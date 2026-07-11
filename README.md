# Hayfever Tracker

A configurable web app that answers two questions for wherever you are: **how bad is hayfever today, and should I take my medicine and eyedrops?**

## How it works

1. **Pick a location** — choose from ~50 countries or add your own place (lat/lon, or "use my current location"). Each country carries a rough climate profile (which pollen types run high there, and roughly when).
2. **Get today's pollen levels** (`src/lib/pollenApi.ts`, `src/lib/seasonalModel.ts`):
   - **Live data** where it exists — Open-Meteo's CAMS European air-quality model gives real tree/grass/weed pollen concentrations (grains/m³) for Europe, no API key needed.
   - **Estimated fallback** everywhere else — a deterministic seasonal curve based on the month, hemisphere, and the location's climate profile. Always clearly labelled as an estimate, never presented as a measurement.
   - **Manual entry** — if you'd rather type in today's level from a local source (or just don't trust an estimate), Settings lets you override each pollen type directly.
   - Wind, humidity and precipitation come from Open-Meteo's global forecast API and feed into the dry-eye score.
3. **Configure yourself, not just the app** (`src/lib/recommendation.ts`, Settings panel):
   - Which pollen types you're actually sensitive to (tree / grass / weed) — types you're not sensitive to are shown but don't drive the verdict.
   - An overall sensitivity dial (mild/normal/high) that shifts how easily a reading tips into the next level.
   - A list of your hayfever medicines, each with its own "take at this level or above" trigger — add as many as you take.
   - Eyedrop reminders with their own trigger level and a choice of which factors count toward dry-eye risk (pollen irritation, wind, low humidity).
   - Units (km/h or mph).
4. **Get a clear verdict** — a single Low/Moderate/High/Very High headline, plus a "recommended today / not needed" call for medicine and for eyedrops, each with the reasoning spelled out. "Mark as taken/used" checks it off for today.

Everything you configure is saved to `localStorage` only — nothing is sent anywhere except the anonymous, keyless calls to Open-Meteo for pollen/weather data.

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
  lib/            countries + climate profiles, live pollen/weather fetch, offline seasonal model, recommendation engine, types
  hooks/          localStorage-backed settings, theme, the pollen/weather data-fetching hook
  components/     location picker, conditions panel, recommendation card, settings panel, medicine editor
```

Pollen levels, dry-eye risk and medicine timing here are estimates to help you plan your day — not medical advice. If symptoms are severe or unusual, speak to a pharmacist or doctor.
