import { BinanceFundingRateResponse, BinanceFundingRateItem } from './types';
import { prisma } from './prisma';
import { ProxyAgent } from 'undici';

const BINANCE_API_URL = 'https://www.binance.com/bapi/futures/v1/public/future/common/get-funding-rate-history';

// 创建代理 agent
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 将日期字符串转换为北京时间 00:00:00 的 UTC 时间戳
 * @param dateString 日期字符串，格式为 YYYY-MM-DD，表示北京时间的日期
 */
export function toBeijingStartOfDay(dateString: string): number {
  // 解析日期字符串为北京时间的 00:00:00
  // 北京时间 00:00:00 = UTC 前一天 16:00:00 (UTC+8)
  const [year, month, day] = dateString.split('-').map(Number);
  return Date.UTC(year, month - 1, day) - 8 * 60 * 60 * 1000;
}

/**
 * 从币安 API 获取资金费率数据
 */
export async function fetchBinanceFundingRate(
  symbol: string,
  page: number,
  rows: number = 100
): Promise<BinanceFundingRateResponse> {
  try {
    const response = await fetch(BINANCE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol, page, rows }),
      // @ts-expect-error dispatcher is a valid option for undici
      dispatcher,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Binance funding rate:', error);
    throw error;
  }
}

/**
 * 获取所有资金费率数据（分页获取）
 */
export async function fetchAllFundingRateData(
  symbol: string,
  startDate: string
): Promise<BinanceFundingRateItem[]> {
  let page = 1;
  const allData: BinanceFundingRateItem[] = [];
  let hasMore = true;
  // 使用北京时间的起始时间
  const startTime = toBeijingStartOfDay(startDate);

  console.log(`开始获取 ${symbol} 从 ${new Date(startTime).toISOString()} (北京时间 ${startDate} 00:00) 的资金费率数据...`);

  while (hasMore) {
    try {
      console.log(`正在获取第 ${page} 页数据...`);
      
      const result = await fetchBinanceFundingRate(symbol, page, 100);

      if (!result.success || !result.data || result.data.length === 0) {
        console.log('没有更多数据');
        hasMore = false;
        break;
      }

      // 过滤起始日期之后的数据
      const filteredData = result.data.filter(item => item.calcTime >= startTime);

      allData.push(...filteredData);
      console.log(`第 ${page} 页获取到 ${filteredData.length} 条有效数据`);

      // 判断是否需要继续获取
      if (filteredData.length < result.data.length) {
        // 已经获取到起始日期之前的数据
        console.log('已获取到起始日期之前的数据，停止获取');
        hasMore = false;
      } else if (page * 100 >= result.total) {
        // 已经获取所有数据
        console.log('已获取所有数据');
        hasMore = false;
      } else {
        page++;
        // 延迟 300ms 避免限流
        await sleep(300);
      }
    } catch (error) {
      console.error(`获取第 ${page} 页数据失败:`, error);
      // 重试一次
      await sleep(1000);
      try {
        const result = await fetchBinanceFundingRate(symbol, page, 100);
        if (result.success && result.data && result.data.length > 0) {
          const filteredData = result.data.filter(item => item.calcTime >= startTime);
          allData.push(...filteredData);
          page++;
          await sleep(300);
        } else {
          hasMore = false;
        }
      } catch (retryError) {
        console.error('重试失败:', retryError);
        hasMore = false;
      }
    }
  }

  console.log(`总共获取到 ${allData.length} 条数据`);
  return allData;
}

/**
 * 保存资金费率数据到数据库
 */
export async function saveFundingRateData(data: BinanceFundingRateItem[]): Promise<void> {
  console.log(`开始保存 ${data.length} 条数据到数据库...`);
  
  let savedCount = 0;
  let skippedCount = 0;

  for (const item of data) {
    try {
      await prisma.fundingRateHistory.upsert({
        where: {
          symbol_calcTime: {
            symbol: item.symbol,
            calcTime: BigInt(item.calcTime),
          },
        },
        update: {
          fundingIntervalHours: item.fundingIntervalHours,
          lastFundingRate: item.lastFundingRate,
          markPrice: item.markPrice,
        },
        create: {
          symbol: item.symbol,
          calcTime: BigInt(item.calcTime),
          fundingIntervalHours: item.fundingIntervalHours,
          lastFundingRate: item.lastFundingRate,
          markPrice: item.markPrice,
        },
      });
      savedCount++;
    } catch (error) {
      console.error('保存数据失败:', error);
      skippedCount++;
    }
  }

  console.log(`保存完成: ${savedCount} 条成功, ${skippedCount} 条跳过`);
}

/**
 * 从数据库获取资金费率数据
 */
export async function getFundingRateFromDB(
  symbol: string,
  startDate: string,
  endDate?: string
): Promise<BinanceFundingRateItem[]> {
  // 使用北京时间的起始时间
  const startTime = BigInt(toBeijingStartOfDay(startDate));

  // 如果提供了结束日期，使用结束日期的次日 00:00 作为上限
  // 否则不设置上限
  let endTime: BigInt | undefined;
  if (endDate) {
    const [year, month, day] = endDate.split('-').map(Number);
    // 结束日期的次日 00:00 的 UTC 时间戳
    endTime = BigInt(Date.UTC(year, month - 1, day + 1) - 8 * 60 * 60 * 1000);
  }

  const where: any = {
    symbol,
    calcTime: {
      gte: startTime,
    },
  };

  if (endTime) {
    where.calcTime.lt = endTime;
  }

  const records = await prisma.fundingRateHistory.findMany({
    where,
    orderBy: {
      calcTime: 'desc',
    },
  });

  return records.map(record => ({
    calcTime: Number(record.calcTime),
    symbol: record.symbol,
    fundingIntervalHours: record.fundingIntervalHours,
    lastFundingRate: record.lastFundingRate.toString(),
    markPrice: record.markPrice.toString(),
  }));
}
