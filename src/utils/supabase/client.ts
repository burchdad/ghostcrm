import { createBrowserClient } from "@supabase/ssr";

// Singleton pattern to prevent multiple client instances
let supabaseClient: any = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// Reset function for testing/development
export function resetClient() {
  supabaseClient = null;
}
