# Repit — Core Flow QA Report

**Date:** July 26, 2026  
**Version:** 1.1.0  
**Build:** `npm run build:ios` (passing)

---

## Automated verification

Run:

```bash
npm run verify
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
| Current streak counts today and yesterday | ✓ Pass |
| Empty history has zero streak | ✓ Pass |

**Run date:** July 26, 2026 — all 13 checks passed.

---

## Code review — expected behavior

### Timer

| Flow | Expected behavior | Code reference |
|------|-------------------|----------------|
| Start | Tap circle → state `Running`, timer starts before async audio/haptics | `App.tsx` `handleStartPauseResume` |
| Tick | Every `delay` seconds (min 0.1s), rep increments, sound + light haptic | `useMeditationTimer.ts`, `handleTick` |
| Pause | Tap while running → `Paused`, medium haptic | `handleStartPauseResume` |
| Resume | Tap while paused → `Running` | same |
| Complete | At `targetReps`, shows sheet, success haptic, duration + history recorded | `completeSession` |
| Restart | Settings or session bar → idle, rep 0 | `handleRestart` |
| Background | App inactive while running → auto-pause | `nativeService.onAppStateChange` |
| Keep awake | Screen stays on while running (iOS) | `nativeService.setKeepAwake` |
| Progress ring | Smooth RAF-driven animation, no stutter at session start | `CircleDisplay.tsx`, `useRepCycle.ts` |

### Practice tracking (v1.1)

| Flow | Expected behavior |
|------|-------------------|
| Session complete | Appends entry to local session history (reps, delay, sound, duration) |
| Lifetime stats | `totalSessions`, `totalReps`, `lastSessionAt` increment |
| Streaks | Current streak, best streak, reps in last 7 days shown in Settings |
| Session complete sheet | Shows streak when &gt; 1 day |
| Custom presets | Save current config (up to 5), tap to apply, × to delete |
| Data storage | All on-device via `localStorage`; no account or cloud sync |

### Focus lock

| Flow | Expected behavior |
|------|-------------------|
| Auto lock | On session start if “Auto focus lock” enabled |
| Manual lock | Lock icon in header during active session |
| While locked | Header hidden, circle enlarged, tap circle disabled |
| Unlock | Hold bottom control ~1.2s until ring completes |
| Unlock result | Controls return, session continues if was running/paused |

### Sounds

Ten tick sounds grouped in Settings (Traditional, Bright, Silent). Mala uses the original embedded bead sample; others use Web Audio synthesis.

| Group | Sound | Behavior |
|-------|-------|----------|
| Traditional | **Mala** | Original Mixkit bead click (embedded MP3 → Web Audio buffer) |
| Traditional | **Gong** | Deep sine ~120 Hz, gentle fade (~1.8s) |
| Bright | **Crystal** | Bright sine ~2200 Hz, gentle fade (~1.2s) |
| Bright | **Bowl** | Singing bowl partials — detuned (~2s) |
| Silent | **None** | No sound; haptics still fire if enabled |

Tick sound section in Settings is **collapsible** (collapsed by default; tap header to expand). Preview plays selected sound immediately.

### Haptics

| Event | Style |
|-------|-------|
| Each rep | Light impact |
| Pause / restart / logout | Medium impact |
| Session complete | Success notification pattern |
| Disabled | Toggle off in Settings → no haptics |

**Note:** Haptics require a physical iPhone or native build. Web fallback uses `navigator.vibrate` where supported.

### App lock (Face ID)

| Flow | Expected behavior |
|------|-------------------|
| Logout | Settings → **Lock app** → welcome splash with brand ring |
| Welcome splash | Logo ring + “Welcome back” + gradient unlock button |
| Unlock | Face ID / Touch ID via native biometric API; splash fades out, timer fades in |
| Lock on leave | If enabled, switching apps triggers welcome splash on return |
| Web | Biometric unavailable → “Tap to unlock” button |

### Subscription & paywall

| Flow | Expected behavior |
|------|-------------------|
| Onboarding | 3 screens → **Begin practice** → first session free |
| Dev mode | Without RevenueCat key, purchases simulated locally |
| Paywall copy | $24.99/yr · $4.99/mo; practice history & presets listed |
| Privacy link | Opens `https://oobaretin.github.io/Repit/` |
| Restore | Settings → Restore purchases |

**Note:** Live StoreKit purchases require Apple Developer enrollment + App Store Connect products + RevenueCat key in `.env`.

| Flow | Expected behavior |
|------|-------------------|
| First session | Onboarding → “Begin practice” → one full session without paywall |
| After first session | Paywall with “You finished your first session” copy (non-subscribers) |
| Dev mode | Without RevenueCat key, purchases simulated locally |

---

## Pre-membership QA (free — do this now)

No $99 Apple Developer account required. Skip anything marked **paid only**.

### Step 0 — Automated checks (2 min)

```bash
npm run verify
```

All checks should pass before manual testing.

---

### Tier 1 — Browser (`npm run dev`)

Best for: UI, timer logic, settings, history, presets, paywall copy.

```bash
npm run dev
```

Open the local URL in Chrome/Safari (or use device on same Wi‑Fi if testing mobile layout).

| # | Test | Pass? |
|---|------|-------|
| 1 | Onboarding: 3 screens, optional name, **Begin practice** | [ ] |
| 2 | Idle circle shows **target reps** (not “Start”) | [ ] |
| 3 | Start → reps increment at interval; pause / resume work | [ ] |
| 4 | Complete session at target → completion sheet | [ ] |
| 5 | **First session free** — no paywall until after session 1 completes | [ ] |
| 6 | After 1st session → paywall appears with first-session copy | [ ] |
| 7 | Dev mode: tap subscribe → app unlocks (simulated premium) | [ ] |
| 8 | Settings: presets 27 / 54 / 108 / 1000, interval slider | [ ] |
| 9 | Save / apply / delete custom preset (max 5) | [ ] |
| 10 | Session history + streak stats update after sessions | [ ] |
| 11 | Collapsible sections: Tick sound, Preferences, Recent sessions | [ ] |
| 12 | All 5 sounds preview; **None** is silent | [ ] |
| 13 | Privacy link opens `https://oobaretin.github.io/Repit/` | [ ] |
| 14 | Practice today strip (streak + weekly reps) on home | [ ] |

**Browser limits:** No real Face ID, weak/no haptics, no keep-awake, no background auto-pause like native.

---

### Tier 2 — iOS Simulator (Xcode, free)

Best for: native shell, layout on iOS, sounds, keep-awake, background pause.

```bash
npm run build:ios
npm run open:ios
```

1. Open **`App.xcworkspace`** (not `.xcodeproj`)
2. Scheme: **App**
3. Destination: any **iPhone Simulator**
4. Run (▶)

| # | Test | Pass? |
|---|------|-------|
| 1 | App launches without crash | [ ] |
| 2 | Full timer flow (start → complete) | [ ] |
| 3 | Progress ring smooth; pause freezes animation | [ ] |
| 4 | Auto focus lock hides header on session start | [ ] |
| 5 | Hold-to-unlock restores controls | [ ] |
| 4 | All four tick sounds on rep | [ ] |
| 7 | Background app while running → auto-pause on return | [ ] |
| 8 | Screen stays awake during session | [ ] |
| 9 | **Lock app** (Settings) → welcome splash → tap to unlock (no Face ID on sim) | [ ] |
| 10 | First-session-free → paywall after session 1 | [ ] |

**Simulator limits:** No haptic feedback, no Face ID, widget/App Groups unreliable — **skip widget**.

---

### Tier 3 — Your iPhone (free Personal Team)

Best for: haptics, Face ID, real-world feel. Requires USB + Apple ID in Xcode.

1. `npm run build:ios` then open workspace
2. **App** target → **Signing & Capabilities** → Team: **Personal Team** (your Apple ID)
3. Enable **Automatically manage signing**
4. Connect iPhone → trust computer → select device → Run

| # | Test | Pass? |
|---|------|-------|
| 1 | App installs and opens (ignore “untrusted developer” if first time: Settings → General → VPN & Device Management) | [ ] |
| 2 | Light haptic each rep; success pattern on complete | [ ] |
| 3 | Face ID / Touch ID: **Lock app** → unlock → timer returns | [ ] |
| 4 | Lock on leave: background app → welcome splash on return | [ ] |
| 5 | Mala tick uses embedded bead sample (distinct from synth sounds) | [ ] |
| 7 | Full session + stats/history persist after force-quit and reopen | [ ] |

**Free signing caveats:**
- App **expires after ~7 days** — re-run from Xcode to reinstall
- Max **3 apps** from free account on device at once
- **Do not** spend time on App Groups / widget — needs paid membership

---

### Deferred until Apple Developer ($99/yr)

Do **not** block on these before enrollment:

| Item | Why |
|------|-----|
| Home Screen widget | App Groups requires paid portal setup |
| Sandbox subscriptions | App Store Connect + products |
| TestFlight / App Store submit | Paid program only |
| RevenueCat live purchases | Needs Connect + `.env` API key |

When enrolled, follow `docs/ios-widget-setup.md` and the subscription checklist below.

---

## Manual test checklist

### Timer (July 23–25, 2026 — device)
- [x] Idle shows **Start** and practice pill
- [x] Start → rep increments at set interval
- [x] Progress ring advances smoothly (July 26 — ring stutter fix verified on device)
- [x] Pause freezes breathing animation
- [x] Resume continues counting
- [x] Completion sheet shows reps + duration
- [x] Close returns to idle

### Focus lock (July 23, 2026 — device)
- [x] Auto focus lock hides header on start
- [x] Hold-to-unlock restores controls
- [x] Session not reset after unlock

### Sounds (July 25, 2026 — device)
- [x] All ten sounds play on tick (Mala: embedded original bead click; others synth)
- [x] None is silent
- [x] Om plays Tibetan monk-style tone (July 26 — device)
- [x] Tick sound section folds/unfolds in Settings (July 26 — device)

### Haptics (July 23, 2026 — device)
- [x] Light tap each rep
- [x] Success pattern on complete

### App lock / welcome splash (July 23, 2026 — device)
- [x] Lock app shows welcome splash with brand ring + “Welcome back”
- [x] Ring and glow breathe in sync
- [x] Face ID unlock works (device); timer fades in after unlock
- [x] Lock on leave after backgrounding app
- [x] Failed Face ID shows error message; retry works

### Settings — core (July 23, 2026 — device)
- [x] Presets 27 / 54 / 108 / 1000 apply
- [x] Interval slider 0.5–10s
- [x] Settings locked during active session
- [x] Lifetime stats increment after session

### Settings — v1.1 (July 26, 2026 — device)
- [x] Streak stats visible (day streak, best streak, reps 7d)
- [x] Recent sessions list appears after completing a session
- [x] Recent sessions section folds/unfolds
- [x] Save custom preset → applies reps, interval, sound
- [x] Delete custom preset works
- [x] Preferences section folds/unfolds
- [x] Session complete shows streak when &gt; 1 day

### Privacy & hosting
- [x] Privacy policy live at `https://oobaretin.github.io/Repit/`
- [x] Policy documents session history, presets, streaks, subscriptions
- [x] Paywall privacy link opens GitHub Pages URL in app

### Subscription (pending Apple Developer)
- [ ] Sandbox purchase — 7-day trial start
- [ ] Trial expiry → paywall blocks app
- [ ] Restore purchases with sandbox account

---

## Known platform notes

1. **Simulator audio** — Works; all sounds play offline via Web Audio.
2. **Simulator haptics** — No physical feedback; code path still runs without error.
3. **Face ID** — Must test on real device with biometrics enrolled.
4. **Free Apple ID signing** — App expires after 7 days; re-run from Xcode.
5. **GitHub Actions** — Privacy deploy workflow may fail if account billing is locked; branch deploy from `/docs` works as fallback.

---

## Issues found

None blocking for TestFlight prep.

| # | Screen / flow | Issue | Severity | Status |
|---|---------------|-------|----------|--------|
| — | — | — | — | — |

---

## Sign-off

- [x] All v1.0 manual checklist items passed on device
- [x] v1.1 practice tracking, presets, and collapsible Settings verified on device (July 26)
- [x] Privacy policy updated and live on GitHub Pages
- [ ] Subscription sandbox flow (blocked on Apple Developer enrollment)
- [x] Ready for App Store screenshots
- [ ] Ready for TestFlight / App Store submission (pending Apple Developer + subscription products)

**Tester:** osagie obaretin  
**Device / iOS:** iPhone (physical device)  
**Last updated:** August 4, 2026
