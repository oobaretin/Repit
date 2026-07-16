# Repit docs (GitHub Pages)

## Enable privacy policy hosting

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. **Source:** Deploy from branch
4. **Branch:** `main` → folder **`/docs`**
5. Save

Your privacy policy will be live at:

**https://oobaretin.github.io/Repit/**

Use that URL in App Store Connect.

## Contents

| File | Purpose |
|------|---------|
| `index.html` | Privacy policy (public URL for App Store) |
| `app-store-copy.md` | Description, keywords, review notes |
| `screenshot-guide.md` | Screenshot layouts and capture steps |
| `qa-test-report.md` | Core flow test results and manual checklist |

## Verify timer logic locally

```bash
node scripts/verify-core-flows.mjs
```
