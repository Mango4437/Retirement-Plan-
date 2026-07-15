import { useState } from "react";
import { BODY_INFO } from "../lib/examData";
import { formatDuration, formatHours, formatMonthYear } from "../lib/format";
import type { CareerPlan, RoadmapResult } from "../lib/types";
import { TimelineChart } from "./TimelineChart";

interface Props {
  plan: CareerPlan;
  result: RoadmapResult;
}

export function RoadmapPanel({ plan, result }: Props) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const bodyInfo = BODY_INFO[plan.examBody];
  const credentialLabel = plan.targetCredential === "associate" ? bodyInfo.associateLabel : bodyInfo.fellowLabel;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <p className="text-sm text-[var(--text-muted)]">
          At {plan.examsPerYear} exam{plan.examsPerYear === 1 ? "" : "s"}/year, you'd reach <strong>{credentialLabel}</strong> around
        </p>
        {result.remaining.length === 0 ? (
          <p className="text-3xl font-bold text-[var(--text-primary)]">You're already there 🎉</p>
        ) : (
          <p className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">{formatMonthYear(result.completionDate)}</p>
        )}
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {result.completedCount}/{result.totalCount} requirements done · {formatHours(result.totalRemainingHours)} of study left ·{" "}
          {formatDuration(result.totalMonths)} of exam sittings at this pace.
        </p>
      </div>

      {result.remaining.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Reality check</h3>
          {result.paceIsRealistic ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Hitting {plan.examsPerYear}/year needs about{" "}
              <strong style={{ color: "var(--status-good)" }}>{Math.ceil(result.requiredWeeklyHours)}h/week</strong> of study. Your stated{" "}
              <strong className="text-[var(--text-primary)]">{plan.studyHoursPerWeek}h/week</strong> covers that comfortably.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              Hitting {plan.examsPerYear}/year actually needs about{" "}
              <strong style={{ color: "var(--status-critical)" }}>{Math.ceil(result.requiredWeeklyHours)}h/week</strong> of study. At your
              stated <strong className="text-[var(--text-primary)]">{plan.studyHoursPerWeek}h/week</strong>, this would realistically
              take <strong style={{ color: "var(--status-critical)" }}>{formatDuration(result.realisticMonths)}</strong> instead —
              either free up more study time or slow your target pace.
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Your roadmap</h3>
        <p className="mb-3 text-xs text-[var(--text-muted)]">
          Each bar is one remaining exam, module, or requirement, sized by typical study hours and placed by when you'd tackle it at
          your chosen pace.
        </p>
        <TimelineChart items={result.remaining} />
      </div>

      {!plan.hasActuarialJob && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 text-sm text-[var(--text-secondary)]">
          <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Get an actuarial-adjacent role early</h3>
          <p>
            You don't need a job to pass exams, but most qualified actuaries pass the bulk of their exams while working as an actuarial
            analyst/trainee. Employers often give paid study time, exam fee reimbursement, and study material budgets — all of which
            shorten the realistic timeline above far more than any single exam does. Start applying for entry-level actuarial analyst
            roles as soon as you've passed one or two preliminary exams.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <button
          type="button"
          onClick={() => setShowAssumptions((s) => !s)}
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--text-primary)]"
        >
          What am I assuming?
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="text-[var(--text-muted)] transition-transform"
            style={{ transform: showAssumptions ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showAssumptions && (
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <p>
              Study hours per exam use the widely-cited actuarial rule of thumb of roughly <strong>100 hours of study per hour of exam
              time</strong>, adjusted for exam difficulty. These are broad industry estimates, not official figures.
            </p>
            <p>
              The timeline assumes you pass every remaining item on the <strong>first attempt</strong>. Pass rates for actuarial exams
              are typically only 40–50%, so build in buffer — a failed sitting adds a full retake cycle, not just a delay.
            </p>
            <p>
              The pace model treats items as sequential (one sitting slot at a time), which is roughly how preliminary exams and
              certainly fellowship-level exams work in practice. Exam syllabi and structures change over time — always check{" "}
              <strong>{bodyInfo.website}</strong> for the current official requirements before committing to a plan.
            </p>
            <p className="text-xs text-[var(--text-muted)]">This is a planning tool, not official guidance from any actuarial body.</p>
          </div>
        )}
      </div>
    </div>
  );
}
