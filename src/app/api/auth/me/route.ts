import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [AUTH-ME] Getting user session... v2');
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ [AUTH-ME] No authenticated user:', error?.message);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    console.log('✅ [AUTH-ME] User authenticated:', {
      id: user.id,
      email: user.email
    });

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, email, role, organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log('⚠️ [AUTH-ME] Could not fetch user profile:', profileError.message);
    }

    // Get tenant info from user metadata - might be subdomain string
    let tenantId = user.user_metadata?.tenant_id || userProfile?.organization_id || 'default-org';
    let organizationId = user.user_metadata?.organization_id || userProfile?.organization_id || 'default-org';

    // If tenantId is not a UUID (looks like a subdomain), resolve it to organization UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(organizationId)) {
      console.log('🔍 [AUTH-ME] organizationId is not UUID, attempting subdomain lookup:', organizationId);
      
      try {
        // Look up organization by subdomain
        const { data: orgLookup, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('subdomain', organizationId)
          .single();
          
        if (orgLookup && !orgError) {
          console.log('✅ [AUTH-ME] Found organization UUID for subdomain:', {
            subdomain: organizationId,
            organizationUUID: orgLookup.id
          });
          organizationId = orgLookup.id;
          tenantId = orgLookup.id; // Use UUID for both
        } else {
          console.log('⚠️ [AUTH-ME] No organization found for subdomain, creating:', organizationId);
          
          // Create organization for this subdomain
          try {
            const { data: newOrg, error: createError } = await supabase
              .from('organizations')
              .insert({
                name: organizationId.charAt(0).toUpperCase() + organizationId.slice(1), // Capitalize first letter
                subdomain: organizationId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();
              
            if (newOrg && !createError) {
              console.log('✅ [AUTH-ME] Created new organization:', {
                subdomain: organizationId,
                organizationUUID: newOrg.id
              });
              organizationId = newOrg.id;
              tenantId = newOrg.id;
            } else {
              console.log('❌ [AUTH-ME] Failed to create organization:', createError);
            }
          } catch (createErr) {
            console.log('❌ [AUTH-ME] Error creating organization:', createErr);
          }
        }
      } catch (error) {
        console.log('❌ [AUTH-ME] Error looking up organization by subdomain:', error);
      }
    }

    console.log('✅ [AUTH-ME] Returning user data:', {
      id: user.id,
      email: user.email,
      tenantId,
      organizationId
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: userProfile?.role || user.user_metadata?.role || 'user',
        organizationId: organizationId,
        tenantId: tenantId
      }
    });

  } catch (error) {
    console.error('💥 [AUTH-ME] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}