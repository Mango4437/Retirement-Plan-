/**
 * UK automatic-enrolment pension conventions (Pensions Act 2008), 2026/27 tax year.
 * Sources: GOV.UK auto-enrolment earnings thresholds review 2026/27; MoneyHelper;
 * DWP State Pension uprating 2026/27 (triple lock).
 */
export const AUTO_ENROLMENT = {
  /** Minimum contributions apply only to earnings between these two thresholds. */
  qualifyingEarningsLower: 6_240,
  qualifyingEarningsUpper: 50_270,
  /** Employer must contribute at least this % of qualifying earnings. */
  minEmployerPercent: 3,
  /** Employee must contribute at least this % of qualifying earnings (includes tax relief). */
  minEmployeePercent: 5,
  /** Basic-rate tax relief: you pay this fraction of the stated employee % out of take-home pay. */
  employeeNetCostFraction: 0.8,
};

/** Full new State Pension, 2026/27 (for people who reach state pension age on/after 6 Apr 2016). */
export const STATE_PENSION_WEEKLY_2026 = 241.3;
export const STATE_PENSION_ANNUAL_2026 = STATE_PENSION_WEEKLY_2026 * 52;

/** Earnings actually eligible for auto-enrolment minimum contributions (the "qualifying earnings" band). */
export function qualifyingEarnings(salary: number): number {
  const capped = Math.min(salary, AUTO_ENROLMENT.qualifyingEarningsUpper);
  return Math.max(0, capped - AUTO_ENROLMENT.qualifyingEarningsLower);
}

export interface PensionContribution {
  qualifyingEarnings: number;
  employeeGross: number;
  employeeNetCost: number;
  employerContribution: number;
  totalIntoPot: number;
}

/**
 * Employee/employer % apply to qualifying earnings, per UK auto-enrolment rules.
 * The employee's gross contribution already includes basic-rate tax relief — their
 * actual take-home cost is lower than what lands in the pot.
 */
export function calculatePensionContribution(
  salary: number,
  employeePercent: number,
  employerPercent: number,
): PensionContribution {
  const qe = qualifyingEarnings(salary);
  const employeeGross = qe * (employeePercent / 100);
  const employeeNetCost = employeeGross * AUTO_ENROLMENT.employeeNetCostFraction;
  const employerContribution = qe * (employerPercent / 100);

  return {
    qualifyingEarnings: qe,
    employeeGross,
    employeeNetCost,
    employerContribution,
    totalIntoPot: employeeGross + employerContribution,
  };
}
