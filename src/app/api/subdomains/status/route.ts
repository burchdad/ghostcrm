import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * POST /api/subdomains/status
 * Check subdomain status for a user by email
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log(`🔍 [SUBDOMAIN-STATUS] Checking status for user: ${userEmail}`);
    
    const supabase = await createSupabaseServer();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, email')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('❌ [SUBDOMAIN-STATUS] User not found:', userError?.message);
      return NextResponse.json({ 
        error: 'User not found',
        success: false 
      }, { status: 404 });
    }

    if (!user.organization_id) {
      console.error('❌ [SUBDOMAIN-STATUS] User has no organization');
      return NextResponse.json({ 
        error: 'User has no organization',
        success: false 
      }, { status: 400 });
    }

    // Find subdomain for this organization
    const { data: subdomain, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .single();

    if (subdomainError || !subdomain) {
      console.error('❌ [SUBDOMAIN-STATUS] No subdomain found for organization:', subdomainError?.message);
      return NextResponse.json({ 
        error: 'No subdomain found',
        success: false 
      }, { status: 404 });
    }

    console.log(`✅ [SUBDOMAIN-STATUS] Found subdomain: ${subdomain.subdomain} with status: ${subdomain.status}`);

    return NextResponse.json({
      success: true,
      subdomain: {
        subdomain: subdomain.subdomain,
        status: subdomain.status,
        created_at: subdomain.created_at,
        updated_at: subdomain.updated_at,
        provisioned_at: subdomain.provisioned_at
      },
      user: {
        id: user.id,
        email: user.email,
        organization_id: user.organization_id
      }
    });

  } catch (error) {
    console.error('❌ [SUBDOMAIN-STATUS] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}