import { findTicker, RISK_TIER_DEFAULTS } from "./tickers";
import { calculatePensionContribution } from "./ukPension";
import type { Holding, MonteCarloBand, MonteCarloResult, ProjectionResult, SimplePlan, YearPoint } from "./types";

const FALLBACK = RISK_TIER_DEFAULTS.moderate;

function returnAndVolatility(holding: Holding): { expectedReturn: number; volatility: number } {
  const known = findTicker(holding.ticker);
  if (known) return known;
  if (holding.riskTier) return RISK_TIER_DEFAULTS[holding.riskTier];
  return FALLBACK;
}

/** Blends a list of holdings into one expected return & volatility, weighted by amount. */
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

interface AnnualContributions {
  annualContribution: number;
  annualPensionContribution: number;
  annualPersonalContribution: number;
  annualEmployeeNetCost: number;
  annualEmployerContribution: number;
  annualTaxReliefFreebie: number;
}

function computeContributions(plan: SimplePlan): AnnualContributions {
  const personal = plan.salary * (plan.savingsRatePercent / 100);

  if (!plan.pensionEnabled) {
    return {
      annualContribution: personal,
      annualPensionContribution: 0,
      annualPersonalContribution: personal,
      annualEmployeeNetCost: 0,
      annualEmployerContribution: 0,
      annualTaxReliefFreebie: 0,
    };
  }

  const pension = calculatePensionContribution(plan.salary, plan.employeePensionPercent, plan.employerPensionPercent);
  const taxReliefFreebie = pension.employeeGross - pension.employeeNetCost;

  return {
    annualContribution: personal + pension.totalIntoPot,
    annualPensionContribution: pension.totalIntoPot,
    annualPersonalContribution: personal,
    annualEmployeeNetCost: pension.employeeNetCost,
    annualEmployerContribution: pension.employerContribution,
    annualTaxReliefFreebie: taxReliefFreebie,
  };
}

/** @param delayYears Optional — pushes contributions out to model "what if I start late". */
export function runProjection(plan: SimplePlan, delayYears = 0): ProjectionResult {
  const { blendedReturn, blendedVolatility, startingBalance } = blendPortfolio(plan.holdings);
  const contributions = computeContributions(plan);

  const years: YearPoint[] = [];
  let balance = startingBalance;
  let contributed = startingBalance;

  for (let y = 0; y <= plan.yearsHorizon; y++) {
    if (y > 0) {
      const isContributing = y > delayYears;
      const contribution = isContributing ? contributions.annualContribution : 0;
      balance = (balance + contribution) * (1 + blendedReturn / 100);
      contributed += contribution;
    }
    years.push({ year: y, balance, contributed });
  }

  const finalBalance = years[years.length - 1]?.balance ?? startingBalance;
  const totalContributed = years[years.length - 1]?.contributed ?? startingBalance;

  return {
    years,
    startingBalance,
    ...contributions,
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
  const { annualContribution } = computeContributions(plan);
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

  const lastBand = bands[bands.length - 1];

  return {
    bands,
    pessimisticFinalBalance: lastBand?.p10 ?? startingBalance,
    medianFinalBalance: lastBand?.p50 ?? startingBalance,
  };
}
