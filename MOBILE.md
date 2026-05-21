# HiredMate — Capacitor Mobile Apps

Native iOS and Android shells load the production web app at **https://hiredmate.app** (all API routes, auth, and features work without a static Next.js export).

## Requirements

- **Node.js 18+** (20 LTS recommended — see `.nvmrc`)
- **Xcode** (macOS) for iOS
- **Android Studio** for Android
- **CocoaPods** for iOS: `sudo gem install cocoapods`

> `@capacitor/microphone` is not published; Voice Practice uses the browser `getUserMedia` API. iOS/Android microphone permissions are configured in `Info.plist` and `AndroidManifest.xml`.

## Quick start

```bash
nvm use          # Node 20
npm install
npm run build:mobile   # syncs out/ + config to ios/ and android/
```

### iOS

```bash
cd ios/App && pod install && cd ../..
npm run open:ios
```

In Xcode: Signing & Capabilities → your team, Bundle ID `app.hiredmate.www`, Version `1.0.0`. Run on simulator, then Archive for App Store.

### Android

```bash
npm run open:android
```

Build → Generate Signed Bundle/APK (AAB for Play Store).

## Config

`capacitor.config.ts` — `server.url: 'https://hiredmate.app'` (change for staging).

Local dev against your machine:

```ts
server: {
  url: 'http://YOUR_LAN_IP:3001',
  cleartext: true,
},
```

## Icons & splash

- **App icons:** [appicon.co](https://appicon.co) — upload `public/hiredmate-logo.png`, install iOS + Android sets into `ios/App/App/Assets.xcassets/AppIcon.appiconset/` and `android/app/src/main/res/mipmap-*`.
- **Splash:** [Capacitor assets](https://capacitorjs.com/docs/guides/splashes) or [apetools](https://apetools.webprofusion.com) — purple `#7C5CBF`, centered logo.

## App Store metadata (prepare in App Store Connect)

- **Name:** HiredMate - Nurse Interview Prep  
- **Subtitle:** AI Mock Interviews for Nurses  
- **Category:** Education (primary), Medical (secondary)  
- **Keywords:** nursing interview, nurse prep, RN interview, nursing job, NCLEX, nurse hiring, clinical interview, nursing resume, healthcare interview, travel nursing  

See the product brief in the Capacitor setup task for full description and screenshot sizes (6.7" iPhone 1290×2796).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build:mobile` | `cap sync` |
| `npm run sync` | Same as above |
| `npm run open:ios` | Open Xcode |
| `npm run open:android` | Open Android Studio |
| `npm run cap -- <cmd>` | Any Capacitor CLI command |

Uses `scripts/cap-cli.mjs` so `cap sync` works without the npm `cap` bin Node version gate when needed.

## Manual steps before store submission

1. **Apple Developer Program** ($99/year)  
2. Generate icons at [appicon.co](https://appicon.co)  
3. Submit via **App Store Connect** / **Google Play Console**  
4. Deploy `CapacitorNativeInit` to production (in `app/layout.tsx`) so status bar/splash behave in the WebView after login  
