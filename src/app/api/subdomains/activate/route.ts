export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * POST /api/subdomains/activate
 * Manually activate subdomain for authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🌐 [SUBDOMAIN-ACTIVATE] Manual activation request...');
    
    // Get the current user session
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ [SUBDOMAIN-ACTIVATE] User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('🔍 [SUBDOMAIN-ACTIVATE] Activating subdomain for user:', user.id);
    
    // Get user's organization info
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ [SUBDOMAIN-ACTIVATE] User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userData.organization_id) {
      console.error('❌ [SUBDOMAIN-ACTIVATE] User has no organization');
      return NextResponse.json(
        { success: false, error: 'User has no organization' },
        { status: 400 }
      );
    }

    // Find the subdomain record
    const { data: subdomainRecord, error: subdomainError } = await supabaseAdmin
      .from('subdomains')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single();

    if (subdomainError || !subdomainRecord) {
      console.error('❌ [SUBDOMAIN-ACTIVATE] Subdomain not found:', subdomainError);
      return NextResponse.json(
        { success: false, error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Only activate if it's pending
    if (subdomainRecord.status === 'active') {
      console.log('✅ [SUBDOMAIN-ACTIVATE] Subdomain already active:', subdomainRecord.subdomain);
      return NextResponse.json({
        success: true,
        subdomain: subdomainRecord.subdomain,
        status: 'active',
        message: 'Subdomain is already active'
      });
    }

    if (subdomainRecord.status !== 'pending' && subdomainRecord.status !== 'pending_payment') {
      console.warn('⚠️ [SUBDOMAIN-ACTIVATE] Subdomain in wrong status:', subdomainRecord.status);
      return NextResponse.json(
        { success: false, error: `Subdomain status is ${subdomainRecord.status}, cannot activate` },
        { status: 400 }
      );
    }

    // Activate the subdomain
    const { error: updateError } = await supabaseAdmin
      .from('subdomains')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
        provisioned_at: new Date().toISOString()
      })
      .eq('id', subdomainRecord.id);

    if (updateError) {
      console.error('❌ [SUBDOMAIN-ACTIVATE] Failed to activate subdomain:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to activate subdomain', detail: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ [SUBDOMAIN-ACTIVATE] Subdomain activated:', subdomainRecord.subdomain);

    // Optionally call the subdomain provisioning API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subdomains/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: subdomainRecord.subdomain,
          organizationId: userData.organization_id
        })
      });

      const provisionResult = await response.json();
      
      if (!provisionResult.success) {
        console.warn('⚠️ [SUBDOMAIN-ACTIVATE] Provisioning warning:', provisionResult.error);
      }
    } catch (provisionError) {
      console.warn('⚠️ [SUBDOMAIN-ACTIVATE] Provisioning API error:', provisionError);
      // Don't fail activation for provisioning errors
    }

    return NextResponse.json({
      success: true,
      subdomain: subdomainRecord.subdomain,
      status: 'active',
      message: 'Subdomain activated successfully'
    });

  } catch (error) {
    console.error('❌ [SUBDOMAIN-ACTIVATE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}