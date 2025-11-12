import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Construct the Supabase URL from the project ID
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
