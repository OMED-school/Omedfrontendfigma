# 📱 Capacitor iOS + Android Setup - Nächste Schritte

## ✅ Was wurde bereits gemacht:

1. ✅ **Capacitor initialisiert**
   - `capacitor.config.ts` erstellt
   - Android Projekt in `android/` 
   - iOS Projekt in `ios/`

2. ✅ **Nearby Discovery implementiert**
   - `useNearbyDiscovery` Hook für Bluetooth Scanning
   - `DiscoveryMode.tsx` UI Component
   - `/discovery` Route
   - Bluetooth Icon im Header

3. ✅ **Android Permissions konfiguriert**
   - AndroidManifest.xml aktualisiert
   - BLUETOOTH_SCAN, CONNECT, ADVERTISE Permissions
   - Location Permissions für Nearby Discovery

---

## 🚀 Nächste Schritte:

### 1. **iOS Configuration** (Xcode)

```bash
# Öffne das iOS Projekt
npx cap open ios
```

Dann in Xcode:
1. Wähle das `App` Target
2. Gehe zu: Build Settings → Signing
3. Team auswählen
4. Product → Scheme → Edit Scheme → Run → Pre-actions:
   ```bash
   bash scripts/setup-ios-bluetooth.sh
   ```

### 2. **Android Test**

```bash
# Android Emulator oder Device über USB
npx cap run android
```

### 3. **iOS Test** 

```bash
npx cap run ios
```

---

## 📋 Aktuelle Struktur:

```
/android                          # Android Studio Project
  └── app/src/main/
      └── AndroidManifest.xml     # ✅ Bluetooth Permissions konfiguriert

/ios                              # Xcode Project  
  └── App/App/
      └── Info.plist              # ⚠️ Braucht Bluetooth Permissions

/src
  ├── pages/Discovery.tsx          # ✅ Discovery Page
  ├── components/DiscoveryMode.tsx # ✅ UI Components
  └── hooks/useNearbyDiscovery.ts  # ✅ Bluetooth Hook

/scripts
  └── setup-ios-bluetooth.sh       # ✅ iOS Config Script
```

---

## 🔧 Bluetooth Funktionen:

| Feature | Status | Platform |
|---------|--------|----------|
| **Scan Nearby** | ✅ Implementiert | Android/iOS (Web BT API) |
| **Auto-Befriend** | ✅ Implementiert | Android/iOS |
| **Advertise** | ✅ UI | iOS braucht native Code |
| **Signal Strength** | ✅ UI | Android besser |
| **Auto-Add to Friends** | ✅ Implementiert | Datenbank |

---

## 📦 App Store Release:

### Google Play Store:
```bash
# Release APK bauen in Android Studio
# Build → Generate Signed Bundle / APK
# Choose Release variant
# Upload zu Play Store Console
```

**Kosten:** $25 einmalig

### Apple App Store:
```bash
# Archive in Xcode
# Product → Archive
# Upload in Transporter
```

**Kosten:** $99/Jahr

---

## 🐛 Debugging:

### Android:
```bash
# Logs schauen
adb logcat | grep "Capacitor"

# Gerät debuggen
npx cap run android --livereload
```

### iOS:
```bash
# In Xcode: Console Tab
# Bei Fehlern: Edit Scheme → Diagnostics → Logging
```

---

## 💡 Tipps für Produktion:

1. **Icons:** Erstelle App Icons für beide Plattformen (1024x1024px)
2. **Screenshots:** Für Store braucht man 2-5 Screenshots
3. **Privacy Policy:** Braucht man für beide Stores
4. **Release Notes:** Mit jedem Update
5. **Testing:** TestFlight für iOS, Internal Testing für Android

---

## 🎯 Bluetooth Limitations:

- **iOS:** Web Bluetooth funktioniert begrenzt, native Implementierung empfohlen
- **Android:** Web Bluetooth API funktioniert besser, aber braucht User Permission
- **Hintergrund:** Beide Systeme erlauben Bluetooth im Hintergrund mit spezieller Config
- **Range:** ~100m bei BLE, stark abhängig von Umgebung

---

**Status:** ✅ Ready für Testing! 🚀
