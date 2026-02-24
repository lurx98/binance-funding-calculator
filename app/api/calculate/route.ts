import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFundingRateData } from '@/lib/binance-api';
import { calculateByQuantity, calculateByAmount } from '@/lib/calculator';

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

    // 验证日期格式 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { success: false, error: '日期格式错误，应为 YYYY-MM-DD' },
        { status: 400 }
      );
    }

    console.log('收到计算请求:', { symbol, inputType, inputValue, startDate });

    // 直接从币安 API 获取数据
    const fundingRateData = await fetchAllFundingRateData(symbol, startDate);

    if (fundingRateData.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到数据' },
        { status: 404 }
      );
    }

    // 计算收益
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

    // 返回结果
    return NextResponse.json({
      success: true,
      data: result,
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
