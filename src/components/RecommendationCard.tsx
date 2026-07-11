import type { ReactNode } from "react";
import { isToday, todayKey } from "../lib/format";
import { LEVEL_COLOR_VAR, LEVEL_LABEL } from "../lib/recommendation";
import type { EyedropSettings, Medicine, Recommendation } from "../lib/types";

interface Props {
  recommendation: Recommendation;
  medicines: Medicine[];
  eyedrops: EyedropSettings;
  onMarkMedicineTaken: (id: string) => void;
  onMarkEyedropsUsed: () => void;
}

export function RecommendationCard({ recommendation, medicines, eyedrops, onMarkMedicineTaken, onMarkEyedropsUsed }: Props) {
  const { overallLevel } = recommendation;

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: `color-mix(in srgb, var(${LEVEL_COLOR_VAR[overallLevel]}) 40%, var(--border))`, backgroundColor: `color-mix(in srgb, var(${LEVEL_COLOR_VAR[overallLevel]}) 8%, var(--surface-1))` }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: `var(${LEVEL_COLOR_VAR[overallLevel]})` }} />
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Today's hayfever level: <span style={{ color: `var(${LEVEL_COLOR_VAR[overallLevel]})` }}>{LEVEL_LABEL[overallLevel]}</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <RecommendationRow
          title="Hayfever medicine"
          due={recommendation.takeMedicine}
          reason={recommendation.medicineReason}
        >
          {medicines.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No medicines configured yet — add one in Settings.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {medicines.map((m) => {
                const takenToday = isToday(m.lastTakenOn);
                return (
                  <label key={m.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {m.name}
                      {m.dose && <span className="text-[var(--text-muted)]"> · {m.dose}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => onMarkMedicineTaken(m.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: takenToday ? "var(--status-good)" : "var(--gridline)",
                        color: takenToday ? "white" : "var(--text-secondary)",
                      }}
                    >
                      {takenToday ? "Taken today ✓" : "Mark as taken"}
                    </button>
                  </label>
                );
              })}
            </div>
          )}
        </RecommendationRow>

        <RecommendationRow title="Eyedrops for dry eyes" due={recommendation.useEyedrops} reason={recommendation.eyedropReason}>
          {eyedrops.enabled && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--text-secondary)]">{eyedrops.name || "Eyedrops"}</span>
              <button
                type="button"
                onClick={onMarkEyedropsUsed}
                className="rounded-md px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: isToday(eyedrops.lastUsedOn) ? "var(--status-good)" : "var(--gridline)",
                  color: isToday(eyedrops.lastUsedOn) ? "white" : "var(--text-secondary)",
                }}
              >
                {isToday(eyedrops.lastUsedOn) ? "Used today ✓" : "Mark as used"}
              </button>
            </label>
          )}
        </RecommendationRow>
      </div>

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        {todayKey()} · Estimates to help you plan your day — not medical advice. If symptoms are severe or unusual, speak to a pharmacist or doctor.
      </p>
    </div>
  );
}

function RecommendationRow({ title, due, reason, children }: { title: string; due: boolean; reason: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: due ? "color-mix(in srgb, var(--status-critical) 15%, transparent)" : "color-mix(in srgb, var(--status-good) 15%, transparent)",
            color: due ? "var(--status-critical)" : "var(--status-good)",
          }}
        >
          {due ? "Recommended today" : "Not needed"}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{reason}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
