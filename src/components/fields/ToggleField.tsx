interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  help?: string;
}

export function ToggleField({ label, checked, onChange, help }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        {help && <p className="text-xs text-[var(--text-muted)]">{help}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: checked ? "var(--series-1)" : "var(--gridline)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}
