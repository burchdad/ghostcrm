import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

interface LocaleSettings {
  language: string;
  region: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY';
  timeFormat: '12h' | '24h';
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  firstDayOfWeek: 'sunday' | 'monday';
}

const defaultLocaleSettings: LocaleSettings = {
  language: 'en',
  region: 'US',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  numberFormat: {
    decimal: '.',
    thousands: ',',
    currency: 'USD'
  },
  firstDayOfWeek: 'sunday'
};

// GET - Get user locale settings
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

    // Get user profile settings
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('user_id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch locale settings' }, { status: 500 });
    }

    // Extract locale settings from profile settings
    const settings = profile?.settings || {};
    const localeSettings = settings.locale || defaultLocaleSettings;
    
    return NextResponse.json({
      success: true,
      settings: localeSettings
    });

  } catch (error) {
    console.error('Error in locale GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user locale settings
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
    const { settings: localeUpdates } = body;

    if (!localeUpdates) {
      return NextResponse.json({ error: 'Locale settings data is required' }, { status: 400 });
    }

    // Validate locale settings
    const validatedSettings: LocaleSettings = {
      language: localeUpdates.language || 'en',
      region: localeUpdates.region || 'US',
      timezone: localeUpdates.timezone || 'America/New_York',
      dateFormat: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'].includes(localeUpdates.dateFormat) 
        ? localeUpdates.dateFormat : 'MM/DD/YYYY',
      timeFormat: ['12h', '24h'].includes(localeUpdates.timeFormat) ? localeUpdates.timeFormat : '12h',
      numberFormat: {
        decimal: localeUpdates.numberFormat?.decimal || '.',
        thousands: localeUpdates.numberFormat?.thousands || ',',
        currency: localeUpdates.numberFormat?.currency || 'USD'
      },
      firstDayOfWeek: ['sunday', 'monday'].includes(localeUpdates.firstDayOfWeek) 
        ? localeUpdates.firstDayOfWeek : 'sunday'
    };

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

    // Get existing profile settings
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('settings')
      .eq('user_id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch existing settings' }, { status: 500 });
    }

    // Merge with existing settings
    const currentSettings = existingProfile?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      locale: validatedSettings
    };

    // Upsert profile with updated settings
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: jwtUser.userId,
        organization_id: orgData.id,
        email: jwtUser.email,
        settings: updatedSettings,
        updated_at: now
      }, {
        onConflict: 'user_id,organization_id'
      })
      .select();

    if (error) {
      console.error('Error updating locale settings:', error);
      return NextResponse.json({ error: 'Failed to update locale settings' }, { status: 500 });
    }

    // Log the settings update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: jwtUser.userId,
        action: 'LOCALE_SETTINGS_UPDATE',
        entity_type: 'USER_SETTINGS',
        entity_id: jwtUser.userId,
        details: {
          updatedFields: Object.keys(localeUpdates),
          timestamp: now
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Locale settings updated successfully',
      settings: validatedSettings
    });

  } catch (error) {
    console.error('Error in locale PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}