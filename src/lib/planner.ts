import { MILESTONES } from "./examData";
import type { CareerPlan, RoadmapItem, RoadmapResult } from "./types";

/** Relevant milestones for a plan's target credential, in official-order. */
export function relevantMilestones(plan: Pick<CareerPlan, "examBody" | "targetCredential">) {
  const all = MILESTONES[plan.examBody];
  return plan.targetCredential === "associate" ? all.filter((m) => !m.fellowOnly) : all;
}

const WEEKS_PER_MONTH = 52 / 12;

export function computeRoadmap(plan: CareerPlan): RoadmapResult {
  const relevant = relevantMilestones(plan);
  const remainingMilestones = relevant.filter((m) => !plan.completed.includes(m.code));
  const completedCount = relevant.length - remainingMilestones.length;

  const totalRemainingHours = remainingMilestones.reduce((sum, m) => sum + m.hours, 0);

  const examsPerYear = Math.max(1, plan.examsPerYear);
  const monthsPerItem = 12 / examsPerYear;

  const remaining: RoadmapItem[] = remainingMilestones.map((m, i) => ({
    ...m,
    startMonth: i * monthsPerItem,
    endMonth: (i + 1) * monthsPerItem,
  }));

  const totalMonths = remainingMilestones.length * monthsPerItem;

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + Math.round(totalMonths));

  // Hours/week needed to actually finish every remaining item within totalMonths.
  const requiredWeeklyHours = totalMonths > 0 ? totalRemainingHours / (totalMonths * WEEKS_PER_MONTH) : 0;

  // How long it would really take at the candidate's stated study capacity.
  const realisticMonths =
    plan.studyHoursPerWeek > 0 ? totalRemainingHours / plan.studyHoursPerWeek / WEEKS_PER_MONTH : totalMonths;

  return {
    remaining,
    totalRemainingHours,
    totalMonths,
    completionDate,
    requiredWeeklyHours,
    paceIsRealistic: plan.studyHoursPerWeek >= requiredWeeklyHours,
    realisticMonths,
    completedCount,
    totalCount: relevant.length,
  };
}
