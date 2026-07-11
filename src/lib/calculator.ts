import { findTicker, RISK_TIER_DEFAULTS } from "./tickers";
import type { Holding, MonteCarloBand, MonteCarloResult, ProjectionResult, SimplePlan, YearPoint } from "./types";

const FALLBACK = RISK_TIER_DEFAULTS.moderate;

function returnAndVolatility(holding: Holding): { expectedReturn: number; volatility: number } {
  const known = findTicker(holding.ticker);
  if (known) return known;
  if (holding.riskTier) return RISK_TIER_DEFAULTS[holding.riskTier];
  return FALLBACK;
}

/** Blends a list of holdings into one expected return & volatility, weighted by dollar amount. */
export function blendPortfolio(holdings: Holding[]): { blendedReturn: number; blendedVolatility: number; startingBalance: number } {
  const startingBalance = holdings.reduce((sum, h) => sum + Math.max(0, h.amount), 0);

  if (holdings.length === 0) {
    return { blendedReturn: FALLBACK.expectedReturn, blendedVolatility: FALLBACK.volatility, startingBalance: 0 };
  }

  const useEqualWeights = startingBalance === 0;
  const weight = useEqualWeights ? 1 / holdings.length : 0;

  let blendedReturn = 0;
  let blendedVolatility = 0;
  for (const h of holdings) {
    const w = useEqualWeights ? weight : Math.max(0, h.amount) / startingBalance;
    const { expectedReturn, volatility } = returnAndVolatility(h);
    blendedReturn += w * expectedReturn;
    blendedVolatility += w * volatility;
  }

  return { blendedReturn, blendedVolatility, startingBalance };
}

export function runProjection(plan: SimplePlan): ProjectionResult {
  const { blendedReturn, blendedVolatility, startingBalance } = blendPortfolio(plan.holdings);
  const annualContribution = plan.salary * (plan.savingsRatePercent / 100);

  const years: YearPoint[] = [];
  let balance = startingBalance;
  let contributed = startingBalance;

  for (let y = 0; y <= plan.yearsHorizon; y++) {
    if (y > 0) {
      balance = (balance + annualContribution) * (1 + blendedReturn / 100);
      contributed += annualContribution;
    }
    years.push({ year: y, balance, contributed });
  }

  const finalBalance = years[years.length - 1]?.balance ?? startingBalance;
  const totalContributed = years[years.length - 1]?.contributed ?? startingBalance;

  return {
    years,
    startingBalance,
    annualContribution,
    blendedReturn,
    blendedVolatility,
    finalBalance,
    totalContributed,
    totalGrowth: finalBalance - totalContributed,
  };
}

function randomNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[index];
}

const SIMULATION_RUNS = 400;

export function runMonteCarlo(plan: SimplePlan): MonteCarloResult {
  const { blendedReturn, blendedVolatility, startingBalance } = blendPortfolio(plan.holdings);
  const annualContribution = plan.salary * (plan.savingsRatePercent / 100);
  const balancesByYear: number[][] = Array.from({ length: plan.yearsHorizon + 1 }, () => []);

  for (let run = 0; run < SIMULATION_RUNS; run++) {
    let balance = startingBalance;
    for (let y = 0; y <= plan.yearsHorizon; y++) {
      if (y > 0) {
        const sampledReturn = blendedReturn + randomNormal() * blendedVolatility;
        balance = Math.max(0, (balance + annualContribution) * (1 + sampledReturn / 100));
      }
      balancesByYear[y].push(balance);
    }
  }

  const bands: MonteCarloBand[] = balancesByYear.map((balances, y) => {
    const sorted = [...balances].sort((a, b) => a - b);
    return {
      year: y,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
    };
  });

  return { bands };
}
