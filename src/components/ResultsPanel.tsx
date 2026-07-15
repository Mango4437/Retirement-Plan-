import { useMemo, useState } from "react";
import type { MonteCarloResult, ProjectionResult, SimplePlan } from "../lib/types";
import { formatCurrency } from "../lib/format";
import { runProjection } from "../lib/calculator";
import { STATE_PENSION_ANNUAL_2026 } from "../lib/ukPension";
import { GrowthChart } from "./GrowthChart";

interface Props {
  plan: SimplePlan;
  result: ProjectionResult;
  monteCarlo: MonteCarloResult;
}

const DELAY_YEARS = 5;

export function ResultsPanel({ plan, result, monteCarlo }: Props) {
  const [showAssumptions, setShowAssumptions] = useState(false);

  const delayed = useMemo(() => {
    if (plan.yearsHorizon <= DELAY_YEARS) return null;
    return runProjection(plan, DELAY_YEARS);
  }, [plan]);

  const costOfWaiting = delayed ? result.finalBalance - delayed.finalBalance : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <p className="text-sm text-[var(--text-muted)]">
          In {plan.yearsHorizon} year{plan.yearsHorizon === 1 ? "" : "s"}, a realistic <strong>cautious</strong> estimate is
        </p>
        <p className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">{formatCurrency(monteCarlo.pessimisticFinalBalance)}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          That's the outcome in a below-average market (10th percentile) — plan around this number, not the best case. If growth is
          closer to average, you'd have around <strong>{formatCurrency(monteCarlo.medianFinalBalance)}</strong>.
        </p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Either way, you'll have put in <strong className="text-[var(--text-primary)]">{formatCurrency(result.totalContributed)}</strong>{" "}
          of contributions. The rest is investment growth — assuming a conservative <strong>{result.blendedReturn.toFixed(1)}%</strong>{" "}
          per year on average, which won't happen in a straight line.
        </p>
      </div>

      {plan.pensionEnabled && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Where your money is coming from, per year</h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Your pay packet" value={formatCurrency(result.annualEmployeeNetCost)} />
            <Stat label="Tax relief (free)" value={formatCurrency(result.annualTaxReliefFreebie)} good />
            <Stat label="Employer (free)" value={formatCurrency(result.annualEmployerContribution)} good />
            <Stat label="Personal investing" value={formatCurrency(result.annualPersonalContribution)} />
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Every year, {formatCurrency(result.annualTaxReliefFreebie + result.annualEmployerContribution)} lands in your pension that
            you never had to earn — that's the whole case for not opting out of a workplace pension.
          </p>
        </div>
      )}

      {costOfWaiting !== null && costOfWaiting > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">The cost of waiting</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            If you put this off for just <strong>{DELAY_YEARS} years</strong> instead of starting now — same contributions, same
            returns, just started later — you'd end up with{" "}
            <strong style={{ color: "var(--status-critical)" }}>{formatCurrency(costOfWaiting)} less</strong>. That gap is pure lost
            compounding — time in the market is doing more work here than how much you save.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">How your money could grow</h3>
        <p className="mb-3 text-xs text-[var(--text-muted)]">
          The line is the expected path. The shaded band shows a realistic range if the market does better or worse than average.
        </p>
        <GrowthChart years={result.years} monteCarlo={monteCarlo} />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 text-sm text-[var(--text-secondary)]">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Don't count on the State Pension to fill the gap</h3>
        <p>
          The full new State Pension is currently <strong>{formatCurrency(STATE_PENSION_ANNUAL_2026)}/year</strong> (2026/27), and only
          if you have 35 qualifying National Insurance years. The age you can claim it keeps rising, and by the time you retire the
          real value could well be lower than today. Treat it as a small backstop, not a plan.
        </p>
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
              typical year-to-year swings of about <strong>±{result.blendedVolatility.toFixed(0)}%</strong> — deliberately more
              conservative than raw historical stock market averages, because past performance over-promises.
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
              These are estimates, not predictions. Markets go up and down — actual results will differ, sometimes a lot. This isn't
              financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="tabular-nums font-semibold" style={{ color: good ? "var(--status-good)" : "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}
