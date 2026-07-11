import type { ReactNode } from "react";

type Status = "good" | "warning" | "critical" | "neutral";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  status?: Status;
  icon?: ReactNode;
}

const statusColor: Record<Status, string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
  neutral: "var(--text-muted)",
};

export function StatTile({ label, value, sublabel, status = "neutral" }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <span className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</span>
      {sublabel && (
        <span className="flex items-center gap-1.5 text-xs" style={{ color: status === "neutral" ? "var(--text-secondary)" : statusColor[status] }}>
          {status !== "neutral" && (
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[status] }} />
          )}
          {sublabel}
        </span>
      )}
    </div>
  );
}
