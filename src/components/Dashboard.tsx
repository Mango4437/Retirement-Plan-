import type { MonteCarloResult, ProjectionResult, RetirementConfig } from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/format";
import { StatTile } from "./dashboard/StatTile";
import { Card } from "./dashboard/Card";
import { BalanceChart } from "./dashboard/BalanceChart";
import { ContributionChart } from "./dashboard/ContributionChart";
import { IncomeMixChart } from "./dashboard/IncomeMixChart";

interface Props {
  config: RetirementConfig;
  result: ProjectionResult;
  monteCarlo: MonteCarloResult | null;
}

export function Dashboard({ config, result, monteCarlo }: Props) {
  const yearsInRetirement = config.lifeExpectancy - config.retirementAge;
  const fundedLabel = result.isSustainable
    ? `Lasts through age ${config.lifeExpectancy}`
    : `Runs out at age ${result.depletionAge}`;
  const fundedStatus = result.isSustainable ? "good" : "critical";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Balance at retirement" value={formatCurrency(result.balanceAtRetirement)} sublabel={`Age ${config.retirementAge}`} />
        <StatTile
          label="Retirement outlook"
          value={result.isSustainable ? "Funded" : "Shortfall"}
          sublabel={fundedLabel}
          status={fundedStatus}
        />
        <StatTile
          label="Monte Carlo success"
          value={monteCarlo ? formatPercent(monteCarlo.successProbability, 1) : "—"}
          sublabel={monteCarlo ? `${monteCarlo.runsCompleted} simulations` : "Simulation disabled"}
          status={monteCarlo ? (monteCarlo.successProbability >= 80 ? "good" : monteCarlo.successProbability >= 50 ? "warning" : "critical") : "neutral"}
        />
        <StatTile
          label="Ending balance"
          value={formatCurrency(result.finalBalance)}
          sublabel={`At age ${config.lifeExpectancy} (${yearsInRetirement}yr retirement)`}
        />
      </div>

      <Card title="Balance over time" description="Projected account balance through retirement, with Monte Carlo confidence range">
        <BalanceChart years={result.years} monteCarlo={monteCarlo} retirementAge={config.retirementAge} depletionAge={result.depletionAge} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Contributions vs. growth" description="How your balance builds by retirement age">
          <ContributionChart years={result.years} />
        </Card>
        <Card title="Retirement income mix" description="What covers your spending each year in retirement">
          <IncomeMixChart years={result.years} />
        </Card>
      </div>

      {!result.isSustainable && (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--status-critical)_40%,transparent)] bg-[color-mix(in_srgb,var(--status-critical)_8%,transparent)] p-4 text-sm text-[var(--text-primary)]">
          <strong style={{ color: "var(--status-critical)" }}>Shortfall detected.</strong> At current assumptions, savings are
          projected to run out at age {result.depletionAge}, leaving an estimated {formatCurrency(result.shortfallAmount)} in unmet
          spending needs through age {config.lifeExpectancy}. Consider increasing contributions, delaying retirement, or reducing
          planned spending.
        </div>
      )}
    </div>
  );
}
