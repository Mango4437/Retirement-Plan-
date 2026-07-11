import { LEVEL_COLOR_VAR, LEVEL_LABEL, levelForReading } from "../lib/recommendation";
import { formatTime, kphToMph } from "../lib/format";
import type { PollenReading, PollenType, SensitivityLevel } from "../lib/types";

interface Props {
  reading: PollenReading;
  sensitivityLevel: SensitivityLevel;
  sensitiveTo: Record<PollenType, boolean>;
  units: "metric" | "imperial";
  onRefresh: () => void;
  refreshing: boolean;
}

const TYPE_LABEL: Record<PollenType, string> = { tree: "Tree", grass: "Grass", weed: "Weed" };

const SOURCE_LABEL: Record<PollenReading["source"], string> = {
  live: "Live station data",
  estimated: "Estimated (seasonal model)",
  manual: "Manual entry",
};

export function ConditionsPanel({ reading, sensitivityLevel, sensitiveTo, units, onRefresh, refreshing }: Props) {
  const types: PollenType[] = ["tree", "grass", "weed"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: reading.source === "live" ? "color-mix(in srgb, var(--status-good) 15%, transparent)" : "var(--gridline)",
            color: reading.source === "live" ? "var(--status-good)" : "var(--text-secondary)",
          }}
        >
          {SOURCE_LABEL[reading.source]}
        </span>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>Updated {formatTime(reading.fetchedAt)}</span>
          {reading.source !== "manual" && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-md border border-[var(--border)] px-2 py-1 font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)] disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </div>
      </div>

      {reading.source === "estimated" && (
        <p className="rounded-md bg-[var(--gridline)]/40 px-3 py-2 text-xs text-[var(--text-muted)]">
          No live pollen station covers this location yet, so this is a seasonal estimate based on the month, hemisphere and typical climate — not a
          measurement. Switch to manual entry in Settings if you have a better local source.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {types.map((type) => {
          const level = levelForReading(type, reading, sensitivityLevel);
          const pct = Math.max(4, Math.min(100, reading.unit === "index" ? reading.values[type] : Math.min(100, (reading.values[type] / 150) * 100)));
          return (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  {TYPE_LABEL[type]} pollen {!sensitiveTo[type] && <span className="text-[var(--text-muted)]">(not tracked for you)</span>}
                </span>
                <span className="font-medium tabular-nums" style={{ color: `var(${LEVEL_COLOR_VAR[level]})` }}>
                  {LEVEL_LABEL[level]}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gridline)]">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: `var(${LEVEL_COLOR_VAR[level]})` }} />
              </div>
            </div>
          );
        })}
      </div>

      {reading.weather && (
        <div className="flex flex-wrap gap-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)]">
          <span>
            Wind: <strong className="tabular-nums text-[var(--text-primary)]">
              {units === "imperial" ? `${Math.round(kphToMph(reading.weather.windKph))} mph` : `${Math.round(reading.weather.windKph)} km/h`}
            </strong>
          </span>
          <span>
            Humidity: <strong className="tabular-nums text-[var(--text-primary)]">{Math.round(reading.weather.humidityPercent)}%</strong>
          </span>
          <span>
            Precipitation: <strong className="tabular-nums text-[var(--text-primary)]">{reading.weather.precipMm} mm</strong>
          </span>
        </div>
      )}
    </div>
  );
}
