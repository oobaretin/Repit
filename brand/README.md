# Repit brand assets

Source: Genspark export (`Repit Logo.html`)

## Primary mark

- **Concept 01 · Primary** — open ring with terminal cap
- Vector source: `icon-primary.svg`
- Full presentation: open `Repit Logo.html` in a browser

## Regenerate iOS & web icons

```bash
npm run generate:icons
```

This updates:

- `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
- Splash screens in `Splash.imageset/`
- `public/icon.svg` and `public/apple-touch-icon.png`

Then sync to iOS:

```bash
npm run build:ios
```
