import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Use service role client to bypass RLS since we're handling auth with Supabase SSR
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user?.organizationId) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    console.log('🔍 [ORGANIZATION API] Authenticated user:', {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    });

    // Use organizationId from user object (most reliable)
    if (user.organizationId) {
      console.log('🎯 [ORGANIZATION API] Using organizationId from user:', user.organizationId);
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, subdomain, created_at, updated_at')
        .eq('id', user.organizationId)
        .single();
        
      if (!orgError && org) {
        console.log('✅ [ORGANIZATION API] Found organization via user organizationId:', org);
        return NextResponse.json({
          success: true,
          organization: org
        });
      } else {
        console.log('⚠️ [ORGANIZATION API] Could not fetch org via JWT organizationId:', orgError);
      }
    }

    // Fallback: Check organization_memberships table using user ID
    console.log('🔍 [ORGANIZATION API] Fallback: Checking memberships for user:', user.id);
    
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select(`
        organization_id,
        organizations!inner (
          id,
          name,
          subdomain,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('🔍 [ORGANIZATION API] Membership query result:', {
      userId: user.id,
      membership: membership,
      error: membershipError
    });

    if (membershipError) {
      console.error('❌ Error fetching organization membership:', membershipError);
      return NextResponse.json({ 
        error: 'Database error while fetching organization',
        details: membershipError.message 
      }, { status: 500 });
    }

    if (!membership || !membership.organizations) {
      console.log('ℹ️ No organization membership found for user:', user.id);
      return NextResponse.json({ 
        error: 'No organization found for user',
        message: 'User has not completed organization setup yet'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      organization: membership.organizations
    });

  } catch (error) {
    console.error('Error in organization GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Use service role client to bypass RLS since we're handling auth with JWT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user?.organizationId) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    console.log('🔍 [ORGANIZATION PUT] Authenticated user:', {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    });

    const body = await request.json();
    const { industry, team_size } = body;

    // Validate required fields
    if (!industry || !team_size) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Industry and team size are required'
      }, { status: 400 });
    }

    // Use organizationId from user object (most reliable)
    if (!user.organizationId) {
      return NextResponse.json({ 
        error: 'Organization not found',
        message: 'User has no organization to update'
      }, { status: 404 });
    }

    console.log('🎯 [ORGANIZATION PUT] Updating organization:', user.organizationId);

    // Update the organization directly using organizationId from JWT
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        updated_at: new Date().toISOString()
        // TODO: Add industry and team_size columns to the organizations table
        // industry: industry,
        // team_size: team_size
      })
      .eq('id', user.organizationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating organization:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update organization',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      organization: updatedOrg
    });

  } catch (error) {
    console.error('Error in organization PUT:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}