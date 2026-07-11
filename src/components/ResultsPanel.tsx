import { useState } from "react";
import type { MonteCarloResult, ProjectionResult, SimplePlan } from "../lib/types";
import { formatCurrency } from "../lib/format";
import { GrowthChart } from "./GrowthChart";

interface Props {
  plan: SimplePlan;
  result: ProjectionResult;
  monteCarlo: MonteCarloResult | null;
}

export function ResultsPanel({ plan, result, monteCarlo }: Props) {
  const [showAssumptions, setShowAssumptions] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <p className="text-sm text-[var(--text-muted)]">
          In {plan.yearsHorizon} year{plan.yearsHorizon === 1 ? "" : "s"}, you could have approximately
        </p>
        <p className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">{formatCurrency(result.finalBalance)}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          You'll have put in <strong className="text-[var(--text-primary)]">{formatCurrency(result.totalContributed)}</strong> of your
          own money. The other{" "}
          <strong style={{ color: "var(--status-good)" }}>{formatCurrency(Math.max(0, result.totalGrowth))}</strong> comes from
          investment growth — assuming your investments grow at about <strong>{result.blendedReturn.toFixed(1)}%</strong> per year on
          average. That won't happen in a straight line: some years will be up a lot, some years down.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">How your money could grow</h3>
        <p className="mb-3 text-xs text-[var(--text-muted)]">
          The line is the expected path. The shaded band shows a realistic range if the market does better or worse than average.
        </p>
        <GrowthChart years={result.years} monteCarlo={monteCarlo} />
      </div>

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
              Your investments are blended into one expected return of <strong>{result.blendedReturn.toFixed(1)}%/yr</strong>, with
              typical year-to-year swings of about <strong>±{result.blendedVolatility.toFixed(0)}%</strong>, based on long-term
              historical averages for what you listed:
            </p>
            {plan.holdings.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No investments listed, so this uses a generic diversified stock fund assumption.
              </p>
            ) : (
              <ul className="flex flex-col gap-1 text-xs">
                {plan.holdings.map((h) => (
                  <li key={h.id} className="flex justify-between border-b border-[var(--border)] py-1 last:border-b-0">
                    <span>{h.ticker || "(untitled)"}</span>
                    <span className="text-[var(--text-muted)]">{formatCurrency(h.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              These are estimates based on long-run historical averages, not predictions. Markets go up and down — actual results
              will differ, sometimes a lot. This isn't financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
