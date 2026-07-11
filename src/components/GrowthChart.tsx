import { useMemo, useRef, useState } from "react";
import type { MonteCarloResult, YearPoint } from "../lib/types";
import { areaPath, bandPath, closestIndex, linePath, niceTicks, scaleLinear } from "../lib/chartUtils";
import { formatCompactCurrency, formatCurrency } from "../lib/format";

interface Props {
  years: YearPoint[];
  monteCarlo: MonteCarloResult | null;
}

const WIDTH = 800;
const HEIGHT = 360;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

export function GrowthChart({ years, monteCarlo }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const minYear = years[0]?.year ?? 0;
  const maxYear = years[years.length - 1]?.year ?? 1;

  const maxBalance = useMemo(() => {
    const deterministicMax = Math.max(...years.map((y) => y.balance), 1);
    const mcMax = monteCarlo ? Math.max(...monteCarlo.bands.map((b) => b.p90)) : 0;
    return Math.max(deterministicMax, mcMax) * 1.05;
  }, [years, monteCarlo]);

  const xScale = scaleLinear([minYear, maxYear], [0, innerWidth]);
  const yScale = scaleLinear([0, maxBalance], [innerHeight, 0]);

  const linePoints = years.map((y) => ({ x: xScale(y.year), y: yScale(y.balance) }));
  const yTicks = niceTicks(0, maxBalance, 5).filter((t) => t <= maxBalance);
  const xTicks = niceTicks(minYear, maxYear, Math.min(6, maxYear - minYear || 1));

  const bandOuter = monteCarlo
    ? {
        upper: monteCarlo.bands.map((b) => ({ x: xScale(b.year), y: yScale(b.p90) })),
        lower: monteCarlo.bands.map((b) => ({ x: xScale(b.year), y: yScale(b.p10) })),
      }
    : null;
  const medianLine = monteCarlo ? monteCarlo.bands.map((b) => ({ x: xScale(b.year), y: yScale(b.p50) })) : null;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH - MARGIN.left;
    const idx = closestIndex(
      years.map((y) => xScale(y.year)),
      px,
    );
    setHoverIndex(idx);
  };

  const hover = hoverIndex !== null ? years[hoverIndex] : null;
  const hoverMc = hoverIndex !== null && monteCarlo ? monteCarlo.bands[hoverIndex] : null;

  return (
    <div className="relative flex flex-col gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label="Projected investment growth over time"
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
              Yr {Math.round(t)}
            </text>
          ))}

          {bandOuter && <path d={bandPath(bandOuter.upper, bandOuter.lower)} fill="var(--series-1)" opacity={0.15} stroke="none" />}
          {medianLine && (
            <path d={linePath(medianLine)} fill="none" stroke="var(--series-1)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          )}

          <path d={areaPath(linePoints, innerHeight)} fill="var(--series-1)" opacity={0.08} />
          <path d={linePath(linePoints)} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover && (
            <>
              <line x1={xScale(hover.year)} x2={xScale(hover.year)} y1={0} y2={innerHeight} stroke="var(--text-muted)" strokeWidth={1} />
              <circle cx={xScale(hover.year)} cy={yScale(hover.balance)} r={4} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={1.5} />
            </>
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((xScale(hover.year) + MARGIN.left) / WIDTH) * 100}%`, top: 8, transform: "translateX(-50%)" }}
        >
          <div className="font-semibold text-[var(--text-primary)]">Year {hover.year}</div>
          <div className="text-[var(--text-secondary)]">Balance: {formatCurrency(hover.balance)}</div>
          {hoverMc && (
            <div className="text-[var(--text-muted)]">
              Range: {formatCompactCurrency(hoverMc.p10)} – {formatCompactCurrency(hoverMc.p90)}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        <LegendLine color="var(--series-1)" label="Expected growth" />
        {monteCarlo && <LegendLine color="var(--series-1)" opacity={0.6} label="Median (with market ups & downs)" dashed />}
        {monteCarlo && <LegendSwatch color="var(--series-1)" opacity={0.15} label="Likely range (10th–90th percentile)" />}
      </div>
    </div>
  );
}

function LegendLine({ color, label, dashed, opacity = 1 }: { color: string; label: string; dashed?: boolean; opacity?: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="16" height="8">
        <line x1="0" y1="4" x2="16" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4,3" : undefined} opacity={opacity} />
      </svg>
      {label}
    </span>
  );
}

function LegendSwatch({ color, label, opacity }: { color: string; label: string; opacity: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color, opacity }} />
      {label}
    </span>
  );
}
