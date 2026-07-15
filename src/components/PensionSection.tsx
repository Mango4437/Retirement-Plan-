import { AUTO_ENROLMENT, calculatePensionContribution } from "../lib/ukPension";
import { formatCurrency } from "../lib/format";
import { ToggleField } from "./ToggleField";
import type { SimplePlan } from "../lib/types";

interface Props {
  plan: SimplePlan;
  onChange: (patch: Partial<SimplePlan>) => void;
}

export function PensionSection({ plan, onChange }: Props) {
  const result = calculatePensionContribution(plan.salary, plan.employeePensionPercent, plan.employerPensionPercent);
  const belowMinimum =
    plan.employeePensionPercent < AUTO_ENROLMENT.minEmployeePercent || plan.employerPensionPercent < AUTO_ENROLMENT.minEmployerPercent;

  return (
    <div className="flex flex-col gap-3">
      <ToggleField
        label="I'm enrolled in a workplace pension"
        checked={plan.pensionEnabled}
        onChange={(v) => onChange({ pensionEnabled: v })}
        help="By UK law, if you're 22+ and earn over £10,000/yr, your employer must auto-enrol you and contribute too — it's free money on top of your salary."
      />

      {plan.pensionEnabled && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <SliderRow
            label="You contribute"
            value={plan.employeePensionPercent}
            onChange={(v) => onChange({ employeePensionPercent: v })}
            min={0}
            max={20}
          />
          <SliderRow
            label="Your employer contributes"
            value={plan.employerPensionPercent}
            onChange={(v) => onChange({ employerPensionPercent: v })}
            min={0}
            max={20}
          />

          {belowMinimum && (
            <p className="text-xs" style={{ color: "var(--status-warning)" }}>
              Below the UK legal minimum (employee 5% + employer 3% of qualifying earnings). Most workplace schemes won't let you go
              lower than this.
            </p>
          )}

          <div className="rounded-md bg-[var(--surface-1)] p-2.5 text-xs text-[var(--text-secondary)]">
            <p>
              Contributions apply to "qualifying earnings" — the slice of your salary between{" "}
              <strong>£{AUTO_ENROLMENT.qualifyingEarningsLower.toLocaleString()}</strong> and{" "}
              <strong>£{AUTO_ENROLMENT.qualifyingEarningsUpper.toLocaleString()}</strong>, currently{" "}
              <strong>{formatCurrency(result.qualifyingEarnings)}</strong> for you.
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5">
              <li>
                Comes out of your pay: <strong className="text-[var(--text-primary)]">{formatCurrency(result.employeeNetCost)}/yr</strong>
              </li>
              <li>
                Topped up by tax relief:{" "}
                <strong style={{ color: "var(--status-good)" }}>
                  +{formatCurrency(result.employeeGross - result.employeeNetCost)}/yr
                </strong>
              </li>
              <li>
                Added by your employer:{" "}
                <strong style={{ color: "var(--status-good)" }}>+{formatCurrency(result.employerContribution)}/yr</strong>
              </li>
              <li className="mt-1 border-t border-[var(--border)] pt-1">
                Total into your pension: <strong className="text-[var(--text-primary)]">{formatCurrency(result.totalIntoPot)}/yr</strong>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--text-primary)]">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
      />
    </div>
  );
}
