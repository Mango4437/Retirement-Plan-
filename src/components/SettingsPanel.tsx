import { LEVEL_LABEL, LEVEL_ORDER } from "../lib/recommendation";
import type { PollenLevel, PollenType, SensitivityLevel, UserSettings } from "../lib/types";
import { MedicineEditor } from "./MedicineEditor";
import { ToggleField } from "./ToggleField";

interface Props {
  settings: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
}

const TYPE_LABEL: Record<PollenType, string> = { tree: "Tree", grass: "Grass", weed: "Weed" };
const SENSITIVITY_OPTIONS: { value: SensitivityLevel; label: string }[] = [
  { value: "mild", label: "Mild — I can tolerate a fair amount" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High — I react quickly" },
];

export function SettingsPanel({ settings, onChange }: Props) {
  const setSensitiveTo = (type: PollenType, val: boolean) => onChange({ sensitiveTo: { ...settings.sensitiveTo, [type]: val } });
  const setManualLevel = (type: PollenType, level: PollenLevel) => onChange({ manualLevels: { ...settings.manualLevels, [type]: level } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Which pollens affect you?</h3>
        <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] p-2.5">
          {(["tree", "grass", "weed"] as PollenType[]).map((type) => (
            <ToggleField key={type} label={`${TYPE_LABEL[type]} pollen`} checked={settings.sensitiveTo[type]} onChange={(v) => setSensitiveTo(type, v)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">How sensitive are you?</h3>
        <div className="flex flex-col gap-1.5">
          {SENSITIVITY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="radio"
                name="sensitivity"
                checked={settings.sensitivityLevel === opt.value}
                onChange={() => onChange({ sensitivityLevel: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Data source</h3>
        <div className="flex items-center rounded-md border border-[var(--border)] p-0.5 text-xs">
          {(["auto", "manual"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ dataMode: mode })}
              className="rounded px-3 py-1.5 font-medium transition-colors"
              style={{ backgroundColor: settings.dataMode === mode ? "var(--series-1)" : "transparent", color: settings.dataMode === mode ? "white" : "var(--text-secondary)" }}
            >
              {mode === "auto" ? "Live + estimated" : "I'll enter it myself"}
            </button>
          ))}
        </div>
        {settings.dataMode === "manual" && (
          <div className="mt-2 flex flex-col gap-2 rounded-md border border-[var(--border)] p-2.5">
            {(["tree", "grass", "weed"] as PollenType[]).map((type) => (
              <div key={type} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">{TYPE_LABEL[type]}</span>
                <select
                  value={settings.manualLevels[type]}
                  onChange={(e) => setManualLevel(type, e.target.value as PollenLevel)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
                >
                  {LEVEL_ORDER.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Hayfever medicines</h3>
        <MedicineEditor medicines={settings.medicines} onChange={(medicines) => onChange({ medicines })} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Eyedrops for dry eyes</h3>
        <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] p-2.5">
          <ToggleField label="Remind me about eyedrops" checked={settings.eyedrops.enabled} onChange={(v) => onChange({ eyedrops: { ...settings.eyedrops, enabled: v } })} />
          {settings.eyedrops.enabled && (
            <>
              <input
                value={settings.eyedrops.name}
                onChange={(e) => onChange({ eyedrops: { ...settings.eyedrops, name: e.target.value } })}
                placeholder="Eyedrop brand/name"
                className="mt-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
              />
              <ToggleField
                label="Factor in pollen irritation"
                checked={settings.eyedrops.considerPollen}
                onChange={(v) => onChange({ eyedrops: { ...settings.eyedrops, considerPollen: v } })}
              />
              <ToggleField
                label="Factor in wind"
                help="Windy days blow more pollen/dust into your eyes and dry them out faster."
                checked={settings.eyedrops.considerWind}
                onChange={(v) => onChange({ eyedrops: { ...settings.eyedrops, considerWind: v } })}
              />
              <ToggleField
                label="Factor in low humidity"
                help="Dry air increases tear evaporation."
                checked={settings.eyedrops.considerHumidity}
                onChange={(v) => onChange({ eyedrops: { ...settings.eyedrops, considerHumidity: v } })}
              />
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Use eyedrops when risk is at least</span>
                <select
                  value={settings.eyedrops.triggerLevel}
                  onChange={(e) => onChange({ eyedrops: { ...settings.eyedrops, triggerLevel: e.target.value as PollenLevel } })}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
                >
                  {LEVEL_ORDER.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Units</h3>
        <div className="flex items-center rounded-md border border-[var(--border)] p-0.5 text-xs">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onChange({ units: u })}
              className="rounded px-3 py-1.5 font-medium transition-colors"
              style={{ backgroundColor: settings.units === u ? "var(--series-1)" : "transparent", color: settings.units === u ? "white" : "var(--text-secondary)" }}
            >
              {u === "metric" ? "km/h" : "mph"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
