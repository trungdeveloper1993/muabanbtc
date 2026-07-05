/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  type: TradeType;
  price: number; // Price per BTC in USD
  amount: number; // Amount of BTC traded
  total: number; // Total value in USD (price * amount)
  date: string; // ISO string
  notes?: string; // Journal notes/reasoning
  fee?: number; // Optional fee in USD
}

export interface PortfolioSummary {
  currentHoldings: number; // Current BTC owned
  totalSpent: number; // Net USD spent on buying remaining holdings
  averageBuyPrice: number; // DCA price for current holdings
  currentValue: number; // Current holdings valued at current BTC price
  unrealizedPL: number; // Current profit/loss in USD
  unrealizedPLPercentage: number; // ROI % for current holdings
  realizedPL: number; // Realized profit/loss from sold holdings
  totalInvested: number; // Total cash currently locked in (or historical max cash active)
}

export interface PriceHistoryPoint {
  time: number; // Timestamp
  price: number;
}
