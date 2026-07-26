# Repit — Premium v1.1 Roadmap

Strategy for raising perceived value **without cloud backup or accounts**. Aligns with Repit’s privacy-first positioning: *“No account required. Your settings and session stats stay on your device.”*

**Target pricing (v1.1):** $24.99/year · $4.99/month (see [subscription-plan.md](./subscription-plan.md))

---

## What you have today (v1 launch)

| Area | Status |
|------|--------|
| Repetition timer + pause/resume | ✓ |
| Presets 27 / 54 / 108 / 1000 | ✓ |
| 10 sounds + haptics | ✓ |
| Focus lock + Face ID app lock | ✓ |
| Lifetime stats (`totalSessions`, `totalReps`, `lastSessionAt`) | ✓ — `SessionStats` in `types.ts`, persisted via `usePersistentState` |
| Subscription + 7-day trial | ✓ — RevenueCat wired, pending App Store Connect |

**Gap:** Stats are aggregate only — no history, streaks, custom presets, widgets, or Watch.

---

## Cloud backup — skip for v1.1

| Option | Verdict |
|--------|---------|
| Full cloud backup + account | **No** — conflicts with brand, adds backend cost/support |
| Optional iCloud sync | **Later** — only if users ask for new-device restore |
| Export/import (JSON → Files) | **Maybe v1.2** — cheap, still no account |

Higher price should come from **daily-use features**, not infrastructure users didn’t ask for.

---

## Prioritized features (recommended order)

### Tier 1 — Ship first (highest perceived value / effort ratio)

#### 1. Practice history & streaks
**Why:** Turns “lifetime reps” into a habit loop users check daily.  
**Scope:**
- Append-only session log: `{ date, reps, delay, sound, durationSec }` in localStorage
- Current streak (consecutive days with ≥1 session)
- Longest streak, this week / this month totals
- Small “History” section in Settings or dedicated sheet

**Effort:** ~2–3 days · **No new dependencies**

**Code touchpoints:** `App.tsx` (on session complete), `types.ts`, `SettingsPage.tsx`, new `SessionHistory` component

---

#### 2. Custom session presets
**Why:** Power users (108×2s Mala, 27×0.5s quick) feel the app was built for them.  
**Scope:**
- Save named presets: `{ name, reps, delay, sound }`
- Show saved presets above built-in 27/54/108/1k chips
- Cap at ~5 presets to keep UI calm

**Effort:** ~1–2 days

**Code touchpoints:** `SettingsPage.tsx`, `REP_PRESETS` in `types.ts`, new storage key

---

#### 3. Home Screen widget (iOS)
**Why:** Visible every day on the Home Screen — strong “premium app” signal.  
**Scope:**
- Small widget: today’s reps + current streak
- Medium (optional): last session summary + “Open Repit”

**Effort:** ~3–5 days · Requires native Widget Extension in Xcode + App Groups for shared data

**Note:** Capacitor app must write stats to App Group UserDefaults; widget reads them.

---

### Tier 2 — Strong differentiators (v1.1 or v1.2)

#### 4. Apple Watch companion
**Why:** Wrist haptics during mala/japa is a killer feature for this category.  
**Scope:**
- Start/pause from Watch
- Rep count + haptic on each tick
- Optional: mirror target reps from phone

**Effort:** ~1–2 weeks · WatchKit + WatchConnectivity or shared App Group

---

#### 5. Session intention / note
**Why:** Emotional connection — one line before or after session.  
**Scope:**
- Optional text field on session complete (stored with history entry)
- Show in history list

**Effort:** ~1 day

---

#### 6. Milestones & gentle celebrations
**Why:** “1,000 lifetime reps” without gamification overload.  
**Scope:**
- Thresholds: 108, 1k, 10k reps; 7-day streak, 30-day streak
- Subtle banner or haptic + one-line message on session complete

**Effort:** ~1 day

---

### Tier 3 — Polish & platform (when Tier 1–2 land)

| Feature | Value | Effort |
|---------|-------|--------|
| iPad / landscape layout | Feels like a real app on tablet | 2–3 days |
| Siri Shortcuts (“Start 108 reps”) | Power users, App Store discoverability | 2–3 days |
| Lock Screen widget (iOS 16+) | Glanceable streak | +2 days after Home widget |
| Export stats (CSV/JSON to Files) | Backup without cloud | 1 day |
| 2–3 “Pro” sounds | Extends existing audio work | 1–2 days each |

---

## Paywall copy (when v1.1 ships)

Update bullet list in `PaywallScreen.tsx` and App Store copy:

```
✓ Unlimited repetition sessions
✓ Focus lock & Face ID app lock
✓ Ten calming tick sounds + haptics
✓ Practice history, streaks & custom presets   ← new
✓ Home Screen widget — streak at a glance       ← when widget ships
✓ Everything on your device — no account
```

Do **not** promise cloud sync until it exists.

---

## Pricing ladder

| Version | Annual | Monthly | Justification |
|---------|--------|---------|---------------|
| **v1 launch** | $14.99 | $2.99 | Core timer + sounds + lock — get reviews |
| **v1.1** | $24.99 | $4.99 | History + streaks + custom presets |
| **v1.2+** | $29.99 | $5.99 | Watch + widgets + export — only after shipped |

Existing subscribers: grandfather at launch price or honor App Store price tiers — decide before first price increase.

---

## Suggested build sequence

```
v1.0  → Launch (current feature set, $14.99/yr)
v1.1  → History + streaks + custom presets ($24.99/yr)
v1.1b → Home Screen widget
v1.2  → Watch companion OR export/import (pick based on user feedback)
```

---

## What to measure post-launch

- Trial → paid conversion rate (target: 15–25% for niche wellness)
- Day-7 retention (did history/streaks increase it?)
- Support emails mentioning “lost data” or “new phone” → signals need for export/iCloud, not full cloud
- App Store reviews mentioning Watch/widgets → prioritize Tier 2

---

## Summary

**You do not need cloud backup** to justify premium pricing. For Repit, the best path is:

1. **History + streaks** — habit loop, on-device
2. **Custom presets** — power-user delight, low effort
3. **Widget** — daily visibility, premium feel
4. **Watch** — category-defining, bigger investment

Keep “no account, data on your device” as a feature, not a limitation.
