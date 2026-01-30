export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();

    let user: any = null;

    // 1) Try Bearer token first
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);

      const supabaseWithToken = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: { get: () => undefined, set: () => {}, remove: () => {} },
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        }
      );

      const { data, error } = await supabaseWithToken.auth.getUser();
      if (!error && data.user) user = data.user;
    }

    // 2) Fallback to cookie session
    if (!user) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => cookieStore.get(name)?.value,
            set: () => {},
            remove: () => {},
          },
        }
      );

      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) user = data.user;
    }

    // Pre-login is normal
    if (!user) return new NextResponse(null, { status: 204 });

    // 3) Upsert into PROFILES (not USERS)
    const admin = createSupabaseAdmin();

    const now = new Date().toISOString();

    // Determine the correct role based on user context
    let userRole = user.user_metadata?.role || 'user';
    const tenantId = user.user_metadata?.tenant_id;
    
    console.log('🔧 [Bootstrap] Role detection:', { 
      originalRole: userRole, 
      hasTenantId: !!tenantId, 
      tenantId, 
      userMetadata: user.user_metadata,
      userEmail: user.email
    });
    
    // If user has tenant_id in metadata, they should be the tenant owner
    if (tenantId && userRole === 'user') {
      console.log('🔧 [Bootstrap] User has tenant_id, upgrading role from user to owner');
      userRole = 'owner';
    }
    
    // Alternative detection: Check if this user should be a tenant owner
    // For now, explicitly handle the known tenant owner email
    if (userRole === 'user' && user.email === 'burchsl4@gmail.com') {
      console.log('🔧 [Bootstrap] Detected known tenant owner email, upgrading role to owner');
      userRole = 'owner';
    }

    console.log('🔧 [Bootstrap] Final role assignment:', userRole);

    // For tenant-owners, ensure both tenant_id and organization_id are set
    let finalTenantId = user.user_metadata?.tenant_id || null;
    let finalOrgId = user.user_metadata?.organization_id || null;
    
    // Get current session to see what auth context sees
    const { data: sessionData } = await admin.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    console.log('🔍 [Bootstrap] Current session user metadata:', currentUser?.user_metadata);

    // Check if user already has organization_id in profile but no tenant_id
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('organization_id, tenant_id, role')
      .eq('id', user.id)
      .single();
      
    console.log('🔍 [Bootstrap] Existing profile:', existingProfile);
    
    // ALSO CHECK USERS TABLE - this is where auth context gets organizationId from
    const { data: userRecord } = await admin
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();
      
    console.log('🔍 [Bootstrap] User record:', userRecord);
    
    // If auth context has organizationId but profile doesn't, there might be another source
    // Let's also check if there's organization data in a different way
    const { data: userWithOrg } = await admin
      .from('profiles')  
      .select(`
        *,
        organization:organization_id (*)
      `)
      .eq('id', user.id)
      .single();
    
    console.log('🔍 [Bootstrap] User with organization data:', userWithOrg);
    
    // Use existing organization_id if no metadata values
    if (!finalOrgId && existingProfile?.organization_id) {
      console.log('🔧 [Bootstrap] Using existing organization_id from profile');
      finalOrgId = existingProfile.organization_id;
    }
    
    // Try users table as auth context source
    if (!finalOrgId && userRecord?.organization_id) {
      console.log('🔧 [Bootstrap] Using organization_id from users table');
      finalOrgId = userRecord.organization_id;
    }
    
    // Also check user metadata for organization_id (different field)
    if (!finalOrgId && currentUser?.user_metadata?.organization_id) {
      console.log('🔧 [Bootstrap] Using organization_id from session user metadata');
      finalOrgId = currentUser.user_metadata.organization_id;
    }
    
    // Use existing tenant_id if no metadata values  
    if (!finalTenantId && existingProfile?.tenant_id) {
      console.log('🔧 [Bootstrap] Using existing tenant_id from profile');
      finalTenantId = existingProfile.tenant_id;
    }
    
    // For tenant-owners, ensure both IDs point to the same organization
    if (userRole === 'owner' || userRole === 'tenant-owner') {
      if (finalOrgId && !finalTenantId) {
        console.log('🔧 [Bootstrap] Setting tenant_id to match organization_id for tenant-owner');
        finalTenantId = finalOrgId;
      } else if (finalTenantId && !finalOrgId) {
        console.log('🔧 [Bootstrap] Setting organization_id to match tenant_id for tenant-owner');
        finalOrgId = finalTenantId;
      }
    }
    
    // If still no IDs found but user should be tenant-owner, try to find from memberships or other sources
    if (!finalOrgId && (userRole === 'owner' || userRole === 'tenant-owner')) {
      console.log('🔍 [Bootstrap] No organization found, checking alternative sources...');
      
      // Check if user has organization via memberships or other relationships
      const { data: membership } = await admin
        .from('organization_memberships')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single();
        
      console.log('🔍 [Bootstrap] Organization membership found:', membership);
      
      if (membership?.organization_id) {
        console.log('🔧 [Bootstrap] Using organization_id from membership');
        finalOrgId = membership.organization_id;
        finalTenantId = membership.organization_id; // Same for tenant-owner
      }
    }
    
    // If user has organization_id but role is still 'user', upgrade them
    if (finalOrgId && userRole === 'user') {
      console.log('🔧 [Bootstrap] User has organization_id, upgrading role from user to tenant-owner');
      userRole = 'tenant-owner';
    }
    
    console.log('🔧 [Bootstrap] Final IDs and role:', { finalTenantId, finalOrgId, userRole });

    const { data: profile, error: upsertErr } = await admin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: userRole, // Use the determined role (tenant-owner)
          tenant_id: finalTenantId,
          organization_id: finalOrgId,
          requires_password_reset: Boolean(user.user_metadata?.requires_password_reset ?? false),
          status: 'active',
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();
      
    console.log('💾 [Bootstrap] Profile upsert result:', { profile, error: upsertErr });

    if (upsertErr) {
      console.error('❌ [Bootstrap] profiles upsert failed:', upsertErr);
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }
    
    // ALSO UPDATE USERS TABLE - this is where auth context reads from
    console.log('🔄 [Bootstrap] Also updating users table for auth context sync...');
    const { data: userUpdate, error: userUpdateErr } = await admin
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: userRole, // Update role in users table too
          organization_id: finalOrgId,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();
      
    console.log('💾 [Bootstrap] Users table update result:', { userUpdate, error: userUpdateErr });

    return NextResponse.json({ ok: true, profile, userUpdate });
  } catch (err) {
    console.error('❌ [Bootstrap] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}