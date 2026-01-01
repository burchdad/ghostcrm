import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for request.cookies usage
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Use service role client to bypass RLS since we're handling auth with JWT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get user info from JWT cookie (same as middleware uses)
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      console.error('❌ No ghostcrm_jwt cookie found');
      return NextResponse.json({ error: 'Unauthorized - No JWT token' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, process.env.JWT_SECRET!) as any;
      console.log('🔍 [ORGANIZATION API] JWT user:', {
        userId: jwtUser.userId,
        email: jwtUser.email,
        organizationId: jwtUser.organizationId
      });
    } catch (jwtError) {
      console.error('❌ JWT decode failed:', jwtError);
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Use organizationId from JWT directly (most reliable)
    if (jwtUser.organizationId) {
      console.log('🎯 [ORGANIZATION API] Using organizationId from JWT:', jwtUser.organizationId);
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, subdomain, created_at, updated_at')
        .eq('id', jwtUser.organizationId)
        .single();
        
      if (!orgError && org) {
        console.log('✅ [ORGANIZATION API] Found organization via JWT organizationId:', org);
        return NextResponse.json({
          success: true,
          organization: org
        });
      } else {
        console.log('⚠️ [ORGANIZATION API] Could not fetch org via JWT organizationId:', orgError);
      }
    }

    // Fallback: Check organization_memberships table using JWT userId
    console.log('🔍 [ORGANIZATION API] Fallback: Checking memberships for user:', jwtUser.userId);
    
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
      .eq('user_id', jwtUser.userId)
      .maybeSingle();

    console.log('🔍 [ORGANIZATION API] Membership query result:', {
      userId: jwtUser.userId,
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
      console.log('ℹ️ No organization membership found for user:', jwtUser.userId);
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
    // Get user info from JWT cookie (same as GET method)
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      console.error('❌ No ghostcrm_jwt cookie found');
      return NextResponse.json({ error: 'Unauthorized - No JWT token' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, process.env.JWT_SECRET!) as any;
      console.log('🔍 [ORGANIZATION PUT] JWT user:', {
        userId: jwtUser.userId,
        email: jwtUser.email,
        organizationId: jwtUser.organizationId
      });
    } catch (jwtError) {
      console.error('❌ JWT decode failed:', jwtError);
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    const body = await request.json();
    const { industry, team_size } = body;

    // Validate required fields
    if (!industry || !team_size) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Industry and team size are required'
      }, { status: 400 });
    }

    // Use organizationId from JWT directly (most reliable)
    if (!jwtUser.organizationId) {
      return NextResponse.json({ 
        error: 'Organization not found',
        message: 'User has no organization to update'
      }, { status: 404 });
    }

    console.log('🎯 [ORGANIZATION PUT] Updating organization:', jwtUser.organizationId);

    // Update the organization directly using organizationId from JWT
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        updated_at: new Date().toISOString()
        // TODO: Add industry and team_size columns to the organizations table
        // industry: industry,
        // team_size: team_size
      })
      .eq('id', jwtUser.organizationId)
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