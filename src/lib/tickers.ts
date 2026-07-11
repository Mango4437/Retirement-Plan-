export type RiskTier = "conservative" | "moderate" | "aggressive";

export interface TickerInfo {
  symbol: string;
  name: string;
  category: string;
  /** Assumed long-term average annual return, in percent. Historical average, not a promise. */
  expectedReturn: number;
  /** Assumed year-to-year swing (standard deviation), in percent. Higher = bumpier ride. */
  volatility: number;
}

/**
 * A small built-in reference table of common tickers a student might actually hold,
 * with long-run historical average return & volatility. This is intentionally offline —
 * no live market data — so the tool always works and never depends on an external API.
 * Figures are rough, widely-cited long-term averages, not predictions.
 */
export const TICKERS: TickerInfo[] = [
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", category: "Broad U.S. market", expectedReturn: 10, volatility: 15 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "Broad U.S. market", expectedReturn: 10, volatility: 15 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", category: "Broad U.S. market", expectedReturn: 10, volatility: 15 },
  { symbol: "SCHB", name: "Schwab U.S. Broad Market ETF", category: "Broad U.S. market", expectedReturn: 10, volatility: 15 },
  { symbol: "QQQ", name: "Invesco QQQ (Nasdaq 100)", category: "Growth / tech", expectedReturn: 12, volatility: 20 },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", category: "Dividend stocks", expectedReturn: 9, volatility: 14 },
  { symbol: "VXUS", name: "Vanguard Total International Stock ETF", category: "International", expectedReturn: 7, volatility: 17 },
  { symbol: "VWO", name: "Vanguard Emerging Markets ETF", category: "International", expectedReturn: 7, volatility: 22 },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", category: "Bonds", expectedReturn: 4, volatility: 6 },
  { symbol: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", category: "Bonds", expectedReturn: 4, volatility: 6 },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", category: "Bonds", expectedReturn: 4, volatility: 14 },
  { symbol: "AAPL", name: "Apple", category: "Individual stock", expectedReturn: 12, volatility: 28 },
  { symbol: "MSFT", name: "Microsoft", category: "Individual stock", expectedReturn: 12, volatility: 27 },
  { symbol: "GOOGL", name: "Alphabet (Google)", category: "Individual stock", expectedReturn: 11, volatility: 28 },
  { symbol: "AMZN", name: "Amazon", category: "Individual stock", expectedReturn: 12, volatility: 32 },
  { symbol: "META", name: "Meta Platforms", category: "Individual stock", expectedReturn: 11, volatility: 35 },
  { symbol: "NVDA", name: "Nvidia", category: "Individual stock", expectedReturn: 14, volatility: 45 },
  { symbol: "TSLA", name: "Tesla", category: "Individual stock", expectedReturn: 12, volatility: 55 },
  { symbol: "BTC", name: "Bitcoin", category: "Crypto", expectedReturn: 15, volatility: 65 },
  { symbol: "ETH", name: "Ethereum", category: "Crypto", expectedReturn: 15, volatility: 70 },
  { symbol: "CASH", name: "Cash / savings account", category: "Cash", expectedReturn: 2, volatility: 0.5 },
];

export const RISK_TIER_DEFAULTS: Record<RiskTier, { label: string; expectedReturn: number; volatility: number }> = {
  conservative: { label: "Conservative (bonds, cash-like)", expectedReturn: 5, volatility: 6 },
  moderate: { label: "Moderate (diversified stock fund)", expectedReturn: 9, volatility: 15 },
  aggressive: { label: "Aggressive (individual stocks, crypto)", expectedReturn: 12, volatility: 35 },
};

export function findTicker(symbol: string): TickerInfo | undefined {
  const clean = symbol.trim().toUpperCase();
  return TICKERS.find((t) => t.symbol === clean);
}
