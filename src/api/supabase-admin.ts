/*
Server-side Supabase admin proxy (example)

- Intended to run in a secure server environment (Vercel Serverless, Netlify Functions,
  Cloud Run, Express backend, etc.).
- MUST NOT be bundled into the frontend. Keep `SUPABASE_SERVICE_ROLE_KEY` in server/CI secrets.
- Protect this endpoint with an additional `ADMIN_API_SECRET` header or other auth.

Usage examples (Vercel): put this file under `api/` in a Vercel project or wire it into
an Express server. This is a minimal example to demonstrate using the service role key.
*/

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Helper to get env vars in different runtimes
const getEnv = (name: string): string | undefined => {
  return (process.env as any)[name] ?? undefined;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY'); // server-only
const ADMIN_API_SECRET = getEnv('ADMIN_API_SECRET'); // e.g. a random token you set in server env

if (!SUPABASE_URL) {
  // We don't throw at import time to keep bundlers happy in some environments,
  // but handlers should check and return errors when invoked.
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' });
    return;
  }
  if (!SUPABASE_URL) {
    res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_URL' });
    return;
  }

  // Basic request protection - require a header `x-admin-secret: <ADMIN_API_SECRET>`
  const provided = req.headers['x-admin-secret'] || req.headers['authorization'];
  if (!ADMIN_API_SECRET || !provided || provided !== `Bearer ${ADMIN_API_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Minimal router
    if (req.method === 'GET' && req.url?.includes('/ping')) {
      res.status(200).json({ ok: true });
      return;
    }

    // Example: insert profile record (admin-created)
    if (req.method === 'POST' && req.url?.includes('/profiles')) {
      const body = req.body;
      if (!body || !body.id) {
        res.status(400).json({ error: 'Missing body or id' });
        return;
      }
      const { data, error } = await supabaseAdmin.from('profiles').upsert(body).select().maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    // Fallback
    res.status(404).json({ error: 'Not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
