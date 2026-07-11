import { RISK_TIER_DEFAULTS, TICKERS, findTicker, type RiskTier } from "../lib/tickers";
import type { Holding } from "../lib/types";

interface Props {
  holdings: Holding[];
  onChange: (holdings: Holding[]) => void;
}

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function HoldingsEditor({ holdings, onChange }: Props) {
  const addHolding = () => {
    onChange([...holdings, { id: createId(), ticker: "", amount: 0 }]);
  };

  const update = (id: string, patch: Partial<Holding>) => {
    onChange(holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const remove = (id: string) => {
    onChange(holdings.filter((h) => h.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {holdings.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          No investments added yet — that's fine. Add anything you already own, or the funds you're planning to buy.
        </p>
      )}

      {holdings.map((holding) => {
        const known = findTicker(holding.ticker);
        const isUnknown = holding.ticker.trim().length > 0 && !known;
        return (
          <div key={holding.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
            <div className="grid grid-cols-[1fr_8rem_auto] items-center gap-2">
              <div>
                <input
                  type="text"
                  list="ticker-options"
                  value={holding.ticker}
                  onChange={(e) => update(holding.id, { ticker: e.target.value })}
                  placeholder="Ticker, e.g. VOO"
                  className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm uppercase text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
                />
              </div>
              <input
                type="number"
                value={holding.amount || ""}
                min={0}
                step={100}
                onChange={(e) => update(holding.id, { amount: e.target.valueAsNumber || 0 })}
                placeholder="$ amount"
                className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1.5 text-right text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(holding.id)}
                aria-label="Remove holding"
                className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--gridline)] hover:text-[var(--status-critical)]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {known && (
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                {known.name} · {known.category} · assumed ~{known.expectedReturn}%/yr average
              </p>
            )}
            {isUnknown && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Don't recognize that ticker — how risky is it?</span>
                <select
                  value={holding.riskTier ?? "moderate"}
                  onChange={(e) => update(holding.id, { riskTier: e.target.value as RiskTier })}
                  className="rounded border border-[var(--border)] bg-transparent px-1.5 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
                >
                  {(Object.keys(RISK_TIER_DEFAULTS) as RiskTier[]).map((tier) => (
                    <option key={tier} value={tier}>
                      {RISK_TIER_DEFAULTS[tier].label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })}

      <datalist id="ticker-options">
        {TICKERS.map((t) => (
          <option key={t.symbol} value={t.symbol}>
            {t.name}
          </option>
        ))}
      </datalist>

      <button
        type="button"
        onClick={addHolding}
        className="mt-1 self-start rounded-md border border-dashed border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)] hover:text-[var(--series-1)]"
      >
        + Add an investment
      </button>
    </div>
  );
}
