# Repit — RevenueCat & App Store Connect Setup

Step-by-step guide to enable real subscriptions. Product IDs and entitlement names **must match** the app code in `constants/subscription.ts`.

| Setting | Value |
|---------|--------|
| Bundle ID | `com.repit.app` |
| Entitlement | `premium` |
| Annual product | `com.repit.app.premium.annual` |
| Monthly product | `com.repit.app.premium.monthly` |
| Annual price | $24.99/year |
| Monthly price | $4.99/month |
| Free trial | 7 days (both products) |

---

## Prerequisites

- [ ] **Apple Developer Program** enrolled ($99/year)
- [ ] App record created in **App Store Connect** with bundle ID `com.repit.app`
- [ ] **Paid Applications Agreement** signed (App Store Connect → **Agreements, Tax, and Banking** → active)
- [ ] Banking and tax info completed (required before subscriptions work)

---

## Part 1 — App Store Connect subscriptions

### 1. Create the app (if not done)

1. [App Store Connect](https://appstoreconnect.apple.com) → **Apps** → **+**
2. **New App** → iOS → name **Repit** → bundle ID **com.repit.app**
3. SKU: e.g. `repit-ios`

### 2. Subscription group

1. Open **Repit** → **Subscriptions** (left sidebar under **Monetization**)
2. **+** → create group: **`Repit Premium`**
3. Reference name: `Repit Premium`

### 3. Annual subscription

1. Inside **Repit Premium** → **+** → **Create Subscription**
2. Fill in:

| Field | Value |
|-------|--------|
| Reference name | Repit Premium Annual |
| Product ID | `com.repit.app.premium.annual` |
| Subscription duration | 1 year |

3. **Subscription prices** → add **$24.99** (USD Tier 25)
4. **App Store localization** → display name e.g. **Repit Premium (Annual)**
5. **Review information** → screenshot of paywall (optional for review)
6. **Introductory offers** → **+**:
   - Type: **Free**
   - Duration: **7 days**
   - Eligibility: **New subscribers** (default)
7. Save and set status to **Ready to Submit**

### 4. Monthly subscription

Repeat with:

| Field | Value |
|-------|--------|
| Reference name | Repit Premium Monthly |
| Product ID | `com.repit.app.premium.monthly` |
| Subscription duration | 1 month |
| Price | $4.99 (Tier 5) |
| Intro offer | 7-day free trial |

### 5. Subscription group order

In **Repit Premium** group settings, set **subscription rank**:

1. **Annual** (rank 1 — shown first)
2. **Monthly** (rank 2)

### 6. Recommended settings

- **Billing Grace Period:** On (1 billing cycle)
- **App price:** **Free** (Users download free; subscription unlocks access)

### 7. Sandbox tester

1. App Store Connect → **Users and Access** → **Sandbox** → **Testers**
2. **+** → create a sandbox Apple ID (use a **new email** you control, not your real Apple ID)
3. Use this account only when prompted on device during test purchases

---

## Part 2 — RevenueCat

### 1. Create project

1. [RevenueCat](https://app.revenuecat.com) → sign up / log in
2. **+ New project** → name: **Repit**

### 2. Add iOS app

1. **Project settings** → **Apps** → **+ New**
2. **Apple App Store**
3. App name: **Repit**
4. Bundle ID: **`com.repit.app`**
5. **App-Specific Shared Secret** (optional but recommended):
   - App Store Connect → **Repit** → **General** → **App Information** → **App-Specific Shared Secret** → Generate
   - Paste into RevenueCat app settings

### 3. Create entitlement

1. **Product catalog** → **Entitlements** → **+ New**
2. Identifier: **`premium`** ← must match code exactly
3. Display name: Repit Premium

### 4. Import products

1. **Product catalog** → **Products** → **+ New**
2. **Import from App Store Connect** (or add manually):

| Product ID | Entitlement |
|------------|-------------|
| `com.repit.app.premium.annual` | Attach to `premium` |
| `com.repit.app.premium.monthly` | Attach to `premium` |

Products may show **Missing metadata** until App Store Connect products are fully configured — that’s normal for a few hours.

### 5. Create offering (required)

The app calls `offerings.current.annual` and `offerings.current.monthly`.

1. **Product catalog** → **Offerings** → **+ New**
2. Identifier: **`default`** (RevenueCat default)
3. Set as **Current offering** ✓
4. Add **Packages**:

| Package type | Product |
|--------------|---------|
| **Annual** | `com.repit.app.premium.annual` |
| **Monthly** | `com.repit.app.premium.monthly` |

5. Save

### 6. Get API key

1. **Project settings** → **API keys**
2. Copy the **Public app-specific API key** for **iOS** (starts with `appl_`)

---

## Part 3 — Wire up Repit

### 1. Environment variable

Create `.env` in the project root (do **not** commit):

```bash
VITE_REVENUECAT_IOS_API_KEY=appl_your_key_here
```

### 2. Rebuild iOS

```bash
source scripts/ios-env.sh
npm run build:ios
npm run open:ios
```

Run on a **physical device** or simulator signed with your dev team. Subscriptions work best on **real device** with sandbox account.

### 3. Test purchase flow

1. Delete Repit from device (fresh install)
2. Run from Xcode (▶)
3. Complete **onboarding** (3 screens)
4. On paywall → **Start 7-day free trial**
5. Sign in with **sandbox Apple ID** when iOS prompts
6. Confirm purchase — app should unlock

### 4. Test restore

1. Delete and reinstall app, OR use a second device with same sandbox Apple ID
2. Complete onboarding → paywall → **Restore purchases**
3. Should unlock without paying again

### 5. Test trial expiry (optional)

In sandbox, subscription periods are accelerated. Apple documents sandbox renewal times — annual may renew in ~1 hour for testing. Use RevenueCat **Customer profile** to inspect entitlement status.

---

## Part 4 — Verify in RevenueCat dashboard

After a test purchase:

1. RevenueCat → **Customers**
2. Search by App User ID (anonymous ID assigned on first launch)
3. Confirm **premium** entitlement is **active**
4. Check product and expiration date

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Paywall says “Plans unavailable” | Offering not set as **current** in RevenueCat, or products not linked to packages |
| “Cannot connect to iTunes Store” | Sign out of real Apple ID in Settings → App Store on device; use sandbox when prompted |
| Products not loading | Wait up to 24h after creating products in App Store Connect; ensure Paid Applications Agreement is active |
| Preview mode banner still shows | `.env` missing or not rebuilt — env vars are baked in at `npm run build` |
| Purchase succeeds but app locked | Entitlement must be named **`premium`** exactly |
| RevenueCat + Capacitor errors | Run `npx cap sync ios` after `npm install`; open `.xcworkspace` not `.xcodeproj` |

---

## Checklist

- [ ] Paid Applications Agreement active
- [ ] Subscription group **Repit Premium** created
- [ ] Both products with 7-day free trial
- [ ] RevenueCat app + entitlement `premium`
- [ ] Offering **default** is current with Annual + Monthly packages
- [ ] `.env` with `VITE_REVENUECAT_IOS_API_KEY`
- [ ] `npm run build:ios` and test on device
- [ ] Sandbox purchase + restore tested
- [ ] RevenueCat dashboard shows active entitlement

---

## Next: App Store submission

When subscriptions work in sandbox:

1. Complete App Store listing ([app-store-copy.md](./app-store-copy.md))
2. Upload screenshots from `screenshots/`
3. Set **Privacy Policy URL**: `https://oobaretin.github.io/Repit/`
4. Submit for review with sandbox notes from [app-store-copy.md](./app-store-copy.md)

See also: [subscription-plan.md](./subscription-plan.md)
