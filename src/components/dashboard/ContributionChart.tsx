import { useMemo, useRef, useState } from "react";
import type { YearProjection } from "../../lib/types";
import { closestIndex, niceTicks, scaleLinear } from "../../lib/chartUtils";
import { formatCompactCurrency, formatCurrency } from "../../lib/format";

interface Props {
  years: YearProjection[];
}

const WIDTH = 800;
const HEIGHT = 300;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

export function ContributionChart({ years }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const accumulationYears = years.filter((y) => y.phase === "accumulation");
  const rows = accumulationYears.length > 0 ? accumulationYears : years.slice(0, 1);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const minAge = rows[0]?.age ?? 0;
  const maxAge = rows[rows.length - 1]?.age ?? 1;
  const maxTotal = useMemo(() => Math.max(...rows.map((r) => r.cumulativeContributions + r.cumulativeGrowth), 1) * 1.05, [rows]);

  const xScale = scaleLinear([minAge, maxAge], [0, innerWidth]);
  const yScale = scaleLinear([0, maxTotal], [innerHeight, 0]);

  const contribTop = rows.map((r) => ({ x: xScale(r.age), y: yScale(r.cumulativeContributions) }));
  const totalTop = rows.map((r) => ({ x: xScale(r.age), y: yScale(r.cumulativeContributions + r.cumulativeGrowth) }));
  const baseline = rows.map((r) => ({ x: xScale(r.age), y: innerHeight }));

  const contribArea = stackPath(contribTop, baseline);
  const growthArea = stackPath(totalTop, contribTop);

  const yTicks = niceTicks(0, maxTotal, 5);
  const xTicks = niceTicks(minAge, maxAge, 6);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH - MARGIN.left;
    const idx = closestIndex(rows.map((r) => xScale(r.age)), px);
    setHoverIndex(idx);
  };

  const hover = hoverIndex !== null ? rows[hoverIndex] : null;

  return (
    <div className="relative flex flex-col gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label="Cumulative contributions versus investment growth"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="var(--gridline)" strokeWidth={1} />
              <text x={-8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-muted)">
                {formatCompactCurrency(t)}
              </text>
            </g>
          ))}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="var(--baseline)" strokeWidth={1} />
          {xTicks.map((t) => (
            <text key={t} x={xScale(t)} y={innerHeight + 20} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
              {Math.round(t)}
            </text>
          ))}

          <path d={contribArea} fill="var(--series-1)" opacity={0.55} />
          <path d={growthArea} fill="var(--series-2)" opacity={0.55} />

          {hover && (
            <line
              x1={xScale(hover.age)}
              x2={xScale(hover.age)}
              y1={0}
              y2={innerHeight}
              stroke="var(--text-muted)"
              strokeWidth={1}
            />
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((xScale(hover.age) + MARGIN.left) / WIDTH) * 100}%`, top: 8, transform: "translateX(-50%)" }}
        >
          <div className="font-semibold text-[var(--text-primary)]">Age {hover.age}</div>
          <div className="text-[var(--series-1)]">Contributions: {formatCurrency(hover.cumulativeContributions)}</div>
          <div className="text-[var(--series-2)]">Growth: {formatCurrency(hover.cumulativeGrowth)}</div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        <LegendSwatch color="var(--series-1)" label="Cumulative contributions" />
        <LegendSwatch color="var(--series-2)" label="Investment growth" />
      </div>
    </div>
  );
}

function stackPath(top: Array<{ x: number; y: number }>, bottom: Array<{ x: number; y: number }>): string {
  if (top.length === 0) return "";
  const topPath = top.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const bottomPath = [...bottom].reverse().map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return `${topPath} ${bottomPath} Z`;
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color, opacity: 0.55 }} />
      {label}
    </span>
  );
}
