export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/organization/default-org
 * Get the default organization for the system
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has permission
    const supabase = await createSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [DEFAULT-ORG] Authentication failed:', authError);
      return NextResponse.json({ 
        error: 'Authentication required',
        success: false 
      }, { status: 401 });
    }

    // Check if user has admin access or is a software owner
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner';
    const isSoftwareOwner = profile?.email === process.env.SOFTWARE_OWNER_EMAIL;

    if (!isAdmin && !isSoftwareOwner) {
      console.error('❌ [DEFAULT-ORG] Access denied for user:', user.email);
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        success: false 
      }, { status: 403 });
    }

    console.log('🏢 [DEFAULT-ORG] Fetching default organization...');

    // Get the default/system organization
    const defaultOrgId = process.env.DEFAULT_ORG_ID;
    
    if (defaultOrgId) {
      const { data: defaultOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', defaultOrgId)
        .single();

      if (orgError) {
        console.error('❌ [DEFAULT-ORG] Error fetching default org by ID:', orgError);
      } else if (defaultOrg) {
        console.log('✅ [DEFAULT-ORG] Found default org by ID:', defaultOrg.name);
        return NextResponse.json({
          success: true,
          organization: defaultOrg
        });
      }
    }

    // Fallback: Find the first organization marked as system/default
    const { data: organizations, error: listError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .or('name.eq.GhostCRM,name.eq.System,status.eq.system')
      .limit(1);

    if (listError) {
      console.error('❌ [DEFAULT-ORG] Error finding default organization:', listError);
      return NextResponse.json({ 
        error: `Database error: ${listError.message}`,
        success: false 
      }, { status: 500 });
    }

    if (!organizations || organizations.length === 0) {
      console.error('❌ [DEFAULT-ORG] No default organization found');
      return NextResponse.json({ 
        error: 'No default organization configured',
        success: false 
      }, { status: 404 });
    }

    const defaultOrg = organizations[0];
    console.log('✅ [DEFAULT-ORG] Found default organization:', defaultOrg.name);

    return NextResponse.json({
      success: true,
      organization: defaultOrg
    });

  } catch (error) {
    console.error('❌ [DEFAULT-ORG] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}