# Repit privacy policy (public site)

Static site for App Store Connect **Privacy Policy URL**. The main Repit repo can stay **private**.

Source of truth: **`docs/index.html`** → synced here via `npm run sync:privacy-site`.

---

## Option A — Netlify (recommended for private repo)

Deploy straight from your **private** Repit repo. No second public GitHub repo needed.

**Live URL:** https://repit-privacy.netlify.app/

### Setup

1. [netlify.com](https://www.netlify.com) → sign up / log in  
2. **Add new site → Import an existing project** → **GitHub** → authorize  
3. Select **`oobaretin/Repit`** (private is fine on the free tier)  
4. Netlify reads **`netlify.toml`** at the repo root:
   - **Build command:** `npm run sync:privacy-site`
   - **Publish directory:** `privacy-site`
5. **Deploy site**

After deploy, open the `.netlify.app` URL and confirm the privacy policy loads.

Use that URL in **App Store Connect → Privacy Policy URL** (update `docs/app-store-copy.md` with your exact URL).

### Updates

Edit `docs/index.html` → push to `main` → Netlify redeploys automatically.

### Even faster (no Git connect)

**Netlify Drop:** [app.netlify.com/drop](https://app.netlify.com/drop) — drag the `privacy-site/` folder onto the page. Good for a one-off; reconnect Git later for auto-deploys.

---

## Option B — GitHub Pages (public `repit-privacy` repo)

Use a **separate public repo** containing only this folder. Free Pages; main Repit stays private.

**URL:** `https://oobaretin.github.io/repit-privacy/`

<details>
<summary>GitHub Pages steps</summary>

### 1. Sync

```bash
npm run sync:privacy-site
```

### 2. Create public repo `repit-privacy` (empty)

### 3. Push this folder as repo root

```bash
cd privacy-site
git init
git add -A
git commit -m "Add Repit privacy policy site."
git branch -M main
git remote add origin https://github.com/oobaretin/repit-privacy.git
git push -u origin main
```

### 4. Enable Pages

**Settings → Pages → Source: GitHub Actions** → wait for deploy.

</details>

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Privacy policy (synced from `docs/index.html`) |
| `icon.svg` | App mark in page header |
| `.nojekyll` | For GitHub Pages only (harmless on Netlify) |
