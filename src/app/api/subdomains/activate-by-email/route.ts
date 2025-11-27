import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * POST /api/subdomains/activate-by-email  
 * Direct activation by email (bypasses Stripe session lookup)
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`🔄 [DIRECT-ACTIVATE] Activating subdomain for email: ${email}`);

    const supabase = await createSupabaseServer();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('❌ [DIRECT-ACTIVATE] User not found:', userError);
      return NextResponse.json({ 
        success: false, 
        error: `User not found for email: ${email}`,
        details: userError 
      });
    }

    if (!user.organization_id) {
      console.error('❌ [DIRECT-ACTIVATE] User has no organization:', user);
      return NextResponse.json({ 
        success: false, 
        error: 'User has no organization',
        user 
      });
    }

    console.log('✅ [DIRECT-ACTIVATE] Found user:', user);

    // Find ALL subdomains for this organization (not just pending)
    const { data: subdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id);

    if (subdomainError) {
      console.error('❌ [DIRECT-ACTIVATE] Database error:', subdomainError);
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${subdomainError.message}` 
      });
    }

    if (!subdomains || subdomains.length === 0) {
      console.log('❌ [DIRECT-ACTIVATE] No subdomains found for organization');
      return NextResponse.json({ 
        success: false, 
        error: 'No subdomains found for this organization',
        organizationId: user.organization_id 
      });
    }

    console.log(`🔍 [DIRECT-ACTIVATE] Found ${subdomains.length} subdomain(s):`, subdomains);

    // Activate ALL subdomains for this organization
    const activationResults = [];
    
    for (const subdomain of subdomains) {
      console.log(`🔄 [DIRECT-ACTIVATE] Processing subdomain: ${subdomain.subdomain} (current status: ${subdomain.status})`);
      
      if (subdomain.status === 'active') {
        console.log(`ℹ️ [DIRECT-ACTIVATE] Subdomain ${subdomain.subdomain} already active, skipping`);
        activationResults.push({
          subdomain: subdomain.subdomain,
          success: true,
          action: 'already_active',
          previousStatus: subdomain.status
        });
        continue;
      }

      // Update to active
      const { data: updatedData, error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomain.id)
        .select();

      if (updateError) {
        console.error(`❌ [DIRECT-ACTIVATE] Failed to update subdomain ${subdomain.subdomain}:`, updateError);
        activationResults.push({
          subdomain: subdomain.subdomain,
          success: false,
          action: 'update_failed',
          error: updateError.message,
          previousStatus: subdomain.status
        });
      } else {
        console.log(`✅ [DIRECT-ACTIVATE] Successfully activated subdomain: ${subdomain.subdomain}`);
        activationResults.push({
          subdomain: subdomain.subdomain,
          success: true,
          action: 'activated',
          previousStatus: subdomain.status,
          updatedData: updatedData?.[0]
        });
      }
    }

    const successful = activationResults.filter(r => r.success);
    const failed = activationResults.filter(r => !r.success);

    console.log(`🎉 [DIRECT-ACTIVATE] Activation complete: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      success: failed.length === 0,
      totalSubdomains: subdomains.length,
      activatedCount: successful.filter(r => r.action === 'activated').length,
      alreadyActiveCount: successful.filter(r => r.action === 'already_active').length,
      failedCount: failed.length,
      results: activationResults,
      user: {
        email: user.email,
        id: user.id,
        organization_id: user.organization_id
      }
    });

  } catch (error) {
    console.error('❌ [DIRECT-ACTIVATE] Unexpected error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}