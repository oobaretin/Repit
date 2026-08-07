# Repit — Subscription Plan

Monetization model for v1.1: **3 free practice sessions** after onboarding, then **7-day free trial** (via StoreKit intro offer), then **annual (recommended)** or **monthly** subscription. No access after free sessions or trial without subscribing.

**Bundle ID:** `com.repit.app`

**Setup guide:** [revenuecat-setup.md](./revenuecat-setup.md) — App Store Connect + RevenueCat step-by-step.

---

## Pricing (v1.1 — current in app)

| Plan | US price | Effective monthly | App Store tier |
|------|----------|-------------------|----------------|
| **Annual** (default on paywall) | **$24.99/year** | ~$2.08/mo | Tier 25 |
| **Monthly** (secondary option) | **$4.99/month** | $4.99/mo | Tier 5 |
| **Free trial** | **7 days** | — | Introductory offer |

Annual saves ~**58%** vs monthly ($59.88/year at monthly rate).

### v1.1 interim pricing (reference)

| Plan | US price |
|------|----------|
| Annual | $19.99/year |
| Monthly | $3.99/month |

### Launch pricing (v1.0 — reference)

| Plan | US price |
|------|----------|
| Annual | $14.99/year |
| Monthly | $2.99/month |

Use **$24.99 / $4.99** tiers in App Store Connect when creating products. If products already exist at a lower tier, update prices before shipping or grandfather existing subscribers.

### Premium tier (optional later)

If reviews and conversion stay strong after Watch/widgets ship:

| Plan | US price |
|------|----------|
| Annual | $29.99/year |
| Monthly | $5.99/month |

---

## App Store Connect setup

### 1. Subscription group

Create one group, e.g. **`Repit Premium`**.

| Product ID | Type | Duration | Intro offer |
|------------|------|----------|-------------|
| `com.repit.app.premium.annual` | Auto-renewable | 1 year | 7-day free trial |
| `com.repit.app.premium.monthly` | Auto-renewable | 1 month | 7-day free trial |

- Attach **both** products to the same subscription group (user picks one).
- Set **annual as rank 1** (shown first).
- Enable **Billing Grace Period** (recommended).
- Enroll in **Small Business Program** if eligible (15% commission).

### 2. App pricing

- **App price:** Free (download is free; subscription unlocks full access after trial).
- **Availability:** All territories or your chosen markets.

### 3. Required legal links (paywall + App Store)

| Link | URL |
|------|-----|
| Privacy Policy | `https://oobaretin.github.io/Repit/` |
| Terms of Use (EULA) | Apple standard EULA, or custom hosted URL |

Subscription auto-renewal disclosure is **required** on the paywall (see copy below).

### 4. Privacy questionnaire update

When subscriptions ship, purchases are handled by **Apple** — you do not store payment info. Update App Store Connect answers if prompted; subscription status may be checked via StoreKit/RevenueCat on device only.

---

## User flow

```
Install (free)
    → Onboarding (3 screens — interactive tap-along on step 2 → “Begin practice”)
    → Sessions 1–3 free (full app access)
    → Session complete shows streak + “X free sessions remaining”
    → After session 3 complete → Paywall (“Your free sessions are complete”)
    → Start 7-day trial (StoreKit purchase with intro offer)
    → Full app access during trial
    → Day 5–6: soft reminder (in-app banner)
    → Trial ends → must subscribe to continue
```

**Trial starts after the third free session**, not on first launch — user feels value before committing.

Settings and history stay accessible after free sessions; starting session 4 (or “Same practice again” when unsubscribed) shows the paywall.

---

## Onboarding (3 screens)

Keep it short. Match Repit’s dark brand (`#060912`, cyan accent, Inter Tight).

### Screen 1 — Welcome

**Headline:**  
`Mindful repetition, simplified`

**Body:**  
`Repit is a calm timer for mantra, affirmations, and breath counting. Set your reps, follow the circle, stay present.`

**Visual:** Brand ring (same as unlock splash)

**CTA:** `Continue`

---

### Screen 2 — How it works

**Headline:**  
`Feel the rhythm`

**Body:**  
`Watch a few reps, then tap the circle three times yourself. This is how practice feels in Repit.`

**Visual:** Interactive tap-along demo (lite Flower of Life)

**CTA:** `Continue`

---

### Screen 3 — Privacy & setup

**Headline:**  
`Private by design`

**Body:**  
`No account required. Your settings and session stats stay on your device. Optional Face ID when you return.`

**Visual:** Settings toggles or Face ID welcome ring

**Primary CTA:** `Begin practice` → **Timer (no paywall yet)**

**Secondary:** `Restore purchases` (small link on paywall when shown later)

---

## Paywall copy

Shown after the **third free session** (and when trial expires, or when starting session 4 without a subscription).

### Headline (after free sessions)

`Your free sessions are complete`

### Subhead (after free sessions)

`You’ve practiced 3 times with Repit. Start a 7-day free trial to keep your streak, history, and daily practice.`

### Headline (default / from settings)

`Start your 7-day free trial`

### Subhead (default)

`Full access to Repit. Cancel anytime before the trial ends.`

### Value bullets

- Unlimited repetition sessions  
- Focus lock & Face ID app lock  
- Four calming tick sounds (Mala, Gong, Crystal, Bowl, or silent)  
- Haptic feedback on every rep  
- Practice history, streaks & custom presets  
- Everything on your device — no account  

### Plan cards (annual first)

**Annual — recommended badge**

```
$24.99 / year
7 days free, then $24.99/year
Less than $2.10/month
```

**Monthly — secondary**

```
$4.99 / month
7 days free, then $4.99/month
```

### Primary button

`Start 7-day free trial`

*(Apple replaces with localized price at runtime.)*

### Secondary actions

- `Restore purchases`  
- `Other plans` → expands monthly if annual-only layout  

### Legal footer (required)

```
Payment will be charged to your Apple ID account at the confirmation of purchase
or at the end of the free trial. Subscription automatically renews unless canceled
at least 24 hours before the end of the current period. Manage or cancel in
Settings → Apple ID → Subscriptions.

Privacy Policy · Terms of Use
```

Link **Privacy Policy** to `https://oobaretin.github.io/Repit/`.

---

## Trial reminder (day 5–6)

**Banner or sheet:**

**Title:** `Your trial ends in 2 days`

**Body:** `Keep your practice going — subscribe to continue uninterrupted sessions.`

**CTA:** `View plans`  
**Dismiss:** `Not now`

---

## Trial expired

**Headline:** `Your free trial has ended`

**Body:** `Subscribe to continue your practice with Repit.`

**CTA:** Same paywall as onboarding.

**Restore:** `Already subscribed? Restore purchases`

---

## Implementation notes

Subscriptions and reminders are implemented in-app; App Store Connect products and sandbox/device QA remain.

| Piece | Recommendation |
|-------|------------------|
| StoreKit wrapper | [RevenueCat](https://www.revenuecat.com) + Capacitor (implemented) |
| Entitlement | `premium` — gate timer after 3 free sessions / trial lapse |
| Free tier | `FREE_SESSION_LIMIT = 3` in `constants/subscription.ts` |
| Restore | Required on paywall and settings |
| Daily reminder | `@capacitor/local-notifications` — scheduled in `reminderService.ts` |
| Sandbox testing | App Store Connect sandbox Apple ID |
| Receipt / status | Cached on device; refresh on launch and after purchase |

### Implemented files

```
constants/subscription.ts         — FREE_SESSION_LIMIT, plan copy
utils/subscriptionAccess.ts       — freeSessionsRemaining, paywall gates
services/subscriptionService.ts   — offerings, purchase, restore, entitlement
services/reminderService.ts       — daily local notification scheduling
components/OnboardingFlow.tsx     — 3-screen flow + tap-along
components/PaywallScreen.tsx      — plans + legal footer
components/SessionComplete.tsx      — streak + free sessions remaining
hooks/useSubscription.ts          — isPremium, trialDaysRemaining
```

### Apple review notes (add when submitting)

```
Subscriptions: complete onboarding → complete 3 free sessions → paywall → tap "Start 7-day free trial" → use sandbox account.

Product IDs:
- com.repit.app.premium.annual (7-day trial)
- com.repit.app.premium.monthly (7-day trial)

Restore purchases is available on the paywall and in Settings.
Daily reminder: Settings → Daily reminder → allow notifications when prompted.
```

---

## App Store listing updates

See [app-store-copy.md](./app-store-copy.md) — subscription description, promotional text, and review notes are updated there.

---

## Checklist before shipping subscriptions

- [ ] Subscription products created in App Store Connect  
- [ ] 7-day introductory offer on both products  
- [x] Onboarding + paywall implemented  
- [x] 3 free sessions before paywall  
- [x] Restore purchases works (Settings + paywall)  
- [x] Trial reminder (day 5–6)  
- [x] Expired trial state handled  
- [x] Paywall legal footer with Privacy Policy link  
- [x] Daily reminder UI + local notification scheduling  
- [ ] RevenueCat project + `VITE_REVENUECAT_IOS_API_KEY` in `.env`  
- [ ] Sandbox tested end-to-end on device  
- [ ] Privacy policy mentions subscriptions billed through Apple (optional sentence)  
- [ ] Screenshots still accurate (or add paywall/onboarding shot if desired)
