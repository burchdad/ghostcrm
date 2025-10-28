import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration with runtime validation
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }

  // Allow placeholder values during build process
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
    // For preview builds, allow placeholder values
    console.warn('Using placeholder Supabase credentials for preview build');
  } else if (supabaseServiceKey.startsWith("placeholder") || supabaseServiceKey === "sb_secret_FSTLepb2jwJ3jCNJy78MsQ_OKKFZud0_PLACEHOLDER") {
    // For build process or development with placeholder values, create a mock client
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Using placeholder Supabase credentials for build/development');
      return { 
        supabaseUrl: supabaseUrl || 'https://placeholder.supabase.co', 
        supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.placeholder_service_role_key_for_build_process_only'
      };
    }
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be a valid service role key (not placeholder)");
  }

  return { supabaseUrl, supabaseServiceKey };
}

// Create admin client with validated configuration
const config = getSupabaseConfig();
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  { auth: { persistSession: false } }
);
