import type { ProjectionResult, RetirementConfig, YearProjection } from "./types";

const pct = (rate: number) => rate / 100;

/** Employer match applies to the lesser of what the employee contributes and the match limit. */
function employerMatchFraction(config: RetirementConfig): number {
  const matchedContribution = Math.min(config.contributionPercent, config.employerMatchLimit);
  return pct(matchedContribution) * pct(config.employerMatchPercent);
}

function salaryAtYear(config: RetirementConfig, yearsFromNow: number): number {
  return config.annualIncome * Math.pow(1 + pct(config.incomeGrowthRate), yearsFromNow);
}

function inflate(amount: number, inflationRate: number, years: number): number {
  return amount * Math.pow(1 + pct(inflationRate), years);
}

/** Nominal annual spending target for a given age during retirement. */
function spendingForAge(config: RetirementConfig, age: number, finalSalaryNominal: number): number {
  const yearsIntoRetirement = age - config.retirementAge;

  if (config.spendingMode === "replacement") {
    const atRetirement = finalSalaryNominal * pct(config.replacementRatio);
    return inflate(atRetirement, config.inflationRate, yearsIntoRetirement);
  }

  const atRetirement = inflate(
    config.fixedAnnualSpending,
    config.inflationRate,
    config.retirementAge - config.currentAge,
  );
  return inflate(atRetirement, config.inflationRate, yearsIntoRetirement);
}

function incomeOffsetForAge(
  age: number,
  currentAge: number,
  monthlyAmountToday: number,
  startAge: number,
  inflationRate: number,
): number {
  if (age < startAge || monthlyAmountToday <= 0) return 0;
  const annualAtStart = inflate(monthlyAmountToday * 12, inflationRate, startAge - currentAge);
  return inflate(annualAtStart, inflationRate, age - startAge);
}

interface RunOptions {
  /** Override annual returns per simulated year (for Monte Carlo). Index 0 = currentAge. */
  returnOverrides?: number[];
}

/**
 * Runs a single deterministic (or seeded-override) year-by-year projection.
 * Contributions/withdrawals are assumed to occur at the start of each year,
 * with growth applied to the remaining balance for that year (start-of-year convention).
 */
export function runProjection(config: RetirementConfig, options: RunOptions = {}): ProjectionResult {
  const years: YearProjection[] = [];
  const totalYears = config.lifeExpectancy - config.currentAge;
  const matchFraction = employerMatchFraction(config);
  const finalSalaryNominal = salaryAtYear(config, config.retirementAge - config.currentAge);

  let balance = config.currentSavings;
  let cumulativeContributions = config.currentSavings;
  let cumulativeGrowth = 0;
  let depletionAge: number | null = null;
  let shortfallAmount = 0;

  const expensesByAge = new Map<number, number>();
  for (const expense of config.oneTimeExpenses) {
    expensesByAge.set(expense.age, (expensesByAge.get(expense.age) ?? 0) + expense.amount);
  }

  for (let t = 0; t <= totalYears; t++) {
    const age = config.currentAge + t;
    const phase: "accumulation" | "retirement" = age < config.retirementAge ? "accumulation" : "retirement";
    const startBalance = balance;
    const returnRate =
      options.returnOverrides?.[t] ??
      (phase === "accumulation" ? config.preRetirementReturn : config.postRetirementReturn);

    let contributions = 0;
    let employerContributions = 0;
    let withdrawals = 0;
    let incomeFromSS = 0;
    let incomeFromPension = 0;
    let incomeFromOther = 0;
    let spendingNeed = 0;
    let midYearBalance: number;

    if (phase === "accumulation") {
      const salary = salaryAtYear(config, t);
      contributions = salary * pct(config.contributionPercent);
      employerContributions = salary * matchFraction;
      midYearBalance = startBalance + contributions + employerContributions;
    } else {
      incomeFromSS = incomeOffsetForAge(
        age,
        config.currentAge,
        config.socialSecurityMonthly,
        config.socialSecurityStartAge,
        config.inflationRate,
      );
      incomeFromPension = incomeOffsetForAge(
        age,
        config.currentAge,
        config.pensionMonthly,
        config.pensionStartAge,
        config.inflationRate,
      );
      incomeFromOther = age >= config.retirementAge ? inflate(config.otherIncomeMonthly * 12, config.inflationRate, t) : 0;

      if (config.withdrawalStrategy === "percent-of-balance") {
        withdrawals = startBalance * pct(config.percentOfBalanceRate);
        spendingNeed = withdrawals;
      } else {
        spendingNeed = spendingForAge(config, age, finalSalaryNominal);
        const netNeed = Math.max(0, spendingNeed - incomeFromSS - incomeFromPension - incomeFromOther);
        const taxRate = Math.min(pct(config.effectiveTaxRate), 0.99);
        withdrawals = netNeed / (1 - taxRate);
      }

      midYearBalance = startBalance - withdrawals;
    }

    const expense = expensesByAge.get(age) ?? 0;
    midYearBalance -= expense;

    let depleted = false;
    if (midYearBalance < 0) {
      depleted = true;
      if (depletionAge === null) depletionAge = age;
      shortfallAmount += -midYearBalance;
      midYearBalance = 0;
    }

    const growth = midYearBalance * pct(returnRate);
    const endBalance = midYearBalance + growth;

    cumulativeContributions += contributions + employerContributions;
    cumulativeGrowth += growth;

    years.push({
      age,
      year: t,
      phase,
      startBalance,
      contributions,
      employerContributions,
      withdrawals: withdrawals + expense,
      growth,
      endBalance,
      cumulativeContributions,
      cumulativeGrowth,
      incomeFromSS,
      incomeFromPension,
      incomeFromOther,
      spendingNeed,
      depleted,
    });

    balance = endBalance;
  }

  const retirementYear = years.find((y) => y.age === config.retirementAge);
  const balanceAtRetirement = retirementYear ? retirementYear.startBalance : config.currentSavings;
  const cumulativeAtRetirement = years.find((y) => y.age === config.retirementAge - 1);

  return {
    years,
    balanceAtRetirement,
    totalContributionsAtRetirement: cumulativeAtRetirement?.cumulativeContributions ?? config.currentSavings,
    totalGrowthAtRetirement: cumulativeAtRetirement?.cumulativeGrowth ?? 0,
    depletionAge,
    finalBalance: years[years.length - 1]?.endBalance ?? balance,
    isSustainable: depletionAge === null,
    shortfallAmount,
  };
}
