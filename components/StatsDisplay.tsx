'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DailyStats, MonthlyStats, YearlyStats, SummaryData } from '@/lib/types';

interface StatsDisplayProps {
  data: {
    daily: DailyStats[];
    monthly: MonthlyStats[];
    yearly: YearlyStats[];
    summary: SummaryData;
  } | null;
  loading: boolean;
}

export default function StatsDisplay({ data, loading }: StatsDisplayProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">正在计算中...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">请输入参数并点击计算按钮</p>
        </div>
      </div>
    );
  }

  const { daily, monthly, yearly, summary } = data;

  // 准备图表数据（反转顺序，让日期从早到晚）
  const chartData = [...daily].reverse().map(d => ({
    ...d,
    date: d.date.slice(5), // 只显示 MM-DD
  }));

  const monthlyChartData = [...monthly].reverse();
  const yearlyChartData = [...yearly].reverse();

  return (
    <div className="space-y-6">
      {/* 汇总信息卡片 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">汇总信息</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">初始仓位</p>
            <p className="text-lg md:text-xl font-bold text-gray-800">
              {summary.quantity.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">初始价格</p>
            <p className="text-lg md:text-xl font-bold text-gray-800">
              {summary.initialPrice.toFixed(2)}
              <span className="text-xs ml-1 text-gray-500">USDT</span>
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">初始金额</p>
            <p className="text-lg md:text-xl font-bold text-gray-800">
              {summary.initialValue.toFixed(2)}
              <span className="text-xs ml-1 text-gray-500">USDT</span>
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">收益率</p>
            <p className={`text-lg md:text-xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.initialValue > 0 ? ((summary.totalProfit / summary.initialValue) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">总收益</p>
            <p className={`text-lg md:text-xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalProfit >= 0 ? '+' : ''}{summary.totalProfit.toFixed(2)}
              <span className="text-xs ml-1 text-gray-500">USDT</span>
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">数据条数</p>
            <p className="text-lg md:text-xl font-bold text-gray-800">{summary.totalRecords}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">统计天数</p>
            <p className="text-lg md:text-xl font-bold text-gray-800">{summary.dayCount}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-blue-100/50 p-4 hover:shadow-lg hover:bg-white/80 transition-all">
            <p className="text-blue-600 text-xs font-medium mb-2">日均收益</p>
            <p className={`text-lg md:text-xl font-bold ${summary.avgDailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.avgDailyProfit >= 0 ? '+' : ''}{summary.avgDailyProfit.toFixed(2)}
              <span className="text-xs ml-1 text-gray-500">USDT</span>
            </p>
          </div>
        </div>
      </div>

      {/* 日统计 */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">日统计</h3>

        {/* 日收益折线图 */}
        {chartData.length > 0 && (
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(4)} USDT`, '收益']}
                  labelFormatter={(label) => `日期: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 日统计表格 */}
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收益 (USDT)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结算次数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">首条价格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均费率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daily.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${day.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.profit >= 0 ? '+' : ''}{day.profit.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{day.count}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{day.firstPrice.toFixed(4)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{(day.avgFundingRate * 100).toFixed(4)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 月统计和年统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月统计 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">月统计</h3>

          {monthlyChartData.length > 0 && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(4)} USDT`, '收益']}
                  />
                  <Bar dataKey="profit" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {monthly.map((m) => (
              <div key={m.month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{m.month}</p>
                  <p className="text-sm text-gray-500">{m.count} 次结算</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.profit >= 0 ? '+' : ''}{m.profit.toFixed(4)} USDT
                  </p>
                  <p className="text-sm text-gray-500">
                    日均 {m.avgDailyProfit.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 年统计 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">年统计</h3>

          {yearlyChartData.length > 0 && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(4)} USDT`, '收益']}
                  />
                  <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {yearly.map((y) => (
              <div key={y.year} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{y.year} 年</p>
                  <p className="text-sm text-gray-500">{y.count} 次结算</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${y.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {y.profit >= 0 ? '+' : ''}{y.profit.toFixed(4)} USDT
                  </p>
                  <p className="text-sm text-gray-500">
                    月均 {y.avgMonthlyProfit.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
