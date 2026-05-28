# UberClone — Ride-Hailing Mobile App

> **"Your smoothest rides"**  
> Final Project — Mobile Development 2026-1  
> Tecnológico de Antioquia · Instructor: Paula Andrea Muñoz Correa

---

## Description

Cross-platform mobile app inspired by Uber, built with **React Native CLI** for iOS and Android. It integrates Google APIs and Firebase to deliver a smooth, real-time mobility experience.

---

## Prerequisites

Before cloning the project, make sure you have:

| Tool | Recommended version |
|---|---|
| Node.js | v18 or higher |
| JDK | 17 |
| Android Studio | Flamingo or higher |
| React Native CLI | latest |
| Git | any recent version |

### Environment variables (Windows)

Add these in **System Environment Variables**:

```
ANDROID_HOME = C:\Users\YOUR_USER\AppData\Local\Android\Sdk
```

Add to **PATH**:

```
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

---

## Clone the repository

```bash
git clone https://github.com/JnJsCortVas23/uberClone.git
cd uberClone
```

---

## Install dependencies

Run these commands in order, or use `npm install` to install everything from `package.json`:

**1. Navigation and state:**

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-vector-icons redux @reduxjs/toolkit react-redux
```

**2. Firebase (Auth + Firestore + Storage):**

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```

**3. Google Maps and Places:**

```bash
npm install react-native-maps react-native-google-places-autocomplete
```

**4. Geolocation and directions:**

```bash
npm install react-native-maps react-native-google-places-autocomplete react-native-maps-directions @react-native-community/geolocation
```

**5. Android permissions:**

```bash
npm install react-native-permissions
```

**6. Image picker (profile photo):**

```bash
npm install react-native-image-picker
```

**7. WebView (Mercado Pago payment gateway):**

```bash
npm install react-native-webview
```

---

## Firebase setup

The project uses Firebase for authentication and database. You must add the configuration file:

1. Request `google-services.json` from your teammate
2. Place it at: `android/app/google-services.json`

> This file is **not in the repository** for security reasons. The app will not build correctly without it.

### Firestore rules (trips and history)

Allow authenticated users to read and write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

---

## Google Maps API setup

The project uses Google Maps, Places, and Directions. You need an API key:

1. Request the API key from your team
2. Open `android/app/src/main/AndroidManifest.xml`
3. Replace the value in:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE"/>
```

4. Open `src/screens/TripRequestScreen.js` and replace:

```js
const GOOGLE_API_KEY = 'YOUR_API_KEY_HERE';
```

> Without a valid API key, the map and destination search will not work.

### Enabled APIs

At [console.cloud.google.com](https://console.cloud.google.com), enable:

- Maps SDK for Android
- Places API
- Directions API
- Distance Matrix API
- Geocoding API

Create an API key (unrestricted for development is fine for early testing).

---

## Mercado Pago setup

The app uses Mercado Pago as a digital payment gateway through a WebView:

1. Create an account at [developers.mercadopago.com](https://www.mercadopago.com.co/developers)
2. Create a new application
3. Get your test credentials (Access Token starting with `TEST-`)
4. Open `src/screens/PaymentScreen.js` and replace:

```js
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
```

### Cash payments

Users can also pay **in cash** to the driver. No WebView is required; the trip is saved in Firestore with `paymentMethod: 'cash'`.

---

## Create your working branch

Each team member should work on their own branch:

```bash
git checkout -b feature/your-name
```

Confirm you are on your branch:

```bash
git branch
```

---

## Run the app

You need **two terminals open at the same time**:

**Terminal 1 — Start Metro (wait until it says "Metro waiting on port 8081"):**

```bash
npx react-native start --reset-cache
```

**Terminal 2 — Build and install on the device:**

```bash
npx react-native run-android
```

> On a physical device, enable **USB debugging** in Developer options and connect the cable before running the command.

Verify the device is detected:

```bash
adb devices
```

---

## Project structure

```
UberClone/
├── android/
│   └── app/
│       ├── google-services.json              ← place here (not in repo)
│       └── src/main/AndroidManifest.xml      ← Google Maps API key
├── src/
│   ├── constants/
│   │   ├── colors.js                         # App color palette
│   │   └── index.js
│   ├── navigation/
│   │   └── AppNavigator.js                   # Stack + Bottom Tab Navigator
│   ├── screens/
│   │   ├── SplashScreen.js                   # Splash / loading
│   │   ├── LoginScreen.js                    # Login with validation
│   │   ├── RegisterScreen.js                 # Registration with validation
│   │   ├── HomeScreen.js                     # Home / welcome
│   │   ├── ProfileScreen.js                  # Editable profile (Firestore)
│   │   ├── TripRequestScreen.js              # Map, trip request, dynamic fares
│   │   ├── TrackingScreen.js                 # Real-time trip tracking
│   │   ├── PaymentScreen.js                  # Mercado Pago + cash payments
│   │   └── TripHistoryScreen.js              # Trip history (Firestore)
│   └── services/
│       └── authService.js                    # Firebase Auth + Firestore
├── App.js
├── babel.config.js
└── package.json
```

---

## Color palette

| Color | Hex |
|---|---|
| Primary blue | `#1A73E8` |
| Dark blue | `#0D47A1` |
| White | `#FFFFFF` |
| Background | `#F5F8FF` |

---

## Technologies

- **React Native CLI** — Cross-platform UI
- **Firebase Auth** — User authentication
- **Firebase Firestore** — NoSQL database
- **Firebase Storage** — Profile images
- **Redux Toolkit** — Global state
- **React Navigation** — Stack + Bottom Tabs navigation
- **Google Maps API** — Maps and routes
- **Google Places API** — Destination autocomplete
- **Google Directions API** — Route calculation and drawing
- **Google Distance Matrix API** — ETA and dynamic fare estimates
- **Mercado Pago** — Digital payments (WebView)
- **Cash payments** — Pay driver in cash (Firestore)
- **Git** — Version control

---

## Dynamic fare logic

Prices are calculated in real time from route distance:

| Category | Base fare | Per km |
|---|---|---|
| Economy | $3,500 COP | $1,200 COP |
| XL | $5,000 COP | $1,800 COP |
| Premium | $8,000 COP | $2,500 COP |

---

## Git workflow

```bash
# Always work on your branch
git checkout feature/Your_Name

# Save your changes
git add .
git commit -m "feat: describe what you did in English"
git push

# When your part is ready, notify the team before merging to main
```

> **Do not push directly to `main`**. Push your changes to your feature branch.

---

## Implemented features

- [x] Login with field validation
- [x] Registration with field validation
- [x] Splash screen
- [x] Home screen with user welcome
- [x] Editable user profile (synced with Firestore)
- [x] Trip request with Google Maps + Places Autocomplete + routes
- [x] Dynamic fares based on real distance
- [x] Real-time trip tracking
- [x] Payment gateway (Mercado Pago via WebView)
- [x] Cash payment option
- [x] Trip history (Firestore, client-side sorting)
- [x] README documentation in English

---

## Team

| Name | Branch |
|---|---|
| Cortes | `feature/Cortes` |
| Muñoz | `feature/munos` |
