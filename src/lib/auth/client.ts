/**
 * Client-side authentication utilities for API calls
 */
import { createClient } from '@/utils/supabase/client';

// Cache for authentication data to avoid repeated calls
let cachedAuthData: { token?: string; source: 'jwt' | 'supabase' | 'none' } = { source: 'none' };
let authCacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting for authentication calls
let lastAuthCall = 0;
const MIN_AUTH_INTERVAL = 1000; // 1 second minimum between auth calls

// Singleton Supabase client to avoid "Multiple GoTrueClient instances" warning
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

/**
 * Get JWT token from cookies
 */
function getJwtFromCookie(): string | null {
  if (typeof document === 'undefined') {
    console.log('[AUTH_DEBUG] getJwtFromCookie: document undefined (SSR)');
    return null;
  }
  
  const cookies = document.cookie.split(';');
  console.log('[AUTH_DEBUG] All cookies:', document.cookie);
  console.log('[AUTH_DEBUG] Cookie count:', cookies.length);
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    console.log('[AUTH_DEBUG] Checking cookie:', name, 'has value:', !!value);
    if (name === 'ghostcrm_jwt') {
      console.log('[AUTH_DEBUG] Found JWT cookie, length:', value?.length || 0);
      console.log('[AUTH_DEBUG] JWT cookie value preview:', value?.substring(0, 50) + '...');
      return decodeURIComponent(value); // Make sure to decode the cookie value
    }
  }
  
  console.log('[AUTH_DEBUG] No JWT cookie found');
  return null;
}

/**
 * Parse JWT payload without verification (for client-side use only)
 */
function parseJwtPayload(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing JWT payload:', error);
    return null;
  }
}

/**
 * Check if JWT token is still valid (not expired)
 */
function isJwtValid(token: string): boolean {
  try {
    console.log('[AUTH_DEBUG] Validating JWT token, length:', token?.length);
    const payload = parseJwtPayload(token);
    console.log('[AUTH_DEBUG] JWT payload:', payload);
    
    if (!payload || !payload.exp) {
      console.log('[AUTH_DEBUG] JWT invalid: no payload or expiration');
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > currentTime;
    console.log('[AUTH_DEBUG] JWT expiration check:', {
      exp: payload.exp,
      current: currentTime,
      valid: isValid
    });
    
    return isValid;
  } catch (error) {
    console.log('[AUTH_DEBUG] JWT validation error:', error);
    return false;
  }
}

/**
 * Get cached authentication data or fetch fresh data if cache is stale
 */
async function getCachedAuthData() {
  const now = Date.now();
  
  // Return cached auth data if it's still fresh and valid
  if (cachedAuthData.source !== 'none' && (now - authCacheTime) < CACHE_DURATION) {
    console.log('[AUTH_DEBUG] Returning fresh cached auth data:', cachedAuthData);
    return cachedAuthData;
  }
  
  // Rate limiting - prevent excessive auth calls, but only if we have valid auth data
  if (cachedAuthData.source !== 'none' && (now - lastAuthCall) < MIN_AUTH_INTERVAL) {
    console.log('[AUTH_DEBUG] Rate limited: returning cached auth data:', cachedAuthData);
    return cachedAuthData;
  }
  
  lastAuthCall = now;
  
  try {
    // First, try JWT cookie authentication (primary method)
    const jwtToken = getJwtFromCookie();
    console.log('[AUTH_DEBUG] JWT token from cookie:', jwtToken ? `Found (${jwtToken.length} chars)` : 'Not found');
    
    if (jwtToken && isJwtValid(jwtToken)) {
      console.log('[AUTH_DEBUG] JWT validation successful');
      cachedAuthData = { token: jwtToken, source: 'jwt' };
      authCacheTime = now;
      return cachedAuthData;
    }
    
    // Only try Supabase session if JWT is not available
    // and we don't have fresh cache data
    if (cachedAuthData.source === 'none' || (now - authCacheTime) > CACHE_DURATION) {
      console.log('[AUTH_DEBUG] JWT cookie not found or invalid, trying Supabase session...');
      const supabase = getSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!error && session?.access_token) {
        console.log('[AUTH_DEBUG] Supabase session successful');
        cachedAuthData = { token: session.access_token, source: 'supabase' };
        authCacheTime = now;
        return cachedAuthData;
      }
    }
    
    console.log('[AUTH_DEBUG] No valid authentication found');
    cachedAuthData = { source: 'none' };
    authCacheTime = now;
    return cachedAuthData;
    
  } catch (error) {
    console.error('[AUTH_DEBUG] Error fetching authentication data:', error);
    cachedAuthData = { source: 'none' };
    authCacheTime = now;
    return cachedAuthData;
  }
}

/**
 * Clear authentication cache (useful after logout)
 */
export function clearAuthCache() {
  cachedAuthData = { source: 'none' };
  authCacheTime = 0;
}

/**
 * Get the current authentication headers for API calls
 * @returns Headers object with Authorization bearer token if authenticated
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const authData = await getCachedAuthData();
    
    console.log('[AUTH_DEBUG] getAuthHeaders - authData:', authData);
    
    if (authData.source === 'none') {
      console.log('[AUTH_DEBUG] No authentication available for API call');
      return {};
    }
    
    if (authData.source === 'jwt' && authData.token) {
      console.log('[AUTH_DEBUG] Using JWT Bearer token for API call, token length:', authData.token.length);
      return {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      };
    }
    
    if (authData.source === 'supabase' && authData.token) {
      console.log('[AUTH_DEBUG] Using Supabase Bearer token for API call');
      return {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      };
    }
    
    console.log('[AUTH_DEBUG] No valid auth source found');
    return {};
  } catch (error) {
    console.error('[AUTH_DEBUG] Error getting auth headers:', error);
    return {};
  }
}

/**
 * Make an authenticated API request
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Fetch response
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    const authData = await getCachedAuthData();
    const authHeaders = await getAuthHeaders();
    
    console.log('[AUTH_DEBUG] Making API request to', url);
    console.log('[AUTH_DEBUG] Auth data:', authData);
    console.log('[AUTH_DEBUG] Auth headers:', authHeaders);
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies for JWT auth
      headers: {
        ...authHeaders,
        ...options.headers
      }
    });

    console.log('[AUTH_DEBUG] Response status:', response.status, response.statusText);
    
    return response;
  } catch (error) {
    console.error(`[AUTH_DEBUG] Error making authenticated request to ${url}:`, error);
    throw error;
  }
}

/**
 * Check if user is currently authenticated
 * @returns Boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const authData = await getCachedAuthData();
    return authData.source !== 'none';
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

/**
 * Get the current user's access token
 * @returns Access token string or null if not authenticated
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const authData = await getCachedAuthData();
    
    if (authData.source === 'supabase') {
      return authData.token || null;
    }
    
    if (authData.source === 'jwt') {
      // For JWT, we don't expose the raw token, but indicate authentication
      return 'jwt-authenticated';
    }
    
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}