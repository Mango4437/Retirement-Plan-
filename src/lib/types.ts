export type RiskTier = "conservative" | "moderate" | "aggressive";

export interface Holding {
  id: string;
  /** Ticker symbol if known, or a free-text label the student typed. */
  ticker: string;
  /** Current dollar amount held in this investment. */
  amount: number;
  /** Only set when the ticker isn't in the built-in reference table. */
  riskTier?: RiskTier;
}

export interface SimplePlan {
  /** Annual salary/income, in dollars. */
  salary: number;
  /** % of salary invested each year. */
  savingsRatePercent: number;
  holdings: Holding[];
  /** Years from now until the money is needed. */
  yearsHorizon: number;
}

export interface YearPoint {
  year: number;
  balance: number;
  contributed: number;
}

export interface ProjectionResult {
  years: YearPoint[];
  startingBalance: number;
  annualContribution: number;
  blendedReturn: number;
  blendedVolatility: number;
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
}

export interface MonteCarloBand {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloResult {
  bands: MonteCarloBand[];
}
