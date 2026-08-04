# Repit — Core Flow QA Report

**Date:** August 4, 2026  
**Version:** 1.1.0  
**Build:** `npm run build:ios` (passing)

---

## Automated verification

Run:

```bash
npm run verify    # logic checks (17)
npm run qa        # verify + browser Tier 1 (12 checks)
npm run qa:browser  # Playwright only (requires: npx playwright install chromium)
```

| Check | Result |
|-------|--------|
| Session completes at target reps (108) | ✓ Pass |
| Does not complete early (27 reps, 26 ticks) | ✓ Pass |
| Open count (target 0) never auto-completes | ✓ Pass |
| Minimum interval floor (100ms) | ✓ Pass |
| Duration formatting | ✓ Pass |
| Five sound options defined (4 playable + None) | ✓ Pass |
| Rep presets include 108 | ✓ Pass |
| Streak logic (today + yesterday, empty) | ✓ Pass |
| Practice intention trim + 48-char cap | ✓ Pass |
| Flower full scale at tick / constricts mid-interval | ✓ Pass |

**Run date:** August 4, 2026 — all **17** logic checks passed.

### Browser QA (Tier 1 — Playwright)

**Run date:** August 4, 2026 — all **12** checks passed.

| Check | Result |
|-------|--------|
| Idle shows target reps | ✓ Pass |
| Adjust practice pill | ✓ Pass |
| Settings + mantra field | ✓ Pass |
| Rep presets in settings | ✓ Pass |
| Start session → rep increments | ✓ Pass |
| Session bar hidden while running | ✓ Pass |
| Session bar visible when paused | ✓ Pass |
| Onboarding step 1 | ✓ Pass |
| Onboarding rhythm demo (step 2) | ✓ Pass |
| Paywall after first session | ✓ Pass |
| Paywall lists Flower of Life | ✓ Pass |

---

## v1.1+ features (August 2026)

| Feature | Expected behavior |
|---------|-------------------|
| **Flower of Life** | Cyan 19-circle pattern inside progress ring; breathes on same curve as ring glow; static SVG blur on iOS for performance |
| **Mantra / intention** | Optional field in Settings → Practice; shown on adjust pill and during active session; quoted on session complete |
| **Onboarding rhythm** | Step 2 plays live 5-rep demo (Crystal tick + animation); static fallback for reduced motion |
| **Idle home** | Single “Adjust practice” card (config + optional streak/reps + intention) |
| **Default interval** | 1.5s for new installs (persisted delay unchanged for existing users) |
| **Session bar** | Hidden while running; restart only when paused |

---

## Code review — expected behavior

### Timer

| Flow | Expected behavior | Code reference |
|------|-------------------|----------------|
| Start | Tap circle → state `Running`, timer starts before async audio/haptics | `App.tsx` `handleStartPauseResume` |
| Tick | Every `delay` seconds (min 0.1s), rep increments, sound + light haptic | `useMeditationTimer.ts`, `handleTick` |
| Pause | Tap while running → `Paused`, medium haptic; session bar appears | `handleStartPauseResume` |
| Resume | Tap while paused → `Running`; session bar hides | same |
| Complete | At `targetReps`, shows sheet, success haptic, duration + history recorded | `completeSession` |
| Restart | Session bar (paused) or settings → idle, rep 0 | `handleRestart` |
| Background | App inactive while running → auto-pause | `nativeService.onAppStateChange` |
| Keep awake | Screen stays on while running (iOS) | `nativeService.setKeepAwake` |
| Progress ring + flower | Smooth RAF-driven animation synced to rep phase | `CircleDisplay.tsx`, `flowerOfLife.ts` |

### Sounds

Four tick sounds + None (Mala uses embedded MP3; others Web Audio synthesis).

| Sound | Behavior |
|-------|----------|
| **Mala** | Embedded bead click |
| **Gong** | Deep sine ~120 Hz |
| **Crystal** | Bright sine ~2200 Hz |
| **Bowl** | Singing bowl partials |
| **None** | Silent; haptics still fire if enabled |

### Subscription & paywall

| Flow | Expected behavior |
|------|-------------------|
| Onboarding | 3 screens → rhythm demo on step 2 → **Begin practice** |
| First session | One full session free |
| After first session | Paywall with first-session copy |
| Dev mode | Simulated purchase via `repit-devPremium` localStorage |

---

## Pre-membership QA (free — do this now)

### Step 0 — Automated (2 min)

```bash
npm run qa
```

### Tier 1 — Browser

```bash
npm run dev   # manual exploratory
npm run qa    # automated Playwright
```

| # | Test | Auto | Manual |
|---|------|------|--------|
| 1 | Onboarding: rhythm demo on step 2 | ✓ | [ ] |
| 2 | Idle circle shows **target reps** | ✓ | [ ] |
| 3 | Start → pause → resume | partial | [ ] |
| 4 | Mantra field in settings + adjust pill | ✓ | [ ] |
| 5 | Flower visible inside ring during session | | [ ] |
| 6 | First session free → paywall after session 1 | ✓ | [ ] |
| 7 | All 5 sounds preview | | [ ] |

### Tier 2 — iOS Simulator

```bash
npm run build:ios && npm run open:ios
```

| # | Test | Pass? |
|---|------|-------|
| 1 | App launches | [ ] |
| 2 | Flower animation smooth (no jank) | [ ] |
| 3 | Onboarding rhythm demo + sound | [ ] |
| 4 | Auto focus lock on session start | [ ] |
| 5 | Session bar only when paused | [ ] |
| 6 | All four tick sounds | [ ] |
| 7 | Background → auto-pause | [ ] |

### Tier 3 — iPhone (Personal Team)

| # | Test | Pass? |
|---|------|-------|
| 1 | Haptics each rep | [ ] |
| 2 | Face ID lock / unlock | [ ] |
| 3 | Flower + ring feel responsive | [ ] |
| 4 | Mantra persists after force-quit | [ ] |

### Deferred (paid Apple Developer)

- Home Screen widget (App Groups)
- Sandbox subscriptions / TestFlight

---

## Issues found

None blocking for device QA.

| # | Screen / flow | Issue | Severity | Status |
|---|---------------|-------|----------|--------|
| — | — | — | — | — |

---

## Sign-off

- [x] Automated logic verification (17 checks)
- [x] Automated browser Tier 1 (12 checks)
- [x] Flower of Life + mantra + onboarding demo shipped
- [x] Privacy policy updated (mantra/intention, Aug 4 2026)
- [ ] Tier 2 Simulator pass
- [ ] Tier 3 device pass
- [ ] Subscription sandbox (blocked on Apple Developer)

**Tester:** osagie obaretin  
**Last updated:** August 4, 2026
