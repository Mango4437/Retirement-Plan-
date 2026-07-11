import { useState } from "react";
import type { SavedScenario } from "../lib/types";

interface Props {
  scenarios: SavedScenario[];
  currentName: string;
  onSave: (name: string) => void;
  onLoad: (scenario: SavedScenario) => void;
  onDelete: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export function ScenarioManager({ scenarios, currentName, onSave, onLoad, onDelete, compareIds, onToggleCompare }: Props) {
  const [draftName, setDraftName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const name = draftName.trim() || "Untitled plan";
    onSave(name);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Scenarios</h3>
        {!saving && (
          <button
            type="button"
            onClick={() => {
              setDraftName(currentName);
              setSaving(true);
            }}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)] hover:text-[var(--series-1)]"
          >
            + Save current
          </button>
        )}
      </div>

      {saving && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            placeholder="Scenario name"
          />
          <button type="button" onClick={handleSave} className="rounded-md bg-[var(--series-1)] px-2.5 py-1 text-xs font-medium text-white">
            Save
          </button>
          <button type="button" onClick={() => setSaving(false)} className="text-xs text-[var(--text-muted)]">
            Cancel
          </button>
        </div>
      )}

      {scenarios.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">
          Save named snapshots of your plan to compare strategies — e.g. "Retire at 62" vs. "Retire at 67".
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {scenarios.map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5">
              <input
                type="checkbox"
                checked={compareIds.includes(s.id)}
                onChange={() => onToggleCompare(s.id)}
                aria-label={`Compare ${s.name}`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-[var(--text-primary)]">{s.name}</div>
                <div className="text-xs text-[var(--text-muted)]">Saved {new Date(s.savedAt).toLocaleDateString()}</div>
              </div>
              <button
                type="button"
                onClick={() => onLoad(s)}
                className="rounded px-2 py-1 text-xs font-medium text-[var(--series-1)] hover:bg-[color-mix(in_srgb,var(--series-1)_12%,transparent)]"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                aria-label={`Delete ${s.name}`}
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--gridline)] hover:text-[var(--status-critical)]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {scenarios.length > 0 && (
        <p className="text-xs text-[var(--text-muted)]">Check scenarios above to compare them against your current plan.</p>
      )}
    </div>
  );
}
