# Recurr → Production PWA: Audit, Checklist & Sprint Plan

_Audit date: 2026-09-17 · Audited commit: `122baa8` (main)_

## 1. Current state

Recurr is a recurring-task tracker ("life maintenance": oil changes, dentist, bills). The entire app is one file, `index.html` (~1,070 lines):

- React 18 + lucide-react loaded at runtime from **esm.sh** through an import map
- JSX compiled **in the browser** by `@babel/standalone` from **unpkg** (version not pinned)
- Google Fonts pulled by an `@import` inside a `<style>` tag that React renders
- State kept in `localStorage` (`recurr_tasks_v2`, `recurr_prefs_v2`, `recurr_cats_v2`)
- Three views (Today / Upcoming / Settings), add/edit sheet, delay sheet, JSON import/export

**Verdict:** It looks and works like a mobile web app, but it is **not a PWA**. You can't install it, it doesn't work offline, and it needs three third-party CDNs just to start. It also has several date-logic and data-safety bugs that matter more once people rely on it as an installed app.

---

## 2. Problems & solutions checklist

Severity: 🔴 Blocker (no PWA without it) · 🟠 High (bugs or data loss) · 🟡 Medium (UX / reliability) · ⚪ Low (polish)

### A. Installability (PWA core)

- [ ] 🔴 **A1. No web app manifest.** Browsers won't offer "Install".
  → Add `manifest.webmanifest` with `name`, `short_name`, `start_url: "./"`, `scope: "./"`, `display: "standalone"`, `background_color`/`theme_color` `#0f0e0b`, `icons`, `id`. Keep paths relative so it works on a GitHub Pages subpath (`/recurr/`).
- [ ] 🔴 **A2. No icons.** No 192/512 PNGs, maskable icon, `apple-touch-icon`, or favicon.
  → Make an icon set (192, 512, 512-maskable, 180 Apple touch icon, SVG favicon), for example with `@vite-pwa/assets-generator`.
- [ ] 🔴 **A3. No service worker.** No offline support, and Chrome's install rules aren't met.
  → Add a Workbox service worker through `vite-plugin-pwa`: precache the app shell and cache fonts/icons.
- [ ] 🟡 **A4. No update flow.** Once a service worker exists, users can get stuck on old versions.
  → Use `registerType: "prompt"` and show a "New version available – Reload" toast.
- [ ] 🟡 **A5. No install prompt UX.**
  → Capture `beforeinstallprompt` and show an "Install app" row in Settings. On iOS, show "Share → Add to Home Screen" instructions instead.
- [ ] ⚪ **A6. Manifest extras:** `shortcuts` ("Add task", "Today"), `screenshots` (for the richer install sheet), `categories: ["productivity"]`.

### B. Build & runtime architecture

- [ ] 🔴 **B1. Babel compiles JSX in the browser on every launch.** It downloads ~3 MB, is slow to start, and can't be precached reliably.
  → Move to **Vite + React**: `src/main.jsx`, `src/App.jsx`, and components split into files.
- [ ] 🔴 **B2. Runtime CDN dependencies** (esm.sh, unpkg). If they're offline or blocked, the app shows a blank screen. The Babel version is unpinned, so an upstream release can break the app.
  → Install `react`, `react-dom`, `lucide-react` from npm and bundle them. Import only the icons the app uses, so unused ones are tree-shaken.
- [ ] 🟠 **B3. Google Fonts `@import` inside the rendered `<style>`.** Fonts fail offline, the page flashes unstyled text, and the whole CSS string is re-injected on every render.
  → Self-host Syne / DM Sans / Space Mono (`@fontsource/*`), move CSS into a static `.css` file, and add `font-display: swap`.
- [ ] 🟡 **B4. No package.json, lint, tests, or CI.**
  → Add ESLint, Vitest, and a GitHub Actions workflow (lint → test → build → deploy).
- [ ] ⚪ **B5. Unused imports:** `Bell`, `RotateCcw`, `ChevronRight`, `AlertTriangle`.
- [ ] ⚪ **B6. No README, license, or deploy target** documented.

### C. Mobile shell / native feel

- [ ] 🟠 **C1. `viewport-fit=cover` is missing.** On iOS, every `env(safe-area-inset-*)` value is `0`, so the bottom nav and FAB sit under the home indicator.
  → Add `viewport-fit=cover` to the viewport meta.
- [ ] 🟠 **C2. Status bar is `black-translucent`, but the header has no top safe-area padding.** In standalone mode the header slides under the notch or clock.
  → Add `padding-top: env(safe-area-inset-top)` to `.rr-header`.
- [ ] 🟡 **C3. `maximum-scale=1, user-scalable=no` blocks zoom.** This fails WCAG 1.4.4 and Lighthouse accessibility.
  → Remove both. To prevent iOS zoom on focus, keep input font-size ≥ 16px instead. Inputs are currently 13–15px.
- [ ] 🟡 **C4. `theme-color` is always dark.** The light theme keeps a dark status bar.
  → Update `<meta name="theme-color">` when the theme changes, and default to `prefers-color-scheme`.
- [ ] 🟡 **C5. `min-height: 100vh`** jumps with mobile browser toolbars.
  → Use `100dvh`.
- [ ] 🟡 **C6. `:hover` transforms stick on touch** (cards and buttons stay lifted after a tap).
  → Wrap hover styles in `@media (hover: hover)`.
- [ ] ⚪ **C7. No overscroll control.** Pull-to-refresh can reload the app mid-edit.
  → `overscroll-behavior-y: contain` on the body/content.
- [ ] ⚪ **C8. Sheets can't be dismissed by swipe or the Escape key**, focus isn't trapped, and background scroll isn't locked.
- [ ] ⚪ **C9. `autoFocus` on the name field** opens the keyboard over the sheet animation on mobile.

### D. Date & recurrence logic bugs

- [ ] 🟠 **D1. Time-zone bug in `shiftDate`.** It builds a local-noon date and then calls `toISOString()` (UTC). In UTC+12 and later (NZ summer, Tonga, Kiribati), dates come back **one day early**.
  → Format with local getters (reuse the `todayStr` logic), or store dates as `YYYY-MM-DD` and do all arithmetic in UTC.
- [ ] 🟠 **D2. Month-end overflow.** Jan 31 + 1 month = **Mar 3**, and the base date then drifts permanently (a monthly bill that starts on the 31st slides forward each month).
  → Clamp to the last day of the target month, and keep the original `anchorDay` on the task so the 31st returns in 31-day months.
- [ ] 🟠 **D3. "Today" never refreshes.** If the app stays open or resumes from the background past midnight, due lists, labels, and the badge are stale. Installed PWAs make this much more common.
  → Add a `useToday()` hook that re-computes on `visibilitychange`, on `focus`, and with a timer set for the next midnight.
- [ ] 🟠 **D4. Delay preview is wrong for overdue tasks.** The sheet previews "→ Tomorrow" (today + N), but `delayTask` shifts from `nextDueDate`. A task 5 days overdue delayed "+1 Day" stays overdue.
  → Decide on one rule (recommended: delay from `max(today, nextDueDate)`) and use it for both the preview and the action.
- [ ] 🟠 **D5. Completing a long-overdue task can stay overdue.** A daily task 10 days late has to be ticked 10 times, because the base only advances one period per completion.
  → Advance the base until it's after today (or offer "Skip missed" vs "Log all"). Record the completion in a history.
- [ ] 🟡 **D6. Invalid custom frequency accepted.** An empty value, 0, or a negative number gives `Number("")=0`, so the task never advances (or moves backwards).
  → Validate an integer from 1 to 999 before saving.
- [ ] 🟡 **D7. Editing a task wipes any active delay** (`baseDueDate` is overwritten by `nextDueDate`). There's also no way to see or clear a delay.
- [ ] ⚪ **D8. Dates are hard-coded to `en-US`.**
  → Use `navigator.language` / `Intl`.

### E. Data durability & safety

- [ ] 🟠 **E1. `localStorage` can be evicted.** Safari clears script-writable storage after 7 days without a visit (unless installed), and storage-pressure eviction applies everywhere.
  → Call `navigator.storage.persist()`, show the persistence status in Settings, and nudge users to back up.
- [ ] 🟠 **E2. Import isn't validated.** Any JSON with a `tasks` key is accepted. A malformed task (missing `frequency`, a bad date) crashes rendering and then gets **saved**, so the app stays broken after a reload.
  → Add a schema check (zod or a hand-written validator), sanitize or skip bad rows, and report "Imported X, skipped Y".
- [ ] 🟠 **E3. No data versioning or migration.** Keys end in `_v2`, but there's no migration code, so older or future shapes will break.
  → Add `schemaVersion` plus a `migrate()` step on load and on import.
- [ ] 🟠 **E4. Delete has no confirmation or undo** (the trash icon on every card is one mis-tap from data loss).
  → Add an "Undo" snackbar (about 5 s).
- [ ] 🟡 **E5. Export doesn't work well in iOS standalone mode.** `<a download>` with a blob opens a viewer or fails. `revokeObjectURL` runs right after `click()`, which can cancel the download in some browsers.
  → Prefer `navigator.share({ files })` when available, fall back to `<a download>`, and revoke on a timeout.
- [ ] 🟡 **E6. `store()` doesn't catch errors.** A quota error or private mode throws inside `useEffect` and breaks the app.
  → try/catch plus a user-visible warning.
- [ ] 🟡 **E7. No sync between open tabs.**
  → Listen to the `storage` event, or a `BroadcastChannel` after moving to IndexedDB.
- [ ] 🟡 **E8. Removing a custom category orphans tasks** that use it (the colour falls back to grey and the edit select shows the wrong value).
  → Block the removal, or reassign those tasks to another category.
- [ ] 🟡 **E9. "Load sample tasks" replaces all tasks** (`setTasks(samples)`). It's only shown when the Today list is empty, but upcoming tasks can still exist.
  → Append instead, or confirm first.
- [ ] ⚪ **E10. `window.confirm` / `alert`** look out of place in standalone mode.
  → Use in-app dialogs.
- [ ] ⚪ **E11. Consider moving to IndexedDB** (`idb-keyval`), which allows completion history, bigger data, and access from the service worker for notifications.

### F. Engagement features expected from an installed app

- [ ] 🟡 **F1. No reminders.** The `Bell` icon is imported but unused.
  → Phase 1: an in-app due banner plus the **Badging API** (`navigator.setAppBadge(todayCount)`). Phase 2: notifications through `Notification` + `showNotification` when the app opens. Phase 3 (optional): Web Push with a small backend or scheduled job. iOS 16.4+ supports push **only for installed PWAs**.
- [ ] ⚪ **F2. No completion history or streaks** (only `lastCompleted` is saved).
- [ ] ⚪ **F3. Haptics** (`navigator.vibrate`) when a task is completed, where supported.

### G. Accessibility

- [ ] 🟡 **G1. Some buttons have no label** (the category remove "X", "Add") and card actions are 27 px, below the 44 px touch-target guideline.
- [ ] 🟡 **G2. Toggle isn't a switch.**
  → `role="switch"` + `aria-checked`.
- [ ] 🟡 **G3. Sheets aren't dialogs.**
  → `role="dialog"`, `aria-modal`, labelled title, focus return on close.
- [ ] ⚪ **G4. The date input forces `colorScheme: "dark"`**, even in the light theme.
- [ ] ⚪ **G5. Contrast:** `--t3` (#5a5442 on #0f0e0b) fails WCAG AA for the 9–11 px labels.
- [ ] ⚪ **G6. No `prefers-reduced-motion`** handling for the sheet/card animations.

### H. Deployment & quality gates

- [ ] 🔴 **H1. No hosting over HTTPS is set up** (service workers require it).
  → GitHub Pages through Actions (`base: "/recurr/"`), or Netlify/Vercel.
- [ ] 🟡 **H2. No Lighthouse/PWA checks.**
  → Add Lighthouse CI to Actions with thresholds (PWA installable, Performance ≥ 90, Accessibility ≥ 95).
- [ ] 🟡 **H3. No unit tests for date math** (D1–D5 are exactly the kind of bug tests catch).
  → Use Vitest with TZ matrix runs (`TZ=Pacific/Kiritimati`, `America/Los_Angeles`, `UTC`).
- [ ] ⚪ **H4. No error boundary.** A render error blanks the screen with no recovery.
  → Add an error boundary with "Export data / Reset" options.

---

## 3. Sprint plan

Assumes 1 developer, **1-week sprints**, and 6 sprints in total. Each sprint ends in a deployable build.

### Sprint 1 — Foundation: real build (B1–B6, H1, H4)
**Goal:** Same app and look, but bundled, with no runtime CDNs, deployed over HTTPS.

| # | Task | Items | Est |
|---|------|-------|-----|
| 1.1 | Scaffold Vite + React, ESLint, Prettier; `.gitignore` | B1, B4 | 0.5d |
| 1.2 | Split `index.html` into `src/` modules: `utils/date.js`, `storage.js`, `components/*`, `App.jsx` | B1 | 1d |
| 1.3 | Install react/lucide from npm; remove import map + Babel; remove unused icons | B2, B5 | 0.25d |
| 1.4 | Move CSS to `styles.css`; self-host fonts via @fontsource | B3 | 0.5d |
| 1.5 | Add ErrorBoundary with export/reset fallback | H4 | 0.25d |
| 1.6 | GitHub Actions: lint → build → deploy to GitHub Pages (`base: /recurr/`) | H1, B4 | 0.5d |
| 1.7 | README (dev, build, deploy), LICENSE | B6 | 0.25d |

**Definition of done:** `npm run build` works; the deployed site loads with the network tab showing only same-origin requests; the UI looks the same as before.

### Sprint 2 — PWA core (A1–A5, C1–C2)
**Goal:** The app installs on Android, desktop, and iOS and works fully offline.

| # | Task | Items | Est |
|---|------|-------|-----|
| 2.1 | Design icon; generate 192/512/maskable/apple-touch/favicon | A2 | 0.5d |
| 2.2 | `vite-plugin-pwa`: manifest (relative scope/start_url, id, colors) | A1 | 0.5d |
| 2.3 | Workbox precache app shell + fonts; offline test | A3 | 0.5d |
| 2.4 | Update prompt toast (`registerType: "prompt"`) | A4 | 0.5d |
| 2.5 | Install button (`beforeinstallprompt`) + iOS instructions sheet | A5 | 0.5d |
| 2.6 | `viewport-fit=cover`, safe-area padding on header/nav/FAB/sheets | C1, C2 | 0.5d |
| 2.7 | Device test pass: Android Chrome, iOS Safari standalone, desktop Chrome/Edge | — | 0.5d |

**Definition of done:** Lighthouse reports the app as installable; it works in airplane mode after the first visit; nothing is hidden under the notch or home indicator.

### Sprint 3 — Correctness: date & recurrence engine (D1–D8, H3)
**Goal:** Recurrence math is right in every time zone and at month ends, and it's covered by tests.

| # | Task | Items | Est |
|---|------|-------|-----|
| 3.1 | Vitest setup + TZ matrix in CI | H3 | 0.5d |
| 3.2 | Rewrite `shiftDate` with local formatting + month-end clamp + `anchorDay` | D1, D2 | 1d |
| 3.3 | `useToday()` hook: midnight timer + visibilitychange/focus | D3 | 0.5d |
| 3.4 | Unify delay semantics (from `max(today, next)`), fix preview; show/clear active delay; preserve on edit | D4, D7 | 0.5d |
| 3.5 | Overdue completion: advance past today; record completion history | D5, F2 (data) | 0.5d |
| 3.6 | Form validation (custom interval 1–999, valid date) | D6 | 0.25d |
| 3.7 | Locale-aware date formatting | D8 | 0.25d |

**Definition of done:** ≥ 95% coverage on `utils/date.js`; the regression tests for D1–D5 pass in all TZ jobs.

### Sprint 4 — Data durability & safety (E1–E10)
**Goal:** Users can't lose data by accident, and a bad backup file can't break the app.

| # | Task | Items | Est |
|---|------|-------|-----|
| 4.1 | Move storage to IndexedDB (`idb-keyval`) with one-time migration from localStorage; `schemaVersion` + `migrate()` | E3, E11, E6 | 1d |
| 4.2 | `navigator.storage.persist()` + status row in Settings; "last backup" reminder | E1 | 0.5d |
| 4.3 | Import schema validation + import report | E2 | 0.5d |
| 4.4 | Export via Web Share API with download fallback | E5 | 0.25d |
| 4.5 | Undo snackbar for delete / complete / clear | E4 | 0.5d |
| 4.6 | In-app confirm dialog component (replaces confirm/alert) | E10 | 0.25d |
| 4.7 | Category removal handling; samples append instead of replace; cross-tab sync | E7–E9 | 0.5d |

**Definition of done:** Importing a corrupted file doesn't crash; a deleted task can be restored; existing localStorage users migrate with no data loss.

### Sprint 5 — Native feel, accessibility & reminders (C3–C9, G1–G6, F1, F3, A6)
**Goal:** The app feels native and passes accessibility checks, and due tasks show up without opening it.

| # | Task | Items | Est |
|---|------|-------|-----|
| 5.1 | Remove zoom lock, 16px inputs, `100dvh`, hover media query, overscroll | C3, C5, C6, C7 | 0.5d |
| 5.2 | Dynamic `theme-color`; system theme default; date input color-scheme | C4, G4 | 0.25d |
| 5.3 | Accessible dialogs (focus trap, Esc, swipe-down to close, scroll lock) | C8, C9, G3 | 1d |
| 5.4 | 44px targets, aria labels, `role="switch"`, contrast fix, reduced-motion | G1, G2, G5, G6 | 0.5d |
| 5.5 | App badge with today count (Badging API) | F1 | 0.25d |
| 5.6 | Opt-in notifications: permission flow in Settings, daily summary shown when app/SW activates | F1 | 1d |
| 5.7 | Manifest shortcuts + screenshots; haptic on complete | A6, F3 | 0.5d |

**Definition of done:** Lighthouse Accessibility ≥ 95; the badge updates on install; notifications work on Android and on an installed iOS 16.4+ app.

### Sprint 6 — Hardening & release (H2, polish)
**Goal:** Quality gates are enforced and v1.0 ships.

| # | Task | Items | Est |
|---|------|-------|-----|
| 6.1 | Lighthouse CI with thresholds in Actions | H2 | 0.5d |
| 6.2 | Full regression pass on real devices (install, offline, update, backup/restore) | — | 1d |
| 6.3 | Bug-fix buffer | — | 2d |
| 6.4 | Tag `v1.0.0`, changelog, README screenshots | — | 0.5d |

**Stretch / backlog (post-1.0):** Web Push with a server (Cloudflare Worker + VAPID) for true background reminders; optional cloud sync; completion history and streaks UI.

---

## 4. Target architecture (after Sprint 4)

```
recurr/
├─ public/            icons, apple-touch-icon, robots.txt
├─ src/
│  ├─ main.jsx        createRoot + SW registration
│  ├─ App.jsx
│  ├─ components/     TaskCard, TodayView, UpcomingView, SettingsView,
│  │                  TaskSheet, DelaySheet, Dialog, Snackbar, UpdateToast
│  ├─ hooks/          useTasks, useToday, useInstallPrompt
│  ├─ lib/            date.js (+ date.test.js), storage.js, migrate.js, schema.js
│  └─ styles.css
├─ vite.config.js     vite-plugin-pwa (manifest + workbox)
└─ .github/workflows/ci.yml   lint → test (TZ matrix) → build → lighthouse → deploy
```

## 5. Release criteria (v1.0)

- [ ] Installable on Android Chrome, desktop Chrome/Edge, and iOS Safari (Add to Home Screen)
- [ ] Works fully offline after the first load; update prompt appears on a new deploy
- [ ] No third-party network requests at runtime
- [ ] Date-engine tests pass in 3+ time zones
- [ ] Data survives: reload, app update, bad import, accidental delete (undo)
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95
