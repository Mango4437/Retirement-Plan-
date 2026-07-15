export type ExamBody = "SOA" | "CAS" | "IFoA";
export type Credential = "associate" | "fellow";
export type EducationLevel = "highschool" | "undergrad" | "graduate" | "careerSwitcher";

export type MilestoneCategory = "preliminary" | "vee" | "fap" | "core" | "specialist" | "advanced" | "professionalism";

export interface Milestone {
  code: string;
  name: string;
  category: MilestoneCategory;
  /** Rough study hours a first-time candidate typically needs. */
  hours: number;
  /** Only required if the candidate is targeting Fellowship, not just Associateship. */
  fellowOnly?: boolean;
}

export interface CareerPlan {
  examBody: ExamBody;
  educationLevel: EducationLevel;
  targetCredential: Credential;
  /** Codes of milestones already completed. */
  completed: string[];
  /** How many exams/modules the candidate commits to attempting per year. */
  examsPerYear: number;
  studyHoursPerWeek: number;
  hasActuarialJob: boolean;
}

export interface RoadmapItem extends Milestone {
  startMonth: number;
  endMonth: number;
}

export interface RoadmapResult {
  remaining: RoadmapItem[];
  totalRemainingHours: number;
  totalMonths: number;
  completionDate: Date;
  requiredWeeklyHours: number;
  paceIsRealistic: boolean;
  realisticMonths: number;
  completedCount: number;
  totalCount: number;
}
