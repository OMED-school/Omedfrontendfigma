# Mobile App Deployment Guide

Dieser Branch ist Android-orientiert und bleibt PWA-first (ohne Zwang zu Capacitor).

## Quick Android via npx

```bash
# Erstaufbau
npm run build
npx cap init           # Web directory: build
npx cap add android

# Zyklen
npm run build
npx cap sync
npx cap open android   # Öffnet Android Studio
```

## Current Status: ✅ PWA Ready!

Your app is now a **Progressive Web App (PWA)** that can be installed on Android devices directly from the browser.

---

## Option 1: PWA (Progressive Web App) ⭐ EASIEST

### What is a PWA?
A PWA allows users to install your web app on their phone like a native app, with offline support and home screen access.

### ✅ Already Configured!

Your app now includes:
- `manifest.json` - App metadata and icons
- `service-worker.js` - Offline functionality and caching
- Install prompt component - Prompts users to install

### How Users Install:

**On Android (Chrome/Edge):**
1. Visit your website
2. See the "Install School Ideas" banner at the bottom
3. Click "Install" button
4. App appears on home screen!

**Or manually:**
1. Open site in Chrome
2. Tap the three dots menu (⋮)
3. Tap "Add to Home screen" or "Install app"

### Requirements for PWA:
- ✅ HTTPS (required for service workers)
- ✅ manifest.json (already created)
- ✅ Service worker (already created)
- ⚠️ Icons needed (see below)

### Creating App Icons:

You need to create icon images and place them in `/public/icons/`:

**Required sizes:**
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Easy way to create icons:**
1. Design a single 512x512px icon
2. Use a tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):
   ```bash
   npx @pwa/asset-generator logo.png public/icons
   ```

---

## Option 2: Capacitor (For Google Play Store) ⭐⭐⭐ RECOMMENDED

Capacitor wraps your web app as a native Android/iOS app that can be published to app stores.

### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```
When prompted:
- **App name:** School Ideas
- **App ID:** com.yourschool.ideas (use reverse domain)
- **Web directory:** build

### Step 2: Build Your Web App

```bash
npm run build
```

### Step 3: Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder with a complete Android Studio project.

### Step 4: Copy Web Assets

```bash
npx cap sync
```

Run this every time you rebuild your web app.

### Step 5: Open in Android Studio

```bash
npx cap open android
```

### Step 6: Configure for Android

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <application
        android:label="School Ideas"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme">
        <!-- Your activities -->
    </application>
</manifest>
```

### Step 7: Generate App Icons for Android

Use Android Studio's Image Asset Studio:
1. In Android Studio: Right-click `res` → New → Image Asset
2. Upload your 512x512px icon
3. Generate all sizes automatically

### Step 8: Test on Device

**Connect Android device via USB:**
```bash
# Enable USB debugging on your phone first
npx cap run android
```

**Or use emulator:**
1. Open Android Studio
2. Create virtual device in AVD Manager
3. Click "Run" button

### Step 9: Build Release APK

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Choose APK
3. Create new keystore (save it securely!)
4. Fill in keystore details
5. Choose release build variant
6. Click Finish

The APK will be in: `android/app/release/app-release.apk`

### Step 10: Publish to Google Play Store

1. Create a developer account ($25 one-time fee)
2. Go to [Google Play Console](https://play.google.com/console)
3. Create new app
4. Fill in app details:
   - Title: School Ideas
   - Description: Student suggestion platform for school improvements
   - Category: Education
   - Content rating: Everyone
5. Upload screenshots (required):
   - Phone screenshots (at least 2)
   - Tablet screenshots (recommended)
6. Upload your APK or AAB (Android App Bundle - preferred)
7. Set pricing (Free recommended)
8. Complete content rating questionnaire
9. Submit for review

### Updating Your App:

```bash
# 1. Make changes to your React code
# 2. Build web app
npm run build

# 3. Sync with Capacitor
npx cap sync

# 4. Build new release APK/AAB
# (Use Android Studio or command line)

# 5. Upload new version to Play Store
```

---

## Option 3: Capacitor for iOS (Apple App Store)

### Requirements:
- Mac computer (required for iOS development)
- Xcode installed
- Apple Developer account ($99/year)

### Steps:

```bash
# Add iOS platform
npm install @capacitor/ios
npx cap add ios

# Open in Xcode
npx cap open ios
```

Then follow similar process as Android in Xcode.

---

## Accessing Native Features with Capacitor

Capacitor gives you access to native device features:

### Camera Access

```bash
npm install @capacitor/camera
```

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  
  const imageUrl = image.webPath;
  // Use the image URL in your app
};
```

### Push Notifications

```bash
npm install @capacitor/push-notifications
```

### Local Notifications

```bash
npm install @capacitor/local-notifications
```

### Geolocation

```bash
npm install @capacitor/geolocation
```

### Storage

```bash
npm install @capacitor/preferences
```

---

## Comparison: PWA vs Capacitor

| Feature | PWA | Capacitor |
|---------|-----|-----------|
| **Ease of Setup** | ✅ Very Easy | ⚠️ Moderate |
| **Distribution** | Via website only | ✅ App stores |
| **Installation** | Browser prompt | ✅ App store |
| **Offline Support** | ✅ Yes | ✅ Yes |
| **Native Features** | ⚠️ Limited | ✅ Full access |
| **Updates** | ✅ Automatic | Manual (via store) |
| **iOS Support** | ⚠️ Limited | ✅ Full |
| **Cost** | ✅ Free | $25-$99/year |
| **App Discoverability** | ⚠️ SEO only | ✅ App store search |

---

## Recommended Approach

### For Testing & Internal Use:
→ **Use PWA** (already set up!)

### For Public Release:
→ **Use Capacitor** (both PWA + app store)

You can have both! Keep the PWA for web users and create a Capacitor app for app store distribution.

---

## Testing Your PWA Right Now

1. **Build your app:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Use ngrok to test on phone:**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose your local server
   ngrok http 4173
   ```

3. **Visit the ngrok URL on your Android phone**

4. **You'll see the install prompt!**

---

## Common Issues & Solutions

### PWA Install Button Not Showing:
- Ensure you're using HTTPS (or localhost)
- Check manifest.json is accessible at `/manifest.json`
- Verify service worker is registered (check DevTools → Application)
- Icons must be available

### Capacitor Build Errors:
- Run `npx cap sync` after every web app rebuild
- Clear Android Studio cache: File → Invalidate Caches
- Check Android SDK is installed correctly

### App Not Working Offline:
- Check service worker is registered
- Verify cache strategy in service-worker.js
- Test in incognito mode (clears cache)

---

## Next Steps

1. **Create app icons** (512x512px logo)
2. **Test PWA** on Android device
3. **If you need app store:** Set up Capacitor
4. **Add native features** as needed (camera, push notifications)

Your app is already PWA-ready! Users can install it right now if you deploy it to a website with HTTPS.

For questions or issues, check:
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
