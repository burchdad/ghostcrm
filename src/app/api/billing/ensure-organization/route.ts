export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log(`🔍 [ENSURE-ORG] Ensuring organization exists for session: ${sessionId}`);

    const supabase = await createSupabaseServer();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log(`👤 [ENSURE-ORG] User: ${user.email}`);

    // Check if user already has an organization
    const { data: existingUser, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, email, first_name, company_name')
      .eq('id', user.id)
      .single();

    console.log(`🏢 [ENSURE-ORG] User lookup:`, { existingUser, userLookupError });

    if (existingUser?.organization_id) {
      console.log(`✅ [ENSURE-ORG] User already has organization: ${existingUser.organization_id}`);
      
      // Get subdomain info
      const { data: subdomain } = await supabaseAdmin
        .from('subdomains')
        .select('subdomain, status')
        .eq('organization_id', existingUser.organization_id)
        .single();

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        organization_id: existingUser.organization_id,
        subdomain: subdomain?.subdomain,
        status: subdomain?.status || 'active'
      });
    }

    // Get session metadata from Stripe (if needed) or use defaults
    const companyName = existingUser?.company_name || 
                       `${existingUser?.first_name || 'My'} Organization`;
    
    // Generate subdomain from company name or user info
    let baseSubdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);
    
    if (!baseSubdomain || baseSubdomain.length < 3) {
      baseSubdomain = `org-${user.id.slice(0, 8)}`;
    }

    console.log(`🎯 [ENSURE-ORG] Creating organization: ${companyName} -> ${baseSubdomain}`);

    // Use the provision function to create organization + subdomain
    const { data: orgResult, error: provisionError } = await supabaseAdmin.rpc('provision_tenant_after_payment', {
      p_user_id: user.id,
      p_org_name: companyName,
      p_requested_subdomain: baseSubdomain,
      p_owner_email: user.email || '',
      p_stripe_customer_id: '', // Empty for manual provisioning
      p_stripe_subscription_id: '', // Empty for manual provisioning
    });

    if (provisionError) {
      console.error('❌ [ENSURE-ORG] Organization creation failed:', provisionError);
      return NextResponse.json({ 
        error: `Failed to create organization: ${provisionError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ [ENSURE-ORG] Organization created:`, orgResult);

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      organization_id: orgResult?.organization_id,
      subdomain: orgResult?.subdomain,
      status: 'active'
    });

  } catch (error) {
    console.error('❌ [ENSURE-ORG] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}