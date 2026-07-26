# Repit privacy policy (GitHub Pages)

The live privacy policy is hosted on **GitHub Pages** from the main Repit repo.

**Live URL:** https://oobaretin.github.io/Repit/

## Source of truth

Edit **`docs/index.html`** in the repo root, then push to `main`. The workflow in `.github/workflows/deploy-privacy-policy.yml` deploys automatically.

## Setup

See [docs/README.md](../docs/README.md#privacy-policy-hosting) for one-time GitHub Pages configuration.

## Legacy

- **Netlify** (`repit-privacy.netlify.app`) — deprecated; disconnect in Netlify after GitHub Pages is live.
- **`npm run sync:privacy-site`** — copies `docs/` into this folder for manual deploys only; not required for GitHub Pages.
