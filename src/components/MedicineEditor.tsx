import { useState } from "react";
import { LEVEL_LABEL, LEVEL_ORDER } from "../lib/recommendation";
import type { Medicine, PollenLevel } from "../lib/types";

interface Props {
  medicines: Medicine[];
  onChange: (medicines: Medicine[]) => void;
}

export function MedicineEditor({ medicines, onChange }: Props) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [triggerLevel, setTriggerLevel] = useState<PollenLevel>("moderate");

  const add = () => {
    if (!name.trim()) return;
    onChange([...medicines, { id: `med-${Date.now()}`, name: name.trim(), dose: dose.trim(), triggerLevel }]);
    setName("");
    setDose("");
    setTriggerLevel("moderate");
  };

  const remove = (id: string) => onChange(medicines.filter((m) => m.id !== id));

  const updateTrigger = (id: string, level: PollenLevel) => onChange(medicines.map((m) => (m.id === id ? { ...m, triggerLevel: level } : m)));

  return (
    <div className="flex flex-col gap-3">
      {medicines.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] p-2.5">
          <div className="text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{m.name}</span>
            {m.dose && <span className="text-[var(--text-muted)]"> · {m.dose}</span>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={m.triggerLevel}
              onChange={(e) => updateTrigger(m.id, e.target.value as PollenLevel)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            >
              {LEVEL_ORDER.map((l) => (
                <option key={l} value={l}>
                  Take at {LEVEL_LABEL[l].toLowerCase()}+
                </option>
              ))}
            </select>
            <button type="button" onClick={() => remove(m.id)} className="text-xs text-[var(--text-muted)] hover:text-[var(--status-critical)]">
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-[var(--border)] p-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cetirizine"
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Dose (optional)</label>
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="e.g. 10mg"
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Trigger level</label>
          <select
            value={triggerLevel}
            onChange={(e) => setTriggerLevel(e.target.value as PollenLevel)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
          >
            {LEVEL_ORDER.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}+
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={add} className="rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "var(--series-1)" }}>
          Add medicine
        </button>
      </div>
    </div>
  );
}
