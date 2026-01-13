// DEPRECATED wrapper — do not create clients here.
// Keep only for backward compatibility while imports are migrated.
export { getBrowserSupabase } from "@/utils/supabase/client";

// legacy names (if old code expects them)
export { createClient, createSupabaseBrowser, getClient } from "@/utils/supabase/client";
