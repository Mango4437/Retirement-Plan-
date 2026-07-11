import { useMemo, useRef, useState } from "react";
import type { MonteCarloResult, YearProjection } from "../../lib/types";
import { areaPath, bandPath, closestIndex, linePath, niceTicks, scaleLinear } from "../../lib/chartUtils";
import { formatCompactCurrency, formatCurrency } from "../../lib/format";

interface Props {
  years: YearProjection[];
  monteCarlo: MonteCarloResult | null;
  retirementAge: number;
  depletionAge: number | null;
}

const WIDTH = 800;
const HEIGHT = 360;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

export function BalanceChart({ years, monteCarlo, retirementAge, depletionAge }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const ages = years.map((y) => y.age);
  const minAge = ages[0] ?? 0;
  const maxAge = ages[ages.length - 1] ?? 1;

  const maxBalance = useMemo(() => {
    const deterministicMax = Math.max(...years.map((y) => y.endBalance), 1);
    const mcMax = monteCarlo ? Math.max(...monteCarlo.bands.map((b) => b.p90)) : 0;
    return Math.max(deterministicMax, mcMax) * 1.05;
  }, [years, monteCarlo]);

  const xScale = scaleLinear([minAge, maxAge], [0, innerWidth]);
  const yScale = scaleLinear([0, maxBalance], [innerHeight, 0]);

  const linePoints = years.map((y) => ({ x: xScale(y.age), y: yScale(y.endBalance) }));
  const yTicks = niceTicks(0, maxBalance, 5).filter((t) => t <= maxBalance);
  const xTicks = niceTicks(minAge, maxAge, 6);

  const bandOuter = monteCarlo
    ? {
        upper: monteCarlo.bands.map((b) => ({ x: xScale(b.age), y: yScale(b.p90) })),
        lower: monteCarlo.bands.map((b) => ({ x: xScale(b.age), y: yScale(b.p10) })),
      }
    : null;
  const bandInner = monteCarlo
    ? {
        upper: monteCarlo.bands.map((b) => ({ x: xScale(b.age), y: yScale(b.p75) })),
        lower: monteCarlo.bands.map((b) => ({ x: xScale(b.age), y: yScale(b.p25) })),
      }
    : null;
  const medianLine = monteCarlo ? monteCarlo.bands.map((b) => ({ x: xScale(b.age), y: yScale(b.p50) })) : null;

  const retirementX = xScale(retirementAge);
  const depletionX = depletionAge !== null ? xScale(depletionAge) : null;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH - MARGIN.left;
    const idx = closestIndex(
      years.map((y) => xScale(y.age)),
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
        aria-label="Projected retirement balance over time"
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

          {/* retirement reference line */}
          <line x1={retirementX} x2={retirementX} y1={0} y2={innerHeight} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3,3" />
          <text x={retirementX} y={-4} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
            Retirement
          </text>

          {depletionX !== null && (
            <>
              <line x1={depletionX} x2={depletionX} y1={0} y2={innerHeight} stroke="var(--status-critical)" strokeWidth={1} strokeDasharray="3,3" />
              <text x={depletionX} y={-4} textAnchor="middle" fontSize={10} fill="var(--status-critical)">
                Funds depleted
              </text>
            </>
          )}

          {/* Monte Carlo bands */}
          {bandOuter && (
            <path d={bandPath(bandOuter.upper, bandOuter.lower)} fill="var(--series-1)" opacity={0.12} stroke="none" />
          )}
          {bandInner && (
            <path d={bandPath(bandInner.upper, bandInner.lower)} fill="var(--series-1)" opacity={0.2} stroke="none" />
          )}
          {medianLine && (
            <path d={linePath(medianLine)} fill="none" stroke="var(--series-1)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          )}

          {/* deterministic projection */}
          <path d={areaPath(linePoints, innerHeight)} fill="var(--series-1)" opacity={0.08} />
          <path d={linePath(linePoints)} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover && (
            <>
              <line x1={xScale(hover.age)} x2={xScale(hover.age)} y1={0} y2={innerHeight} stroke="var(--text-muted)" strokeWidth={1} />
              <circle cx={xScale(hover.age)} cy={yScale(hover.endBalance)} r={4} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={1.5} />
            </>
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(xScale(hover.age) + MARGIN.left) / WIDTH * 100}%`,
            top: 8,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold text-[var(--text-primary)]">Age {hover.age}</div>
          <div className="text-[var(--text-secondary)]">Balance: {formatCurrency(hover.endBalance)}</div>
          {hoverMc && (
            <div className="text-[var(--text-muted)]">
              Range: {formatCompactCurrency(hoverMc.p10)} – {formatCompactCurrency(hoverMc.p90)}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
        <LegendItem color="var(--series-1)" label="Projected balance" />
        {monteCarlo && <LegendItem color="var(--series-1)" opacity={0.5} label="Monte Carlo median" dashed />}
        {monteCarlo && <LegendItem color="var(--series-1)" opacity={0.2} label="10th–90th percentile range" swatch />}
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
  swatch,
  opacity = 1,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  swatch?: boolean;
  opacity?: number;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch ? (
        <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color, opacity }} />
      ) : (
        <svg width="16" height="8">
          <line x1="0" y1="4" x2="16" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4,3" : undefined} opacity={opacity} />
        </svg>
      )}
      {label}
    </span>
  );
}
