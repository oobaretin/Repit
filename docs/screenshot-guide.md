# Repit — App Store Screenshot Guide

Capture on **iPhone 15 Pro Max** or **iPhone 16 Pro Max** simulator (6.7" display) for the primary set. Apple also requires 6.5" if you support older phones — use iPhone 11 Pro Max simulator as a second pass.

**Required size (6.7"):** 1290 × 2796 px (portrait)  
**Tool:** Xcode Simulator → **File → Save Screen** (⌘S), or `Cmd+S` with simulator focused.

---

## Recommended set (5 screenshots)

Keep backgrounds dark. Optional: add a short caption overlay in Figma/Canva using Repit colors (`#060912` bg, `#22d3ee` accent, Inter Tight).

### 1. Hero — Ready to practice

| | |
|---|---|
| **Screen** | Timer idle |
| **State** | 108 reps · 2.0s · Mala visible in practice pill |
| **Circle** | Shows **Start**, ~3m session estimate |
| **Caption idea** | *Mindful repetition, simplified* |

```
┌─────────────────────┐
│  [logo] Repit    ⚙  │
│                     │
│      ╭───────╮      │
│      │ Start │      │
│      │  0%   │      │
│      ╰───────╯      │
│                     │
│  ┌ Practice ──────┐ │
│  │ 108 reps · 2s  │ │
│  └────────────────┘ │
└─────────────────────┘
```

---

### 2. Active session — Breathe with the circle

| | |
|---|---|
| **Screen** | Timer running (~24 / 108) |
| **State** | Breathing animation active, progress ring ~22% |
| **Header** | “In session” chip, lock + settings icons |
| **Caption idea** | *A steady rhythm for mantra & breath* |

Show the cyan breathing layers expanded mid-inhale if possible (pause is harder — running looks best).

---

### 3. Focus lock — Distraction-free

| | |
|---|---|
| **Screen** | Focus lock during session |
| **State** | Header hidden, large circle, rep count visible |
| **Bottom** | “Hold to unlock” control (don’t need progress ring full) |
| **Caption idea** | *Focus lock keeps you in the flow* |

Start session → tap lock icon in header (or rely on auto focus lock) → capture before unlocking.

---

### 4. Settings — Your practice, your way

| | |
|---|---|
| **Screen** | Settings page |
| **State** | 108 selected preset, interval ~2.0s, Mala sound, toggles visible |
| **Caption idea** | *Presets, sounds, and privacy controls* |

Scroll so **Practice**, **Interval**, **Sound**, and **Preferences** sections are visible.

---

### 5. Session complete — Well done

| | |
|---|---|
| **Screen** | Completion sheet |
| **State** | “Well done” · 108 repetitions · duration shown |
| **Caption idea** | *Track progress across your journey* |

Fast path: set **27 reps** at **0.5s** interval (~14s) to reach completion quickly.

---

## Optional 6th screenshot

**Welcome splash / Face ID** — Settings → Logout. Shows the brand ring, “Welcome back”, and gradient unlock button.

| | |
|---|---|
| **Screen** | Welcome splash (`UnlockWelcomeScreen`) |
| **State** | Ring + glow visible; “Unlock with Face ID” button at bottom |
| **Caption idea** | *Unlock with Face ID when you return* |

Capture before tapping unlock so the ring and cyan glow are fully visible.

Only include if you have space; not required for v1.

---

## Capture checklist

- [ ] Status bar clean (9:41 AM is Apple’s convention — set in Simulator **Features → Toggle Appearance** or leave default)
- [ ] No debug banners
- [ ] Dark mode (app is dark-only)
- [ ] Use **Portrait** only for phone listing (simplest story)
- [ ] Same device class for all shots in a set

---

## Quick simulator setup

```bash
source scripts/ios-env.sh
npm run build:ios
npm run open:ios
```

1. Select **iPhone 16 Pro Max** simulator  
2. Run (▶)  
3. Navigate to each state above  
4. **File → Save Screen** for each capture  
5. Files save to Desktop by default  

---

## iPad (optional)

Repit supports iPad orientations in Info.plist. If you ship iPad, add 12.9" screenshots (2048 × 2732). Same five scenes, centered layout works well.

---

## File naming (for your records)

```
01-hero-idle.png
02-session-active.png
03-focus-lock.png
04-settings.png
05-session-complete.png
06-welcome-splash-optional.png
```

Upload in this order in App Store Connect — first image is the one users see in search.
