/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortfolioSummary } from '../types';
import { formatUSD, formatPercent, formatBTC } from '../utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface StatsDashboardProps {
  stats: PortfolioSummary;
  tradesCount: number;
  currentPrice: number;
}

export default function StatsDashboard({ stats, tradesCount, currentPrice }: StatsDashboardProps) {
  // Headline reflects TOTAL P/L = realized (from sells) + unrealized (on holdings),
  // so a loss booked by selling BTC is always counted.
  const isProfit = stats.totalPL >= 0;
  const isRealizedProfit = stats.realizedPL >= 0;
  const isUnrealizedProfit = stats.unrealizedPL >= 0;

  // Render stats matching the mockup precisely
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      
      {/* 3 Grid mini stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: TỔNG SỐ LƯỢNG */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm shadow-gray-50/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase font-sans flex items-center gap-1.5">
              ⚖️ TỔNG SỐ LƯỢNG
            </span>
          </div>
          <div>
            <div className="text-gray-900 font-mono text-2xl font-black tracking-tight leading-none">
              {formatBTC(stats.currentHoldings)} <span className="text-gray-400 text-sm font-sans font-normal">BTC</span>
            </div>
            <div className="text-gray-400 text-xs mt-2 font-medium">
              {tradesCount} lần giao dịch
            </div>
          </div>
        </div>

        {/* Card 2: GIÁ VỐN TB */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm shadow-gray-50/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase font-sans flex items-center gap-1.5">
              🪙 GIÁ VỐN TB
            </span>
          </div>
          <div>
            <div className="text-gray-900 font-mono text-2xl font-black tracking-tight leading-none">
              {stats.currentHoldings > 0 ? formatUSD(stats.averageBuyPrice, 2) : '0 USD'}
            </div>
            <div className="text-gray-400 text-xs mt-2 font-medium">
              USD / BTC
            </div>
          </div>
        </div>

        {/* Card 3: TỔNG TIỀN ĐÃ MUA */}
        <div className="bg-rose-600 rounded-3xl p-6 flex flex-col justify-between shadow-sm shadow-rose-100/30 relative overflow-hidden text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-rose-200 text-[10px] font-extrabold tracking-widest uppercase font-sans flex items-center gap-1.5">
              👛 TỔNG TIỀN ĐÃ MUA
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-black tracking-tight leading-none text-white">
              {formatUSD(stats.totalSpent, 2)}
            </div>
            <div className="text-rose-200 text-xs mt-2 font-medium">
              USD
            </div>
          </div>
        </div>

      </div>

      {/* Big PnL Card: Chênh Lệch Lãi / Lỗ */}
      <div 
        className={`rounded-3xl border p-8 flex flex-col gap-6 shadow-sm relative overflow-hidden transition-all duration-350 ${
          isProfit 
            ? 'bg-[#F4FBF7] border-emerald-100/80 shadow-emerald-50/30' 
            : 'bg-[#FFF6F6] border-rose-100/80 shadow-rose-50/30'
        }`}
      >
        
        {/* Status Indicator Badge */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider border self-start ${
              isProfit 
                ? 'bg-emerald-100/60 border-emerald-200 text-emerald-800' 
                : 'bg-rose-100/60 border-rose-200 text-rose-800'
            }`}>
              {isProfit ? (
                <>
                  <TrendingUp className="w-3 h-3" /> ĐANG LỜI
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" /> ĐANG LỖ
                </>
              )}
            </span>
            <h4 className="font-sans font-black text-gray-900 text-base tracking-tight uppercase mt-2">
              Chênh Lệch Lãi / Lỗ
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed mt-0.5">
              {stats.currentHoldings > 0 ? (
                <>
                  Tổng lãi/lỗ = đã chốt khi bán + tạm tính trên số BTC đang giữ (giá vốn TB {formatUSD(stats.averageBuyPrice, 2)} so với giá hiện tại {formatUSD(currentPrice, 2)}).
                </>
              ) : (
                'Tổng lãi/lỗ đã chốt từ các lệnh bán BTC. Hãy thêm giao dịch để theo dõi biến động lời lỗ thời gian thực.'
              )}
            </p>
          </div>
        </div>

        {/* Main large profit/loss value */}
        <div className="flex flex-col items-center justify-center text-center py-4 border-t border-b border-gray-100/30">
          <span className={`font-mono text-4xl font-black tracking-tight leading-none ${
            isProfit ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {isProfit ? '+' : ''}{formatUSD(stats.totalPL, 2)}
          </span>
          <span className={`font-mono text-base font-extrabold mt-2 ${
            isProfit ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {formatPercent(stats.totalPLPercentage)}
          </span>
        </div>

        {/* Breakdown: realized (from sells) vs unrealized (on holdings) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Box: LÃI/LỖ ĐÃ CHỐT */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase">
              LÃI/LỖ ĐÃ CHỐT (BÁN)
            </span>
            <span className={`font-mono text-lg font-black ${isRealizedProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isRealizedProfit ? '+' : ''}{formatUSD(stats.realizedPL, 2)}
            </span>
          </div>

          {/* Box: LÃI/LỖ TẠM TÍNH */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase">
              LÃI/LỖ TẠM TÍNH (ĐANG GIỮ)
            </span>
            <span className={`font-mono text-lg font-black ${isUnrealizedProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.currentHoldings > 0 ? `${isUnrealizedProfit ? '+' : ''}${formatUSD(stats.unrealizedPL, 2)}` : '0 USD'}
            </span>
          </div>

        </div>

        {/* Two white internal details grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">

          {/* Box 1: GIÁ TRỊ HIỆN TẠI */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase">
              GIÁ TRỊ HIỆN TẠI
            </span>
            <span className="text-gray-900 font-mono text-lg font-black">
              {formatUSD(stats.currentValue, 2)}
            </span>
          </div>

          {/* Box 2: VỐN ĐÃ BỎ RA */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-gray-400 text-[10px] font-extrabold tracking-widest uppercase">
              VỐN ĐÃ BỎ RA
            </span>
            <span className="text-gray-900 font-mono text-lg font-black">
              {formatUSD(stats.totalSpent, 2)}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
