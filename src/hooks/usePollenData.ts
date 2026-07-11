import { useEffect, useState } from "react";
import { fetchLivePollen, fetchWeather } from "../lib/pollenApi";
import { buildEstimatedReading } from "../lib/seasonalModel";
import type { PollenLevel, PollenReading, PollenType } from "../lib/types";

interface Args {
  lat: number;
  lon: number;
  hemisphere: "N" | "S";
  climate: { intensity: Record<PollenType, number>; tropical?: boolean };
  dataMode: "auto" | "manual";
  manualLevels: Record<PollenType, PollenLevel>;
  refreshKey: number;
}

const MANUAL_INDEX: Record<PollenLevel, number> = { low: 10, moderate: 35, high: 60, "very-high": 90 };

export function usePollenData({ lat, lon, hemisphere, climate, dataMode, manualLevels, refreshKey }: Args) {
  const [reading, setReading] = useState<PollenReading | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dataMode === "manual") {
      setReading({
        source: "manual",
        fetchedAt: new Date().toISOString(),
        unit: "index",
        values: {
          tree: MANUAL_INDEX[manualLevels.tree],
          grass: MANUAL_INDEX[manualLevels.grass],
          weed: MANUAL_INDEX[manualLevels.weed],
        },
      });
      setStatus("ready");
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    (async () => {
      try {
        const [live, weather] = await Promise.all([
          fetchLivePollen(lat, lon, controller.signal).catch(() => null),
          fetchWeather(lat, lon, controller.signal).catch(() => null),
        ]);

        const base = live ?? buildEstimatedReading(hemisphere, climate);
        setReading({ ...base, weather: weather ?? undefined });
        setStatus("ready");
      } catch (err) {
        if (controller.signal.aborted) return;
        setReading(buildEstimatedReading(hemisphere, climate));
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Couldn't reach the live data source.");
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, hemisphere, dataMode, refreshKey, manualLevels.tree, manualLevels.grass, manualLevels.weed]);

  return { reading, status, errorMessage };
}
