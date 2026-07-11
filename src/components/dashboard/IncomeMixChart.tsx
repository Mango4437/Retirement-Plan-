import { useRef, useState } from "react";
import type { YearProjection } from "../../lib/types";
import { closestIndex, niceTicks, scaleLinear } from "../../lib/chartUtils";
import { formatCompactCurrency, formatCurrency } from "../../lib/format";

interface Props {
  years: YearProjection[];
}

const SERIES = [
  { key: "incomeFromSS", label: "Social Security", color: "var(--series-1)" },
  { key: "incomeFromPension", label: "Pension", color: "var(--series-2)" },
  { key: "incomeFromOther", label: "Other income", color: "var(--series-3)" },
  { key: "withdrawals", label: "Portfolio withdrawals", color: "var(--series-5)" },
] as const;

const WIDTH = 800;
const HEIGHT = 300;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

export function IncomeMixChart({ years }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rows = years.filter((y) => y.phase === "retirement");

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No retirement years to display.</p>;
  }

  const minAge = rows[0].age;
  const maxAge = rows[rows.length - 1].age;

  const stacked = rows.map((r) => {
    let running = 0;
    return SERIES.map((s) => {
      const value = Math.max(0, r[s.key] as number);
      const from = running;
      running += value;
      return { from, to: running };
    });
  });

  const maxTotal = Math.max(...stacked.map((s) => s[s.length - 1].to), 1) * 1.05;

  const xScale = scaleLinear([minAge, maxAge], [0, innerWidth]);
  const yScale = scaleLinear([0, maxTotal], [innerHeight, 0]);
  const yTicks = niceTicks(0, maxTotal, 5);
  const xTicks = niceTicks(minAge, maxAge, 6);

  const areas = SERIES.map((s, sIdx) => {
    const top = rows.map((r, i) => ({ x: xScale(r.age), y: yScale(stacked[i][sIdx].to) }));
    const bottom = rows.map((r, i) => ({ x: xScale(r.age), y: yScale(stacked[i][sIdx].from) }));
    const topPath = top.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    const bottomPath = [...bottom].reverse().map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    return { path: `${topPath} ${bottomPath} Z`, color: s.color, label: s.label };
  });

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
        aria-label="Retirement income sources by year"
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

          {areas.map((a) => (
            <path key={a.label} d={a.path} fill={a.color} opacity={0.6} stroke="var(--surface-1)" strokeWidth={0.5} />
          ))}

          {hover && (
            <line x1={xScale(hover.age)} x2={xScale(hover.age)} y1={0} y2={innerHeight} stroke="var(--text-muted)" strokeWidth={1} />
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((xScale(hover.age) + MARGIN.left) / WIDTH) * 100}%`, top: 8, transform: "translateX(-50%)" }}
        >
          <div className="mb-1 font-semibold text-[var(--text-primary)]">Age {hover.age}</div>
          {SERIES.map((s) => (
            <div key={s.key} style={{ color: s.color }}>
              {s.label}: {formatCurrency(hover[s.key] as number)}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        {SERIES.map((s) => (
          <LegendSwatch key={s.key} color={s.color} label={s.label} />
        ))}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color, opacity: 0.6 }} />
      {label}
    </span>
  );
}
