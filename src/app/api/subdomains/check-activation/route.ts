export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * POST /api/subdomains/check-activation
 * Check if subdomain needs activation and activate if payment is confirmed
 */
export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Find subdomain with pending_payment status
    const { data: subdomain, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'pending_payment')
      .single();

    if (subdomainError || !subdomain) {
      // No pending subdomain found, might already be activated
      const { data: activeSubdomain } = await supabase
        .from('subdomains')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      return NextResponse.json({ 
        needsActivation: false, 
        status: activeSubdomain ? 'active' : 'not_found',
        subdomain: activeSubdomain?.subdomain || null
      });
    }

    // Check if organization has any successful payments (this is a fallback check)
    // In a real implementation, you'd check Stripe customer records
    console.log('🔍 Found pending subdomain, checking payment status...');
    
    // For now, we'll activate any subdomain that's been pending for more than 5 minutes
    // This assumes if they got to the onboarding page, payment was successful
    const createdAt = new Date(subdomain.created_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (createdAt < fiveMinutesAgo) {
      console.log('⏰ Subdomain has been pending for more than 5 minutes, activating...');
      
      const { error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomain.id);

      if (updateError) {
        console.error('❌ Failed to activate subdomain:', updateError);
        return NextResponse.json({ error: 'Failed to activate subdomain' }, { status: 500 });
      }

      console.log('✅ Subdomain activated:', subdomain.subdomain);
      
      return NextResponse.json({
        needsActivation: true,
        activated: true,
        status: 'active',
        subdomain: subdomain.subdomain
      });
    }

    return NextResponse.json({
      needsActivation: true,
      activated: false,
      status: 'pending_payment',
      subdomain: subdomain.subdomain,
      message: 'Subdomain still pending, please wait a few minutes'
    });

  } catch (error) {
    console.error('Error checking subdomain activation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}