/**
 * Supabase-only client-side authentication utilities
 */
import { getBrowserSupabase } from '@/utils/supabase/client';

// Cache for authentication data to avoid repeated calls
let cachedAuthData: { user?: any; session?: any; source: 'supabase' | 'none' } = { source: 'none' };
let authCacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting for authentication calls
let lastAuthCall = 0;
const MIN_AUTH_INTERVAL = 1000; // 1 second minimum between auth calls

/**
 * Get Supabase client singleton
 */
async function getSupabaseClient() {
  return getBrowserSupabase();
}

/**
 * Get current authenticated user from Supabase session
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('[AUTH] Error getting user:', error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('[AUTH] Error in getAuthenticatedUser:', error);
    return null;
  }
}

/**
 * Get current session with caching
 */
async function getCachedAuthData() {
  const now = Date.now();
  
  // Return cached auth data if it's still fresh
  if (cachedAuthData.source !== 'none' && (now - authCacheTime) < CACHE_DURATION) {
    return cachedAuthData;
  }
  
  // Rate limiting - prevent excessive auth calls
  if (cachedAuthData.source !== 'none' && (now - lastAuthCall) < MIN_AUTH_INTERVAL) {
    return cachedAuthData;
  }
  
  lastAuthCall = now;
  
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      cachedAuthData = { source: 'none' };
      authCacheTime = now;
      return cachedAuthData;
    }

    const { data: { session, user }, error } = await supabase.auth.getSession();
    
    if (!error && session && user) {
      cachedAuthData = { user, session, source: 'supabase' };
      authCacheTime = now;
      return cachedAuthData;
    }
    
    cachedAuthData = { source: 'none' };
    authCacheTime = now;
    return cachedAuthData;
    
  } catch (error) {
    console.error('[AUTH] Error fetching authentication data:', error);
    cachedAuthData = { source: 'none' };
    authCacheTime = now;
    return cachedAuthData;
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const authData = await getCachedAuthData();
  return authData.source === 'supabase' && !!authData.user;
}

/**
 * Get authentication headers for API calls (optional - usually not needed with cookies)
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const authData = await getCachedAuthData();
    
    if (authData.source === 'supabase' && authData.session?.access_token) {
      return {
        'Authorization': `Bearer ${authData.session.access_token}`
      };
    }
    
    return {};
  } catch (error) {
    console.error('[AUTH] Error getting auth headers:', error);
    return {};
  }
}

/**
 * Enhanced fetch with automatic authentication
 * Uses cookies by default - headers are optional for external APIs
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  try {
    // Ensure credentials are included for same-origin requests
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include', // This sends cookies automatically
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // For external APIs, you might want to add Authorization header
    // const authHeaders = await getAuthHeaders();
    // fetchOptions.headers = { ...fetchOptions.headers, ...authHeaders };

    const response = await fetch(url, fetchOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.warn('[AUTH] Unauthorized response, clearing cache');
      clearAuthCache();
    }
    
    return response;
  } catch (error) {
    console.error('[AUTH] Error in authenticatedFetch:', error);
    throw error;
  }
}

/**
 * Clear authentication cache
 */
export function clearAuthCache() {
  cachedAuthData = { source: 'none' };
  authCacheTime = 0;
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const supabase = await getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAuthCache();
  } catch (error) {
    console.error('[AUTH] Error during sign out:', error);
  }
}