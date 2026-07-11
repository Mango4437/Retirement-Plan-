import type { ReactNode } from "react";

interface Props {
  title: string;
  help?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, help, right, children }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          {help && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{help}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
