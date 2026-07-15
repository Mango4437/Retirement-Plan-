# Will I Be Rich?

A dead-simple investing calculator for UK students/young people with zero finance background. It exists to teach one lesson: **saving feels like a barrier, but time is the actual lever** — starting now beats saving more later.

## How it works

1. **How much do you earn?** — annual salary, before tax.
2. **Your workplace pension** — models real UK auto-enrolment law (Pensions Act 2008, 2026/27 figures, `src/lib/ukPension.ts`): employer/employee minimums of 3%/5% of *qualifying earnings* (the band between £6,240–£50,270, not your whole salary), with the employee side correctly showing that only ~80% comes out of take-home pay — the rest is automatic basic-rate tax relief. Employer and tax-relief amounts are called out as "free money" you don't have to earn.
3. **Investing beyond your pension** — a slider for extra ISA/general-account saving, plus tickers/holdings. A built-in offline reference table (`src/lib/tickers.ts`) maps ~20 common funds/stocks to a return & volatility assumption, so no live market data or API key is needed. Unrecognized tickers fall back to a simple risk-tier picker.
4. **How long until you need the money?**

## Why the numbers are pessimistic on purpose

Return assumptions in `tickers.ts` are deliberately lower than raw historical backtests (e.g. a global tracker assumes ~6%/yr, not the ~10% often quoted for the S&P 500) — headline historical averages are widely considered too optimistic to plan around today. The headline result on screen is the **10th-percentile ("cautious") outcome** from a 400-run Monte Carlo simulation, not the average case — you're shown what happens if markets underperform, with the median as a secondary figure. There's also a State Pension backstop note (current full amount, with an explicit warning not to rely on it) and a **"cost of waiting"** comparison that shows, in cash terms, what a 5-year delay actually costs — the core teaching point.

An expandable "What am I assuming?" panel shows the exact blended return and every input, so it's never a black box.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. To type-check and produce a production build:

```bash
npm run build
```

## Project structure

```
src/
  lib/            UK pension law, tickers reference table, growth/Monte Carlo calculator, types, formatting, chart math
  hooks/          localStorage-backed state, theme
  components/     the step cards, pension section, holdings editor, growth chart, results panel
```

All figures are estimates using conservative planning assumptions, not predictions — this is a learning tool, not financial advice. Your plan is saved to your browser's `localStorage` only; nothing is sent anywhere.
