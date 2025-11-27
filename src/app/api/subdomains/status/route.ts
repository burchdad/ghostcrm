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

    // Find subdomain directly by owner_email - more reliable approach
    const { data: subdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('owner_email', userEmail);

    console.log('🌐 [SUBDOMAIN-STATUS] Subdomain lookup result:', { 
      subdomains, 
      subdomainError, 
      ownerEmailSearched: userEmail 
    });

    if (subdomainError) {
      console.error('❌ [SUBDOMAIN-STATUS] Database error querying subdomains:', subdomainError);
      return NextResponse.json({ 
        error: `Database error: ${subdomainError.message}`,
        success: false 
      }, { status: 500 });
    }

    if (!subdomains || subdomains.length === 0) {
      console.error('❌ [SUBDOMAIN-STATUS] No subdomains found for email:', userEmail);
      return NextResponse.json({ 
        error: 'No subdomains found for this email',
        success: false,
        searchedEmail: userEmail
      }, { status: 404 });
    }

    // Use the first subdomain if multiple found
    const subdomain = subdomains[0];
    console.log(`✅ [SUBDOMAIN-STATUS] Found subdomain: ${subdomain.subdomain} (${subdomain.status})`);

    return NextResponse.json({
      success: true,
      subdomain: {
        id: subdomain.id,
        subdomain: subdomain.subdomain,
        status: subdomain.status,
        organization_id: subdomain.organization_id,
        owner_email: subdomain.owner_email,
        created_at: subdomain.created_at,
        updated_at: subdomain.updated_at
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