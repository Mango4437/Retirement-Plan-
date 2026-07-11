export type RiskTier = "conservative" | "moderate" | "aggressive";

export interface TickerInfo {
  symbol: string;
  name: string;
  category: string;
  /** Conservative planning assumption for long-term average annual return, in percent. */
  expectedReturn: number;
  /** Assumed year-to-year swing (standard deviation), in percent. Higher = bumpier ride. */
  volatility: number;
}

/**
 * A small built-in reference table of common funds/stocks a young UK investor might hold,
 * offline — no live market data — so the tool always works without an API.
 *
 * Return assumptions are deliberately conservative, not raw historical backtests. Headline
 * "average annual return" figures for the S&P 500 etc. (~10%) are calculated in the past, in
 * US dollars, before fees and inflation, and are widely considered too optimistic to plan
 * around today (valuations are higher than history, and future returns tend to mean-revert).
 * These numbers instead sit closer to what UK pension trustees and financial planners use
 * for forward-looking projections. Treat them as a plausible planning assumption, not a
 * promise — real returns in any given decade could be well above or below this.
 */
export const TICKERS: TickerInfo[] = [
  { symbol: "VWRL", name: "Vanguard FTSE All-World UCITS ETF", category: "Global tracker", expectedReturn: 6, volatility: 15 },
  { symbol: "VUSA", name: "Vanguard S&P 500 UCITS ETF", category: "US market tracker", expectedReturn: 6.5, volatility: 16 },
  { symbol: "ISF", name: "iShares Core FTSE 100 ETF", category: "UK market tracker", expectedReturn: 5, volatility: 14 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", category: "US market tracker", expectedReturn: 6.5, volatility: 16 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "US market tracker", expectedReturn: 6.5, volatility: 16 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", category: "US market tracker", expectedReturn: 6.5, volatility: 16 },
  { symbol: "QQQ", name: "Invesco QQQ (Nasdaq 100)", category: "Growth / tech", expectedReturn: 7, volatility: 21 },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", category: "Dividend stocks", expectedReturn: 6, volatility: 14 },
  { symbol: "VXUS", name: "Vanguard Total International Stock ETF", category: "International", expectedReturn: 5.5, volatility: 17 },
  { symbol: "VWO", name: "Vanguard Emerging Markets ETF", category: "International", expectedReturn: 5.5, volatility: 22 },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", category: "Bonds", expectedReturn: 3.5, volatility: 6 },
  { symbol: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", category: "Bonds", expectedReturn: 3.5, volatility: 6 },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", category: "Bonds", expectedReturn: 3.5, volatility: 14 },
  { symbol: "AAPL", name: "Apple", category: "Individual stock", expectedReturn: 7, volatility: 28 },
  { symbol: "MSFT", name: "Microsoft", category: "Individual stock", expectedReturn: 7, volatility: 27 },
  { symbol: "GOOGL", name: "Alphabet (Google)", category: "Individual stock", expectedReturn: 7, volatility: 28 },
  { symbol: "AMZN", name: "Amazon", category: "Individual stock", expectedReturn: 7, volatility: 32 },
  { symbol: "META", name: "Meta Platforms", category: "Individual stock", expectedReturn: 7, volatility: 35 },
  { symbol: "NVDA", name: "Nvidia", category: "Individual stock", expectedReturn: 8, volatility: 45 },
  { symbol: "TSLA", name: "Tesla", category: "Individual stock", expectedReturn: 7, volatility: 55 },
  { symbol: "BTC", name: "Bitcoin", category: "Crypto", expectedReturn: 8, volatility: 65 },
  { symbol: "ETH", name: "Ethereum", category: "Crypto", expectedReturn: 8, volatility: 70 },
  { symbol: "CASH", name: "Cash / savings account", category: "Cash", expectedReturn: 2.5, volatility: 0.5 },
];

export const RISK_TIER_DEFAULTS: Record<RiskTier, { label: string; expectedReturn: number; volatility: number }> = {
  conservative: { label: "Conservative (bonds, cash-like)", expectedReturn: 3.5, volatility: 6 },
  moderate: { label: "Moderate (diversified stock fund)", expectedReturn: 6, volatility: 15 },
  aggressive: { label: "Aggressive (individual stocks, crypto)", expectedReturn: 7, volatility: 40 },
};

export function findTicker(symbol: string): TickerInfo | undefined {
  const clean = symbol.trim().toUpperCase();
  return TICKERS.find((t) => t.symbol === clean);
}
