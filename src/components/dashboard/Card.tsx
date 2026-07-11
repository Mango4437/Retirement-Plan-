import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Card({ title, description, children, action }: CardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
