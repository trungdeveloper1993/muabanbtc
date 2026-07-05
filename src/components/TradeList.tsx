/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Trade } from '../types';
import { formatUSD, formatBTC, formatDate } from '../utils';
import { Trash2, Heart, Clock, Search, BookOpen, AlertTriangle } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onClearAll: () => void;
}

export default function TradeList({ trades, onDeleteTrade, onClearAll }: TradeListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Filter trades
  const filteredTrades = trades
    .filter((trade) => {
      if (filterType === 'ALL') return true;
      return trade.type === filterType;
    })
    .filter((trade) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const noteMatch = trade.notes?.toLowerCase().includes(q);
      const priceMatch = trade.price.toString().includes(q);
      const amountMatch = trade.amount.toString().includes(q);
      return noteMatch || priceMatch || amountMatch;
    })
    // Sort by newest first
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleClearConfirm = () => {
    const confirmClear = window.confirm(
      'Cảnh báo: Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử nhật ký giao dịch? Hành động này không thể hoàn tác.'
    );
    if (confirmClear) {
      onClearAll();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm nhật ký giao dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-155 rounded-2xl pl-10 pr-4 py-3 text-xs font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-150 self-start sm:self-auto font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType('BUY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              filterType === 'BUY'
                ? 'bg-white text-emerald-700 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Chỉ lệnh Mua
          </button>
          <button
            onClick={() => setFilterType('SELL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              filterType === 'SELL'
                ? 'bg-white text-rose-700 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Chỉ lệnh Bán
          </button>
        </div>
      </div>

      {/* Main Journal List Container */}
      <div id="trade-list-card" className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col gap-6 shadow-sm shadow-gray-100/50">
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-sans font-black text-gray-900 text-base tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-900" />
              Nhật Ký Đã Mua / Bán
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 border border-gray-200/50 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 font-mono tracking-wider uppercase">
              {filteredTrades.length} {filteredTrades.length === 1 ? 'MỤC' : 'MỤC'}
            </span>
            {trades.length > 0 && (
              <button
                onClick={handleClearConfirm}
                className="text-[10px] text-rose-500 hover:text-rose-600 font-bold border border-rose-100 hover:bg-rose-50 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
              >
                Xóa Hết
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        {filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Trống nhật ký</p>
            <p className="text-gray-400 text-[11px] mt-1 font-sans">
              {trades.length === 0
                ? 'Nhập lệnh MUA hoặc BÁN ở biểu mẫu trên để tạo giao dịch đầu tiên.'
                : 'Không tìm thấy nhật ký giao dịch nào khớp với bộ lọc hiện tại.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {filteredTrades.map((trade) => {
              const isBuy = trade.type === 'BUY';
              
              return (
                <div 
                  key={trade.id} 
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  
                  {/* Left Column: Info & Details */}
                  <div className="flex flex-col gap-1.5">
                    
                    {/* Top Row: Amount & Price */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md font-mono ${
                        isBuy ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {isBuy ? 'MUA' : 'BÁN'}
                      </span>
                      <span className="text-gray-900 font-mono text-sm font-black">
                        {formatBTC(trade.amount)} BTC
                      </span>
                      <span className="text-gray-400 text-xs">x</span>
                      <span className="text-gray-500 font-mono text-xs font-semibold">
                        {formatUSD(trade.price, 2)}
                      </span>
                    </div>

                    {/* Bottom Row: Timestamp and Note description */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(trade.date).split(' ')[0]} {/* Show just date cleanly */}
                      </span>
                      {trade.notes && (
                        <>
                          <span className="text-gray-200">•</span>
                          <span className="text-gray-500 font-medium italic break-all max-w-sm">
                            {trade.notes}
                          </span>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Calculated Total price and Delete action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    
                    {/* Total Value */}
                    <div className="text-right font-mono">
                      <span className="text-amber-700 font-black text-sm">
                        {formatUSD(trade.price * trade.amount, 2)}
                      </span>
                    </div>

                    {/* Action buttons wrapper */}
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-100/50 hover:border-rose-100/60 transition-all cursor-pointer shadow-sm"
                        title="Xóa dòng nhật ký này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Warning local storage footer disclaimer */}
      <div className="bg-[#FFF6F6] border border-rose-100/70 rounded-3xl p-6 flex items-start gap-4 shadow-sm shadow-rose-50/20 max-w-3xl mx-auto w-full">
        <span className="p-2 bg-rose-100/60 border border-rose-200 rounded-xl flex-shrink-0">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
        </span>
        <div className="text-xs leading-relaxed font-sans text-rose-800">
          <strong>Lưu ý nhỏ nè ❤️</strong> Nhật ký được lưu ngay trên trình duyệt của bạn. Vì vậy <strong>đừng xóa dữ liệu duyệt web</strong> (lịch sử / cache) và lưu ý khi <strong>đổi máy hoặc đổi trình duyệt</strong> — nếu không bạn có thể bị mất toàn bộ nhật ký đã ghi. Hãy giữ gìn cẩn thận nha!
        </div>
      </div>

    </div>
  );
}
