# Will I Be Rich?

A dead-simple investing growth calculator for people with zero finance background — students figuring out what happens if they actually start investing. Three questions, one chart.

## How it works

1. **How much do you earn?** — annual income, plus a slider for what % you want to invest each year.
2. **What are you invested in?** — add tickers (VOO, AAPL, ...) and dollar amounts. A built-in reference table (`src/lib/tickers.ts`) maps ~20 common tickers to long-term historical average return & volatility, so no live market data or API key is needed. Unrecognized tickers fall back to a simple risk-tier picker (conservative/moderate/aggressive).
3. **How long until you need the money?** — a years-from-now slider.

The app blends the listed holdings into one expected return/volatility (weighted by dollar amount), then projects year-by-year compound growth (`src/lib/calculator.ts`), plus a lightweight Monte Carlo simulation (400 runs) to show a realistic 10th–90th percentile range alongside the expected path. Everything updates live as you type.

An expandable "What am I assuming?" panel shows the exact blended return and each holding's contribution, so it's never a black box.

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
  lib/            tickers reference table, growth/Monte Carlo calculator, types, formatting, chart math
  hooks/          localStorage-backed state, theme
  components/     the 3 step cards, holdings editor, growth chart, results panel
```

All figures are rough historical averages, not predictions — this is a learning tool, not financial advice. Your plan is saved to your browser's `localStorage` only; nothing is sent anywhere.
