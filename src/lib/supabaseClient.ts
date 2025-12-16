import { createClient } from '@supabase/supabase-js';

// Load from environment variables (Vite exposes VITE_* as import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: !!supabasePublishableKey,
  });
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '');
