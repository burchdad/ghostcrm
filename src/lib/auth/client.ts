/**
 * Client-side authentication utilities for API calls
 */
import { createClient } from '@/utils/supabase/client';

/**
 * Get the current authentication headers for API calls
 * @returns Headers object with Authorization bearer token if authenticated
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      console.warn('No valid session found for API authentication');
      return {};
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
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
  const authHeaders = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  });
}

/**
 * Check if user is currently authenticated
 * @returns Boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && !!session?.access_token;
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
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}