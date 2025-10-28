# 🎓 OMED - School Ideas Platform

Willkommen bei der School Ideas Platform! Dies ist ein Reddit-ähnliches Vorschlagssystem für Schulen, das von Grund auf neu entwickelt wurde.

> Hinweis: Dieser Branch ist für Android und bleibt PWA-first (npx/npm-basiert).

Dieses Projekt wurde mit **React, TypeScript, Vite und Tailwind CSS** erstellt und ist so konzipiert, dass es auf verschiedenen Plattformen bereitgestellt werden kann:

-   🌐 **Web (PWA):** Installierbar im Browser (Android-optimiert).
-   🤖 **Android:** Optimal nutzbar als PWA oder optional via Capacitor.
-   🍏 **iOS:** Optional (separat behandeln).

---

## 🚀 Schnellstart

Um das Projekt lokal auszuführen:

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

2.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```

3.  Öffnen Sie http://localhost:3000 in Ihrem Browser.
   - Für Tests auf Android im LAN: http://<Ihre-PC-IP>:3000 (server.host ist aktiviert)

### 🤖 Android (via npx + Capacitor)

```bash
# Einmalig einrichten
npm run build
npx cap init   # App-ID/Name, Web directory: build
npx cap add android

# Bei jeder Änderung
npm run build
npx cap sync
npx cap open android
```

---

## 📚 Dokumentation

Für eine vollständige Anleitung zum Verständnis, zur Bereitstellung und zur Wartung der Anwendung, **beginnen Sie bitte hier:**

➡️ **[START_HERE_README.md](./src/README_START_HERE.md)** ⬅️

Dieses Dokument ist Ihr zentraler Leitfaden für das gesamte Projekt.