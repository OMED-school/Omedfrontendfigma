#!/usr/bin/env bash
set -euo pipefail

# Sicheres, interaktives Skript zur Vorbereitung einer Git-Historienbereinigung.
# Dieses Skript führt keine destruktiven Pushes aus. Es zeigt die Schritte
# und kann lokal ausgeführt werden. Lies die Datei bevor du fortfährst.

REPO_DIR="$(pwd)"
BACKUP_DIR="${REPO_DIR}-backup-$(date +%Y%m%d%H%M%S)"
REPLACEMENTS_FILE="$(dirname "$0")/../tools/bfg-replacements.txt"

echo "Git-Historienbereinigung vorbereiten"
echo "Repository: $REPO_DIR"

if [ ! -f "$REPLACEMENTS_FILE" ]; then
  echo "Fehler: Ersetzer-Datei nicht gefunden: $REPLACEMENTS_FILE"
  exit 1
fi

echo "1) Erstelle ein spiegelbares Bare-Clone (sicherer Backup)"
read -rp "Fortfahren und Backup erstellen? (y/N) " CONF
if [ "$CONF" != "y" ]; then
  echo "Abbruch durch Benutzer."
  exit 0
fi

git clone --mirror "$(git config --get remote.origin.url)" "$BACKUP_DIR"

cat <<-EOF

Backup angelegt: $BACKUP_DIR

2) BFG / git-filter-repo Hinweise
- Du kannst entweder 'git-filter-repo' (empfohlen) oder 'BFG' verwenden.
- Beide verändern die Repo-Historie. Nach Bereinigung musst du FORCE-PUSH
  auf den Remote durchführen (destruktiv!).

EOF

read -rp "Soll ich die Beispiel-Befehle anzeigen (nur anzeigen, nicht ausführen)? (y/N) " CONF2
if [ "$CONF2" = "y" ]; then
  cat <<-CMD

# Beispiel mit BFG (Java erforderlich):
# 1) Klone das Repo lokal als mirror (oben gemacht)
cd "$BACKUP_DIR"
# 2) Entferne Dateien komplett (falls gewünscht)
# bfg --delete-files build/assets/index-B9JwOL5c.js
# 3) Ersetze Texte/Secrets gemäss $REPLACEMENTS_FILE
# bfg --replace-text $REPLACEMENTS_FILE
# 4) Bereinige git und packe neu
git reflog expire --expire=now --all
git gc --prune=now --aggressive
# 5) Prüfe den Mirror und pushe erst wenn du sicher bist:
# git push --force

# Beispiel mit git-filter-repo (Python, empfohlen):
# 1) Falls nicht installiert: pip install git-filter-repo
# 2) Ausführen (Beispiel: ersetze string):
# git -C "$BACKUP_DIR" filter-repo --replace-text "$REPLACEMENTS_FILE"
# 3) Danach:
# git -C "$BACKUP_DIR" reflog expire --expire=now --all
# git -C "$BACKUP_DIR" gc --prune=now --aggressive
# git -C "$BACKUP_DIR" push --force

CMD
fi

echo "Fertig. Lies $BACKUP_DIR und die obigen Befehle. Ich werde nichts automatisch pushen."