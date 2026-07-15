import { useState } from "react";
import { CATEGORY_META } from "../lib/examData";
import { formatDuration, formatHours } from "../lib/format";
import { niceTicks, scaleLinear } from "../lib/chartUtils";
import type { RoadmapItem } from "../lib/types";

interface Props {
  items: RoadmapItem[];
}

const ROW_HEIGHT = 30;
const MARGIN = { top: 8, right: 16, bottom: 28, left: 16 };
const WIDTH = 800;

export function TimelineChart({ items }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Nothing left to plan for — every requirement for this credential is already checked off. Nice work.
      </p>
    );
  }

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const height = items.length * ROW_HEIGHT + MARGIN.top + MARGIN.bottom;
  const maxMonth = items[items.length - 1]?.endMonth ?? 1;

  const xScale = scaleLinear([0, maxMonth], [0, innerWidth]);
  const xTicks = niceTicks(0, maxMonth, Math.min(6, Math.max(1, Math.round(maxMonth / 6))));

  const hovered = hoverIndex !== null ? items[hoverIndex] : null;

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full select-none"
        role="img"
        aria-label="Timeline of remaining actuarial exam milestones"
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {xTicks.map((t) => (
            <g key={t}>
              <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={items.length * ROW_HEIGHT} stroke="var(--gridline)" strokeWidth={1} />
              <text x={xScale(t)} y={items.length * ROW_HEIGHT + 16} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
                {t === 0 ? "Now" : `+${Math.round(t)}mo`}
              </text>
            </g>
          ))}

          {items.map((item, i) => {
            const color = CATEGORY_META[item.category].color;
            const barY = i * ROW_HEIGHT + 5;
            const barHeight = ROW_HEIGHT - 10;
            const x = xScale(item.startMonth);
            const w = Math.max(4, xScale(item.endMonth) - xScale(item.startMonth));
            return (
              <g key={item.code} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                <rect x={x} y={barY} width={w} height={barHeight} rx={4} fill={color} opacity={hoverIndex === i ? 1 : 0.8} />
                <text x={x + w + 8} y={barY + barHeight / 2} dominantBaseline="middle" fontSize={11} fill="var(--text-secondary)">
                  {item.name.length > 42 ? `${item.name.slice(0, 40)}…` : item.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs">
          <div className="font-semibold text-[var(--text-primary)]">{hovered.name}</div>
          <div className="text-[var(--text-secondary)]">
            {formatHours(hovered.hours)} of study · starts {formatDuration(hovered.startMonth)} from now
          </div>
        </div>
      )}
    </div>
  );
}
