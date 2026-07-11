# Retirement Plan Studio

A fully configurable retirement planning application. Every assumption — timeline, income, contributions, investment returns, spending, Social Security, pensions, one-time expenses — is editable, and results update live as a year-by-year projection with an optional Monte Carlo simulation.

## Features

- **Configurable plan inputs** — timeline (current age, retirement age, life expectancy), income & contributions (salary, growth, savings rate, employer match), investment assumptions (pre/post-retirement returns, inflation, volatility), retirement spending (replacement ratio or fixed amount, withdrawal strategy, tax rate), other income (Social Security, pension, other), and one-time expenses at any age.
- **Year-by-year projection engine** (`src/lib/calculator.ts`) — models accumulation (contributions + employer match + growth) and decumulation (inflation-adjusted spending net of other income, taxed withdrawals) phases, and reports whether the plan is sustainable through life expectancy.
- **Monte Carlo simulation** (`src/lib/monteCarlo.ts`) — runs hundreds of randomized-return simulations to estimate a success probability and 10th–90th percentile balance range.
- **Dashboard** — stat tiles, a balance-over-time chart with the Monte Carlo confidence band, a contributions-vs-growth breakdown, and a retirement income mix chart.
- **Scenarios** — save named snapshots of a plan, reload them, and compare multiple scenarios' balance projections on one chart.
- **Persistence** — the current plan and saved scenarios are stored in the browser's `localStorage`; nothing leaves your browser.
- **Light/dark theme**, responsive layout.

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
  lib/            calculation engine, Monte Carlo, types, formatting, chart math
  hooks/          localStorage-backed state, theme
  components/     ConfigForm, Dashboard, ScenarioManager, and their subcomponents
```

All figures are estimates for planning purposes only and are not financial advice.
