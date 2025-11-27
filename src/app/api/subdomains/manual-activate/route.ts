import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

// Type for activation results
interface ActivationResult {
  success: boolean;
  subdomain: string;
  error?: string;
  data?: any;
}

/**
 * POST /api/subdomains/manual-activate
 * Manually activate a subdomain by email (for testing)
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail, subdomain } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log(`🔧 [MANUAL-ACTIVATE] Manually activating subdomain for user: ${userEmail}`);
    
    const supabase = await createSupabaseServer();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, email')
      .eq('email', userEmail)
      .single();

    console.log('👤 [MANUAL-ACTIVATE] User lookup result:', { user, userError });

    if (userError || !user) {
      console.error('❌ [MANUAL-ACTIVATE] User not found:', userError);
      return NextResponse.json({ 
        error: 'User not found',
        success: false,
        userEmail 
      }, { status: 404 });
    }

    if (!user.organization_id) {
      console.error('❌ [MANUAL-ACTIVATE] User has no organization:', user);
      return NextResponse.json({ 
        error: 'User has no organization',
        success: false,
        user 
      }, { status: 400 });
    }

    // Find subdomains to activate
    let query = supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id);
    
    if (subdomain) {
      query = query.eq('subdomain', subdomain);
    } else {
      query = query.eq('status', 'pending_payment');
    }

    const { data: subdomains, error: subdomainError } = await query;

    console.log('🌐 [MANUAL-ACTIVATE] Subdomain query result:', { 
      subdomains, 
      subdomainError,
      organizationId: user.organization_id 
    });

    if (subdomainError) {
      console.error('❌ [MANUAL-ACTIVATE] Database error querying subdomains:', subdomainError);
      return NextResponse.json({ 
        error: `Database error: ${subdomainError.message}`,
        success: false 
      }, { status: 500 });
    }

    if (!subdomains || subdomains.length === 0) {
      console.log('ℹ️ [MANUAL-ACTIVATE] No subdomains found to activate');
      
      // Check if there are ANY subdomains for this organization
      const { data: allSubdomains, error: allSubdomainsError } = await supabase
        .from('subdomains')
        .select('*')
        .eq('organization_id', user.organization_id);
      
      console.log('🌐 [MANUAL-ACTIVATE] All subdomains for org:', { allSubdomains, allSubdomainsError });
      
      return NextResponse.json({ 
        error: 'No subdomains found to activate',
        success: false,
        allSubdomains: allSubdomains || []
      }, { status: 404 });
    }

    console.log(`🔄 [MANUAL-ACTIVATE] Activating ${subdomains.length} subdomain(s)...`);

    // Activate all found subdomains
    const activationResults: ActivationResult[] = [];
    
    for (const subdomainRecord of subdomains) {
      console.log(`🔄 [MANUAL-ACTIVATE] Activating subdomain: ${subdomainRecord.subdomain} (ID: ${subdomainRecord.id})`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomainRecord.id)
        .select();

      if (updateError) {
        console.error(`❌ [MANUAL-ACTIVATE] Failed to activate subdomain ${subdomainRecord.subdomain}:`, updateError);
        activationResults.push({ 
          success: false, 
          subdomain: subdomainRecord.subdomain, 
          error: updateError.message 
        });
      } else {
        console.log(`✅ [MANUAL-ACTIVATE] Successfully activated subdomain: ${subdomainRecord.subdomain}`);
        activationResults.push({ 
          success: true, 
          subdomain: subdomainRecord.subdomain,
          data: updateData
        });
      }
    }

    const successful = activationResults.filter(r => r.success);
    const failed = activationResults.filter(r => !r.success);

    console.log(`🎉 [MANUAL-ACTIVATE] Activation complete: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      success: failed.length === 0,
      activatedCount: successful.length,
      failedCount: failed.length,
      results: activationResults,
      user: {
        email: user.email,
        organization_id: user.organization_id
      }
    });

  } catch (error) {
    console.error('❌ [MANUAL-ACTIVATE] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}