import { createBrowserClient } from "@supabase/ssr";

// Singleton pattern to prevent multiple client instances
let supabaseClient: any = null;
let clientInitialized = false;
let initializationPromise: Promise<any> | null = null;

export function createClient() {
  // If already initialized, return existing client
  if (supabaseClient) {
    return supabaseClient;
  }

  // If currently initializing, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  if (!clientInitialized) {
    clientInitialized = true;
    
    initializationPromise = new Promise((resolve) => {
      try {
        if (!supabaseClient) {
          supabaseClient = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              auth: {
                // Use a unique storage key to avoid conflicts
                storageKey: `ghostcrm_auth_${process.env.NODE_ENV}`,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
              }
            }
          );
          
          // Add global error handler for refresh token failures
          supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'TOKEN_REFRESHED') {
              console.log('✅ [Auth] Token refreshed successfully');
            } else if (event === 'SIGNED_OUT') {
              console.log('🔓 [Auth] User signed out');
              // Clear any stale data
              clearClientCache();
            }
          });
          
          // Handle refresh errors globally
          const originalRefreshSession = supabaseClient.auth.refreshSession;
          supabaseClient.auth.refreshSession = async function(...args) {
            try {
              return await originalRefreshSession.apply(this, args);
            } catch (error) {
              console.error('❌ [Auth] Refresh token failed:', error);
              // Force sign out and clear storage on refresh failure
              await handleRefreshTokenError();
              throw error;
            }
          };
        }
        resolve(supabaseClient);
      } catch (error) {
        console.error('❌ [Auth] Failed to create Supabase client:', error);
        clientInitialized = false;
        initializationPromise = null;
        resolve(null);
      }
    });
    
    return initializationPromise;
  }
  
  return supabaseClient;
}

// Handle refresh token errors gracefully
async function handleRefreshTokenError() {
  try {
    console.log('🧹 [Auth] Cleaning up after refresh token error...');
    
    // Clear all auth storage
    if (typeof window !== 'undefined') {
      const storageKeys = [
        `ghostcrm_auth_${process.env.NODE_ENV}`,
        'supabase.auth.token',
        'sb-auth-token',
        'supabase-auth-token'
      ];
      
      storageKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        if (name.trim().includes('supabase') || name.trim().includes('auth')) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      });
    }
    
    // Force page reload to restart auth flow
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      console.log('🔄 [Auth] Redirecting to login...');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('❌ [Auth] Error during cleanup:', error);
  }
}

// Clear client cache
function clearClientCache() {
  console.log('🧹 [Auth] Clearing client cache...');
  // Don't reset the client itself, just clear any cached data
}

// Reset function for testing/development
export function resetClient() {
  supabaseClient = null;
  clientInitialized = false;
  initializationPromise = null;
  
  if (typeof window !== 'undefined') {
    console.log('🔄 [Dev] Supabase client reset');
  }
}

// Check if client is properly initialized
export function isClientReady(): boolean {
  return supabaseClient !== null && clientInitialized;
}

// Get client with error handling
export async function getClient() {
  try {
    const client = createClient();
    if (client instanceof Promise) {
      return await client;
    }
    return client;
  } catch (error) {
    console.error('❌ [Auth] Failed to get Supabase client:', error);
    return null;
  }
}
