# Repit — Sound Library Plan (10 + Silent)

Expanded sound picker for a **premium subscription** app — all sounds included for trial and paid users. No in-app sound packs or tiers.

**Current (v1):** 4 options — Mala, Gong, Crystal, None  
**Proposed:** **10 playable sounds + None** (11 total), grouped in Settings

---

## Group 1 — Traditional

Earthy, ritual, mantra / japa. Best for 54–108 reps.

| # | Name | Status | Character | Implementation |
|---|------|--------|-----------|----------------|
| 1 | **Mala** | Keep | Warm bead / soft chime | Bundle same Mixkit MP3 locally (`public/sounds/mala.mp3`); fade in/out |
| 2 | **Wood** | Add | Dry wooden block (mokugyo-style) | Short synth: noise burst + low sine ~180 Hz, fast decay (~0.4s) |
| 3 | **Gong** | Keep | Deep grounding strike | Enhanced synth: 120 Hz + 60 Hz partial, pitch decay, ~1.5s |
| 4 | **Bell** | Add | Single temple bell, mid pitch | Synth: 520 Hz + 780 Hz partial, bell-like decay ~1.2s |

---

## Group 2 — Bright

Clear, present ticks. Good for faster intervals and breath counting.

| # | Name | Status | Character | Implementation |
|---|------|--------|-----------|----------------|
| 5 | **Crystal** | Keep | Bright glass-like tick | Enhanced synth: 2200 Hz + shimmer partial ~4400 Hz, ~0.8s |
| 6 | **Bowl** | Add | Singing bowl strike | Synth: 440 Hz with long exponential decay ~2s (cap overlap on fast reps) |
| 7 | **Tap** | Add | Soft felt mallet / muted tap | Synth: band-pass noise + 300 Hz, very short ~0.25s |

---

## Group 3 — Soft

Minimal, quiet, late-night friendly.

| # | Name | Status | Character | Implementation |
|---|------|--------|-----------|----------------|
| 8 | **Breath** | Add | Gentle exhale / air tone | Synth: filtered noise swell, very low gain, ~0.6s |
| 9 | **Om** | Add | Short om tone (subtle) | Synth: 136 Hz (C#) + 272 Hz, soft attack, ~1.0s — keep quiet |

---

## Silent

| # | Name | Status | Character | Implementation |
|---|------|--------|-----------|----------------|
| 10 | **None** | Keep | No sound | Haptics only (if enabled) |

---

## Settings UI (grouped)

```
Sound

  Traditional
  [ Mala ] [ Wood ] [ Gong ] [ Bell ]

  Bright
  [ Crystal ] [ Bowl ] [ Tap ]

  Soft
  [ Breath ] [ Om ]

  Silent
  [ None ]
```

One selection across all groups (radio behavior — same as today).

---

## Audio rules (all sounds)

- **Max length:** ~2s; cut or duck previous tick if interval &lt; sound length (fast 0.5s reps)
- **Master gain:** Normalize perceived loudness across all options
- **Offline:** No CDN at runtime — Mala bundled; rest synth (or bundle later if needed)
- **Preview:** Tap in Settings plays selected sound (existing behavior)

---

## Code touchpoints (when implementing)

| File | Change |
|------|--------|
| `types.ts` | Extend `SoundOption` enum (+6 values) |
| `constants/sounds.ts` | Groups, labels, descriptions (new) |
| `services/audioService.ts` | Per-sound playback + master bus |
| `components/SettingsPage.tsx` | Grouped sound sections |
| `scripts/verify-core-flows.mjs` | Update sound count assert |
| `docs/qa-test-report.md` | Manual sound checklist |
| `docs/index.html` | Network use — Mala no longer CDN-only |
| Paywall / App Store copy | “10 calming tick sounds” (optional) |

---

## Enum values (proposed)

```ts
export enum SoundOption {
  Mala = 'Mala',
  Wood = 'Wood',
  Gong = 'Gong',
  Bell = 'Bell',
  Crystal = 'Crystal',
  Bowl = 'Bowl',
  Tap = 'Tap',
  Breath = 'Breath',
  Om = 'Om',
  None = 'None',
}
```

Migration: existing users with `repit-sound` in localStorage keep valid values; new values default safely.

---

## What we’re not adding (v1)

| Sound | Why skip |
|-------|----------|
| Voice counting | Breaks flow; localization |
| Rain / ocean loops | Too long; not tick-shaped |
| Multiple gongs / malas | Choice fatigue |
| User-uploaded sounds | Scope + storage |

---

## Rollout order

1. **Phase A** — Enhance Mala, Gong, Crystal + bundle Mala (keep 4 names, better quality)
2. **Phase B** — Add Wood, Bell, Bowl, Tap (7 playable + None)
3. **Phase C** — Add Breath, Om + grouped Settings UI (10 + None)

Can ship Phase B as “8 sounds” if you want a smaller v1.5.

---

## Summary

| Group | Count | Sounds |
|-------|-------|--------|
| Traditional | 4 | Mala, Wood, Gong, Bell |
| Bright | 3 | Crystal, Bowl, Tap |
| Soft | 2 | Breath, Om |
| Silent | 1 | None |
| **Total** | **11** | **10 playable + None** |

All included in **7-day trial** and **subscription** — full access, no extras to unlock.
