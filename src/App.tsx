import { useMemo } from "react";
import { computeRoadmap, relevantMilestones } from "./lib/planner";
import { BODY_INFO, EDUCATION_LABELS } from "./lib/examData";
import type { CareerPlan, EducationLevel, ExamBody } from "./lib/types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { ThemeToggle } from "./components/ThemeToggle";
import { StepCard } from "./components/StepCard";
import { ToggleField } from "./components/ToggleField";
import { ChoiceCards } from "./components/ChoiceCards";
import { ExamChecklist } from "./components/ExamChecklist";
import { RoadmapPanel } from "./components/RoadmapPanel";

const DEFAULT_PLAN: CareerPlan = {
  examBody: "SOA",
  educationLevel: "undergrad",
  targetCredential: "fellow",
  completed: [],
  examsPerYear: 2,
  studyHoursPerWeek: 12,
  hasActuarialJob: false,
};

function App() {
  const [plan, setPlan] = useLocalStorage<CareerPlan>("actuary-planner:plan-v1", DEFAULT_PLAN);
  const { theme, setTheme } = useTheme();

  const milestones = useMemo(() => relevantMilestones(plan), [plan]);
  const result = useMemo(() => computeRoadmap(plan), [plan]);

  const set = <K extends keyof CareerPlan>(key: K, value: CareerPlan[K]) => {
    setPlan({ ...plan, [key]: value });
  };

  const bodyInfo = BODY_INFO[plan.examBody];

  return (
    <div className="min-h-screen bg-[var(--page-plane)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Becoming an Actuary</h1>
            <p className="text-xs text-[var(--text-muted)]">A configurable roadmap for passing your actuarial exams</p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1000px] flex-col gap-4 p-4 md:px-6">
        <StepCard step={1} title="Where are you starting from?" help="This just sets expectations — it doesn't change the roadmap math.">
          <div className="flex flex-col gap-3">
            <ChoiceCards
              value={plan.educationLevel}
              onChange={(v: EducationLevel) => set("educationLevel", v)}
              options={(Object.keys(EDUCATION_LABELS) as EducationLevel[]).map((key) => ({ value: key, label: EDUCATION_LABELS[key] }))}
            />
            <ToggleField
              label="I currently work in an actuarial-adjacent role"
              checked={plan.hasActuarialJob}
              onChange={(v) => set("hasActuarialJob", v)}
              help="An analyst/trainee role with exam support (study days, fee reimbursement) — not required, but it helps a lot."
            />
          </div>
        </StepCard>

        <StepCard step={2} title="Pick your exam track" help="Each body has its own syllabus, exam codes, and credential names.">
          <div className="flex flex-col gap-4">
            <ChoiceCards
              value={plan.examBody}
              onChange={(v: ExamBody) => set("examBody", v)}
              options={(Object.keys(BODY_INFO) as ExamBody[]).map((key) => ({
                value: key,
                label: BODY_INFO[key].label,
                description: `${BODY_INFO[key].region} · ${BODY_INFO[key].blurb}`,
              }))}
            />
            <div>
              <p className="mb-2 text-sm text-[var(--text-secondary)]">Target credential</p>
              <ChoiceCards
                value={plan.targetCredential}
                onChange={(v: CareerPlan["targetCredential"]) => set("targetCredential", v)}
                options={[
                  { value: "associate", label: bodyInfo.associateLabel, description: "Associateship — the first professional milestone." },
                  { value: "fellow", label: bodyInfo.fellowLabel, description: "Fellowship — full qualification, most senior roles expect this." },
                ]}
              />
            </div>
          </div>
        </StepCard>

        <StepCard
          step={3}
          title="What have you already completed?"
          help="Check off any exams, VEE credits, or modules you've already passed — the roadmap below only covers what's left."
        >
          <ExamChecklist milestones={milestones} completed={plan.completed} onChange={(c) => set("completed", c)} />
        </StepCard>

        <StepCard step={4} title="Set your pace" help="How ambitious do you want to be, and how much time can you realistically give it?">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Exams/sittings attempted per year</span>
                <span className="tabular-nums text-[var(--text-primary)]">{plan.examsPerYear}</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={plan.examsPerYear}
                onChange={(e) => set("examsPerYear", Number(e.target.value))}
                className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Study hours available per week</span>
                <span className="tabular-nums text-[var(--text-primary)]">{plan.studyHoursPerWeek}h</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={plan.studyHoursPerWeek}
                onChange={(e) => set("studyHoursPerWeek", Number(e.target.value))}
                className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
              />
            </div>
          </div>
        </StepCard>

        <RoadmapPanel plan={plan} result={result} />
      </main>

      <footer className="mx-auto max-w-[1000px] px-4 pb-8 pt-4 text-center text-xs text-[var(--text-muted)] md:px-6">
        Estimates only, using broad industry rules of thumb — not official guidance from any actuarial body. Your plan is saved to your
        browser's localStorage only; nothing is sent anywhere.
      </footer>
    </div>
  );
}

export default App;
