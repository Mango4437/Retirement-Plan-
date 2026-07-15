interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface Props<T extends string> {
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ChoiceCards<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rounded-lg border p-3 text-left transition-colors"
            style={{
              borderColor: selected ? "var(--series-1)" : "var(--border)",
              backgroundColor: selected ? "color-mix(in srgb, var(--series-1) 10%, var(--surface-2))" : "var(--surface-2)",
            }}
          >
            <div className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</div>
            {opt.description && <div className="mt-0.5 text-xs text-[var(--text-muted)]">{opt.description}</div>}
          </button>
        );
      })}
    </div>
  );
}
