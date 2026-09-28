import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Both values must come from the same Supabase project. Do not fall back to
// the former project's server-side configuration.
const url = import.meta.env['VITE_SUPABASE_URL'];
const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];

export const supabase = url && anonKey
  ? createClient<Database>(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
