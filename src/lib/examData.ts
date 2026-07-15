import type { CareerPlan, ExamBody, Milestone, MilestoneCategory } from "./types";

export interface BodyInfo {
  label: string;
  region: string;
  associateLabel: string;
  fellowLabel: string;
  website: string;
  blurb: string;
}

export const BODY_INFO: Record<ExamBody, BodyInfo> = {
  SOA: {
    label: "Society of Actuaries",
    region: "US & Canada · Life, Health, Retirement, general insurance",
    associateLabel: "ASA",
    fellowLabel: "FSA",
    website: "soa.org",
    blurb: "The most common path for life, health, retirement and enterprise-risk actuaries in North America.",
  },
  CAS: {
    label: "Casualty Actuarial Society",
    region: "US & Canada · Property & Casualty (P&C)",
    associateLabel: "ACAS",
    fellowLabel: "FCAS",
    website: "casact.org",
    blurb: "The path for property & casualty (general insurance) actuaries in North America — auto, home, commercial lines.",
  },
  IFoA: {
    label: "Institute & Faculty of Actuaries",
    region: "UK & international",
    associateLabel: "AIA",
    fellowLabel: "FIA",
    website: "actuaries.org.uk",
    blurb: "The UK qualification, also widely taken internationally, covering life, GI, pensions and investment specialisms.",
  },
};

export const CATEGORY_META: Record<MilestoneCategory, { label: string; color: string }> = {
  preliminary: { label: "Preliminary exam", color: "var(--series-1)" },
  core: { label: "Core exam", color: "var(--series-1)" },
  vee: { label: "VEE credit", color: "var(--series-3)" },
  fap: { label: "Associateship module", color: "var(--series-2)" },
  professionalism: { label: "Professionalism requirement", color: "var(--series-8)" },
  specialist: { label: "Specialist exam", color: "var(--series-5)" },
  advanced: { label: "Fellowship exam/module", color: "var(--series-6)" },
};

export const MILESTONES: Record<ExamBody, Milestone[]> = {
  SOA: [
    { code: "P", name: "Exam P — Probability", category: "preliminary", hours: 300 },
    { code: "FM", name: "Exam FM — Financial Mathematics", category: "preliminary", hours: 250 },
    { code: "FAM", name: "Exam FAM — Fundamentals of Actuarial Mathematics", category: "preliminary", hours: 300 },
    { code: "SRM", name: "Exam SRM — Statistics for Risk Modeling", category: "preliminary", hours: 200 },
    { code: "PA", name: "Exam PA — Predictive Analytics", category: "preliminary", hours: 250 },
    { code: "VEE-ECON", name: "VEE — Economics", category: "vee", hours: 100 },
    { code: "VEE-ACCT", name: "VEE — Accounting & Finance", category: "vee", hours: 100 },
    { code: "VEE-STATS", name: "VEE — Mathematical Statistics", category: "vee", hours: 100 },
    { code: "FAP", name: "FAP — Fundamentals of Actuarial Practice modules", category: "fap", hours: 150 },
    { code: "APC", name: "APC — Associateship Professionalism Course", category: "professionalism", hours: 20 },
    { code: "ADV-TOPIC", name: "Advanced Topics exam (e.g. ALTAM/ASTAM/ERM/QFI, per track)", category: "advanced", hours: 350, fellowOnly: true },
    { code: "FSA-MODULES", name: "FSA e-Learning modules (2, for chosen track)", category: "advanced", hours: 250, fellowOnly: true },
    { code: "FSA-CAPSTONE", name: "FSA capstone / module project", category: "advanced", hours: 100, fellowOnly: true },
  ],
  CAS: [
    { code: "EXAM1", name: "Exam 1 — Probability", category: "preliminary", hours: 300 },
    { code: "EXAM2", name: "Exam 2 — Financial Mathematics & Economics", category: "preliminary", hours: 250 },
    { code: "MAS1", name: "Exam MAS-I — Modern Actuarial Statistics I", category: "preliminary", hours: 250 },
    { code: "MAS2", name: "Exam MAS-II — Modern Actuarial Statistics II", category: "preliminary", hours: 250 },
    { code: "EXAM5", name: "Exam 5 — Basic Ratemaking & Reserving", category: "core", hours: 350 },
    { code: "EXAM6", name: "Exam 6 — Regulation & Financial Reporting", category: "core", hours: 300 },
    { code: "EXAM7", name: "Exam 7 — Estimation of Policy Liabilities", category: "core", hours: 350 },
    { code: "CAS-PROF", name: "CAS Course on Professionalism", category: "professionalism", hours: 20 },
    { code: "EXAM8", name: "Exam 8 — Advanced Ratemaking", category: "advanced", hours: 350, fellowOnly: true },
    { code: "EXAM9", name: "Exam 9 — Financial Risk & Rate of Return", category: "advanced", hours: 300, fellowOnly: true },
    { code: "CAS-CAPSTONE", name: "CAS Ratemaking & Reserving capstone requirement", category: "advanced", hours: 60, fellowOnly: true },
  ],
  IFoA: [
    { code: "CB1", name: "CB1 — Business Finance", category: "core", hours: 150 },
    { code: "CB2", name: "CB2 — Business Economics", category: "core", hours: 150 },
    { code: "CM1", name: "CM1 — Actuarial Mathematics I", category: "core", hours: 250 },
    { code: "CM2", name: "CM2 — Actuarial Mathematics II (Financial Engineering)", category: "core", hours: 250 },
    { code: "CS1", name: "CS1 — Actuarial Statistics I", category: "core", hours: 250 },
    { code: "CS2", name: "CS2 — Actuarial Statistics II", category: "core", hours: 250 },
    { code: "CP1", name: "CP1 — Actuarial Practice", category: "core", hours: 200 },
    { code: "CP2", name: "CP2 — Modelling Practice", category: "core", hours: 150 },
    { code: "CP3", name: "CP3 — Communications Practice", category: "core", hours: 100 },
    { code: "SP-A", name: "Specialist Principles exam #1 (choose SP1–SP9)", category: "specialist", hours: 200, fellowOnly: true },
    { code: "SP-B", name: "Specialist Principles exam #2 (choose SP1–SP9)", category: "specialist", hours: 200, fellowOnly: true },
    { code: "SA", name: "Specialist Advanced exam (matching your specialism)", category: "specialist", hours: 250, fellowOnly: true },
    { code: "WBS-PST", name: "Work-Based Skills + Professional Skills Training portfolio", category: "professionalism", hours: 50, fellowOnly: true },
  ],
};

export const EDUCATION_LABELS: Record<CareerPlan["educationLevel"], string> = {
  highschool: "High school / considering university",
  undergrad: "Undergraduate student",
  graduate: "Graduate / already have a degree",
  careerSwitcher: "Switching careers into actuarial work",
};
