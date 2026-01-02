import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [AUTH-ME] Getting user session...');
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ [AUTH-ME] No authenticated user:', error?.message);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    console.log('✅ [AUTH-ME] User authenticated:', {
      id: user.id,
      email: user.email
    });

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, email, role, organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log('⚠️ [AUTH-ME] Could not fetch user profile:', profileError.message);
    }

    // Get tenant info from user metadata
    const tenantId = user.user_metadata?.tenant_id || userProfile?.organization_id || 'default-org';
    const organizationId = user.user_metadata?.organization_id || userProfile?.organization_id || 'default-org';

    console.log('✅ [AUTH-ME] Returning user data:', {
      id: user.id,
      email: user.email,
      tenantId,
      organizationId
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: userProfile?.role || user.user_metadata?.role || 'user',
        organizationId: organizationId,
        tenantId: tenantId
      }
    });

  } catch (error) {
    console.error('💥 [AUTH-ME] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}