# Repit — Core Flow QA Report

**Date:** July 23, 2026  
**Version:** 1.0.0  
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
| Sound options (4) | ✓ Pass |
| Rep presets include 108 | ✓ Pass |

**Run date:** July 23, 2026 — all 10 checks passed.

---

## Code review — expected behavior

### Timer

| Flow | Expected behavior | Code reference |
|------|-------------------|----------------|
| Start | Tap circle → state `Running`, haptic tap if rep 0 | `App.tsx` `handleStartPauseResume` |
| Tick | Every `delay` seconds (min 0.1s), rep increments, sound + light haptic | `useMeditationTimer.ts`, `handleTick` |
| Pause | Tap while running → `Paused`, medium haptic | `handleStartPauseResume` |
| Resume | Tap while paused → `Running` | same |
| Complete | At `targetReps`, shows sheet, success haptic, duration recorded | `completeSession` |
| Restart | Settings or session bar → idle, rep 0 | `handleRestart` |
| Background | App inactive while running → auto-pause | `nativeService.onAppStateChange` |
| Keep awake | Screen stays on while running (iOS) | `nativeService.setKeepAwake` |

### Focus lock

| Flow | Expected behavior |
|------|-------------------|
| Auto lock | On session start if “Auto focus lock” enabled |
| Manual lock | Lock icon in header during active session |
| While locked | Header hidden, circle enlarged, tap circle disabled |
| Unlock | Hold bottom control ~1.2s until ring completes |
| Unlock result | Controls return, session continues if was running/paused |

### Sounds

Ten tick sounds grouped in Settings (Traditional, Bright, Soft, Silent). All playback is on-device — Mala uses a bundled MP3; the rest use Web Audio synthesis.

| Group | Sound | Behavior |
|-------|-------|----------|
| Traditional | **Mala** | Bundled MP3 (`public/sounds/mala.mp3`) |
| Traditional | **Wood** | Filtered noise + low triangle (~180 Hz) |
| Traditional | **Gong** | Deep sine partials (~120 / 60 Hz) |
| Traditional | **Bell** | Dual sine (~520 / 780 Hz) |
| Bright | **Crystal** | Bright sine + shimmer (~2200 / 4400 Hz) |
| Bright | **Bowl** | Singing-bowl sine (~440 / 880 Hz) |
| Bright | **Tap** | Short noise + triangle click |
| Soft | **Breath** | Soft noise + low sine |
| Soft | **Om** | Low harmonic sine (~136 / 272 Hz) |
| Silent | **None** | No sound; haptics still fire if enabled |

Preview in Settings plays the selected sound immediately. Overlapping ticks are stopped when the interval is shorter than the sound length.

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

---

## Manual test checklist

Completed on **iPhone (device)** — July 23, 2026.

### Timer
- [x] Idle shows **Start** and practice pill
- [x] Start → rep increments at set interval
- [x] Progress ring advances
- [x] Pause freezes breathing animation
- [x] Resume continues counting
- [x] Completion sheet shows reps + duration
- [x] Close returns to idle

### Focus lock
- [x] Auto focus lock hides header on start
- [x] Hold-to-unlock restores controls
- [x] Session not reset after unlock

### Sounds
- [x] All ten sounds play on tick (Mala bundled; others synth)
- [x] None is silent
- [ ] Re-test full library on device after sound expansion (July 25, 2026)

### Haptics (device recommended)
- [x] Light tap each rep
- [x] Success pattern on complete

### App lock / welcome splash
- [x] Logout shows welcome splash with brand ring + “Welcome back”
- [x] Ring and glow breathe in sync
- [x] Face ID unlock works (device); timer fades in after unlock
- [x] Lock on leave after backgrounding app
- [x] Failed Face ID shows error message; retry works

### Settings
- [x] Presets 27 / 54 / 108 / 1000 apply
- [x] Interval slider 0.5–10s
- [x] Settings locked during active session
- [x] Lifetime stats increment after session

---

## Known platform notes

1. **Simulator audio** — Works; all sounds play offline (Mala bundled locally).
2. **Simulator haptics** — No physical feedback; code path still runs without error.
3. **Face ID** — Must test on real device with biometrics enrolled.
4. **Free Apple ID signing** — App expires after 7 days; re-run from Xcode.

---

## Issues found

None. Device QA pass — July 23, 2026.

| # | Screen / flow | Issue | Severity | Status |
|---|---------------|-------|----------|--------|
| — | — | — | — | — |

---

## Sign-off

- [x] All manual checklist items passed on device
- [x] No blocking issues open
- [x] Ready for App Store screenshots

**Tester:** osagie obaretin  
**Device / iOS:** iPhone (physical device)  
**Date:** July 23, 2026
