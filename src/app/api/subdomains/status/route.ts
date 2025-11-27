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

    // Find user by email - handle multiple users with same email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, email')
      .eq('email', userEmail);

    console.log('👤 [SUBDOMAIN-STATUS] User lookup result:', { users, userError, emailSearched: userEmail });

    if (userError) {
      console.error('❌ [SUBDOMAIN-STATUS] Database error during user lookup:', userError);
      return NextResponse.json({ 
        error: `Database error: ${userError.message}`,
        success: false 
      }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.error('❌ [SUBDOMAIN-STATUS] No users found for email:', userEmail);
      return NextResponse.json({ 
        error: 'User not found',
        success: false 
      }, { status: 404 });
    }

    // If multiple users, use the first one (or we could add logic to pick the right one)
    const user = users[0];
    console.log('👤 [SUBDOMAIN-STATUS] Selected user from results:', user);

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