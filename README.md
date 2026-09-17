# Recurr

A local-first tracker for recurring life-maintenance tasks — oil changes, dentist visits, bills, watering plants.
All data stays on your device.

**Live:** https://nabilpervez.github.io/recurr/

## Development

Requires Node 20+.

```bash
npm install
npm run dev       # http://localhost:5173/recurr/
npm run lint
npm run build     # outputs to dist/
npm run preview   # serve the production build
```

## Project structure

```
src/
  main.jsx            entry: fonts, styles, ErrorBoundary
  App.jsx             state, task operations, navigation
  styles.css
  components/         TaskCard, TodayView, UpcomingView, SettingsView, TaskModal, DelayModal, ErrorBoundary
  lib/                constants.js, date.js, storage.js
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml` (lint → build → GitHub Pages).
One-time setup: **Settings → Pages → Source: GitHub Actions**.

The Vite `base` is `/recurr/`; change it in `vite.config.js` if hosting elsewhere.

## Roadmap

See [docs/PWA_AUDIT_AND_SPRINT_PLAN.md](docs/PWA_AUDIT_AND_SPRINT_PLAN.md).

## License

MIT
