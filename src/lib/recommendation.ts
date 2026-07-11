import type { EyedropSettings, LevelBreakdown, PollenLevel, PollenReading, PollenType, Recommendation, SensitivityLevel, UserSettings } from "./types";

export const LEVEL_ORDER: PollenLevel[] = ["low", "moderate", "high", "very-high"];

export const LEVEL_LABEL: Record<PollenLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  "very-high": "Very high",
};

export const LEVEL_COLOR_VAR: Record<PollenLevel, string> = {
  low: "--status-good",
  moderate: "--status-warning",
  high: "--status-serious",
  "very-high": "--status-critical",
};

export function levelOrdinal(level: PollenLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function ordinalToLevel(n: number): PollenLevel {
  return LEVEL_ORDER[Math.max(0, Math.min(LEVEL_ORDER.length - 1, Math.round(n)))];
}

/** Bands are in grains/m3, loosely based on published European pollen-index scales. */
const LIVE_BANDS: Record<PollenType, { moderate: number; high: number; veryHigh: number }> = {
  tree: { moderate: 30, high: 90, veryHigh: 500 },
  grass: { moderate: 20, high: 50, veryHigh: 150 },
  weed: { moderate: 10, high: 50, veryHigh: 100 },
};

/** Sensitivity scales how easily a 0-100 estimated/manual index (or live band) tips into the next level. */
const SENSITIVITY_MULTIPLIER: Record<SensitivityLevel, number> = {
  mild: 1.3,
  normal: 1.0,
  high: 0.7,
};

function levelFromLive(type: PollenType, value: number, sensitivity: SensitivityLevel): PollenLevel {
  const b = LIVE_BANDS[type];
  const m = SENSITIVITY_MULTIPLIER[sensitivity];
  if (value < b.moderate * m) return "low";
  if (value < b.high * m) return "moderate";
  if (value < b.veryHigh * m) return "high";
  return "very-high";
}

function levelFromIndex(value: number, sensitivity: SensitivityLevel): PollenLevel {
  const m = SENSITIVITY_MULTIPLIER[sensitivity];
  if (value < 20 * m) return "low";
  if (value < 50 * m) return "moderate";
  if (value < 75 * m) return "high";
  return "very-high";
}

export function levelForReading(type: PollenType, reading: PollenReading, sensitivity: SensitivityLevel): PollenLevel {
  const value = reading.values[type];
  return reading.unit === "grains-per-m3" ? levelFromLive(type, value, sensitivity) : levelFromIndex(value, sensitivity);
}

function windRisk(windKph: number): number {
  if (windKph >= 35) return 3;
  if (windKph >= 22) return 2;
  if (windKph >= 12) return 1;
  return 0;
}

function humidityRisk(humidityPercent: number): number {
  if (humidityPercent <= 30) return 3;
  if (humidityPercent <= 45) return 2;
  if (humidityPercent <= 60) return 1;
  return 0;
}

function computeDryEyeLevel(overallOrdinal: number, settings: EyedropSettings, weather?: { windKph: number; humidityPercent: number }): PollenLevel {
  const factors: number[] = [];
  if (settings.considerPollen) factors.push(overallOrdinal);
  if (settings.considerWind && weather) factors.push(windRisk(weather.windKph));
  if (settings.considerHumidity && weather) factors.push(humidityRisk(weather.humidityPercent));
  if (!factors.length) return "low";
  const avg = factors.reduce((a, b) => a + b, 0) / factors.length;
  return ordinalToLevel(avg);
}

export function computeRecommendation(reading: PollenReading, settings: UserSettings): Recommendation {
  const types: PollenType[] = ["tree", "grass", "weed"];
  const breakdown: LevelBreakdown[] = types.map((type) => ({
    type,
    level: levelForReading(type, reading, settings.sensitivityLevel),
    rawValue: reading.values[type],
  }));

  const sensitiveTypes = types.filter((t) => settings.sensitiveTo[t]);
  const relevant = sensitiveTypes.length ? breakdown.filter((b) => sensitiveTypes.includes(b.type)) : breakdown;
  const overallOrdinal = Math.max(...relevant.map((b) => levelOrdinal(b.level)));
  const overallLevel = ordinalToLevel(overallOrdinal);

  const dueMedicines = settings.medicines.filter((m) => overallOrdinal >= levelOrdinal(m.triggerLevel));
  const takeMedicine = dueMedicines.length > 0;
  const medicineReason = !settings.medicines.length
    ? "No medicines configured — add one in Settings to get a take/skip reminder."
    : takeMedicine
      ? `${sensitiveTypes.length ? sensitiveTypes.join(" + ") : "overall"} pollen is ${LEVEL_LABEL[overallLevel].toLowerCase()} — at or above the trigger level for ${dueMedicines.map((m) => m.name).join(", ")}.`
      : `Pollen is ${LEVEL_LABEL[overallLevel].toLowerCase()} for the types you're sensitive to — below every medicine's trigger level today.`;

  const dryEyeLevel = computeDryEyeLevel(overallOrdinal, settings.eyedrops, reading.weather);
  const useEyedrops = settings.eyedrops.enabled && levelOrdinal(dryEyeLevel) >= levelOrdinal(settings.eyedrops.triggerLevel);
  const eyedropReason = !settings.eyedrops.enabled
    ? "Eyedrop reminders are turned off in Settings."
    : useEyedrops
      ? `Dry-eye risk is ${LEVEL_LABEL[dryEyeLevel].toLowerCase()} today (${describeDryEyeFactors(settings.eyedrops, reading)}).`
      : `Dry-eye risk is ${LEVEL_LABEL[dryEyeLevel].toLowerCase()} — below your trigger level.`;

  return { overallLevel, breakdown, takeMedicine, medicineReason, useEyedrops, eyedropReason, dryEyeLevel };
}

function describeDryEyeFactors(settings: EyedropSettings, reading: PollenReading): string {
  const parts: string[] = [];
  if (settings.considerPollen) parts.push("pollen irritation");
  if (settings.considerWind && reading.weather) parts.push(`${Math.round(reading.weather.windKph)} km/h wind`);
  if (settings.considerHumidity && reading.weather) parts.push(`${Math.round(reading.weather.humidityPercent)}% humidity`);
  return parts.join(", ") || "no factors selected";
}
