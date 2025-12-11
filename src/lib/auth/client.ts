/**
 * Client-side authentication utilities for API calls
 */
import { createClient } from '@/utils/supabase/client';

// Cache for authentication data to avoid repeated calls
let cachedAuthData: { token?: string; source: 'jwt' | 'supabase' | 'none' } = { source: 'none' };
let authCacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Get JWT token from cookies
 */
function getJwtFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'ghostcrm_jwt') {
      return value;
    }
  }
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
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Get cached authentication data or fetch fresh data if cache is stale
 */
async function getCachedAuthData() {
  const now = Date.now();
  
  // Return cached auth data if it's still fresh
  if (cachedAuthData.source !== 'none' && (now - authCacheTime) < CACHE_DURATION) {
    return cachedAuthData;
  }
  
  try {
    // First, try JWT cookie authentication (primary method)
    const jwtToken = getJwtFromCookie();
    if (jwtToken && isJwtValid(jwtToken)) {
      console.debug('Authentication via JWT cookie successful');
      cachedAuthData = { token: jwtToken, source: 'jwt' };
      authCacheTime = now;
      return cachedAuthData;
    }
    
    // Fallback to Supabase session
    console.debug('JWT cookie not found or invalid, trying Supabase session...');
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!error && session?.access_token) {
      console.debug('Authentication via Supabase session successful');
      cachedAuthData = { token: session.access_token, source: 'supabase' };
      authCacheTime = now;
      return cachedAuthData;
    }
    
    console.debug('No valid authentication found');
    cachedAuthData = { source: 'none' };
    return cachedAuthData;
    
  } catch (error) {
    console.error('Error fetching authentication data:', error);
    cachedAuthData = { source: 'none' };
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
      console.debug('No authentication available for API call');
      return {};
    }
    
    if (authData.source === 'jwt' && authData.token) {
      console.debug('Using JWT Bearer token for API call');
      return {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      };
    }
    
    if (authData.source === 'supabase' && authData.token) {
      console.debug('Using Supabase Bearer token for API call');
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
    
    console.debug(`Making API request to ${url} with auth type: ${authData.source}`);
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies for JWT auth
      headers: {
        ...authHeaders,
        ...options.headers
      }
    });

    // Log response status for debugging
    console.debug(`API response from ${url}: ${response.status} ${response.statusText}`);
    
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