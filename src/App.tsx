import { useMemo, useState } from "react";
import { runProjection } from "./lib/calculator";
import { runMonteCarlo } from "./lib/monteCarlo";
import { DEFAULT_CONFIG, createId } from "./lib/defaults";
import type { RetirementConfig, SavedScenario } from "./lib/types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { ConfigForm } from "./components/ConfigForm";
import { Dashboard } from "./components/Dashboard";
import { ScenarioManager } from "./components/ScenarioManager";
import { ThemeToggle } from "./components/ThemeToggle";
import { Card } from "./components/dashboard/Card";
import { ComparisonChart, type ComparisonSeries } from "./components/dashboard/ComparisonChart";

const SCENARIO_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

function App() {
  const [config, setConfig] = useLocalStorage<RetirementConfig>("retirement-plan:config", DEFAULT_CONFIG);
  const [scenarios, setScenarios] = useLocalStorage<SavedScenario[]>("retirement-plan:scenarios", []);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

  const result = useMemo(() => runProjection(config), [config]);
  const monteCarlo = useMemo(() => (config.monteCarloEnabled ? runMonteCarlo(config) : null), [config]);

  const comparisonSeries: ComparisonSeries[] = useMemo(() => {
    if (compareIds.length === 0) return [];
    const list: ComparisonSeries[] = [
      { id: "__current", label: `${config.name} (current)`, color: SCENARIO_COLORS[0], years: result.years },
    ];
    compareIds.forEach((id, idx) => {
      const scenario = scenarios.find((s) => s.id === id);
      if (!scenario) return;
      list.push({
        id: scenario.id,
        label: scenario.name,
        color: SCENARIO_COLORS[(idx + 1) % SCENARIO_COLORS.length],
        years: runProjection(scenario.config).years,
      });
    });
    return list;
  }, [compareIds, scenarios, config, result]);

  const handleSaveScenario = (name: string) => {
    const scenario: SavedScenario = {
      id: createId(),
      name,
      savedAt: new Date().toISOString(),
      config: { ...config, name },
    };
    setScenarios([scenario, ...scenarios]);
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setConfig(scenario.config);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
    setCompareIds(compareIds.filter((cid) => cid !== id));
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-[var(--page-plane)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Retirement Plan Studio</h1>
            <p className="text-xs text-[var(--text-muted)]">A fully configurable retirement projection &amp; simulation tool</p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 p-4 md:px-6 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)] lg:overflow-y-auto">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4">
            <ConfigForm config={config} onChange={setConfig} onReset={() => setConfig(DEFAULT_CONFIG)} />
          </div>
          <ScenarioManager
            scenarios={scenarios}
            currentName={config.name}
            onSave={handleSaveScenario}
            onLoad={handleLoadScenario}
            onDelete={handleDeleteScenario}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
        </aside>

        <section className="flex flex-col gap-4">
          <Dashboard config={config} result={result} monteCarlo={monteCarlo} />

          {comparisonSeries.length > 0 && (
            <Card title="Scenario comparison" description="Balance projections side by side">
              <ComparisonChart series={comparisonSeries} />
            </Card>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-8 pt-4 text-center text-xs text-[var(--text-muted)] md:px-6">
        Estimates only, not financial advice. All data stays in your browser.
      </footer>
    </div>
  );
}

export default App;
