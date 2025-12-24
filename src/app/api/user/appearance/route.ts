import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

interface AppearanceSettings {
  theme: {
    mode: 'light' | 'dark' | 'system' | 'auto';
    colorScheme: string;
    primaryColor: string;
    accentColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    gradientEnabled: boolean;
    customCss: string;
  };
  layout: {
    sidebarWidth: number;
    sidebarPosition: 'left' | 'right';
    compactMode: boolean;
    showAvatars: boolean;
    density: 'comfortable' | 'compact' | 'spacious';
    gridColumns: number;
    cardLayout: 'grid' | 'list' | 'kanban';
    headerFixed: boolean;
    breadcrumbsVisible: boolean;
  };
  typography: {
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    fontWeight: 'normal' | 'medium' | 'bold';
    lineHeight: number;
    letterSpacing: number;
    headingFont: string;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    focusRingVisible: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
    tooltipDelay: number;
  };
  dashboard: {
    widgetLayout: 'default' | 'minimal' | 'detailed';
    defaultView: 'grid' | 'list';
    autoRefresh: boolean;
    refreshInterval: number; // minutes
    showAnimations: boolean;
    compactCharts: boolean;
    chartColorPalette: string[];
  };
  editor: {
    theme: 'vs' | 'vs-dark' | 'hc-black';
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
  };
}

const defaultAppearanceSettings: AppearanceSettings = {
  theme: {
    mode: 'system',
    colorScheme: 'blue',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    gradientEnabled: false,
    customCss: ''
  },
  layout: {
    sidebarWidth: 280,
    sidebarPosition: 'left',
    compactMode: false,
    showAvatars: true,
    density: 'comfortable',
    gridColumns: 3,
    cardLayout: 'grid',
    headerFixed: true,
    breadcrumbsVisible: true
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 'medium',
    fontWeight: 'normal',
    lineHeight: 1.5,
    letterSpacing: 0,
    headingFont: 'Inter, system-ui, sans-serif'
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    focusRingVisible: true,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    tooltipDelay: 300
  },
  dashboard: {
    widgetLayout: 'default',
    defaultView: 'grid',
    autoRefresh: true,
    refreshInterval: 5,
    showAnimations: true,
    compactCharts: false,
    chartColorPalette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316']
  },
  editor: {
    theme: 'vs',
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true
  }
};

// GET - Get user appearance settings
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
      return NextResponse.json({ error: 'Failed to fetch appearance settings' }, { status: 500 });
    }

    // Extract appearance settings from profile settings
    const settings = profile?.settings || {};
    const appearanceSettings = settings.appearance || defaultAppearanceSettings;
    
    return NextResponse.json({
      success: true,
      settings: appearanceSettings
    });

  } catch (error) {
    console.error('Error in appearance GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user appearance settings
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
    const { settings: appearanceUpdates } = body;

    if (!appearanceUpdates) {
      return NextResponse.json({ error: 'Appearance settings data is required' }, { status: 400 });
    }

    // Validate appearance settings structure
    const validatedSettings = {
      theme: {
        mode: appearanceUpdates.theme?.mode || 'system',
        colorScheme: appearanceUpdates.theme?.colorScheme || 'blue',
        primaryColor: appearanceUpdates.theme?.primaryColor || '#3B82F6',
        accentColor: appearanceUpdates.theme?.accentColor || '#10B981'
      },
      layout: {
        sidebarWidth: Number(appearanceUpdates.layout?.sidebarWidth) || 280,
        compactMode: Boolean(appearanceUpdates.layout?.compactMode),
        showAvatars: Boolean(appearanceUpdates.layout?.showAvatars),
        density: appearanceUpdates.layout?.density || 'comfortable'
      },
      typography: {
        fontFamily: appearanceUpdates.typography?.fontFamily || 'Inter',
        fontSize: appearanceUpdates.typography?.fontSize || 'medium',
        fontWeight: appearanceUpdates.typography?.fontWeight || 'normal'
      },
      accessibility: {
        highContrast: Boolean(appearanceUpdates.accessibility?.highContrast),
        reduceMotion: Boolean(appearanceUpdates.accessibility?.reduceMotion),
        focusRingVisible: Boolean(appearanceUpdates.accessibility?.focusRingVisible)
      }
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
      appearance: validatedSettings
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
      console.error('Error updating appearance settings:', error);
      return NextResponse.json({ error: 'Failed to update appearance settings' }, { status: 500 });
    }

    // Log the settings update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: jwtUser.userId,
        action: 'APPEARANCE_SETTINGS_UPDATE',
        entity_type: 'USER_SETTINGS',
        entity_id: jwtUser.userId,
        details: {
          updatedFields: Object.keys(appearanceUpdates),
          timestamp: now
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Appearance settings updated successfully',
      settings: validatedSettings
    });

  } catch (error) {
    console.error('Error in appearance PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}