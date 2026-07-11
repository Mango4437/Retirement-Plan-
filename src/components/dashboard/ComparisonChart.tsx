import { useMemo, useRef, useState } from "react";
import type { YearProjection } from "../../lib/types";
import { closestIndex, linePath, niceTicks, scaleLinear } from "../../lib/chartUtils";
import { formatCompactCurrency, formatCurrency } from "../../lib/format";

export interface ComparisonSeries {
  id: string;
  label: string;
  color: string;
  years: YearProjection[];
}

interface Props {
  series: ComparisonSeries[];
}

const WIDTH = 800;
const HEIGHT = 340;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

export function ComparisonChart({ series }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const allAges = series.flatMap((s) => s.years.map((y) => y.age));
  const minAge = allAges.length > 0 ? Math.min(...allAges) : 0;
  const maxAge = allAges.length > 0 ? Math.max(...allAges) : 1;
  const maxBalance = useMemo(
    () => Math.max(...series.flatMap((s) => s.years.map((y) => y.endBalance)), 1) * 1.05,
    [series],
  );

  const xScale = scaleLinear([minAge, maxAge], [0, innerWidth]);
  const yScale = scaleLinear([0, maxBalance], [innerHeight, 0]);
  const yTicks = niceTicks(0, maxBalance, 5);
  const xTicks = niceTicks(minAge, maxAge, 6);

  const referenceAges = series[0]?.years.map((y) => y.age) ?? [];

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || referenceAges.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH - MARGIN.left;
    const idx = closestIndex(referenceAges.map((a) => xScale(a)), px);
    setHoverIdx(idx);
  };

  const hoverAge = hoverIdx !== null ? referenceAges[hoverIdx] : null;

  return (
    <div className="relative flex flex-col gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label="Scenario comparison of projected balance over time"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
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

          {series.map((s) => {
            const points = s.years.map((y) => ({ x: xScale(y.age), y: yScale(y.endBalance) }));
            return <path key={s.id} d={linePath(points)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
          })}

          {hoverAge !== null && (
            <line x1={xScale(hoverAge)} x2={xScale(hoverAge)} y1={0} y2={innerHeight} stroke="var(--text-muted)" strokeWidth={1} />
          )}
        </g>
      </svg>

      {hoverAge !== null && (
        <div
          className="pointer-events-none absolute rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((xScale(hoverAge) + MARGIN.left) / WIDTH) * 100}%`, top: 8, transform: "translateX(-50%)" }}
        >
          <div className="mb-1 font-semibold text-[var(--text-primary)]">Age {hoverAge}</div>
          {series.map((s) => {
            const y = s.years.find((yr) => yr.age === hoverAge);
            if (!y) return null;
            return (
              <div key={s.id} style={{ color: s.color }}>
                {s.label}: {formatCurrency(y.endBalance)}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        {series.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5">
            <svg width="16" height="8">
              <line x1="0" y1="4" x2="16" y2="4" stroke={s.color} strokeWidth="2" />
            </svg>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
