# 🎓 OMED - School Ideas Platform

Willkommen bei der School Ideas Platform! Dies ist ein Reddit-ähnliches Vorschlagssystem für Schulen, das von Grund auf neu entwickelt wurde.

Dieses Projekt wurde mit **React, TypeScript, Vite und Tailwind CSS** erstellt und nutzt **Supabase** als Backend-Plattform. Es ist so konzipiert, dass es auf verschiedenen Plattformen bereitgestellt werden kann:

-   🌐 **Web:** Als Progressive Web App (PWA), die direkt im Browser installiert werden kann.
-   🤖 **Android:** Als native App, die im Google Play Store veröffentlicht werden kann.
-   🍏 **iOS:** Als native App, die im Apple App Store veröffentlicht werden kann.

---

## 🚀 Schnellstart

### Erste Schritte

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

2.  **Supabase Backend einrichten:**
    
    ⚠️ **Wichtig:** Die App benötigt eine Supabase-Datenbank, um zu funktionieren.
    
    Folgen Sie der vollständigen Anleitung in:
    
    ➡️ **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** ⬅️
    
    Diese enthält:
    - Erstellung eines Supabase-Projekts
    - Datenbank-Schema-Setup
    - Authentifizierungskonfiguration
    - Konfiguration der Projektanmeldeinformationen

3.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```

4.  Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

---

## 📚 Dokumentation

### Wichtige Dokumente

- 📖 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Backend-Einrichtung (erforderlich!)
- 📖 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration von Mock-Daten zu Supabase
- 📖 **[START_HERE_README.md](./src/README_START_HERE.md)** - Vollständiger Projektleitfaden

### Was ist neu? 🎉

Die App wurde von Mock-Daten auf eine vollständige Supabase-Integration migriert:

✅ **Echte Benutzerauthentifizierung** - Keine gefälschten Anmeldungen mehr
✅ **Persistente Datenspeicherung** - Daten bleiben erhalten
✅ **Echtzeit-Updates** - Änderungen erscheinen sofort bei allen Benutzern
✅ **Produktionsbereit** - Enterprise-Grade-Backend-Infrastruktur
✅ **Sichere Zugriffskontrolle** - Rollenbasierte Berechtigungen (Student, Lehrer, Direktor)

---

## 🏗️ Tech Stack

- **Frontend:** React 18.3, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **UI Components:** Shadcn/ui, Radix UI
- **Icons:** Lucide React

---

## 🔑 Hauptfunktionen

- 👥 **Benutzerauthentifizierung** - Registrierung, Anmeldung, Profilverwaltung
- 💡 **Ideeneinreichung** - Studenten können Verbesserungsvorschläge einreichen
- 🗳️ **Abstimmungssystem** - Upvote/Downvote für Ideen
- 💬 **Kommentare** - Verschachtelte Diskussionen zu Ideen
- 👨‍🏫 **Lehrer-Dashboard** - Ideen überprüfen, genehmigen oder zur Prüfung weiterleiten
- 👔 **Direktor-Dashboard** - Endgültige Genehmigung mit Budget und Zeitplan
- 💬 **Chat-System** - Echtzeitnachrichten zwischen Benutzern
- 📱 **PWA-Unterstützung** - Installierbar auf jedem Gerät

---

## 📦 Installation und Bereitstellung

Für eine vollständige Anleitung zum Verständnis, zur Bereitstellung und zur Wartung der Anwendung, **beginnen Sie bitte hier:**

➡️ **[START_HERE_README.md](./src/README_START_HERE.md)** ⬅️

Dieses Dokument ist Ihr zentraler Leitfaden für das gesamte Projekt.

---

## 🛠️ Entwicklung

### Voraussetzungen
- Node.js 18 oder höher
- npm oder yarn
- Ein Supabase-Konto

### Lokale Entwicklung
```bash
# Abhängigkeiten installieren
npm install

# Backend einrichten (siehe SUPABASE_SETUP.md)
# ...

# Entwicklungsserver starten
npm run dev

# Produktion bauen
npm run build
```

---

## 📝 Lizenz

Dieses Projekt ist ein Schulprojekt. Fühlen Sie sich frei:
- ✅ Es in Ihrer Schule zu verwenden
- ✅ Es zu modifizieren und anzupassen
- ✅ Es kommerziell bereitzustellen
- ✅ Es mit anderen zu teilen

---

**Bereit loszulegen?** Beginnen Sie mit [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)!

*Erstellt mit ❤️ für Schüler, Lehrer und Schulen*
