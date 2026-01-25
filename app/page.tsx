'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InputForm, { FormData } from '@/components/InputForm';
import StatsDisplay from '@/components/StatsDisplay';
import { CalculateResult } from '@/lib/types';

interface ApiResponse {
  success: boolean;
  data?: CalculateResult;
  error?: string;
  fromCache?: boolean;
  dataCount?: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ fromCache: boolean; dataCount: number } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setMeta(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        setMeta({
          fromCache: data.fromCache ?? false,
          dataCount: data.dataCount ?? 0,
        });
      } else {
        setError(data.error || '计算失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
      console.error('请求错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = () => {
    // TODO: 实现历史记录弹窗
    alert('历史记录功能开发中...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onHistoryClick={handleHistoryClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 输入表单 */}
        <div className="mb-8">
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold">错误</p>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* 统计结果展示 */}
        <StatsDisplay data={result} loading={loading} />

        {/* 数据来源信息 */}
        {meta && result && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              数据来源: {meta.fromCache ? '数据库缓存' : '币安 API'} |
              数据条数: {meta.dataCount}
            </p>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            币安资金费率计算器 - 仅供参考，不构成投资建议
          </p>
        </div>
      </footer>
    </div>
  );
}
