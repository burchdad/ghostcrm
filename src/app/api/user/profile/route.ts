import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// GET - Get user profile data
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for profile request:', user.id);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // No need to set cookies in server utilities
        },
      }
    );

    // Get organization from user profile
    const organizationId = user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);
    
    let orgData;
    if (isUUID) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', organizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', organizationId)
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
      .eq('user_id', user.id)
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
          email: user.email || '',
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
        email: profile.email || user.email || '',
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
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for PUT profile request:', user.id);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // No need to set cookies in server utilities
        },
      }
    );

    const body = await request.json();
    const { profile: profileUpdates } = body;

    if (!profileUpdates) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    // Get organization from user profile
    const organizationId = user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);
    
    let orgData;
    if (isUUID) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', organizationId)
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

    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', orgData.id)
      .single();

    let data, error;
    
    if (existingProfile) {
      // Update existing profile
      const updateResult = await supabase
        .from('profiles')
        .update({
          email: profileUpdates.email,
          first_name: profileUpdates.first_name || '',
          last_name: profileUpdates.last_name || '',
          avatar_url: profileUpdates.avatar_url || '',
          settings: settings,
          updated_at: now
        })
        .eq('user_id', user.id)
        .eq('organization_id', orgData.id)
        .select();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new profile
      const insertResult = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          email: profileUpdates.email,
          first_name: profileUpdates.first_name || '',
          last_name: profileUpdates.last_name || '',
          avatar_url: profileUpdates.avatar_url || '',
          settings: settings,
          updated_at: now
        })
        .select();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Log the profile update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: user.id,
        action: 'PROFILE_UPDATE',
        entity_type: 'USER_PROFILE',
        entity_id: user.id,
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