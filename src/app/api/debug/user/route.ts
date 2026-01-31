export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/debug/user?email=user@example.com&table=users
 * Debug API to check user data in different tables
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const table = searchParams.get('table') || 'users';
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter required' },
        { status: 400 }
      );
    }

    console.log(`🔍 [DEBUG-USER] Looking for ${email} in ${table} table...`);

    // Query the specified table
    const { data: userData, error: userError } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('email', email);

    if (userError) {
      console.error(`❌ [DEBUG-USER] Error querying ${table}:`, userError);
      return NextResponse.json(
        { success: false, error: `Error querying ${table}`, detail: userError },
        { status: 500 }
      );
    }

    if (!userData || userData.length === 0) {
      console.log(`⚠️ [DEBUG-USER] No user found with email ${email} in ${table}`);
      return NextResponse.json({
        success: true,
        user: null,
        table,
        email,
        message: `No user found with email ${email} in ${table}`
      });
    }

    const user = userData[0];
    console.log(`✅ [DEBUG-USER] Found user in ${table}:`, user.id);

    // If user found, also get related data
    let organizationData: any = null;
    let subdomainData: any[] | null = null;

    if (user.organization_id) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', user.organization_id)
        .single();
      organizationData = orgData;

      if (orgData) {
        const { data: subData } = await supabaseAdmin
          .from('subdomains')
          .select('*')
          .eq('organization_id', orgData.id);
        subdomainData = subData || null;
      }
    }

    return NextResponse.json({
      success: true,
      user,
      organization: organizationData,
      subdomains: subdomainData,
      table,
      email
    });

  } catch (error) {
    console.error('❌ [DEBUG-USER] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}