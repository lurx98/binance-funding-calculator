import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFundingRateData, saveFundingRateData, getFundingRateFromDB, toBeijingStartOfDay } from '@/lib/binance-api';
import { calculateByQuantity, calculateByAmount } from '@/lib/calculator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, inputType, inputValue, startDate } = body;

    // 验证参数
    if (!symbol || !inputType || !inputValue || !startDate) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (inputValue <= 0) {
      return NextResponse.json(
        { success: false, error: '输入值必须大于 0' },
        { status: 400 }
      );
    }

    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { success: false, error: '日期格式错误' },
        { status: 400 }
      );
    }

    console.log('收到计算请求:', { symbol, inputType, inputValue, startDate });

    // 1. 先尝试从数据库获取数据
    let fundingRateData = await getFundingRateFromDB(symbol, startDateObj);
    let fromCache = true;

    // 2. 检查数据库数据是否覆盖了请求的起始日期
    const startTime = toBeijingStartOfDay(startDateObj);
    let needFetchMore = false;

    if (fundingRateData.length === 0) {
      needFetchMore = true;
      console.log('数据库无数据，需要从币安 API 获取...');
    } else {
      // 检查数据库中最早的数据是否早于请求的起始日期
      // 注意：币安 API 返回的时间戳可能有毫秒偏移（如 xxx001），所以用 1 秒的容差
      const oldestDataTime = Math.min(...fundingRateData.map(d => d.calcTime));
      const tolerance = 1000; // 1 秒容差
      if (oldestDataTime > startTime + tolerance) {
        needFetchMore = true;
        console.log(`数据库最早数据时间 ${new Date(oldestDataTime).toISOString()} 晚于请求起始时间 ${new Date(startTime).toISOString()}，需要获取更多数据`);
      } else {
        console.log(`从数据库获取到 ${fundingRateData.length} 条数据，数据完整`);
      }
    }

    // 3. 如果需要获取更多数据，从币安 API 获取
    if (needFetchMore) {
      fromCache = false;
      const apiData = await fetchAllFundingRateData(symbol, startDateObj);

      // 保存到数据库
      if (apiData.length > 0) {
        await saveFundingRateData(apiData);
      }

      // 合并数据（去重）
      const existingTimes = new Set(fundingRateData.map(d => d.calcTime));
      const newData = apiData.filter(d => !existingTimes.has(d.calcTime));
      fundingRateData = [...fundingRateData, ...newData].sort((a, b) => b.calcTime - a.calcTime);

      console.log(`合并后共 ${fundingRateData.length} 条数据`);
    }

    if (fundingRateData.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到数据' },
        { status: 404 }
      );
    }

    // 3. 计算收益
    let result;
    if (inputType === 'quantity') {
      result = calculateByQuantity(fundingRateData, inputValue);
    } else if (inputType === 'amount') {
      result = calculateByAmount(fundingRateData, inputValue);
    } else {
      return NextResponse.json(
        { success: false, error: '无效的输入类型' },
        { status: 400 }
      );
    }

    // 4. 保存查询历史
    try {
      await prisma.queryHistory.create({
        data: {
          symbol,
          inputType,
          inputValue: inputValue.toString(),
          startDate: startDateObj,
          totalProfit: result.summary.totalProfit.toString(),
          totalRecords: result.summary.totalRecords,
        },
      });
    } catch (error) {
      console.error('保存查询历史失败:', error);
      // 不影响主流程
    }

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      data: result,
      fromCache,
      dataCount: fundingRateData.length,
    });

  } catch (error) {
    console.error('计算失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '计算失败' 
      },
      { status: 500 }
    );
  }
}
