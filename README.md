# Repit

A mindfulness repetition timer for mantra practice, affirmations, and breath counting — built for iOS and web.

## Features

- **Repetition timer** — configurable target count and interval
- **Quick presets** — 27, 54, 108, 1000
- **Sounds** — Mala, Gong, Crystal, or silent
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

1. Install **Xcode** from the App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Build and sync:
   ```bash
   npm run build:ios
   npm run open:ios
   ```
4. In Xcode, select your team under **Signing & Capabilities**, then run on a device or simulator

If Xcode is in Downloads:

```bash
export DEVELOPER_DIR="$HOME/Downloads/Xcode.app/Contents/Developer"
```

## App identity

| Field | Value |
|-------|-------|
| **App name** | Repit |
| **Bundle ID** | com.repit.app |
| **Category** | Health & Fitness |

## Version

Current release: **1.0.0**
