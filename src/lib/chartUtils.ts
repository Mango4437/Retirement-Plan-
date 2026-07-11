export function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const rawStep = span / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let step: number;
  if (residual >= 7.5) step = 10 * magnitude;
  else if (residual >= 3.5) step = 5 * magnitude;
  else if (residual >= 1.5) step = 2 * magnitude;
  else step = magnitude;

  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

export function linePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

export function areaPath(points: Array<{ x: number; y: number }>, baselineY: number): string {
  if (points.length === 0) return "";
  const top = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${last.x.toFixed(2)},${baselineY} L${first.x.toFixed(2)},${baselineY} Z`;
}

export function bandPath(upper: Array<{ x: number; y: number }>, lower: Array<{ x: number; y: number }>): string {
  if (upper.length === 0 || lower.length === 0) return "";
  const top = upper.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const bottom = [...lower].reverse().map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return `${top} ${bottom} Z`;
}

export function closestIndex(xValues: number[], target: number): number {
  let closest = 0;
  let closestDist = Infinity;
  for (let i = 0; i < xValues.length; i++) {
    const dist = Math.abs(xValues[i] - target);
    if (dist < closestDist) {
      closestDist = dist;
      closest = i;
    }
  }
  return closest;
}
