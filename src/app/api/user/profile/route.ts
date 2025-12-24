import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

// GET - Get user profile data
export async function GET(request: NextRequest) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      console.error('❌ No ghostcrm_jwt cookie found');
      return NextResponse.json({ error: 'Unauthorized - No JWT cookie' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
      console.log('✅ JWT verified successfully for user:', jwtUser.userId);
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Get organization data
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
    let orgData;
    if (isUUID) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // If no profile exists, return default structure
    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: {
          id: null,
          first_name: '',
          last_name: '',
          email: jwtUser.email || '',
          phone: '',
          avatar_url: '',
          role: 'member',
          settings: {},
          title: '',
          department: '',
          location: '',
          organization_name: orgData.name
        }
      });
    }

    // Parse settings from JSONB
    const settings = profile.settings || {};
    
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || jwtUser.email || '',
        phone: settings.phone || '',
        avatar_url: profile.avatar_url || '',
        role: profile.role,
        settings: settings,
        title: settings.title || '',
        department: settings.department || '',
        location: settings.location || '',
        organization_name: orgData.name
      }
    });

  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile data
export async function PUT(request: NextRequest) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      console.error('❌ No ghostcrm_jwt cookie found');
      return NextResponse.json({ error: 'Unauthorized - No JWT cookie' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
      console.log('✅ JWT verified successfully for PUT request');
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    const body = await request.json();
    const { profile: profileUpdates } = body;

    if (!profileUpdates) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    // Get organization data
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
    let orgData;
    if (isUUID) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    const now = new Date().toISOString();

    // Prepare settings object for additional fields
    const settings = {
      phone: profileUpdates.phone || '',
      title: profileUpdates.title || '',
      department: profileUpdates.department || '',
      location: profileUpdates.location || ''
    };

    // Upsert profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: jwtUser.userId,
        organization_id: orgData.id,
        email: profileUpdates.email,
        first_name: profileUpdates.first_name || '',
        last_name: profileUpdates.last_name || '',
        avatar_url: profileUpdates.avatar_url || '',
        settings: settings,
        updated_at: now
      }, {
        onConflict: 'user_id,organization_id'
      })
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Log the profile update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: jwtUser.userId,
        action: 'PROFILE_UPDATE',
        entity_type: 'USER_PROFILE',
        entity_id: jwtUser.userId,
        details: {
          updatedFields: Object.keys(profileUpdates),
          timestamp: now
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data?.[0] || null
    });

  } catch (error) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}