import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserSupabase() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
  }
  return browserClient
}

// Legacy exports for backward compatibility
export function createClient() {
  return getBrowserSupabase()
}

export function createSupabaseBrowser() {
  return getBrowserSupabase()
}

// Get client with error handling (async version for compatibility)
export async function getClient() {
  try {
    return getBrowserSupabase();
  } catch (error) {
    console.error('❌ [Auth] Failed to get Supabase client:', error);
    return null;
  }
}

// Clear client cache on sign out
function clearClientCache() {
  browserClient = null;
}

// Handle refresh token errors
async function handleRefreshTokenError() {
  try {
    // Clear all auth storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ghostcrm_auth');
      localStorage.removeItem('sb-ghostcrm-auth-token');
      sessionStorage.clear();
      
      // Clear client cache
      clearClientCache();
      
      // 🚨 CRITICAL FIX: Don't redirect to login from billing success page
      const currentPath = window.location.pathname;
      if (currentPath === '/billing/success') {
        console.log('🛡️ Refresh token error on billing success page - suppressing redirect');
        return;
      }
      
      // Redirect to login
      window.location.href = '/auth/login';
    }
  } catch (error) {
    console.error('❌ [Auth] Failed to handle refresh token error:', error);
  }
}

// Export for emergency cleanup
export { clearClientCache, handleRefreshTokenError };
