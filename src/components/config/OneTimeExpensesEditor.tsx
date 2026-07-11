import type { OneTimeExpense } from "../../lib/types";
import { createId } from "../../lib/defaults";

interface Props {
  expenses: OneTimeExpense[];
  onChange: (expenses: OneTimeExpense[]) => void;
  currentAge: number;
  lifeExpectancy: number;
}

export function OneTimeExpensesEditor({ expenses, onChange, currentAge, lifeExpectancy }: Props) {
  const addExpense = () => {
    onChange([
      ...expenses,
      { id: createId(), label: "New expense", age: currentAge + 10, amount: 10000 },
    ]);
  };

  const update = (id: string, patch: Partial<OneTimeExpense>) => {
    onChange(expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => {
    onChange(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {expenses.length === 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          Add large one-time costs — a home purchase, a wedding, a medical event — at a specific age.
        </p>
      )}
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="grid grid-cols-[1fr_4.5rem_6rem_auto] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2"
        >
          <input
            type="text"
            value={expense.label}
            onChange={(e) => update(expense.id, { label: e.target.value })}
            className="min-w-0 rounded border border-transparent bg-transparent px-1 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            placeholder="Label"
          />
          <input
            type="number"
            value={expense.age}
            min={currentAge}
            max={lifeExpectancy}
            onChange={(e) => update(expense.id, { age: e.target.valueAsNumber || currentAge })}
            className="w-full rounded border border-[var(--border)] bg-transparent px-1 py-1 text-right text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            title="Age"
          />
          <input
            type="number"
            value={expense.amount}
            min={0}
            step={1000}
            onChange={(e) => update(expense.id, { amount: e.target.valueAsNumber || 0 })}
            className="w-full rounded border border-[var(--border)] bg-transparent px-1 py-1 text-right text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
            title="Amount"
          />
          <button
            type="button"
            onClick={() => remove(expense.id)}
            aria-label={`Remove ${expense.label}`}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--gridline)] hover:text-[var(--status-critical)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addExpense}
        className="mt-1 self-start rounded-md border border-dashed border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--series-1)] hover:text-[var(--series-1)]"
      >
        + Add one-time expense
      </button>
    </div>
  );
}
