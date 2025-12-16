Schritt-für-Schritt: Supabase publishable-key rotieren

WICHTIG: Rotieren Sie sofort den exponierten `publishable`-Key in der Supabase-Konsole bevor Sie die Historie bereinigen oder weiter deployen.

1) Login in Supabase
   - Öffnen Sie https://app.supabase.com und wählen Sie Ihr Projekt.
2) Rotate publishable key
   - Project -> Settings -> API -> "Rotate" für `publishable` key.
   - Notieren Sie den neuen Wert sicher (z. B. Passwortmanager).
3) Update lokale und CI-Umgebungen
   - Aktualisieren Sie `.env` (lokal) und die Umgebungsvariablen in CI/Hosting mit dem neuen `VITE_SUPABASE_PUBLISHABLE_KEY` und ggf. `VITE_SUPABASE_URL`.

   Beispiel `.env`:

   VITE_SUPABASE_URL=https://<dein-projekt>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=public-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

4) Redeploy
   - Nach Update der CI/Hosting-Variablen: neu deployen (Vercel/Netlify/Cloud Run etc.).
5) Test
   - `npm run dev` (lokal) oder nach Deploy: prüfe Login/Logout, ProtectedRoutes, Datenzugriff.
6) Service-Role Keys
   - Falls ein Service-Role Key (`SERVICE_ROLE_KEY`) versehentlich öffentlich war: sofort rotieren (Server-only) und alle Server/Secrets aktualisieren.

Hinweis: Rotation unterbricht etablierte Sessions nur dann, wenn Sie zusätzlich Regelungen aktivieren; dennoch sollten Sie Benutzer-Session-Fehler prüfen.

Schnelle Commands (lokal):

```bash
# setze neue env (Beispiel)
echo "VITE_SUPABASE_URL=https://<proj>.supabase.co" > .env
echo "VITE_SUPABASE_PUBLISHABLE_KEY=public-xxxxx" >> .env
npm run dev
```

Wenn du willst, führe ich die nächsten Schritte zur Git-Historienbereinigung (BFG/git-filter-repo) vorbereitend aus — ich lasse nichts automatisch pushen ohne deine ausdrückliche Zustimmung.