CI / Hosting: How to store Supabase keys and deploy securely

Principles
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the client or in committed files.
- `VITE_SUPABASE_*` keys are embedded at build time into the client bundle and therefore
  should only contain public/publishable values suitable for client usage.
- Use the hosting provider's secret store for production keys (Vercel, Netlify, GitHub Actions secrets).

Vercel (recommended for easy static + serverless)
1. Go to your Project → Settings → Environment Variables.
2. Add variables:
   - `VITE_SUPABASE_URL` = https://<project>.supabase.co
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = public-xxxxx
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role-xxxxx  (Only used by server functions; do NOT expose to client)
   - `ADMIN_API_SECRET` = a random string used to protect server endpoints
3. For `SUPABASE_SERVICE_ROLE_KEY` choose Environment: "Production" and mark as "Encrypted".
4. Deploy — serverless functions will have access to the service key at runtime.

Netlify
1. Site settings → Build & deploy → Environment → Environment variables.
2. Add the same variables as above.
3. Remember: any key starting with `VITE_` will be embedded in built frontend assets.

GitHub Actions example (build & deploy)
- Store secrets in the repository or organization Secrets (Settings → Secrets).
- Example workflow snippet (only an excerpt):

```yaml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
        run: npm run build
      # Deploy step depends on your provider (Vercel, Netlify, etc.)

  deploy-serverless:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy serverless
        env:
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ADMIN_API_SECRET: ${{ secrets.ADMIN_API_SECRET }}
        run: |
          # Run deployment that needs server key (upload function, run migrations, etc.)
          echo "Deploy serverless with service key available at runtime"
```

Notes and best practices
- Do NOT pass `SUPABASE_SERVICE_ROLE_KEY` into the frontend build environment. If you must run server-side code in the same pipeline, ensure that step does not accidentally bundle the key into client assets.
- For local development, use `.env` (in `.gitignore`) or the `scripts/set_local_env.sh` helper.
- Rotate keys when they may have been exposed.

Recommended setup for your repo
- Keep `.env.example` in repo with placeholders.
- Use `scripts/set_local_env.sh` in repo to help contributors create a local `.env` file.
- Store production keys as secrets in the host and never check them into source control.
