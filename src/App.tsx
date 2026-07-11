import { useMemo } from "react";
import { runProjection, runMonteCarlo } from "./lib/calculator";
import type { SimplePlan } from "./lib/types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { ThemeToggle } from "./components/ThemeToggle";
import { StepCard } from "./components/StepCard";
import { HoldingsEditor } from "./components/HoldingsEditor";
import { ResultsPanel } from "./components/ResultsPanel";
import { formatCurrency } from "./lib/format";

const DEFAULT_PLAN: SimplePlan = {
  salary: 45000,
  savingsRatePercent: 15,
  holdings: [],
  yearsHorizon: 10,
};

function App() {
  const [plan, setPlan] = useLocalStorage<SimplePlan>("investing-planner:plan", DEFAULT_PLAN);
  const { theme, setTheme } = useTheme();

  const result = useMemo(() => runProjection(plan), [plan]);
  const monteCarlo = useMemo(() => runMonteCarlo(plan), [plan]);

  const set = <K extends keyof SimplePlan>(key: K, value: SimplePlan[K]) => {
    setPlan({ ...plan, [key]: value });
  };

  const annualContribution = plan.salary * (plan.savingsRatePercent / 100);

  return (
    <div className="min-h-screen bg-[var(--page-plane)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Will I be rich?</h1>
            <p className="text-xs text-[var(--text-muted)]">A simple investing calculator — no finance background needed</p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1000px] flex-col gap-4 p-4 md:px-6">
        <StepCard step={1} title="How much do you earn?" help="Your annual income, before taxes.">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">$</span>
              <input
                type="number"
                value={plan.salary || ""}
                min={0}
                step={1000}
                onChange={(e) => set("salary", e.target.valueAsNumber || 0)}
                className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
              />
              <span className="text-sm text-[var(--text-muted)]">per year</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>How much of that do you want to invest each year?</span>
                <span className="tabular-nums text-[var(--text-primary)]">
                  {plan.savingsRatePercent}% ({formatCurrency(annualContribution)}/yr)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={plan.savingsRatePercent}
                onChange={(e) => set("savingsRatePercent", Number(e.target.value))}
                className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
              />
            </div>
          </div>
        </StepCard>

        <StepCard
          step={2}
          title="What are you invested in?"
          help="A “ticker” is the short code for a stock or fund (e.g. VOO, AAPL). Add what you own now — new money will follow the same mix."
        >
          <HoldingsEditor holdings={plan.holdings} onChange={(h) => set("holdings", h)} />
        </StepCard>

        <StepCard step={3} title="How long until you need this money?" help="E.g. until retirement, or a big goal like a house.">
          <div>
            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>Time horizon</span>
              <span className="tabular-nums text-[var(--text-primary)]">
                {plan.yearsHorizon} year{plan.yearsHorizon === 1 ? "" : "s"}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={plan.yearsHorizon}
              onChange={(e) => set("yearsHorizon", Number(e.target.value))}
              className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
            />
          </div>
        </StepCard>

        <ResultsPanel plan={plan} result={result} monteCarlo={monteCarlo} />
      </main>

      <footer className="mx-auto max-w-[1000px] px-4 pb-8 pt-4 text-center text-xs text-[var(--text-muted)] md:px-6">
        Estimates only, based on historical averages — not financial advice. All data stays in your browser.
      </footer>
    </div>
  );
}

export default App;
