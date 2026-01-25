'use client';

interface HeaderProps {
  onHistoryClick?: () => void;
}

export default function Header({ onHistoryClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              币安资金费率计算器
            </h1>
          </div>

          <nav className="flex items-center space-x-4">
            <button
              onClick={onHistoryClick}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              历史记录
            </button>
            <a
              href="https://www.binance.com/zh-CN/futures"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              币安合约
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
