import type { Theme } from "../hooks/useTheme";

interface Props {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle({ theme, setTheme }: Props) {
  return (
    <div className="flex items-center rounded-md border border-[var(--border)] p-0.5 text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className="rounded px-2 py-1 font-medium transition-colors"
          style={{
            backgroundColor: theme === opt.value ? "var(--series-1)" : "transparent",
            color: theme === opt.value ? "white" : "var(--text-secondary)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
