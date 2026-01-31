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
      
      // 🚨 CRITICAL FIX: Don't redirect to login from billing flows
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check if we're in any billing flow
      const billingPaths = ['/billing/success', '/billing/cancel', '/billing/'];
      const isBillingFlow = billingPaths.some(path => currentPath.startsWith(path));
      
      // Check if coming from Stripe redirect
      const hasStripeParams = ['session_id', 'payment_intent', 'setup_intent'].some(param => searchParams.has(param));
      
      if (isBillingFlow || hasStripeParams) {
        console.log('🛡️ Refresh token error in billing flow - suppressing redirect');
        return;
      }
      
      // Redirect to login (correct path)
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('❌ [Auth] Failed to handle refresh token error:', error);
  }
}

// Export for emergency cleanup
export { clearClientCache, handleRefreshTokenError };
