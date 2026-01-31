/**
 * Client-side authentication utilities for API calls
 */
import { createClient, getClient } from '@/utils/supabase/client';

// Cache for authentication data to avoid repeated calls
let cachedAuthData: { token?: string; source: 'jwt' | 'supabase' | 'none' } = { source: 'none' };
let authCacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting for authentication calls
let lastAuthCall = 0;
const MIN_AUTH_INTERVAL = 1000; // 1 second minimum between auth calls

// Use singleton Supabase client to avoid "Multiple GoTrueClient instances" warning
async function getSupabaseClient() {
  return await getClient();
}

/**
 * Get JWT token from cookies
 */
function getJwtFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  try {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'ghostcrm_jwt' && value) {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JWT from cookie:', error);
    return null;
  }
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
    const payload = parseJwtPayload(token);
    
    if (!payload || !payload.exp) {
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('JWT validation error:', error);
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
    return cachedAuthData;
  }
  
  // Rate limiting - prevent excessive auth calls, but only if we have valid auth data
  if (cachedAuthData.source !== 'none' && (now - lastAuthCall) < MIN_AUTH_INTERVAL) {
    return cachedAuthData;
  }
  
  lastAuthCall = now;
  
  try {
    // First, try JWT cookie authentication (primary method)
    const jwtToken = getJwtFromCookie();
    
    if (jwtToken && isJwtValid(jwtToken)) {
      cachedAuthData = { token: jwtToken, source: 'jwt' };
      authCacheTime = now;
      return cachedAuthData;
    }
    
    // Only try Supabase session if JWT is not available
    // and we don't have fresh cache data
    if (cachedAuthData.source === 'none' || (now - authCacheTime) > CACHE_DURATION) {
      const supabase = await getSupabaseClient();
      if (supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!error && session?.access_token) {
          cachedAuthData = { token: session.access_token, source: 'supabase' };
          authCacheTime = now;
          return cachedAuthData;
        }
      }
    }
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
    
    if (authData.source === 'none') {
      return {};
    }
    
    if ((authData.source === 'jwt' || authData.source === 'supabase') && authData.token) {
      return {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting auth headers:', error);
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
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies for JWT auth
      headers: {
        ...authHeaders,
        ...options.headers
      }
    });
    
    // Clear auth cache on 401 to force re-authentication
    if (response.status === 401) {
      cachedAuthData = { source: 'none' };
      authCacheTime = 0;
    }
    
    return response;
  } catch (error) {
    console.error(`Error making authenticated request to ${url}:`, error);
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