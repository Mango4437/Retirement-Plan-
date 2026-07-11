interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  help?: string;
  withSlider?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  prefix,
  help,
  withSlider = true,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-[var(--text-muted)]">{prefix}</span>}
          <input
            type="number"
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-right text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            value={Number.isFinite(value) ? value : 0}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          />
          {suffix && <span className="text-sm text-[var(--text-muted)]">{suffix}</span>}
        </div>
      </div>
      {withSlider && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--gridline)]"
        />
      )}
      {help && <p className="text-xs text-[var(--text-muted)]">{help}</p>}
    </div>
  );
}
