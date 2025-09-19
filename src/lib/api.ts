import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type definitions for returned data
export interface User {
  id: string;
  name: string;
  online: boolean;
  org_id?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
}

// Config validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing: Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Simple in-memory cache for orgs (can be replaced with Redis etc.)
let orgCache: Organization[] | null = null;
let orgCacheTimestamp: number = 0;
const ORG_CACHE_TTL = 60 * 1000; // 1 minute

// Centralized error handler & audit logger
function handleError(error: any, context: string): { error: true; message: string; context: string } {
  // Log error to monitoring service here
  console.error(`[API ERROR] ${context}:`, error);
  // Optionally send to external service
  return { error: true, message: error.message || 'Unknown error', context };
}

function auditLog(action: string, details?: any) {
  // Log API call for compliance/debugging
  // Replace with real logging service if needed
  console.info(`[API AUDIT] ${action}`, details);
}

/**
 * Get online users with pagination, multi-tenancy, and filtering
 * @param orgId Optional organization/team ID for scoping
 * @param limit Max results to return (default 50)
 * @param offset Offset for pagination
 */
export async function getOnlineUsers(orgId?: string, limit = 50, offset = 0): Promise<User[] | { error: true; message: string; context: string }> {
  auditLog('getOnlineUsers', { orgId, limit, offset });
  try {
    let query = supabase
      .from('users')
      .select('id, name, online, org_id')
      .eq('online', true)
      .range(offset, offset + limit - 1);
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) return handleError(error, 'getOnlineUsers');
    return (data as User[]) || [];
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
  auditLog('getNotifications', { userId, limit, offset, sortBy, sortOrder });
  if (!userId) return handleError(new Error('Missing userId'), 'getNotifications');
  try {
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
export async function getOrgs(search?: string): Promise<Organization[] | { error: true; message: string; context: string }> {
  auditLog('getOrgs', { search });
  const now = Date.now();
  if (orgCache && now - orgCacheTimestamp < ORG_CACHE_TTL && !search) {
    return orgCache;
  }
  try {
    let query = supabase
      .from('organizations')
      .select('id, name');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) return handleError(error, 'getOrgs');
    orgCache = (data as Organization[]) || [];
    orgCacheTimestamp = now;
    return orgCache;
  } catch (error: any) {
    return handleError(error, 'getOrgs');
  }
}
