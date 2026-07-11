import { useMemo, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY_ID, findCountry } from "./lib/countries";
import { todayKey } from "./lib/format";
import { computeRecommendation } from "./lib/recommendation";
import type { CustomLocation, UserSettings } from "./lib/types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePollenData } from "./hooks/usePollenData";
import { useTheme } from "./hooks/useTheme";
import { ThemeToggle } from "./components/ThemeToggle";
import { SectionCard } from "./components/SectionCard";
import { LocationPicker } from "./components/LocationPicker";
import { ConditionsPanel } from "./components/ConditionsPanel";
import { RecommendationCard } from "./components/RecommendationCard";
import { SettingsPanel } from "./components/SettingsPanel";

const DEFAULT_SETTINGS: UserSettings = {
  locationId: DEFAULT_COUNTRY_ID,
  customLocations: [],
  dataMode: "auto",
  manualLevels: { tree: "low", grass: "moderate", weed: "low" },
  sensitiveTo: { tree: true, grass: true, weed: false },
  sensitivityLevel: "normal",
  medicines: [],
  eyedrops: {
    enabled: true,
    name: "",
    considerPollen: true,
    considerWind: true,
    considerHumidity: true,
    triggerLevel: "moderate",
  },
  units: "metric",
};

const FALLBACK_CLIMATE = { intensity: { tree: 1, grass: 1, weed: 1 } };

function App() {
  const [settings, setSettings] = useLocalStorage<UserSettings>("hayfever-tracker:settings", DEFAULT_SETTINGS);
  const { theme, setTheme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const patch = (p: Partial<UserSettings>) => setSettings({ ...settings, ...p });

  const country = findCountry(settings.locationId);
  const custom = settings.customLocations.find((c) => c.id === settings.locationId);
  const location = country
    ? { name: country.name, lat: country.lat, lon: country.lon, hemisphere: country.hemisphere, climate: country.climate }
    : custom
      ? { name: custom.name, lat: custom.lat, lon: custom.lon, hemisphere: custom.hemisphere, climate: FALLBACK_CLIMATE }
      : { name: COUNTRIES[0].name, lat: COUNTRIES[0].lat, lon: COUNTRIES[0].lon, hemisphere: COUNTRIES[0].hemisphere, climate: COUNTRIES[0].climate };

  const { reading, status, errorMessage } = usePollenData({
    lat: location.lat,
    lon: location.lon,
    hemisphere: location.hemisphere,
    climate: location.climate,
    dataMode: settings.dataMode,
    manualLevels: settings.manualLevels,
    refreshKey,
  });

  const recommendation = useMemo(() => (reading ? computeRecommendation(reading, settings) : null), [reading, settings]);

  const addCustomLocation = (loc: CustomLocation) => {
    setSettings({ ...settings, customLocations: [...settings.customLocations, loc], locationId: loc.id });
  };

  const removeCustomLocation = (id: string) => {
    const remaining = settings.customLocations.filter((c) => c.id !== id);
    setSettings({
      ...settings,
      customLocations: remaining,
      locationId: settings.locationId === id ? DEFAULT_COUNTRY_ID : settings.locationId,
    });
  };

  const markMedicineTaken = (id: string) => {
    setSettings({
      ...settings,
      medicines: settings.medicines.map((m) => (m.id === id ? { ...m, lastTakenOn: todayKey() } : m)),
    });
  };

  const markEyedropsUsed = () => {
    setSettings({ ...settings, eyedrops: { ...settings.eyedrops, lastUsedOn: todayKey() } });
  };

  return (
    <div className="min-h-screen bg-[var(--page-plane)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Hayfever Tracker</h1>
            <p className="text-xs text-[var(--text-muted)]">Pollen levels by location, and whether to take your medicine or eyedrops today</p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="mx-auto flex max-w-[900px] flex-col gap-4 p-4 md:px-6">
        <SectionCard title="Location" help="Pick a country, or add your own place. Live data is used where available (Europe today), otherwise a seasonal estimate.">
          <LocationPicker
            locationId={settings.locationId}
            customLocations={settings.customLocations}
            onSelect={(id) => patch({ locationId: id })}
            onAddCustom={addCustomLocation}
            onRemoveCustom={removeCustomLocation}
          />
        </SectionCard>

        <SectionCard title={`Conditions in ${location.name}`}>
          {status === "loading" && !reading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading conditions…</p>
          ) : reading ? (
            <>
              {status === "error" && errorMessage && (
                <p className="mb-3 rounded-md bg-[var(--status-critical)]/10 px-3 py-2 text-xs text-[var(--status-critical)]">
                  Couldn't reach live data ({errorMessage}) — showing the seasonal estimate instead.
                </p>
              )}
              <ConditionsPanel
                reading={reading}
                sensitivityLevel={settings.sensitivityLevel}
                sensitiveTo={settings.sensitiveTo}
                units={settings.units}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                refreshing={status === "loading"}
              />
            </>
          ) : null}
        </SectionCard>

        {recommendation && (
          <RecommendationCard
            recommendation={recommendation}
            medicines={settings.medicines}
            eyedrops={settings.eyedrops}
            onMarkMedicineTaken={markMedicineTaken}
            onMarkEyedropsUsed={markEyedropsUsed}
          />
        )}

        <SectionCard
          title="Settings"
          help="Configure your sensitivities, medicines, eyedrop rules and units."
          right={
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)]"
            >
              {settingsOpen ? "Hide" : "Edit"}
            </button>
          }
        >
          {settingsOpen && <SettingsPanel settings={settings} onChange={patch} />}
        </SectionCard>
      </main>

      <footer className="mx-auto max-w-[900px] px-4 pb-8 pt-4 text-center text-xs text-[var(--text-muted)] md:px-6">
        Pollen and dry-eye estimates only, not medical advice. Live pollen data via Open-Meteo (CAMS Europe); everything else stays in your browser.
      </footer>
    </div>
  );
}

export default App;
