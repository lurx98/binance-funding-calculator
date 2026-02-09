'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays } from 'date-fns';

const DATE_PRESETS = [
  { label: '最近 7 天', days: 7 },
  { label: '最近 30 天', days: 30 },
  { label: '最近 90 天', days: 90 },
  { label: '最近 365 天', days: 365 },
];

export interface FormData {
  symbol: string;
  inputType: 'quantity' | 'amount';
  inputValue: number;
  startDate: string;
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [symbol, setSymbol] = useState('XAGUSDT');
  const [inputType, setInputType] = useState<'quantity' | 'amount'>('amount');
  const [inputValue, setInputValue] = useState('10000');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 获取所有币种列表
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetch('https://www.binance.com/bapi/futures/v1/public/future/common/get-funding-info');
        const data = await response.json();
        if (data.success && data.data) {
          const symbols = data.data.map((item: { symbol: string }) => item.symbol);
          setAllSymbols(symbols);
        }
      } catch (error) {
        console.error('Failed to fetch symbols:', error);
      }
    };
    fetchSymbols();
  }, []);

  // 处理输入框变化，显示建议列表
  const handleSymbolChange = (value: string) => {
    setSymbol(value.toUpperCase());

    if (value.trim() === '') {
      setFilteredSymbols([]);
      setShowSuggestions(false);
    } else {
      // 过滤币种
      const filtered = allSymbols.filter(s =>
        s.includes(value.toUpperCase())
      );
      setFilteredSymbols(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  // 选择建议中的币种
  const handleSelectSuggestion = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setShowSuggestions(false);
  };

  // 点击外部关闭建议列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      alert('请输入有效的数值');
      return;
    }
    onSubmit({
      symbol,
      inputType,
      inputValue: value,
      startDate,
    });
  };

  const handlePresetClick = (days: number) => {
    setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 交易对选择 */}
        <div className="relative overflow-visible" ref={suggestionsRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            交易对
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            onFocus={() => {
              setFilteredSymbols(allSymbols);
              setShowSuggestions(allSymbols.length > 0);
            }}
            placeholder="输入交易对，如 BTCUSDT"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />

          {/* 建议列表 */}
          {showSuggestions && filteredSymbols.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredSymbols.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-2 hover:bg-yellow-50 transition-colors text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 输入方式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            输入方式
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setInputType('quantity')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                inputType === 'quantity'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              持仓数量
            </button>
            <button
              type="button"
              onClick={() => setInputType('amount')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                inputType === 'amount'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              投入金额
            </button>
          </div>
        </div>

        {/* 数值输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {inputType === 'quantity' ? '持仓数量' : '投入金额 (USDT)'}
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputType === 'quantity' ? '请输入持仓数量' : '请输入投入金额'}
            step="any"
            min="0"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        {/* 起始日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            起始日期
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* 快捷日期选择 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 mr-2 self-center">快捷选择:</span>
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => handlePresetClick(preset.days)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 计算按钮 */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              计算中...
            </>
          ) : (
            '开始计算'
          )}
        </button>
      </div>
    </form>
  );
}
