# TradeNova SN — Mobile Application Guide (Android & iOS)

TradeNova SN is built with a dual-mode mobile architecture:
1. **Instant Standalone PWA (Recommended for Dabba & Institutional clients):**  
   Zero App Store / Play Store rejection risks, 0 developer account fees, instant 1-tap install on both Android and iOS directly from the browser, runs in full-screen standalone mode with native app icons, offline caching, and haptic feedback.
2. **Native APK / IPA (Capacitor Engine):**  
   Generates a native `.apk` file for Android to distribute directly over WhatsApp/Telegram, or publish to Google Play / Apple App Store.

---

## Method 1: Instant 1-Tap Mobile Installation (PWA)

### On Android (Chrome / Brave / Edge)
1. Open your TradeNova server URL (e.g., `http://your-ip:3000` or `https://yourdomain.com`).
2. An automatic floating banner will appear: **"Install TradeNova App — Fast 1-tap mobile trading & live ticks"**.
3. Tap **Install** (or tap the 3 dots in Chrome > **"Install app"** or **"Add to Home screen"**).
4. The TradeNova icon appears directly on the phone's Home Screen and App Drawer.
5. Tapping the icon opens the app in **100% full-screen mode** with no browser URL bar or bottom navigation buttons.

### On iOS (iPhone / iPad - Safari)
1. Open TradeNova in **Safari**.
2. Tap the **Share** button (⎋) at the bottom center of Safari.
3. Scroll down and tap **Add to Home Screen (⊕)**.
4. Tap **Add**.
5. TradeNova will install to your iOS Home Screen with the high-resolution fintech app icon and launch as a standalone iOS app with full safe-area support.

---

## Method 2: Building Native Android APK & iOS Apps

The native Android and iOS platform projects are already generated and configured in your workspace:
- **Android Native Project:** [`android/`](file:///c:/Users/acer/Desktop/TradeNova%20SN/android)
- **iOS Native Project:** [`ios/`](file:///c:/Users/acer/Desktop/TradeNova%20SN/ios)

### How to Build the Native Android APK:

1. **Open the project in Android Studio:**
   ```bash
   npm run mobile:android
   # (or: npx cap open android)
   ```
2. Android Studio will open the pre-configured [`android/`](file:///c:/Users/acer/Desktop/TradeNova%20SN/android) project.
3. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in the top menu.
4. When finished, Android Studio will show a prompt: **"APK(s) generated successfully: locate"**.
5. Your output APK file will be at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
6. You can rename this file to `TradeNova_v2.apk` and send it directly to your clients via WhatsApp, Telegram, or direct download link.

### How to Open iOS in Xcode (macOS):
```bash
npm run mobile:ios
# (or: npx cap open ios)
```
Xcode will open the native workspace with all bundle identifiers and asset catalogs configured.

### Whenever you change web code, run:
```bash
npm run mobile:sync
```
This automatically syncs your HTML, CSS, JavaScript, and assets into both the `android/` and `ios/` native app bundles!

---

## Mobile Features Included:
- **Haptic Tactile Feedback:** Physical phone vibration on order placements (`App.vibrate(50)`).
- **Sticky Bottom Navigation Bar:** Dedicated mobile bar with 5 primary screens:
  - 📊 **Watch** (Live NSE, BSE, MCX market watch)
  - 📈 **Terminal** (Interactive candlestick chart & order form)
  - 💼 **Positions** (Live M2M & open contracts)
  - 📝 **Orders** (Order execution ledger)
  - ⚡ **Dashboard** (Operational KPIs & turnover)
- **High-Speed Service Worker (`sw.js`):** Instant sub-100ms startup caching for charts, fonts, and icons.
- **Safe Area Insets:** Optimized for iPhone Dynamic Island and Android notch screens.
