/**
 * Supabase authentication utilities for API routes
 */
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Enhanced user type for server-side auth
 */
export interface ServerAuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  tenantId: string;
  requires_password_reset?: boolean;
}

/**
 * Get authenticated user from Supabase session with profile data
 */
export async function getUserFromRequest(req: NextRequest): Promise<ServerAuthUser | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {}, // No need to set cookies in server utilities
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Try to get user profile from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, role, organization_id, requires_password_reset')
      .eq('id', user.id)
      .single();

    // Extract tenant ID from hostname for subdomain detection
    const url = new URL(req.url);
    const hostname = url.hostname;
    const subdomain = hostname.split('.')[0];
    const detectedTenantId = (subdomain && subdomain !== hostname && !hostname.includes('localhost')) 
      ? subdomain 
      : 'default-org';

    // Build auth user with fallbacks
    const organizationId = userProfile?.organization_id || user.user_metadata?.organization_id || detectedTenantId;
    const role = userProfile?.role || user.user_metadata?.role || (detectedTenantId !== 'default-org' ? 'owner' : 'user');

    return {
      id: user.id,
      email: user.email!,
      role,
      organizationId,
      tenantId: organizationId,
      requires_password_reset: userProfile?.requires_password_reset || false
    };
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }
}

/**
 * Check if request is authenticated (has valid Supabase session)
 */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(req);
  return !!user;
}