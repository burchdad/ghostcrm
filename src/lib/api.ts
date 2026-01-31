import { SupabaseClient } from '@supabase/supabase-js';
import { getClient } from '@/utils/supabase/client';

// Type definitions for returned data
export interface User {
  id: string;
  email: string;
  role?: string;
  requires_password_reset?: boolean; // For enhanced invitation flow
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at?: string;
}

// Get Supabase client using singleton pattern
async function getSupabaseClient(): Promise<SupabaseClient | null> {
  return await getClient();
}

// orgCache removed

// Centralized error handler
function handleError(error: any, context: string): { error: true; message: string; context: string } {
  // Log error to monitoring service here
  console.error(`[API ERROR] ${context}:`, error);
  // Optionally send to external service
  return { error: true, message: error.message || 'Unknown error', context };
}

/**
 * Get online users with pagination, multi-tenancy, and filtering
 * @param orgId Optional organization/team ID for scoping
 * @param limit Max results to return (default 50)
 * @param offset Offset for pagination
 */
export async function getOnlineUsers(limit = 50, offset = 0): Promise<User[] | { error: true; message: string; context: string }> {
  try {
    // Since we don't have online/presence tracking yet, return empty array
    // This prevents the 400 errors while the feature is being implemented
    return [];
    
    // TODO: Implement proper online user tracking with websockets/presence
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('id, email, role')
    //   .range(offset, offset + limit - 1);
    // if (error) return handleError(error, 'getOnlineUsers');
    // return (data as User[]) || [];
  } catch (error: any) {
    return handleError(error, 'getOnlineUsers');
  }
}

/**
 * Get notifications for a user with pagination and sorting
 * @param userId User ID (required)
 * @param limit Max results (default 50)
 * @param offset Offset for pagination
 * @param sortBy Field to sort by (default 'created_at')
 * @param sortOrder 'asc' or 'desc' (default 'desc')
 */
export async function getNotifications(
  userId: string,
  limit = 50,
  offset = 0,
  sortBy: keyof Notification = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<Notification[] | { error: true; message: string; context: string }> {
  if (!userId) return handleError(new Error('Missing userId'), 'getNotifications');
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return handleError(new Error('Supabase client unavailable'), 'getNotifications');
    
    const { data, error } = await supabase
      .from('notifications')
      .select('id, message, read, created_at')
      .eq('user_id', userId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    if (error) return handleError(error, 'getNotifications');
    return (data as Notification[]) || [];
  } catch (error: any) {
    return handleError(error, 'getNotifications');
  }
}

/**
 * Get organizations with caching and search
 * @param search Optional search string for org name
 */
// getOrgs removed
