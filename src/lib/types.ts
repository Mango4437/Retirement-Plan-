export type PollenType = "tree" | "grass" | "weed";

export type PollenLevel = "low" | "moderate" | "high" | "very-high";

export type SensitivityLevel = "mild" | "normal" | "high";

export type DataMode = "auto" | "manual";

export type DataSource = "live" | "estimated" | "manual";

export interface ClimateProfile {
  /** Relative exposure ceiling per pollen type, ~0.3 (low) to ~1.4 (very high). */
  intensity: Record<PollenType, number>;
  /** Muted, less sharply-seasonal pollen curve (equatorial/tropical climates). */
  tropical?: boolean;
}

export interface CountryLocation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  hemisphere: "N" | "S";
  climate: ClimateProfile;
}

export interface CustomLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  hemisphere: "N" | "S";
}

export interface WeatherSnapshot {
  windKph: number;
  humidityPercent: number;
  precipMm: number;
}

export interface PollenReading {
  source: DataSource;
  fetchedAt: string;
  values: Record<PollenType, number>;
  /** Raw units differ by source: grains/m3 for "live", a 0-100 index for "estimated"/"manual". */
  unit: "grains-per-m3" | "index";
  weather?: WeatherSnapshot;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  triggerLevel: PollenLevel;
  lastTakenOn?: string;
}

export interface EyedropSettings {
  enabled: boolean;
  name: string;
  considerPollen: boolean;
  considerWind: boolean;
  considerHumidity: boolean;
  triggerLevel: PollenLevel;
  lastUsedOn?: string;
}

export interface UserSettings {
  locationId: string;
  customLocations: CustomLocation[];
  dataMode: DataMode;
  manualLevels: Record<PollenType, PollenLevel>;
  sensitiveTo: Record<PollenType, boolean>;
  sensitivityLevel: SensitivityLevel;
  medicines: Medicine[];
  eyedrops: EyedropSettings;
  units: "metric" | "imperial";
}

export interface LevelBreakdown {
  type: PollenType;
  level: PollenLevel;
  rawValue: number;
}

export interface Recommendation {
  overallLevel: PollenLevel;
  breakdown: LevelBreakdown[];
  takeMedicine: boolean;
  medicineReason: string;
  useEyedrops: boolean;
  eyedropReason: string;
  dryEyeLevel: PollenLevel;
}
