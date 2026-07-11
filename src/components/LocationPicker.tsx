import { useState } from "react";
import { COUNTRIES } from "../lib/countries";
import type { CustomLocation } from "../lib/types";

interface Props {
  locationId: string;
  customLocations: CustomLocation[];
  onSelect: (id: string) => void;
  onAddCustom: (loc: CustomLocation) => void;
  onRemoveCustom: (id: string) => void;
}

export function LocationPicker({ locationId, customLocations, onSelect, onAddCustom, onRemoveCustom }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [hemisphere, setHemisphere] = useState<"N" | "S">("N");

  const submitCustom = () => {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!name.trim() || Number.isNaN(latNum) || Number.isNaN(lonNum)) return;
    onAddCustom({ id: `custom-${Date.now()}`, name: name.trim(), lat: latNum, lon: lonNum, hemisphere });
    setName("");
    setLat("");
    setLon("");
    setAdding(false);
  };

  const useBrowserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      onAddCustom({
        id: `custom-${Date.now()}`,
        name: "My location",
        lat: Math.round(pos.coords.latitude * 1000) / 1000,
        lon: Math.round(pos.coords.longitude * 1000) / 1000,
        hemisphere: pos.coords.latitude >= 0 ? "N" : "S",
      });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <select
        value={locationId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
      >
        {customLocations.length > 0 && (
          <optgroup label="Your locations">
            {customLocations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Countries">
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      </select>

      {customLocations.some((c) => c.id === locationId) && (
        <button
          type="button"
          onClick={() => onRemoveCustom(locationId)}
          className="self-start text-xs text-[var(--text-muted)] underline decoration-dotted hover:text-[var(--text-secondary)]"
        >
          Remove this custom location
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useBrowserLocation}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)]"
        >
          Use my current location
        </button>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)]"
        >
          {adding ? "Cancel" : "Add a custom place"}
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-2 rounded-md border border-[var(--border)] p-3">
          <input
            placeholder="Name (e.g. My town)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-1/2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            />
            <input
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-1/2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Hemisphere (for the seasonal estimate):</span>
            <button
              type="button"
              onClick={() => setHemisphere("N")}
              className="rounded px-2 py-1"
              style={{ backgroundColor: hemisphere === "N" ? "var(--series-1)" : "var(--gridline)", color: hemisphere === "N" ? "white" : "var(--text-secondary)" }}
            >
              North
            </button>
            <button
              type="button"
              onClick={() => setHemisphere("S")}
              className="rounded px-2 py-1"
              style={{ backgroundColor: hemisphere === "S" ? "var(--series-1)" : "var(--gridline)", color: hemisphere === "S" ? "white" : "var(--text-secondary)" }}
            >
              South
            </button>
          </div>
          <button
            type="button"
            onClick={submitCustom}
            className="self-start rounded-md px-3 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: "var(--series-1)" }}
          >
            Add location
          </button>
        </div>
      )}
    </div>
  );
}
