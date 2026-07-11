import { runProjection } from "./calculator";
import type { MonteCarloBand, MonteCarloResult, RetirementConfig } from "./types";

/** Standard normal sample via the Box–Muller transform. */
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

export function runMonteCarlo(config: RetirementConfig): MonteCarloResult {
  const runs = Math.max(50, Math.min(2000, config.simulationRuns));
  const totalYears = config.lifeExpectancy - config.currentAge;
  const balancesByYear: number[][] = Array.from({ length: totalYears + 1 }, () => []);
  const depletionAges: number[] = [];
  let successes = 0;

  for (let run = 0; run < runs; run++) {
    const returnOverrides: number[] = [];
    for (let t = 0; t <= totalYears; t++) {
      const age = config.currentAge + t;
      const mean = age < config.retirementAge ? config.preRetirementReturn : config.postRetirementReturn;
      const sample = mean + randomNormal() * config.returnVolatility;
      returnOverrides.push(sample);
    }

    const result = runProjection(config, { returnOverrides });
    result.years.forEach((y, idx) => {
      balancesByYear[idx].push(y.endBalance);
    });

    if (result.isSustainable) {
      successes++;
    } else if (result.depletionAge !== null) {
      depletionAges.push(result.depletionAge);
    }
  }

  const bands: MonteCarloBand[] = balancesByYear.map((balances, idx) => {
    const sorted = [...balances].sort((a, b) => a - b);
    return {
      age: config.currentAge + idx,
      p10: percentile(sorted, 0.1),
      p25: percentile(sorted, 0.25),
      p50: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      p90: percentile(sorted, 0.9),
    };
  });

  return {
    successProbability: (successes / runs) * 100,
    bands,
    depletionAges,
    runsCompleted: runs,
  };
}
