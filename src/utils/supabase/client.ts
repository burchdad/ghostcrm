import { createBrowserClient } from "@supabase/ssr";

// Singleton pattern to prevent multiple client instances
let supabaseClient: any = null;
let clientInitialized = false;

export function createClient() {
  // Double-check locking pattern for thread safety
  if (!supabaseClient && !clientInitialized) {
    clientInitialized = true;
    
    // Only create if we don't already have an instance
    if (!supabaseClient) {
      supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }
  
  return supabaseClient;
}

// Reset function for testing/development
export function resetClient() {
  supabaseClient = null;
  clientInitialized = false;
}
