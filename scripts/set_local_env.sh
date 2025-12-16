#!/usr/bin/env bash
set -euo pipefail

echo "This script creates or updates a local .env file with secrets. It will NOT commit them."

if [ -f .env ]; then
	read -rp ".env already exists. Overwrite? (y/N) " CONF
	if [ "$CONF" != "y" ]; then
		echo "Aborted: .env left unchanged."
		exit 0
	fi
fi

read -rp "VITE_SUPABASE_URL: " VITE_SUPABASE_URL
read -rp "VITE_SUPABASE_PUBLISHABLE_KEY (secret): " VITE_SUPABASE_PUBLISHABLE_KEY
echo
read -rp "SUPABASE_SERVICE_ROLE_KEY (server-only, leave empty if none): " SUPABASE_SERVICE_ROLE_KEY
echo
read -rp "CLOUDFLARE_TUNNEL_TOKEN (optional): " CLOUDFLARE_TUNNEL_TOKEN
echo

cat > .env <<EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
EOF

# Restrict permissions so the file isn't world-readable
chmod 600 .env || true

echo ".env written to $(pwd)/.env (file permissions set to 600)"

echo "IMPORTANT: Do NOT commit .env. It is already included in .gitignore."

echo "Make script executable if desired: chmod +x scripts/set_local_env.sh"
