/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trade, PortfolioSummary } from './types';

/**
 * Calculates portfolio statistics using the Weighted Average Cost method.
 * Matches standard crypto asset tracking principles.
 */
export function calculatePortfolio(trades: Trade[], currentPrice: number): PortfolioSummary {
  // Sort trades chronologically (oldest first) to accurately simulate DCA adjustments
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentHoldings = 0;
  let averageBuyPrice = 0;
  let realizedPL = 0;
  let totalBought = 0; // Cumulative cost basis of every BUY (for lifetime ROI)

  for (const trade of sortedTrades) {
    const tradeFee = trade.fee || 0;
    if (trade.type === 'BUY') {
      const newHoldings = currentHoldings + trade.amount;
      const newCostBasis = trade.amount * trade.price + tradeFee;
      totalBought += newCostBasis;
      if (newHoldings > 0) {
        // Average cost = (old cost + new cost) / total holdings
        const oldCostBasis = currentHoldings * averageBuyPrice;
        averageBuyPrice = (oldCostBasis + newCostBasis) / newHoldings;
      } else {
        averageBuyPrice = 0;
      }
      currentHoldings = newHoldings;
    } else if (trade.type === 'SELL') {
      // Selling reduces holdings, average cost of remaining holds remains same
      const sellAmount = Math.min(trade.amount, currentHoldings);
      
      // If user is selling more than they own (e.g. short/empty history), handle gracefully
      if (sellAmount > 0) {
        const profitPerUnit = trade.price - averageBuyPrice;
        const profit = profitPerUnit * sellAmount - tradeFee;
        realizedPL += profit;
        currentHoldings -= sellAmount;
      } else {
        // Assume cost basis was the sell price itself to avoid negative holdings issues
        currentHoldings = Math.max(0, currentHoldings - trade.amount);
        realizedPL -= tradeFee; // Just subtract the fee
      }

      if (currentHoldings === 0) {
        averageBuyPrice = 0;
      }
    }
  }

  const totalSpent = currentHoldings * averageBuyPrice;
  const currentValue = currentHoldings * currentPrice;
  const unrealizedPL = currentValue - totalSpent;
  const unrealizedPLPercentage = totalSpent > 0 ? (unrealizedPL / totalSpent) * 100 : 0;

  // Total P/L combines already-realized gains/losses (from sells) with the
  // unrealized P/L on remaining holdings. This is the figure that stays correct
  // even after selling BTC at a loss (or after selling everything).
  const totalPL = realizedPL + unrealizedPL;
  const totalPLPercentage = totalBought > 0 ? (totalPL / totalBought) * 100 : 0;

  return {
    currentHoldings,
    totalSpent,
    averageBuyPrice,
    currentValue,
    unrealizedPL,
    unrealizedPLPercentage,
    realizedPL,
    totalPL,
    totalPLPercentage,
    totalInvested: totalSpent,
  };
}

/**
 * Format currency to beautiful USD format with dot separators
 */
export function formatUSD(value: number, maximumFractionDigits: number = 2): string {
  // Use de-DE format to match dots and commas precisely (e.g. 18.000.000,50 USD or 18.000.000 USD)
  const isWhole = value % 1 === 0;
  const digits = isWhole ? 0 : maximumFractionDigits;
  
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

  return `${formatted} USD`;
}

/**
 * Format percent to Vietnamese style with commas (e.g. -26,72%)
 */
export function formatPercent(value: number): string {
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${value >= 0 ? '+' : ''}${formatted}%`;
}

/**
 * Format crypto amounts
 */
export function formatBTC(value: number): string {
  // For BTC we can show up to 6 decimal places cleanly
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

/**
 * Format date for localized reading
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Standard templates of trade comments/reasons
 */
export const NOTE_PRESETS = [
  'DCA định kỳ',
  'Mua FOMO / Theo trend',
  'Mua khi hỗ trợ / Bắt đáy',
  'Mua Breakout cản',
  'Chốt lời từng phần (Take Profit)',
  'Cắt lỗ chủ động (Stop Loss)',
  'Cơ cấu lại danh mục',
  'Bán hoảng loạn (FUD)',
];
