import type { ClimateProfile, PollenReading, PollenType } from "./types";

/** Approximate northern-hemisphere peak day-of-year for each pollen type, and how wide the season is. */
const NORTHERN_PEAK_DAY: Record<PollenType, number> = {
  tree: 80, // ~late March
  grass: 170, // ~mid June
  weed: 250, // ~early September
};

const PERIOD = 365.25;
const HEMISPHERE_SHIFT = PERIOD / 2;

function circularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % PERIOD;
  return Math.min(d, PERIOD - d);
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / 86_400_000) + 1;
}

/**
 * Deterministic offline pollen estimate, used when no live monitoring station covers a
 * location. Not a measurement — a seasonal curve shaped by hemisphere + climate profile,
 * clearly surfaced as "estimated" in the UI so it's never confused with real data.
 */
export function estimateSeasonalIndex(type: PollenType, date: Date, hemisphere: "N" | "S", climate: ClimateProfile): number {
  let peakDay = NORTHERN_PEAK_DAY[type];
  if (hemisphere === "S") peakDay = (peakDay + HEMISPHERE_SHIFT) % PERIOD;

  const width = climate.tropical ? 95 : 40;
  const dist = circularDistance(dayOfYear(date), peakDay);
  const bell = Math.exp(-(dist * dist) / (2 * width * width));

  const base = climate.tropical ? 28 + bell * 42 : bell * 100;
  const scaled = base * climate.intensity[type];
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

export function buildEstimatedReading(hemisphere: "N" | "S", climate: ClimateProfile, date: Date = new Date()): PollenReading {
  return {
    source: "estimated",
    fetchedAt: date.toISOString(),
    unit: "index",
    values: {
      tree: estimateSeasonalIndex("tree", date, hemisphere, climate),
      grass: estimateSeasonalIndex("grass", date, hemisphere, climate),
      weed: estimateSeasonalIndex("weed", date, hemisphere, climate),
    },
  };
}
