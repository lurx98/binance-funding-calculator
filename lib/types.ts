// 币安 API 相关类型定义
export interface BinanceFundingRateResponse {
  success: boolean;
  total: number;
  data: BinanceFundingRateItem[];
}

export interface BinanceFundingRateItem {
  calcTime: number;
  symbol: string;
  fundingIntervalHours: number;
  lastFundingRate: string;
  markPrice: string;
}

// 日统计
export interface DailyStats {
  date: string;
  profit: number;
  count: number;
  firstPrice: number;
  avgFundingRate: number;
}

// 月统计
export interface MonthlyStats {
  month: string;
  profit: number;
  count: number;
  avgDailyProfit: number;
}

// 年统计
export interface YearlyStats {
  year: string;
  profit: number;
  count: number;
  avgMonthlyProfit: number;
}

// 汇总信息
export interface SummaryData {
  totalProfit: number;
  totalRecords: number;
  dayCount: number;
  avgDailyProfit: number;
  quantity: number;      // 持仓数量
  initialPrice: number;  // 初始价格
  initialValue: number;  // 初始金额 (持仓数量 × 初始价格)
}

// 计算结果
export interface CalculateResult {
  daily: DailyStats[];
  monthly: MonthlyStats[];
  yearly: YearlyStats[];
  summary: SummaryData;
}
