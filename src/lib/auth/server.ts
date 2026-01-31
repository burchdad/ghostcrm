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
 * Create a shared Supabase server client for API routes
 */
function createSupabaseServerClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {}, // No need to set cookies in server utilities
      },
    }
  );
}

/**
 * Get authenticated user from Supabase session with profile data
 */
export async function getUserFromRequest(req: NextRequest): Promise<ServerAuthUser | null> {
  const supabase = createSupabaseServerClient(req);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ [AUTH] No user or error:', error?.message);
      return null;
    }

    // Try to get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, organization_id, requires_password_reset')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('⚠️ [AUTH] No user profile found, using fallback:', profileError.message);
    }

    // Extract tenant ID from hostname for subdomain detection
    const url = new URL(req.url);
    const hostname = url.hostname;
    const subdomain = hostname.split('.')[0];
    const detectedTenantId = (subdomain && subdomain !== hostname && !hostname.includes('localhost')) 
      ? subdomain 
      : 'default-org';

    // Build auth user with fallbacks
    let organizationId = userProfile?.organization_id || user.user_metadata?.organization_id || detectedTenantId;
    const role = userProfile?.role || user.user_metadata?.role || (detectedTenantId !== 'default-org' ? 'owner' : 'user');

    // If organizationId is not a UUID (looks like a subdomain), resolve it to organization UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(organizationId)) {
      console.log('🔍 [AUTH] organizationId is not UUID, attempting subdomain lookup:', organizationId);
      
      try {
        // Create service role client for admin operations
        const supabaseAdmin = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll: () => [],
              setAll: () => {}
            }
          }
        );

        // Look up organization by subdomain
        const { data: orgLookup, error: orgError } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('subdomain', organizationId)
          .single();
          
        if (orgLookup && !orgError) {
          console.log('✅ [AUTH] Found organization UUID for subdomain:', {
            subdomain: organizationId,
            organizationUUID: orgLookup.id
          });
          organizationId = orgLookup.id;
        } else {
          console.log('⚠️ [AUTH] No organization found for subdomain, creating:', organizationId);
          
          // Create organization for this subdomain
          try {
            const { data: newOrg, error: createError } = await supabaseAdmin
              .from('organizations')
              .insert({
                name: organizationId.charAt(0).toUpperCase() + organizationId.slice(1),
                subdomain: organizationId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();
              
            if (newOrg && !createError) {
              console.log('✅ [AUTH] Created new organization:', {
                subdomain: organizationId,
                organizationUUID: newOrg.id
              });
              organizationId = newOrg.id;
            } else {
              console.log('❌ [AUTH] Failed to create organization:', createError);
            }
          } catch (createErr) {
            console.log('❌ [AUTH] Error creating organization:', createErr);
          }
        }
      } catch (error) {
        console.log('❌ [AUTH] Error looking up organization by subdomain:', error);
      }
    }

    console.log('✅ [AUTH] User authenticated:', {
      id: user.id,
      email: user.email,
      role,
      organizationId,
      hasProfile: !!userProfile
    });

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
 * Reuses getUserFromRequest to avoid creating multiple Supabase clients
 */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(req);
  return !!user;
}