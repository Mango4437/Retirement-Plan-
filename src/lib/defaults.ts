import type { RetirementConfig } from "./types";

export const DEFAULT_CONFIG: RetirementConfig = {
  name: "My Retirement Plan",

  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,

  annualIncome: 85000,
  incomeGrowthRate: 3,
  currentSavings: 25000,
  contributionPercent: 10,
  employerMatchPercent: 50,
  employerMatchLimit: 6,

  preRetirementReturn: 7,
  postRetirementReturn: 5,
  inflationRate: 2.5,
  returnVolatility: 12,

  spendingMode: "replacement",
  replacementRatio: 80,
  fixedAnnualSpending: 60000,
  withdrawalStrategy: "fixed-real",
  percentOfBalanceRate: 4,
  effectiveTaxRate: 15,

  socialSecurityMonthly: 2200,
  socialSecurityStartAge: 67,
  pensionMonthly: 0,
  pensionStartAge: 65,
  otherIncomeMonthly: 0,

  oneTimeExpenses: [],

  monteCarloEnabled: true,
  simulationRuns: 500,
};

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}
