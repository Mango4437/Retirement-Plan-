# Becoming an Actuary

A configurable roadmap tool for anyone working towards an actuarial qualification. It exists to answer one question: **given where I am now, and how much time I can realistically give it, when do I actually qualify?**

## How it works

1. **Where are you starting from?** — education level, and whether you're already in an actuarial-adjacent role (analyst/trainee with exam support).
2. **Pick your exam track** — Society of Actuaries (SOA, US/Canada), Casualty Actuarial Society (CAS, US/Canada P&C), or the Institute & Faculty of Actuaries (IFoA, UK). Each has its own exam codes, structure, and credential names (`src/lib/examData.ts`). Choose Associateship or Fellowship as your target.
3. **What have you already completed?** — a checklist of every exam, VEE credit, module, and professionalism requirement for your chosen body and target, grouped by category.
4. **Set your pace** — how many exams/sittings you'll attempt per year, and how many hours a week you can actually study.

## What you get

- A headline qualification date, based on your chosen pace.
- A **reality check**: the study hours/week your chosen pace actually demands vs. what you said you have — and how much longer it'd really take if those don't match.
- A visual timeline (`src/components/TimelineChart.tsx`) of every remaining requirement, sized by typical study hours and placed in sequence.
- An expandable "What am I assuming?" panel explaining the hour estimates, the first-attempt assumption (real pass rates are ~40–50%, so build in buffer), and a pointer to check the official syllabus, since actuarial bodies revise their exam structures periodically.

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
  lib/            exam body & syllabus data, roadmap/pacing calculator, types, formatting, chart math
  hooks/          localStorage-backed state, theme
  components/     step cards, choice cards, exam checklist, timeline chart, roadmap results panel
```

Study hour estimates are broad industry rules of thumb, not official figures from any actuarial body — this is a planning tool, not professional guidance. Your plan is saved to your browser's `localStorage` only; nothing is sent anywhere.
