export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Use Supabase session instead of custom JWT
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        isSoftwareOwner: false, 
        userRole: null,
        error: 'No authentication token' 
      }, { status: 401 });
    }

    const userEmail = user.email;
    const userId = user.id;
    
    if (!userEmail || !userId) {
      return NextResponse.json({ 
        isSoftwareOwner: false, 
        userRole: null,
        error: 'Invalid user session' 
      }, { status: 401 });
    }

    // Check if user is the software owner
    const softwareOwnerEmail = process.env.SOFTWARE_OWNER_EMAIL || 'admin@ghostcrm.com';
    const isSoftwareOwner = userEmail === softwareOwnerEmail;
    
    // Get user profile to check their role from users table (not user_profiles)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users') // 🔧 FIX: Use 'users' table instead of 'user_profiles'
      .select('role, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('⚠️ [OWNER-CHECK] Profile not found:', profileError.message);
    }

    // Check if user is admin or owner role
    const isGlobalAdmin = profile?.role === 'admin' || profile?.role === 'owner';
    
    const result = {
      isSoftwareOwner: isSoftwareOwner || isGlobalAdmin,
      userRole: profile?.role || null,
      isAdmin: isGlobalAdmin,
      userEmail: userEmail,
      softwareOwnerEmail,
      emailMatch: isSoftwareOwner,
      globalAdmin: isGlobalAdmin
    };
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [OWNER-CHECK] Error:', error);
    return NextResponse.json({ 
      isSoftwareOwner: false, 
      userRole: null,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}