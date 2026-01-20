export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/auth/profile
 * Get user profile with comprehensive RLS bypass fallbacks
 */
export async function GET(req: NextRequest) {
  try {
    console.log('👤 [PROFILE-API] Fetching user profile...');

    // Get the current user session
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ [PROFILE-API] User not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('🔍 [PROFILE-API] User ID:', user.id);

    // Method 1: Try RPC function to get complete user data
    try {
      console.log('🔧 [PROFILE-API] Trying RPC function get_user_complete_data...');
      
      const { data: completeData, error: rpcError } = await supabaseAdmin
        .rpc('get_user_complete_data', { p_user_id: user.id });

      if (!rpcError && completeData && completeData.length > 0) {
        const userData = completeData[0];
        console.log('✅ [PROFILE-API] Got data from RPC function');
        
        return NextResponse.json({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          organization_id: userData.organization_id,
          tenant_id: userData.tenant_id,
          requires_password_reset: userData.requires_password_reset || false,
          organization_memberships: userData.organization_memberships || [],
          tenant_memberships: userData.tenant_memberships || []
        });
      }

      console.warn('⚠️ [PROFILE-API] RPC function failed or returned no data:', rpcError);
    } catch (rpcException) {
      console.warn('⚠️ [PROFILE-API] RPC function exception:', rpcException);
    }

    // Method 2: Try get_user_profile RPC function
    try {
      console.log('🔧 [PROFILE-API] Trying RPC function get_user_profile...');
      
      const { data: profileData, error: profileRpcError } = await supabaseAdmin
        .rpc('get_user_profile', { p_user_id: user.id });

      if (!profileRpcError && profileData && profileData.length > 0) {
        const userData = profileData[0];
        console.log('✅ [PROFILE-API] Got data from get_user_profile RPC');
        
        return NextResponse.json({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          organization_id: userData.organization_id,
          tenant_id: userData.tenant_id,
          requires_password_reset: userData.requires_password_reset || false
        });
      }

      console.warn('⚠️ [PROFILE-API] get_user_profile RPC failed:', profileRpcError);
    } catch (profileRpcException) {
      console.warn('⚠️ [PROFILE-API] get_user_profile RPC exception:', profileRpcException);
    }

    // Method 3: Try direct admin query on users table
    try {
      console.log('🔧 [PROFILE-API] Trying direct users table query...');
      
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, role, organization_id, tenant_id, requires_password_reset')
        .eq('id', user.id)
        .single();

      if (!userError && userData) {
        console.log('✅ [PROFILE-API] Got data from users table');
        return NextResponse.json(userData);
      }

      console.warn('⚠️ [PROFILE-API] Users table query failed:', userError);
    } catch (userException) {
      console.warn('⚠️ [PROFILE-API] Users table query exception:', userException);
    }

    // Method 4: Try direct admin query on profiles table
    try {
      console.log('🔧 [PROFILE-API] Trying direct profiles table query...');
      
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, organization_id, tenant_id, requires_password_reset')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        console.log('✅ [PROFILE-API] Got data from profiles table');
        return NextResponse.json(profileData);
      }

      console.warn('⚠️ [PROFILE-API] Profiles table query failed:', profileError);
    } catch (profileException) {
      console.warn('⚠️ [PROFILE-API] Profiles table query exception:', profileException);
    }

    // Method 5: Fallback to auth user data only
    console.log('🔧 [PROFILE-API] Falling back to auth user data...');
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: 'owner', // Default role
      organization_id: null,
      tenant_id: null,
      requires_password_reset: false
    });

  } catch (error) {
    console.error('❌ [PROFILE-API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}