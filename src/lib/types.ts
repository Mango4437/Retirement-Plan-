export interface OneTimeExpense {
  id: string;
  label: string;
  age: number;
  amount: number;
}

export type SpendingMode = "replacement" | "fixed";
export type WithdrawalStrategy = "fixed-real" | "percent-of-balance";

export interface RetirementConfig {
  /** Identity — only used when a config is saved as a named scenario */
  name: string;

  // Timeline
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;

  // Income & contributions
  annualIncome: number;
  incomeGrowthRate: number; // % per year
  currentSavings: number;
  contributionPercent: number; // % of salary employee contributes
  employerMatchPercent: number; // % employer matches, of the matched contribution
  employerMatchLimit: number; // match applies up to this % of salary contributed

  // Investment assumptions
  preRetirementReturn: number; // % nominal annual return while working
  postRetirementReturn: number; // % nominal annual return while retired
  inflationRate: number; // % per year
  returnVolatility: number; // % standard deviation, for Monte Carlo

  // Retirement income needs
  spendingMode: SpendingMode;
  replacementRatio: number; // % of final salary, used when spendingMode === "replacement"
  fixedAnnualSpending: number; // today's dollars, used when spendingMode === "fixed"
  withdrawalStrategy: WithdrawalStrategy;
  percentOfBalanceRate: number; // % withdrawn of balance each year, when strategy is percent-of-balance
  effectiveTaxRate: number; // % applied to withdrawals

  // Other income sources (today's dollars, inflation-adjusted forward)
  socialSecurityMonthly: number;
  socialSecurityStartAge: number;
  pensionMonthly: number;
  pensionStartAge: number;
  otherIncomeMonthly: number;

  oneTimeExpenses: OneTimeExpense[];

  // Monte Carlo
  monteCarloEnabled: boolean;
  simulationRuns: number;
}

export interface YearProjection {
  age: number;
  year: number;
  phase: "accumulation" | "retirement";
  startBalance: number;
  contributions: number;
  employerContributions: number;
  withdrawals: number;
  growth: number;
  endBalance: number;
  cumulativeContributions: number;
  cumulativeGrowth: number;
  incomeFromSS: number;
  incomeFromPension: number;
  incomeFromOther: number;
  spendingNeed: number;
  depleted: boolean;
}

export interface ProjectionResult {
  years: YearProjection[];
  balanceAtRetirement: number;
  totalContributionsAtRetirement: number;
  totalGrowthAtRetirement: number;
  depletionAge: number | null;
  finalBalance: number;
  isSustainable: boolean;
  shortfallAmount: number;
}

export interface MonteCarloBand {
  age: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MonteCarloResult {
  successProbability: number;
  bands: MonteCarloBand[];
  depletionAges: number[];
  runsCompleted: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  config: RetirementConfig;
}
