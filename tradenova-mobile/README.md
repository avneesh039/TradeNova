# TradeNova SN — Native React Native Mobile Application

This directory contains the **100% Pure React Native (Bare CLI)** mobile application for **TradeNova SN**, with custom native Gradle configurations for Android and Xcode configurations for iOS.

---

## 📱 Features Included

1. **Brand-New Animated Native Splash Screen (`SplashScreen.js`):**
   - Floating 3D TradeNova gold emblem with orbital rotating ring and ambient glow.
   - Real-time progress bar (0% → 100%) with dynamic gateway status steps.
   - Automatic session check against backend (`/api/me`). Transitions smoothly to **Main Trading Terminal** if authenticated, or **Sign In / Register** if unauthenticated.
   - Replay button in Profile to re-watch the splash animation anytime.

2. **Native Sign In Screen (`AuthScreen.js`):**
   - Trader User ID input with auto-fill of remembered credentials.
   - Password input with Show/Hide eye toggle button.
   - "Remember User ID on this device" preference saved via `@react-native-async-storage/async-storage`.
   - High-contrast gold shimmer "Sign In to Terminal" button.
   - "⚡ Try 1-Tap Demo Account" button for quick evaluation (`demo / demo`).
   - "WhatsApp Broker Desk" direct chat button.

3. **Native 2-Step Registration with WhatsApp OTP (`AuthScreen.js`):**
   - **Step 1 (Trader Details):** Full Name, WhatsApp Mobile Number with fixed `+91` flag badge, Desired Trader ID, City/Location, Password with visibility toggle, and "📲 Send WhatsApp Verification Code" button.
   - **Step 2 (WhatsApp OTP Verification):** Green shield verification card, target phone display, 6-digit spaced OTP keypad input, 60-second countdown timer with resend button, and "✅ Verify & Activate Account" button.

4. **Multi-Market Trading Terminal (`MainTabs`):**
   - 📊 **Watch:** Live NSE Cash, MCX Futures, and F&O derivatives list with live Socket.IO tick updates, change %, high/low, and fast Buy/Sell action buttons.
   - 📈 **Terminal:** Candlestick chart simulation with interval switcher (1m, 3m, 5m, 15m, 1h, 1D), Level 2 Market Depth (5 Best Bids / 5 Best Asks), and sticky Buy/Sell order tickets.
   - 💼 **Positions:** Live Net M2M P&L indicator, open contracts list, average price, CMP, and 1-tap "Square Off" modal.
   - 📝 **Orders:** Executed, Pending, and Rejected order ledger with timestamps.
   - ⚡ **Dashboard:** Available Margin, Used Margin, Total Account Balance, and Top Gainers & Losers.
   - 👤 **Profile / Account:** Trader User ID, Role badge, Live Gateway connection dot, Server URL configuration, and **"Sign Out / Switch Trader Account"** button.

---

## 🚀 How to Run the React Native App

### Prerequisites
- Node.js (v18+)
- Android Studio with Android SDK 34/35 and an Android Emulator (or a physical Android phone with USB Debugging enabled).

### 1. Install Dependencies
In your terminal, navigate into `tradenova-mobile`:
```bash
cd tradenova-mobile
npm.cmd install
```

### 2. Start the Backend Server (if not already running)
In a separate terminal in the root folder:
```bash
npm.cmd start
# Starts TradeNova Express server on http://localhost:3000
```

### 3. Run on Android
```bash
cd tradenova-mobile
npm.cmd run android
```
> **Tip for Android Emulator:** The app connects to your computer's server at `http://10.0.2.2:3000` by default.  
> **Tip for Physical Phone:** Connect your phone to the same WiFi network and set the server URL in **Account > Server Gateway API** to your computer's IP (e.g., `http://192.168.1.50:3000`).

### 4. Build Standalone Android APK (No PC Required)
To generate a standalone `.apk` to send to your traders via WhatsApp or Telegram:
```bash
cd tradenova-mobile
npm.cmd run build:debug
```
Your output APK will be ready at:
`tradenova-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📁 Project Structure

```
tradenova-mobile/
├── App.js                     # Root entry wrapping providers & navigator
├── app.json                   # App name and display configuration
├── package.json               # React Native dependencies & scripts
├── assets/                    # High-res TradeNova icons & splash assets
├── android/                   # Pure native Android project (Gradle, Manifest)
├── ios/                       # Pure native iOS project (Podfile, AppDelegate)
└── src/
    ├── config.js              # Server URLs and app constants
    ├── theme.js               # Luxury gold & dark mode palette
    ├── services/
    │   ├── api.js             # Axios client with session management
    │   └── socket.js          # Socket.io live market feed client
    ├── context/
    │   ├── AuthContext.js     # User session, login, WhatsApp OTP registration
    │   └── MarketContext.js   # Live ticks, watchlist, orders, and positions
    ├── navigation/
    │   └── RootNavigator.js   # Splash -> Auth -> MainTabs stack
    ├── components/
    │   └── OrderModal.js      # Quick Buy/Sell order placement bottom sheet
    └── screens/
        ├── SplashScreen.js    # Animated splash sequence & session check
        ├── AuthScreen.js      # Sign In & WhatsApp OTP Registration
        ├── WatchScreen.js     # Live NSE & MCX Watchlist
        ├── TerminalScreen.js  # Charts, timeframe intervals, and depth ladder
        ├── PositionsScreen.js # Active positions & M2M square off
        ├── OrdersScreen.js    # Executed & Pending order ledger
        ├── DashboardScreen.js # Margin KPIs & Top Movers
        └── ProfileScreen.js   # Account settings & Sign Out
```
