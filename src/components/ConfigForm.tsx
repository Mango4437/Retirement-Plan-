import type { RetirementConfig } from "../lib/types";
import { Section } from "./Section";
import { NumberField } from "./fields/NumberField";
import { SelectField } from "./fields/SelectField";
import { ToggleField } from "./fields/ToggleField";
import { OneTimeExpensesEditor } from "./config/OneTimeExpensesEditor";

interface Props {
  config: RetirementConfig;
  onChange: (config: RetirementConfig) => void;
  onReset: () => void;
}

export function ConfigForm({ config, onChange, onReset }: Props) {
  const set = <K extends keyof RetirementConfig>(key: K, value: RetirementConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Plan inputs</h2>
          <p className="text-xs text-[var(--text-muted)]">Every assumption below is configurable.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--status-critical)] hover:text-[var(--status-critical)]"
        >
          Reset
        </button>
      </div>

      <Section title="Timeline" description="Your age milestones">
        <NumberField label="Current age" value={config.currentAge} onChange={(v) => set("currentAge", v)} min={16} max={80} suffix="yrs" />
        <NumberField
          label="Retirement age"
          value={config.retirementAge}
          onChange={(v) => set("retirementAge", v)}
          min={config.currentAge + 1}
          max={85}
          suffix="yrs"
        />
        <NumberField
          label="Life expectancy"
          value={config.lifeExpectancy}
          onChange={(v) => set("lifeExpectancy", v)}
          min={config.retirementAge + 1}
          max={110}
          suffix="yrs"
        />
      </Section>

      <Section title="Income & contributions" description="Salary, savings rate, and employer match">
        <NumberField
          label="Annual income (gross)"
          value={config.annualIncome}
          onChange={(v) => set("annualIncome", v)}
          min={0}
          max={1000000}
          step={1000}
          prefix="$"
          withSlider={false}
        />
        <NumberField label="Income growth" value={config.incomeGrowthRate} onChange={(v) => set("incomeGrowthRate", v)} min={0} max={10} step={0.1} suffix="%/yr" />
        <NumberField
          label="Current savings"
          value={config.currentSavings}
          onChange={(v) => set("currentSavings", v)}
          min={0}
          max={5000000}
          step={1000}
          prefix="$"
          withSlider={false}
        />
        <NumberField label="Your contribution" value={config.contributionPercent} onChange={(v) => set("contributionPercent", v)} min={0} max={50} step={0.5} suffix="% salary" />
        <NumberField
          label="Employer match"
          value={config.employerMatchPercent}
          onChange={(v) => set("employerMatchPercent", v)}
          min={0}
          max={200}
          step={5}
          suffix="%"
          help="e.g. 50% means employer contributes $0.50 per $1 you contribute, up to the limit below"
        />
        <NumberField label="Match limit" value={config.employerMatchLimit} onChange={(v) => set("employerMatchLimit", v)} min={0} max={20} step={0.5} suffix="% salary" />
      </Section>

      <Section title="Investment assumptions" description="Expected market returns and inflation">
        <NumberField label="Pre-retirement return" value={config.preRetirementReturn} onChange={(v) => set("preRetirementReturn", v)} min={0} max={15} step={0.1} suffix="%/yr" />
        <NumberField label="Post-retirement return" value={config.postRetirementReturn} onChange={(v) => set("postRetirementReturn", v)} min={0} max={15} step={0.1} suffix="%/yr" />
        <NumberField label="Inflation" value={config.inflationRate} onChange={(v) => set("inflationRate", v)} min={0} max={10} step={0.1} suffix="%/yr" />
        <NumberField
          label="Return volatility"
          value={config.returnVolatility}
          onChange={(v) => set("returnVolatility", v)}
          min={0}
          max={30}
          step={0.5}
          suffix="% stdev"
          help="Used for the Monte Carlo simulation below"
        />
      </Section>

      <Section title="Retirement spending">
        <SelectField
          label="Spending target"
          value={config.spendingMode}
          onChange={(v) => set("spendingMode", v as RetirementConfig["spendingMode"])}
          options={[
            { value: "replacement", label: "% of final salary" },
            { value: "fixed", label: "Fixed amount (today's $)" },
          ]}
        />
        {config.spendingMode === "replacement" ? (
          <NumberField label="Replacement ratio" value={config.replacementRatio} onChange={(v) => set("replacementRatio", v)} min={10} max={150} step={5} suffix="%" />
        ) : (
          <NumberField
            label="Annual spending"
            value={config.fixedAnnualSpending}
            onChange={(v) => set("fixedAnnualSpending", v)}
            min={0}
            max={500000}
            step={1000}
            prefix="$"
            withSlider={false}
          />
        )}
        <SelectField
          label="Withdrawal strategy"
          value={config.withdrawalStrategy}
          onChange={(v) => set("withdrawalStrategy", v as RetirementConfig["withdrawalStrategy"])}
          options={[
            { value: "fixed-real", label: "Spend target, inflation-adjusted" },
            { value: "percent-of-balance", label: "% of balance each year" },
          ]}
        />
        {config.withdrawalStrategy === "percent-of-balance" && (
          <NumberField label="Withdrawal rate" value={config.percentOfBalanceRate} onChange={(v) => set("percentOfBalanceRate", v)} min={1} max={15} step={0.25} suffix="%/yr" />
        )}
        <NumberField label="Effective tax rate" value={config.effectiveTaxRate} onChange={(v) => set("effectiveTaxRate", v)} min={0} max={50} step={1} suffix="%" />
      </Section>

      <Section title="Other retirement income" description="Social Security, pension, and other sources (today's dollars)">
        <NumberField
          label="Social Security"
          value={config.socialSecurityMonthly}
          onChange={(v) => set("socialSecurityMonthly", v)}
          min={0}
          max={6000}
          step={50}
          prefix="$"
          suffix="/mo"
        />
        <NumberField
          label="SS start age"
          value={config.socialSecurityStartAge}
          onChange={(v) => set("socialSecurityStartAge", v)}
          min={62}
          max={70}
          suffix="yrs"
        />
        <NumberField label="Pension" value={config.pensionMonthly} onChange={(v) => set("pensionMonthly", v)} min={0} max={10000} step={50} prefix="$" suffix="/mo" />
        <NumberField label="Pension start age" value={config.pensionStartAge} onChange={(v) => set("pensionStartAge", v)} min={config.retirementAge} max={80} suffix="yrs" />
        <NumberField
          label="Other income"
          value={config.otherIncomeMonthly}
          onChange={(v) => set("otherIncomeMonthly", v)}
          min={0}
          max={10000}
          step={50}
          prefix="$"
          suffix="/mo"
          help="Rental income, part-time work, annuities, etc."
        />
      </Section>

      <Section title="One-time expenses" defaultOpen={false}>
        <OneTimeExpensesEditor
          expenses={config.oneTimeExpenses}
          onChange={(v) => set("oneTimeExpenses", v)}
          currentAge={config.currentAge}
          lifeExpectancy={config.lifeExpectancy}
        />
      </Section>

      <Section title="Monte Carlo simulation" description="Model market uncertainty" defaultOpen={false}>
        <ToggleField label="Enable simulation" checked={config.monteCarloEnabled} onChange={(v) => set("monteCarloEnabled", v)} />
        {config.monteCarloEnabled && (
          <NumberField label="Simulation runs" value={config.simulationRuns} onChange={(v) => set("simulationRuns", v)} min={50} max={2000} step={50} withSlider={false} />
        )}
      </Section>
    </div>
  );
}
