import { BinanceFundingRateItem, DailyStats, MonthlyStats, YearlyStats, CalculateResult } from './types';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// 北京时间时区
const BEIJING_TZ = 'Asia/Shanghai';

/**
 * 将时间戳转换为北京时间的日期字符串
 */
function formatToBeijingDate(timestamp: number): string {
  const zonedDate = toZonedTime(new Date(timestamp), BEIJING_TZ);
  return format(zonedDate, 'yyyy-MM-dd');
}

/**
 * 计算单次收益
 * @param quantity 持仓数量
 * @param markPrice 标记价格
 * @param fundingRate 资金费率
 */
function calculateSingleProfit(
  quantity: number,
  markPrice: number,
  fundingRate: number
): number {
  return quantity * markPrice * fundingRate;
}

/**
 * 按持仓数量计算收益
 */
export function calculateByQuantity(
  data: BinanceFundingRateItem[],
  quantity: number
): CalculateResult {
  return calculateProfits(data, quantity);
}

/**
 * 按投入金额计算收益
 */
export function calculateByAmount(
  data: BinanceFundingRateItem[],
  amount: number
): CalculateResult {
  if (data.length === 0) {
    throw new Error('没有数据');
  }

  // 数据按时间降序排列，最后一条是最早的数据
  // 使用最早一天的标记价格计算持仓数量（模拟在起始日期买入）
  const earliestData = data[data.length - 1];
  const earliestPrice = parseFloat(earliestData.markPrice);
  const quantity = amount / earliestPrice;

  console.log(`投入金额: ${amount} USDT, 起始价格: ${earliestPrice} USDT, 计算持仓数量: ${quantity}`);

  return calculateProfits(data, quantity);
}

/**
 * 核心计算逻辑
 */
function calculateProfits(
  data: BinanceFundingRateItem[],
  quantity: number
): CalculateResult {
  // 按日期分组
  const dailyMap = new Map<string, {
    profits: number[];
    prices: number[];
    fundingRates: number[];
  }>();

  // 计算每条数据的收益
  for (const item of data) {
    const date = formatToBeijingDate(item.calcTime);
    const markPrice = parseFloat(item.markPrice);
    const fundingRate = parseFloat(item.lastFundingRate);
    const profit = calculateSingleProfit(quantity, markPrice, fundingRate);

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        profits: [],
        prices: [],
        fundingRates: [],
      });
    }

    const dayData = dailyMap.get(date)!;
    dayData.profits.push(profit);
    dayData.prices.push(markPrice);
    dayData.fundingRates.push(fundingRate);
  }

  // 生成日统计
  const daily: DailyStats[] = [];
  for (const [date, dayData] of dailyMap.entries()) {
    const totalProfit = dayData.profits.reduce((sum, p) => sum + p, 0);
    const avgFundingRate = dayData.fundingRates.reduce((sum, r) => sum + r, 0) / dayData.fundingRates.length;

    // 数据是按时间降序排列的，所以当天最后一条是最早的数据
    // firstPrice 应该是当天最早的价格
    const firstPrice = dayData.prices[dayData.prices.length - 1];

    daily.push({
      date,
      profit: totalProfit,
      count: dayData.profits.length,
      firstPrice,
      avgFundingRate,
    });
  }

  // 按日期排序（降序）
  daily.sort((a, b) => b.date.localeCompare(a.date));

  // 生成月统计
  const monthlyMap = new Map<string, { profit: number; count: number; days: number }>();
  for (const day of daily) {
    const month = day.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { profit: 0, count: 0, days: 0 });
    }
    const monthData = monthlyMap.get(month)!;
    monthData.profit += day.profit;
    monthData.count += day.count;
    monthData.days += 1;
  }

  const monthly: MonthlyStats[] = [];
  for (const [month, monthData] of monthlyMap.entries()) {
    monthly.push({
      month,
      profit: monthData.profit,
      count: monthData.count,
      avgDailyProfit: monthData.profit / monthData.days,
    });
  }
  monthly.sort((a, b) => b.month.localeCompare(a.month));

  // 生成年统计
  const yearlyMap = new Map<string, { profit: number; count: number; months: number }>();
  for (const mon of monthly) {
    const year = mon.month.substring(0, 4); // YYYY
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { profit: 0, count: 0, months: 0 });
    }
    const yearData = yearlyMap.get(year)!;
    yearData.profit += mon.profit;
    yearData.count += mon.count;
    yearData.months += 1;
  }

  const yearly: YearlyStats[] = [];
  for (const [year, yearData] of yearlyMap.entries()) {
    yearly.push({
      year,
      profit: yearData.profit,
      count: yearData.count,
      avgMonthlyProfit: yearData.profit / yearData.months,
    });
  }
  yearly.sort((a, b) => b.year.localeCompare(a.year));

  // 生成汇总信息
  const totalProfit = daily.reduce((sum, d) => sum + d.profit, 0);
  const totalRecords = data.length;
  const dayCount = daily.length;
  const avgDailyProfit = dayCount > 0 ? totalProfit / dayCount : 0;

  // 获取初始价格（最早一条数据的价格）
  const initialPrice = data.length > 0 ? parseFloat(data[data.length - 1].markPrice) : 0;
  const initialValue = quantity * initialPrice;

  const summary = {
    totalProfit,
    totalRecords,
    dayCount,
    avgDailyProfit,
    quantity,
    initialPrice,
    initialValue,
  };

  return {
    daily,
    monthly,
    yearly,
    summary,
  };
}
