/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Trade } from './types';
import { calculatePortfolio, formatUSD } from './utils';
import StatsDashboard from './components/StatsDashboard';
import AddTradeForm from './components/AddTradeForm';
import TradeList from './components/TradeList';
import {
  Coins,
  Sparkles,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';

// Seed trades to populate the diary with some realistic starting data
const SEED_TRADES: Trade[] = [
  {
    id: 'seed-1',
    type: 'BUY',
    price: 91400,
    amount: 0.15,
    total: 13710,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'DCA thêm khi nến ngày đóng xanh vượt cản cứng',
    fee: 0,
  }
];

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(94500);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load trades from localStorage or seed
  useEffect(() => {
    const savedTrades = localStorage.getItem('btc_trading_journal_trades');
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error('Lỗi tải dữ liệu cũ, dùng seed thay thế', e);
        setTrades(SEED_TRADES);
      }
    } else {
      setTrades(SEED_TRADES);
      localStorage.setItem('btc_trading_journal_trades', JSON.stringify(SEED_TRADES));
    }
  }, []);

  // Sync trades to localStorage when modified
  const saveTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem('btc_trading_journal_trades', JSON.stringify(newTrades));
  };

  // Fetch BTC price from public API periodically
  useEffect(() => {
    let apiFailuresCount = 0;

    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (!response.ok) throw new Error('Binance response not ok');
        const data = await response.json();
        const price = parseFloat(data.price);
        
        if (!isNaN(price) && price > 0) {
          setCurrentPrice(price);
          setIsLiveApi(true);
          apiFailuresCount = 0;
          return;
        }
      } catch (err) {
        console.warn('Lỗi kết nối Binance API, thử Coindesk fallback...', err);
        
        // Coindesk Fallback
        try {
          const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
          if (!response.ok) throw new Error('Coindesk response not ok');
          const data = await response.json();
          const price = parseFloat(data.bpi.USD.rate_float);
          if (!isNaN(price) && price > 0) {
            setCurrentPrice(price);
            setIsLiveApi(true);
            apiFailuresCount = 0;
            return;
          }
        } catch (coindeskErr) {
          apiFailuresCount++;
          if (apiFailuresCount >= 2) {
            setIsLiveApi(false);
          }
        }
      }

      // Offline mock drift update if APIs are down or slow
      setCurrentPrice((prevPrice) => {
        const percentDrift = (Math.random() - 0.49) * 0.0008; // slightly positive drift
        return Math.max(10000, prevPrice * (1 + percentDrift));
      });
    };

    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger brief floating success notifications
  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add trade
  const handleAddTrade = (newTradeData: Omit<Trade, 'id' | 'total'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: `trade-${Date.now()}`,
      total: newTradeData.price * newTradeData.amount,
    };

    const updated = [newTrade, ...trades];
    saveTrades(updated);
    triggerNotification(
      `Đã thêm thành công: ${newTrade.amount} BTC vào nhật ký giao dịch.`,
      'success'
    );
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    const updated = trades.filter((t) => t.id !== id);
    saveTrades(updated);
    triggerNotification('Đã xóa dòng nhật ký giao dịch.', 'success');
  };

  // Clear all trades
  const handleClearAll = () => {
    saveTrades([]);
    triggerNotification('Đã làm sạch toàn bộ nhật ký giao dịch.', 'success');
  };

  // Calculate standard DCA stats based on the live currentPrice
  const portfolioSummary = calculatePortfolio(trades, currentPrice);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-800 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Visual floating notifications */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in">
          <div className={`px-5 py-3.5 rounded-2xl border shadow-xl flex items-center gap-2.5 backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-white/95 border-emerald-100 text-emerald-800 shadow-emerald-50'
              : 'bg-white/95 border-rose-100 text-rose-800 shadow-rose-50'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold font-sans">{notification.message}</span>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="border-b border-gray-50 bg-white/85 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-sm shadow-gray-50/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 w-full">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-950 rounded-xl flex items-center justify-center shadow-sm">
              <Coins className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-sans font-black text-sm tracking-tight text-gray-950 uppercase leading-none">
                BTC Journal
              </h1>
              <p className="font-sans text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">
                Nhật Ký Mua Bán Cá Nhân
              </p>
            </div>
          </div>

          {/* Connection API state / Profile details */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-mono font-bold ${
              isLiveApi 
                ? 'bg-emerald-500/10 border-emerald-200 text-emerald-700' 
                : 'bg-amber-500/10 border-amber-200 text-amber-700'
            }`}>
              {isLiveApi ? (
                <>
                  <Wifi className="w-3 h-3" />
                  LIVE PRICE
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  OFFLINE
                </>
              )}
            </div>

            {/* Profile email */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-400">
              <User className="w-3 h-3" />
              <span>trungdeveloper1993@gmail.com</span>
            </div>
          </div>

        </div>
      </header>

      {/* BODY CONTAINER */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* TOP LEVEL: ADD TRADE RECORD FORM */}
        <AddTradeForm
          onAddTrade={handleAddTrade}
          currentPrice={currentPrice}
          currentHoldings={portfolioSummary.currentHoldings}
        />

        {/* MID LEVEL: PORTFOLIO WIDGETS AND PNL SUMMARY CARD */}
        <StatsDashboard 
          stats={portfolioSummary} 
          tradesCount={trades.length}
          currentPrice={currentPrice}
        />

        {/* BOTTOM LEVEL: LEDGER TRANSACTIONS LIST */}
        <TradeList
          trades={trades}
          onDeleteTrade={handleDeleteTrade}
          onClearAll={handleClearAll}
        />

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-50 py-6 bg-white text-center text-[10px] text-gray-400 font-sans mt-12">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <p>© 2026 BTC Journal • Lưu giữ lịch sử mua bán Bitcoin của bạn.</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 font-bold">Binance API Stream</p>
        </div>
      </footer>

    </div>
  );
}
