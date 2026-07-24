# App Store screenshots

Capture on **iPhone 16 Pro Max** simulator (1290 × 2796 px). See [docs/screenshot-guide.md](../docs/screenshot-guide.md) for each scene.

## Expected files

```
01-hero-idle.png
02-session-active.png
03-focus-lock.png
04-settings.png
05-session-complete.png
06-welcome-splash-optional.png
```

## Quick capture

```bash
source scripts/ios-env.sh
npm run build:ios
npm run open:ios
```

1. Select **iPhone 16 Pro Max** simulator  
2. Run (▶) in Xcode  
3. Set simulator time to **9:41 AM** (optional Apple convention)  
4. Navigate to each scene in the guide  
5. Simulator → **File → Save Screen** (⌘S) — saves to Desktop by default  
6. Move files here and rename per list above  

These files are for App Store Connect upload — they are not bundled in the app.
