# Repit

A mindfulness repetition timer for mantra practice, affirmations, and breath counting — built for iOS and web.

## Features

- **Repetition timer** — configurable target count and interval
- **Quick presets** — 27, 54, 108, 1000
- **Sounds** — Ten calming ticks (Traditional / Bright / Soft) or silent
- **Haptic feedback** — light tap on each rep (iOS)
- **Session tracking** — lifetime sessions and reps
- **iOS native shell** — Capacitor with keep-awake, safe areas, status bar

## Development

```bash
npm install
npm run dev          # web dev server at http://localhost:3000
npm run build        # production web build
npm run build:ios    # build + sync to ios/
npm run open:ios     # open Xcode project
```

### Node on this machine

If `node` is not on your PATH:

```bash
export PATH="$HOME/Repeat2/.tools/node-v22.17.0-darwin-x64/bin:$PATH"
```

## iOS build

Xcode is installed at `~/Downloads/Xcode.app` on this machine. Before building:

```bash
source scripts/ios-env.sh
npm run build:ios
npm run open:ios
```

Or open manually: `ios/App/App.xcworkspace` (use the **workspace**, not the `.xcodeproj`).

### In Xcode

1. Open **App.xcworkspace**
2. Select the **App** target → **Signing & Capabilities**
3. Choose your **Team** (Apple ID)
4. Pick a simulator (e.g. iPhone 16) or connect your iPhone
5. Press **Run** (▶)

If Xcode is moved to Applications:

```bash
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
```

## App identity

| Field | Value |
|-------|-------|
| **App name** | Repit |
| **Bundle ID** | com.repit.app |
| **Category** | Health & Fitness |

## App icon

The primary logo (open ring mark) lives in `brand/`. Regenerate icons with:

```bash
npm run generate:icons
npm run build:ios
```

See [brand/README.md](brand/README.md) for details.

## App Store & privacy (pre-submission)

Draft materials live in [`docs/`](docs/):

- [App Store copy & keywords](docs/app-store-copy.md)
- [Screenshot guide](docs/screenshot-guide.md)
- [Privacy policy](docs/index.html) — host on **Netlify** from this private repo ([`privacy-site/`](privacy-site/README.md))
- [QA test report](docs/qa-test-report.md)

Verify core timer logic:

```bash
node scripts/verify-core-flows.mjs
```

## Version

Current release: **1.0.0**
