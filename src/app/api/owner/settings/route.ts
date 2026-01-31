import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface BusinessSettings {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordExpiry: number;
    sessionTimeout: number;
  };
}

interface OrganizationData {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationSettings {
  organization_id: string;
  settings: BusinessSettings;
  updated_at: string;
}

// GET - Fetch business settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ User or organization not found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    }

    // Use organizationId from user object
    const jwtOrganizationId = user.organizationId;
    if (!jwtOrganizationId) {
      console.error('❌ No organizationId found in JWT');
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
    let orgData;
    if (isUUID) {
      // Direct UUID lookup
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, status, created_at, updated_at')
        .eq('id', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        console.error('Organization lookup error:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      // Subdomain lookup
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, status, created_at, updated_at')
        .eq('subdomain', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        console.error('Organization lookup error:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    // Get organization settings from dedicated table
    const { data: settingsData, error: settingsError } = await supabase
      .from('organization_settings')
      .select('settings, updated_at')
      .eq('organization_id', orgData.id)
      .single();

    // Combine organization data with settings
    const defaultSettings: BusinessSettings = {
      companyName: orgData.name || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '12:00', close: '16:00', closed: true },
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        logo: '',
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        weeklyReports: true,
      },
      security: {
        twoFactorAuth: false,
        passwordExpiry: 90,
        sessionTimeout: 30,
      },
    };

    // Merge stored settings with defaults
    const settings = settingsData?.settings 
      ? { ...defaultSettings, ...settingsData.settings }
      : defaultSettings;

    return NextResponse.json({ 
      success: true, 
      settings,
      organizationId: orgData.id,
      organizationInfo: {
        name: orgData.name,
        subdomain: orgData.subdomain,
        status: orgData.status,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at
      },
      settingsLastUpdated: settingsData?.updated_at || null
    });

  } catch (error) {
    console.error('Error fetching business settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save business settings
export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ User or organization not found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    }

    const body = await request.json();
    const { settings, confirm } = body as { settings: BusinessSettings; confirm?: boolean };

    if (!settings) {
      return NextResponse.json({ error: 'Settings data is required' }, { status: 400 });
    }

    // Use organizationId from user object
    const organizationId = user.organizationId;

    // Get organization data using organizationId from user object
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single();

    if (orgError || !orgData) {
      console.error('Organization lookup error:', orgError);
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // If not confirmed, return preview of changes
    if (!confirm) {
      // Get current settings to show changes
      const { data: currentSettings } = await supabase
        .from('organization_settings')
        .select('settings')
        .eq('organization_id', orgData.id)
        .single();

      const changes: any[] = [];
      const current = currentSettings?.settings || {};

      // Detect changes in core organization info
      if (settings.companyName !== orgData.name) {
        changes.push({
          field: 'Company Name',
          from: orgData.name,
          to: settings.companyName,
          table: 'organizations'
        });
      }

      // Detect changes in settings
      const settingsFields = [
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'zipCode', label: 'ZIP Code' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'website', label: 'Website' }
      ];

      settingsFields.forEach(field => {
        if (settings[field.key as keyof BusinessSettings] !== current[field.key]) {
          changes.push({
            field: field.label,
            from: current[field.key] || 'Not set',
            to: settings[field.key as keyof BusinessSettings],
            table: 'organization_settings'
          });
        }
      });

      // Check business hours changes
      if (JSON.stringify(settings.businessHours) !== JSON.stringify(current.businessHours)) {
        changes.push({
          field: 'Business Hours',
          from: 'Current schedule',
          to: 'Updated schedule',
          table: 'organization_settings'
        });
      }

      // Check branding changes
      if (JSON.stringify(settings.branding) !== JSON.stringify(current.branding)) {
        changes.push({
          field: 'Branding & Colors',
          from: 'Current colors/logo',
          to: 'Updated branding',
          table: 'organization_settings'
        });
      }

      // Check notification changes
      if (JSON.stringify(settings.notifications) !== JSON.stringify(current.notifications)) {
        changes.push({
          field: 'Notification Preferences',
          from: 'Current preferences',
          to: 'Updated preferences',
          table: 'organization_settings'
        });
      }

      // Check security changes
      if (JSON.stringify(settings.security) !== JSON.stringify(current.security)) {
        changes.push({
          field: 'Security Settings',
          from: 'Current settings',
          to: 'Updated settings',
          table: 'organization_settings'
        });
      }

      return NextResponse.json({
        success: true,
        requiresConfirmation: true,
        changes,
        message: changes.length > 0 
          ? `${changes.length} setting(s) will be updated. Please confirm to save changes.`
          : 'No changes detected.'
      });
    }

    // Confirmed - proceed with saving
    const now = new Date().toISOString();

    // Update organization name if changed
    if (settings.companyName !== orgData.name) {
      const { error: orgUpdateError } = await supabase
        .from('organizations')
        .update({ 
          name: settings.companyName,
          updated_at: now
        })
        .eq('id', orgData.id);

      if (orgUpdateError) {
        console.error('Error updating organization:', orgUpdateError);
        return NextResponse.json({ error: 'Failed to update organization info' }, { status: 500 });
      }
    }

    // Update or insert organization settings
    const { data: existingSettings } = await supabase
      .from('organization_settings')
      .select('organization_id')
      .eq('organization_id', orgData.id)
      .single();

    let settingsResult;
    if (existingSettings) {
      // Update existing settings
      settingsResult = await supabase
        .from('organization_settings')
        .update({
          settings: settings,
          updated_at: now
        })
        .eq('organization_id', orgData.id)
        .select();
    } else {
      // Insert new settings
      settingsResult = await supabase
        .from('organization_settings')
        .insert({
          organization_id: orgData.id,
          settings: settings,
          updated_at: now
        })
        .select();
    }

    if (settingsResult.error) {
      console.error('Error updating settings:', settingsResult.error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    // Log the settings update in audit logs
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: user.id,
        action: 'SETTINGS_UPDATE',
        entity_type: 'ORGANIZATION_SETTINGS',
        entity_id: orgData.id,
        details: {
          settingsUpdated: Object.keys(settings),
          companyNameChanged: settings.companyName !== orgData.name,
          timestamp: now
        }
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      data: {
        organizationId: orgData.id,
        settingsUpdated: settingsResult.data?.[0],
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Error saving business settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}