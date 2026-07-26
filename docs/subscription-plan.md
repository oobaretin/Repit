# Repit — Subscription Plan

Monetization model for v1: **7-day free trial** after onboarding, then **annual (recommended)** or **monthly** subscription. No free tier after trial ends.

**Bundle ID:** `com.repit.app`

**Setup guide:** [revenuecat-setup.md](./revenuecat-setup.md) — App Store Connect + RevenueCat step-by-step.

---

## Pricing (launch)

| Plan | US price | Effective monthly | App Store tier |
|------|----------|-------------------|----------------|
| **Annual** (default on paywall) | **$14.99/year** | ~$1.25/mo | Tier 15 |
| **Monthly** (secondary option) | **$2.99/month** | $2.99/mo | Tier 3 |
| **Free trial** | **7 days** | — | Introductory offer |

Annual saves ~**58%** vs monthly ($35.88/year at monthly rate).

### Premium tier (optional later)

If reviews and conversion are strong, consider v1.1 pricing:

| Plan | US price |
|------|----------|
| Annual | $19.99/year |
| Monthly | $3.99/month |

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
| Privacy Policy | `https://repit-privacy.netlify.app/` |
| Terms of Use (EULA) | Apple standard EULA, or custom hosted URL |

Subscription auto-renewal disclosure is **required** on the paywall (see copy below).

### 4. Privacy questionnaire update

When subscriptions ship, purchases are handled by **Apple** — you do not store payment info. Update App Store Connect answers if prompted; subscription status may be checked via StoreKit/RevenueCat on device only.

---

## User flow

```
Install (free)
    → Onboarding (3 screens, no paywall yet)
    → Start 7-day trial (StoreKit purchase with intro offer)
    → Full app access during trial
    → Day 5–6: soft reminder (in-app banner or sheet)
    → Trial ends → must subscribe to continue (or read-only / locked — pick one at implementation)
```

**Trial starts after onboarding**, not on first launch — user sees value before committing.

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
`A steady rhythm for your practice`

**Body:**  
`Choose your count and interval. Each rep brings a gentle sound and haptic tap. Focus lock keeps distractions away.`

**Visual:** Timer running (~24/108) or idle with practice pill

**CTA:** `Continue`

---

### Screen 3 — Privacy & setup

**Headline:**  
`Private by design`

**Body:**  
`No account required. Your settings and session stats stay on your device. Optional Face ID when you return.`

**Visual:** Settings toggles or Face ID welcome ring

**Primary CTA:** `Start free trial` → **Paywall / StoreKit**

**Secondary:** `Restore purchases` (small link)

---

## Paywall copy

Shown after onboarding screen 3 (and when trial expires).

### Headline

`Start your 7-day free trial`

### Subhead

`Full access to Repit. Cancel anytime in Settings before the trial ends.`

### Value bullets

- Unlimited repetition sessions  
- Focus lock & Face ID app lock  
- Ten calming tick sounds (Mala, Wood, Gong, Bell, Crystal, Bowl, Tap, Breath, Om, or silent)  
- Haptic feedback on every rep  
- Session stats on your device — no account  

### Plan cards (annual first)

**Annual — recommended badge**

```
$14.99 / year
7 days free, then $14.99/year
Less than $1.25/month
```

**Monthly — secondary**

```
$2.99 / month
7 days free, then $2.99/month
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

Link **Privacy Policy** to `https://repit-privacy.netlify.app/`.

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

Not built yet — use when ready to ship subscriptions.

| Piece | Recommendation |
|-------|------------------|
| StoreKit wrapper | [RevenueCat](https://www.revenuecat.com) + Capacitor (fastest) or `@capgo/capacitor-purchases` |
| Entitlement | `premium` — gate timer after trial/sub lapse |
| Restore | Required on paywall and settings |
| Sandbox testing | App Store Connect sandbox Apple ID |
| Receipt / status | Cached on device; refresh on launch and after purchase |

### Suggested file structure (future)

```
services/subscriptionService.ts   — offerings, purchase, restore, entitlement
components/OnboardingFlow.tsx       — 3-screen flow
components/PaywallScreen.tsx      — plans + legal footer
hooks/useSubscription.ts          — isPremium, trialDaysRemaining
```

### Apple review notes (add when submitting)

```
Subscriptions: complete onboarding → tap "Start free trial" → use sandbox account.

Product IDs:
- com.repit.app.premium.annual (7-day trial)
- com.repit.app.premium.monthly (7-day trial)

Restore purchases is available on the paywall and in Settings.
```

---

## App Store listing updates

See [app-store-copy.md](./app-store-copy.md) — subscription description, promotional text, and review notes are updated there.

---

## Checklist before shipping subscriptions

- [ ] Subscription products created in App Store Connect  
- [ ] 7-day introductory offer on both products  
- [x] Onboarding + paywall implemented  
- [x] Restore purchases works (Settings + paywall)  
- [x] Trial reminder (day 5–6)  
- [x] Expired trial state handled  
- [x] Paywall legal footer with Privacy Policy link  
- [ ] RevenueCat project + `VITE_REVENUECAT_IOS_API_KEY` in `.env`  
- [ ] Sandbox tested end-to-end on device  
- [ ] Privacy policy mentions subscriptions billed through Apple (optional sentence)  
- [ ] Screenshots still accurate (or add paywall/onboarding shot if desired)
