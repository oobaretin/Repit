# Repit — Core Flow QA Report

**Date:** July 16, 2026  
**Version:** 1.0.0  
**Build:** `npm run build` (passing)

---

## Automated verification

Run:

```bash
node scripts/verify-core-flows.mjs
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

| Sound | Behavior |
|-------|----------|
| **Mala** | Fetches MP3 from Mixkit CDN (network on first play) |
| **Gong** | On-device Web Audio sine synth (~120 Hz) |
| **Crystal** | On-device Web Audio sine synth (~2200 Hz) |
| **None** | Silent; haptics still fire if enabled |

Preview in Settings plays selected sound immediately.

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
| Logout | Settings → Logout → full-screen lock |
| Unlock | Face ID / Touch ID via native biometric API |
| Lock on leave | If enabled, switching apps triggers lock screen on return |
| Web | Biometric unavailable → simple Unlock button |

---

## Manual test checklist

Complete on **iPhone simulator or device** after `npm run build:ios`:

### Timer
- [ ] Idle shows **Start** and practice pill
- [ ] Start → rep increments at set interval
- [ ] Progress ring advances
- [ ] Pause freezes breathing animation
- [ ] Resume continues counting
- [ ] Completion sheet shows reps + duration
- [ ] Close returns to idle

### Focus lock
- [ ] Auto focus lock hides header on start
- [ ] Hold-to-unlock restores controls
- [ ] Session not reset after unlock

### Sounds
- [ ] Mala plays on tick (simulator: audible)
- [ ] Gong / Crystal play on tick
- [ ] None is silent

### Haptics (device recommended)
- [ ] Light tap each rep
- [ ] Success pattern on complete

### App lock
- [ ] Logout shows lock screen with logo
- [ ] Face ID unlock works (device)
- [ ] Lock on leave after backgrounding app

### Settings
- [ ] Presets 27 / 54 / 108 / 1000 apply
- [ ] Interval slider 0.5–10s
- [ ] Settings locked during active session
- [ ] Lifetime stats increment after session

---

## Known platform notes

1. **Simulator audio** — Works; Mala requires network on first load.
2. **Simulator haptics** — No physical feedback; code path still runs without error.
3. **Face ID** — Must test on real device with biometrics enrolled.
4. **Free Apple ID signing** — App expires after 7 days; re-run from Xcode.

---

## Issues found

None from automated/code review pass. Manual device checklist above is pending your sign-off.
