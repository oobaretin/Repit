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
| Ten sound options defined (9 playable + None) | ✓ Pass |
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

Ten tick sounds grouped in Settings (Traditional, Bright, Soft, Silent). Mala uses the original embedded bead sample; others use Web Audio synthesis.

| Group | Sound | Behavior |
|-------|-------|----------|
| Traditional | **Mala** | Original Mixkit bead click (embedded MP3 → Web Audio buffer) |
| Traditional | **Wood** | Mokugyo-style knock — retuned Web Audio (~0.35s) |
| Traditional | **Gong** | Deep sine ~120 Hz, gentle fade (~1.8s) |
| Traditional | **Bell** | Temple bell partials — retuned (~1.2s) |
| Bright | **Crystal** | Bright sine ~2200 Hz, gentle fade (~1.2s) |
| Bright | **Bowl** | Singing bowl — retuned (~2s) |
| Bright | **Tap** | Muted mallet — retuned (~0.22s) |
| Soft | **Breath** | Filtered air swell — retuned (~0.6s) |
| Soft | **Om** | Tibetan monk-style synth — deep ~92 Hz, vibrato, O→M morph (~1.55s) |
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
| Logout | Settings → Logout → welcome splash with brand ring |
| Welcome splash | Logo ring + “Welcome back” + gradient unlock button |
| Unlock | Face ID / Touch ID via native biometric API; splash fades out, timer fades in |
| Lock on leave | If enabled, switching apps triggers welcome splash on return |
| Web | Biometric unavailable → “Tap to unlock” button |

### Subscription & paywall

| Flow | Expected behavior |
|------|-------------------|
| Onboarding | 3 screens → paywall (7-day trial) |
| Dev mode | Without RevenueCat key, purchases simulated locally |
| Paywall copy | $24.99/yr · $4.99/mo; practice history & presets listed |
| Privacy link | Opens `https://oobaretin.github.io/Repit/` |
| Restore | Settings → Restore purchases |

**Note:** Live StoreKit purchases require Apple Developer enrollment + App Store Connect products + RevenueCat key in `.env`.

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
- [x] Logout shows welcome splash with brand ring + “Welcome back”
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
**Last updated:** July 26, 2026
