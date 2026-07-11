import type { ReactNode } from "react";

interface Props {
  step: number;
  title: string;
  help?: string;
  children: ReactNode;
}

export function StepCard({ step, title, help, children }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--series-1)" }}
        >
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          {help && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{help}</p>}
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}
