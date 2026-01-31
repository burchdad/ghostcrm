import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only throw errors at runtime, not during build
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (service role)");
}

// Provide fallback values during build
const safeUrl = url || 'https://placeholder.supabase.co';
const safeServiceKey = serviceKey || 'placeholder-key';

export const supabaseAdmin = createClient(safeUrl, safeServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${safeServiceKey}`,
      apikey: safeServiceKey,
    },
  },
});
