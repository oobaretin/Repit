# iOS Home Screen Widget Setup

Repit includes a WidgetKit extension that shows your **day streak**, **reps this week**, **last practice**, and **total sessions** on the Home Screen.

**Tap the widget** → opens the app via `repit://practice?start=1` and starts a session when subscribed (otherwise shows the paywall).

Data flows: **App (Capacitor)** → `WidgetSyncPlugin` → **App Group** (`group.com.repit.app`) → **RepitWidget**.

---

## What's already in the repo

| Path | Purpose |
|------|---------|
| `services/widgetSyncService.ts` | JS bridge; called from `App.tsx` when stats change |
| `ios/App/App/WidgetSyncPlugin.swift` | Capacitor plugin; writes to App Group + reloads timelines |
| `ios/App/App/App.entitlements` | App Group entitlement for main app |
| `ios/RepitWidget/RepitWidget.swift` | SwiftUI widget (small + medium) |
| `ios/RepitWidget/Info.plist` | Widget extension plist |
| `ios/RepitWidget/RepitWidget.entitlements` | App Group entitlement for widget |

The Xcode project includes the **RepitWidgetExtension** target and embeds it in the App target.

---

## One-time Apple Developer setup

1. Open **`ios/App/App.xcworkspace`** in Xcode (not the `.xcodeproj` alone).
2. Select the **App** target → **Signing & Capabilities**.
3. Confirm **App Groups** is enabled with `group.com.repit.app`.
   - If missing: **+ Capability** → App Groups → add `group.com.repit.app`.
4. Select the **RepitWidgetExtension** target → **Signing & Capabilities**.
5. Add the same App Group: `group.com.repit.app`.
6. In [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list), ensure both App IDs (`com.repit.app` and `com.repit.app.RepitWidget`) have the App Groups capability enabled for `group.com.repit.app`.

---

## Build & test

```bash
npm run build:ios
```

In Xcode:

1. Select your physical iPhone (widgets do not preview well on Simulator for App Group data).
2. Run the **App** scheme.
3. Complete at least one practice session so stats sync.
4. Long-press Home Screen → **Edit Home Screen** → **+** → search **Repit** → add **Practice** widget.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Widget shows zeros after sessions | App Group not enabled on both targets, or mismatched group ID |
| `App Group not configured` in Xcode console | Add App Groups capability + `group.com.repit.app` on App target |
| Widget not in gallery | Build RepitWidgetExtension target; confirm it is embedded under App → General → Frameworks, Libraries, and Embedded Content |
| Plugin not found in JS | Rebuild after adding `WidgetSyncPlugin.swift` to App target Sources |

---

## Widget sizes

- **Small:** streak badge + weekly reps (or “Start your practice” if no sessions yet)
- **Medium:** same layout with more horizontal space

Timelines refresh when the app syncs stats and hourly as a fallback.

---

## Deep link (tap to start)

| URL | Behavior |
|-----|----------|
| `repit://practice?start=1` | Opens timer and starts a session (or paywall if unsubscribed) |
| `repit://practice` | Opens timer only |

Registered in `ios/App/App/Info.plist` under `CFBundleURLTypes` (`repit` scheme). Handled in `App.tsx` via `@capacitor/app` `appUrlOpen` + `getLaunchUrl`.

The widget sets `.widgetURL(URL(string: "repit://practice?start=1"))` on its view.

**Test without a widget:** In Safari on Simulator, type `repit://practice?start=1` in the address bar (may prompt to open Repit).
