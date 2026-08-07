# Repit — Core Flow QA Report

**Date:** August 7, 2026  
**Version:** 1.1.0  
**Build:** `npm run build:ios` (passing)

**Tester context:** No paid Apple Developer account yet · No physical iPhone (Simulator + browser only)

---

## Automated verification

Run:

```bash
npm run verify    # logic checks
npm run qa        # verify + browser Tier 1
npm run qa:browser  # Playwright only (requires: npx playwright install chromium)
```

### Logic checks (`npm run verify`)

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
| Reminder time parsing | ✓ Pass |

**Run date:** August 6, 2026

### Browser QA (Tier 1 — Playwright)

| Check | Result |
|-------|--------|
| Idle shows target reps | ✓ Pass |
| Adjust practice sheet opens from pill | ✓ Pass |
| Settings + mantra field | ✓ Pass |
| Rep presets in settings | ✓ Pass |
| Start session → rep increments | ✓ Pass |
| Session bar hidden while running | ✓ Pass |
| Session bar visible when paused | ✓ Pass |
| Onboarding step 1 | ✓ Pass |
| Onboarding rhythm demo + tap-along (3 taps) | ✓ Pass |
| Paywall on session start after free sessions | ✓ Pass |
| Paywall lists Flower of Life | ✓ Pass |

**Run date:** August 6, 2026

---

## Shipped since last report

| Feature | Expected behavior |
|---------|-------------------|
| **Practice adjust sheet** | Idle “Adjust practice” opens bottom sheet (reps, interval, sound); full settings via link |
| **Paywall overlay** | App shell stays usable; paywall on start / “Same again” / trial banner; “Not now” dismisses |
| **Idle hierarchy** | No quick-count chips; StatusChip only when paused/complete |
| **Settings IA** | Practice-first order; empty history state; sound fold open for new users |
| **Onboarding tap-along** | Step 2: auto demo + Flower of Life + user taps circle 3× before Continue |
| **Daily reminder (UI)** | Settings → toggle + time; saved locally; native scheduling stub until notifications plugin |
| **Post-session** | Streak line + free sessions remaining; “Same practice again” for all users |
| **Flower of Life (native)** | Lite path on iOS; CSS ring sweep; full 19-circle pattern |

---

## Code review — expected behavior

### Timer

| Flow | Expected behavior | Code reference |
|------|-------------------|----------------|
| Start | Tap circle → `Running` (paywall if no subscription after free session) | `App.tsx` `handleStartPauseResume` |
| Tick | Every `delay` seconds (min 0.1s), rep increments, sound + light haptic | `useMeditationTimer.ts` |
| Pause | Tap while running → `Paused`; session bar appears | same |
| Complete | At `targetReps`, completion sheet + history | `completeSession` |
| Background | App inactive while running → auto-pause | `nativeService.onAppStateChange` |

### Subscription & paywall

| Flow | Expected behavior |
|------|-------------------|
| Onboarding | 3 screens → demo + 3 taps on step 2 → **Begin practice** |
| First sessions | **3** full practice sessions free |
| After free sessions | Settings/history accessible; paywall when starting session 4 |
| Dev mode | `repit-devPremium` localStorage simulates premium |

### Daily reminder

| Flow | Expected behavior |
|------|-------------------|
| Toggle off | Status: “Daily reminder off.” |
| Toggle on + time | Persists hour/minute; status explains iOS scheduling ships later |
| Native | `reminderService.ts` stub — wire `@capacitor/local-notifications` with Developer account |

---

## Your workflow (no iPhone, no paid account)

### Step 1 — Automated (every change)

```bash
npm run qa
```

### Step 2 — iOS Simulator (primary manual QA)

```bash
npm run build:ios && npm run open:ios
```

In Xcode: **iPhone 15** (or any) simulator → **Product → Clean Build Folder** (⇧⌘K) → Run (⌘R).

| # | Simulator test | Pass? | Notes |
|---|----------------|-------|-------|
| 1 | App launches to timer or onboarding | ✓ Pass | |
| 2 | Onboarding: watch demo → tap circle 3× → Continue | ✓ Pass | Continue disabled until 3 taps |
| 3 | Idle: circle shows target reps; **Adjust practice** opens sheet | ✓ Pass | |
| 4 | Sheet: change reps/sound/interval → Done | ✓ Pass | |
| 5 | Start → pause → resume; session bar only when paused | ✓ Pass | |
| 6 | Complete session → celebration sheet → Done → still on timer | ✓ Pass | |
| 7 | Session 2 attempt → paywall overlay; **Not now** → settings still open | ✓ Pass | |
| 8 | Settings → daily reminder toggle + time | ✓ Pass | Status message appears |
| 9 | Flower + ring animation (subjective smoothness) | ✓ Pass | Acceptable in Simulator |
| 10 | Practice mode + hold-to-exit overlay | ✓ Pass | |

**Run date:** August 7, 2026 — all **10** simulator checks passed.

**Simulator limits (skip for now):** haptics, Face ID, real audio unlock edge cases, true WKWebView perf vs device.

### Step 3 — Web dev (fast iteration)

```bash
npm run dev
```

Good for copy, layout, settings, paywall UI — not native animation parity.

---

## Deferred until you have hardware + Developer account

| Item | Blocked by |
|------|------------|
| TestFlight / App Store | Paid Apple Developer Program |
| Sandbox IAP / RevenueCat live | Developer account |
| Home Screen widget (App Groups) | Developer account + device testing |
| Local notification delivery | Developer account + `@capacitor/local-notifications` |
| Tier 3 device QA (haptics, Face ID, audio) | Physical iPhone |

---

## Issues found

| # | Screen / flow | Issue | Severity | Status |
|---|---------------|-------|----------|--------|
| — | — | — | — | — |

---

## Sign-off

- [x] Automated logic verification
- [x] Automated browser Tier 1
- [x] UX quick wins + adjust sheet + onboarding tap-along
- [x] Daily reminder UI + stub service
- [x] Tier 2 Simulator checklist (10/10 — August 7, 2026)
- [ ] Tier 3 device pass (blocked — no iPhone)
- [ ] Subscription sandbox (blocked — no Developer account)

**Tester:** osagie obaretin  
**Last updated:** August 7, 2026
