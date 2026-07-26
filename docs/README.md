# Repit docs

Internal planning, App Store copy, and the **privacy policy** source for GitHub Pages.

**Privacy policy (public):** https://oobaretin.github.io/Repit/

---

## Privacy policy hosting

The policy is published from this repo via GitHub Actions when `docs/index.html` changes.

| Item | Value |
|------|--------|
| Source | `docs/index.html` |
| Workflow | `.github/workflows/deploy-privacy-policy.yml` |
| Live URL | `https://oobaretin.github.io/Repit/` |
| App constant | `PRIVACY_POLICY_URL` in `constants/subscription.ts` |

### One-time GitHub setup

1. Make the **Repit** repo **public** (Settings → General → Danger zone).
2. **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
3. Push to `main` or run **Actions → Deploy privacy policy → Run workflow**.
4. Confirm https://oobaretin.github.io/Repit/ loads.
5. Set the same URL in **App Store Connect → Privacy Policy URL**.
6. Disconnect the old Netlify site if it was connected (`repit-privacy.netlify.app`).

Edits: change `docs/index.html` → push → workflow redeploys automatically.

---

## Contents

| File | Purpose |
|------|---------|
| `index.html` | Privacy policy (published to GitHub Pages) |
| `icon.svg` | Logo on the privacy page |
| `app-store-copy.md` | Description, keywords, review notes |
| `subscription-plan.md` | Pricing, onboarding, paywall copy |
| [revenuecat-setup.md](./revenuecat-setup.md) | App Store Connect + RevenueCat setup |
| [premium-v1.1-roadmap.md](./premium-v1.1-roadmap.md) | Feature and pricing roadmap |
| `screenshot-guide.md` | Screenshot layouts and capture steps |
| `qa-test-report.md` | Core flow test results and manual checklist |

---

## Verify timer logic locally

```bash
npm run verify
```

---

## Pre-submission checklist

- [ ] **Privacy policy live** at `https://oobaretin.github.io/Repit/`
- [ ] **`npm run verify`** passes locally
- [ ] **Device QA** — manual checklist in `qa-test-report.md`
- [ ] **Screenshots** — per `screenshot-guide.md` → `screenshots/`
- [ ] **No secrets in repo** — `.env` gitignored, RevenueCat key only in local `.env`

When all boxes are checked, you're ready for App Store Connect and TestFlight.
