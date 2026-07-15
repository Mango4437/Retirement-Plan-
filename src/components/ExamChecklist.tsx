import { CATEGORY_META } from "../lib/examData";
import type { Milestone } from "../lib/types";

interface Props {
  milestones: Milestone[];
  completed: string[];
  onChange: (completed: string[]) => void;
}

export function ExamChecklist({ milestones, completed, onChange }: Props) {
  const toggle = (code: string) => {
    onChange(completed.includes(code) ? completed.filter((c) => c !== code) : [...completed, code]);
  };

  const categories = Array.from(new Set(milestones.map((m) => m.category)));

  return (
    <div className="flex flex-col gap-3">
      {categories.map((category) => {
        const items = milestones.filter((m) => m.category === category);
        const doneCount = items.filter((m) => completed.includes(m.code)).length;
        const meta = CATEGORY_META[category];
        return (
          <div key={category} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </span>
              <span className="text-xs tabular-nums text-[var(--text-muted)]">
                {doneCount}/{items.length}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {items.map((m) => {
                const checked = completed.includes(m.code);
                return (
                  <label
                    key={m.code}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded px-1.5 py-1 hover:bg-[var(--gridline)]"
                  >
                    <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(m.code)}
                        className="h-4 w-4 shrink-0 accent-[var(--series-1)]"
                      />
                      <span className={checked ? "line-through opacity-60" : ""}>{m.name}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">~{m.hours}h</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
