import type { PollenReading, WeatherSnapshot } from "./types";

const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

interface AirQualityResponse {
  hourly?: {
    time: string[];
    alder_pollen?: (number | null)[];
    birch_pollen?: (number | null)[];
    olive_pollen?: (number | null)[];
    grass_pollen?: (number | null)[];
    mugwort_pollen?: (number | null)[];
    ragweed_pollen?: (number | null)[];
  };
}

interface ForecastResponse {
  current?: {
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    precipitation?: number;
  };
}

function closestHourIndex(times: string[]): number {
  const now = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  times.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  });
  return bestIdx;
}

function maxOf(...values: (number | null | undefined)[]): number {
  const nums = values.filter((v): v is number => typeof v === "number");
  return nums.length ? Math.max(...nums) : 0;
}

/**
 * Live pollen concentrations (grains/m3) from Open-Meteo's CAMS European Air Quality model.
 * Coverage is Europe-only — outside that footprint every field comes back null, in which case
 * the caller should fall back to the offline seasonal estimate.
 */
export async function fetchLivePollen(lat: number, lon: number, signal?: AbortSignal): Promise<PollenReading | null> {
  const url = `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}&hourly=alder_pollen,birch_pollen,olive_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=auto&forecast_days=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as AirQualityResponse;
  const hourly = data.hourly;
  if (!hourly || !hourly.time?.length) return null;

  const idx = closestHourIndex(hourly.time);
  const tree = maxOf(hourly.alder_pollen?.[idx], hourly.birch_pollen?.[idx], hourly.olive_pollen?.[idx]);
  const grass = maxOf(hourly.grass_pollen?.[idx]);
  const weed = maxOf(hourly.mugwort_pollen?.[idx], hourly.ragweed_pollen?.[idx]);

  const allNull =
    hourly.alder_pollen?.[idx] == null &&
    hourly.birch_pollen?.[idx] == null &&
    hourly.olive_pollen?.[idx] == null &&
    hourly.grass_pollen?.[idx] == null &&
    hourly.mugwort_pollen?.[idx] == null &&
    hourly.ragweed_pollen?.[idx] == null;
  if (allNull) return null;

  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    unit: "grains-per-m3",
    values: { tree, grass, weed },
  };
}

/** Current wind/humidity/precipitation — available worldwide, used for the dry-eye risk score. */
export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherSnapshot | null> {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as ForecastResponse;
  const c = data.current;
  if (!c) return null;
  return {
    windKph: c.wind_speed_10m ?? 0,
    humidityPercent: c.relative_humidity_2m ?? 50,
    precipMm: c.precipitation ?? 0,
  };
}
