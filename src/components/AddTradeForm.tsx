/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Trade, TradeType } from '../types';
import { formatUSD } from '../utils';
import { Info, AlertCircle, Sparkles, Plus, Wallet } from 'lucide-react';

interface AddTradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'total'>) => void;
  currentPrice: number;
  currentHoldings: number;
}

export default function AddTradeForm({ onAddTrade, currentPrice, currentHoldings }: AddTradeFormProps) {
  const [type, setType] = useState<TradeType>('BUY');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [totalVal, setTotalVal] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Auto calculate total whenever price or amount changes
  useEffect(() => {
    const p = parseFloat(price);
    const a = parseFloat(amount);
    if (!isNaN(p) && !isNaN(a)) {
      setTotalVal(p * a);
    } else {
      setTotalVal(0);
    }
  }, [price, amount]);

  const fillLivePrice = () => {
    setPrice(currentPrice.toFixed(0));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Vui lòng nhập số lượng BTC hợp lệ (> 0)');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Vui lòng nhập giá BTC hợp lệ (> 0)');
      return;
    }

    // Warnings for SELL transaction exceeding wallet holding limits
    if (type === 'SELL' && parsedAmount > currentHoldings) {
      const confirmSell = window.confirm(
        `Cảnh báo: Bạn đang bán ${parsedAmount} BTC, vượt quá số dư hiện có (${currentHoldings} BTC) trong nhật ký. Bạn vẫn muốn tiếp tục ghi lại giao dịch này?`
      );
      if (!confirmSell) return;
    }

    onAddTrade({
      type,
      price: parsedPrice,
      amount: parsedAmount,
      date: new Date().toISOString(),
      notes: notes.trim() || (type === 'BUY' ? 'Mua tích trữ BTC' : 'Bán chốt lời BTC'),
      fee: 0,
    });

    // Reset inputs
    setAmount('');
    setNotes('');
  };

  const exceedsBalance = type === 'SELL' && parseFloat(amount) > currentHoldings;

  return (
    <form onSubmit={handleSubmit} id="add-trade-card" className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col gap-6 shadow-sm shadow-gray-100/50 max-w-3xl mx-auto w-full">
      
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-5">
        <div>
          <h3 className="font-sans font-black text-gray-900 text-lg tracking-tight uppercase flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xl">+</span> Ghi Nhật Ký Mua Bán BTC
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Nhập số lượng (BTC) và giá BTC tại thời điểm giao dịch.
          </p>
        </div>

        {/* Action switch MUA / BÁN */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-150 self-start sm:self-center font-mono">
          <button
            type="button"
            onClick={() => setType('BUY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'BUY'
                ? 'bg-white text-emerald-700 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            MUA BTC
          </button>
          <button
            type="button"
            onClick={() => setType('SELL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'SELL'
                ? 'bg-white text-rose-700 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            BÁN BTC
          </button>
        </div>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Left column: SỐ LƯỢNG */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-sans">
            Số lượng (BTC)
          </label>
          <input
            type="number"
            step="any"
            required
            placeholder="Ví dụ: 0.15"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50/70 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-0 transition-colors"
          />
        </div>

        {/* Right column: GIÁ BTC */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-sans">
              Giá BTC (USD / BTC)
            </label>
            <button
              type="button"
              onClick={fillLivePrice}
              className="text-[9px] text-gray-500 hover:bg-gray-100 font-semibold font-mono flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-150 cursor-pointer transition-colors"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              Lấy giá hiện tại ({currentPrice.toFixed(0)})
            </button>
          </div>
          <input
            type="number"
            step="any"
            required
            placeholder="Ví dụ: 94500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-50/70 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-0 transition-colors"
          />
        </div>

      </div>

      {/* Ghi chú nhật ký (Subtle optional field) */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-sans">
          Ghi chú nhật ký (Tùy chọn)
        </label>
        <input
          type="text"
          placeholder="Ví dụ: Mua tích trữ dài hạn, Bắt đáy hỗ trợ..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-gray-50/70 border border-gray-200/80 rounded-2xl px-5 py-3 text-sm font-sans text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-0 transition-colors"
        />
      </div>

      {/* Orange/Amber THÀNH TIỀN box */}
      <div className="bg-[#FFFDF5] border border-amber-100/60 rounded-2xl p-5 flex items-center justify-between font-sans shadow-sm shadow-amber-50/50">
        <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider">
          THÀNH TIỀN
        </span>
        <span className="text-amber-800 font-black text-lg tracking-tight font-mono">
          {formatUSD(totalVal)}
        </span>
      </div>

      {/* Feedback alerts if needed */}
      {exceedsBalance && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            Số lượng bán ({amount} BTC) vượt quá số dư nắm giữ hiện tại của bạn ({currentHoldings} BTC).
            Hệ thống vẫn cho phép ghi để linh hoạt khớp các giao dịch cũ chưa nhập hết.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
          <Info className="w-4 h-4 flex-shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {/* Salmon pink action button */}
      <button
        type="submit"
        className="w-full py-4 rounded-2xl font-sans font-bold text-sm tracking-wide text-white bg-rose-400 hover:bg-rose-500 active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-rose-100 flex items-center justify-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Lưu vào nhật ký
      </button>

    </form>
  );
}
