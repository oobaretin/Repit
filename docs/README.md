# Repit docs

The main **Repit** repo is private. Host the privacy policy on **Netlify** (deploy from this repo) or a **public `repit-privacy` repo** (GitHub Pages).

---

## Privacy policy URL

Pick one:

| Host | Example URL | Notes |
|------|-------------|--------|
| **Netlify** (live) | `https://repit-privacy.netlify.app/` | Deployed from private Repit repo |
| GitHub Pages | `https://oobaretin.github.io/repit-privacy/` | Separate public repo with only `privacy-site/` |

After editing `docs/index.html` or `docs/privacy.html`, run `npm run sync:privacy-site` and push (Netlify runs sync on deploy automatically).

---

## Contents

| File | Purpose |
|------|---------|
| `index.html` | Simple app landing page, links to the privacy policy |
| `privacy.html` | Privacy policy source (synced to `privacy-site/`) |
| `icon.svg` | Logo for the app and privacy pages |
| `app-store-copy.md` | Description, keywords, review notes |
| `screenshot-guide.md` | Screenshot layouts and capture steps |
| `qa-test-report.md` | Core flow test results and manual checklist |

---

## Verify timer logic locally

```bash
npm run verify
```

---

## Free pre-submission checklist

- [x] **Privacy policy live** at `https://repit-privacy.netlify.app/privacy.html`
- [x] **`npm run verify`** passes locally
- [x] **Device QA** — manual checklist in `qa-test-report.md` on a real iPhone
- [x] **Screenshots** — 5-scene set per `screenshot-guide.md` → `screenshots/`
- [ ] **Fix any issues** from QA or screenshot pass

When all boxes are checked, you’re ready for App Store Connect and TestFlight.

---

## If you make Repit public later

You can host from this repo’s `/docs` folder instead:

1. **Settings → Pages →** deploy **`main`** / **`/docs`**
2. URL becomes `https://oobaretin.github.io/Repit/`
3. Update App Store Connect with the new URL

The workflow in `.github/workflows/deploy-privacy-policy.yml` also works on a **public** Repit repo.
