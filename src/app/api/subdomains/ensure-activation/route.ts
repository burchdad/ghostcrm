import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'User email is required' 
      }, { status: 400 });
    }

    console.log('🔄 [ENSURE-ACTIVATION] Checking subdomain activation for:', userEmail);

    const supabase = await createSupabaseServer();

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, organization_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.warn('⚠️ [ENSURE-ACTIVATION] User not found for email:', userEmail);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    if (!user.organization_id) {
      console.warn('⚠️ [ENSURE-ACTIVATION] User has no organization:', user.id);
      return NextResponse.json({ 
        success: false, 
        error: 'User has no organization' 
      }, { status: 400 });
    }

    // Check if there are any pending payment subdomains for this organization
    const { data: pendingSubdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('status', 'pending_payment');

    if (subdomainError) {
      console.error('❌ [ENSURE-ACTIVATION] Error querying subdomains:', subdomainError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database error' 
      }, { status: 500 });
    }

    if (!pendingSubdomains || pendingSubdomains.length === 0) {
      // No pending subdomains - either already activated or none exist
      console.log('✅ [ENSURE-ACTIVATION] No pending subdomains found - already activated or none exist');
      return NextResponse.json({ 
        success: true, 
        message: 'No pending subdomains found',
        activated: false
      });
    }

    console.log(`🔄 [ENSURE-ACTIVATION] Found ${pendingSubdomains.length} pending subdomain(s), activating...`);

    // Activate all pending subdomains for this organization
    const activationPromises = pendingSubdomains.map(async (subdomain) => {
      const { error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomain.id);

      if (updateError) {
        console.error(`❌ [ENSURE-ACTIVATION] Failed to activate subdomain ${subdomain.subdomain}:`, updateError);
        return { success: false, subdomain: subdomain.subdomain, error: updateError.message };
      }

      console.log(`✅ [ENSURE-ACTIVATION] Activated subdomain: ${subdomain.subdomain}`);
      return { success: true, subdomain: subdomain.subdomain };
    });

    const results = await Promise.all(activationPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Activated ${successful.length} subdomain(s)`,
      activated: successful.length > 0,
      results: {
        successful: successful.map(r => r.subdomain),
        failed: failed.map(r => ({ subdomain: r.subdomain, error: r.error }))
      }
    });

  } catch (error) {
    console.error('❌ [ENSURE-ACTIVATION] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}