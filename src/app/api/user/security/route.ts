import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';
import { createServerClient } from '@supabase/ssr';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'totp' | 'sms' | 'email' | null;
    backupCodes: string[];
  };
  loginSecurity: {
    sessionTimeout: number; // minutes
    requireEmailVerification: boolean;
    allowMultipleSessions: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    shareAnalytics: boolean;
    dataRetention: boolean;
  };
  webauthn: {
    enabled: boolean;
    credentials: any[];
  };
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorAuth: {
    enabled: false,
    method: null,
    backupCodes: []
  },
  loginSecurity: {
    sessionTimeout: 480, // 8 hours
    requireEmailVerification: true,
    allowMultipleSessions: false
  },
  privacy: {
    profileVisibility: 'team',
    shareAnalytics: false,
    dataRetention: true
  },
  webauthn: {
    enabled: false,
    credentials: []
  }
};

// GET - Get user security settings
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for security settings request:', user.id);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    // Get organization data
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

    // Get user profile settings
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('user_id', user.id)
      .eq('organization_id', orgData.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch security settings' }, { status: 500 });
    }

    // Get user's auth data for TOTP/WebAuthn status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('totp_secret, webauthn_credentials')
      .eq('id', user.id)
      .single();

    // Extract security settings from profile settings
    const settings = profile?.settings || {};
    let securitySettings = settings.security || defaultSecuritySettings;
    
    // Update with actual auth status
    if (!userError && userData) {
      securitySettings.twoFactorAuth.enabled = !!userData.totp_secret;
      securitySettings.webauthn.enabled = !!userData.webauthn_credentials;
      securitySettings.webauthn.credentials = userData.webauthn_credentials ? 
        JSON.parse(userData.webauthn_credentials) : [];
    }
    
    return NextResponse.json({
      success: true,
      settings: securitySettings
    });

  } catch (error) {
    console.error('Error in security GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user security settings
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for PUT security settings request:', user.id);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const body = await request.json();
    const { settings: securityUpdates, currentPassword, newPassword } = body;

    if (!securityUpdates && !newPassword) {
      return NextResponse.json({ error: 'Security settings or password data is required' }, { status: 400 });
    }

    // Get organization data
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

    // Handle password change
    if (newPassword && currentPassword) {
      // Get current user for password verification
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser.user) {
        return NextResponse.json({ error: 'Unable to verify current user' }, { status: 401 });
      }

      // Update password through Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }
    }

    // Handle security settings update
    if (securityUpdates) {
      // Validate security settings
      const validatedSettings = {
        twoFactorAuth: {
          enabled: Boolean(securityUpdates.twoFactorAuth?.enabled),
          method: securityUpdates.twoFactorAuth?.method || null,
          backupCodes: securityUpdates.twoFactorAuth?.backupCodes || []
        },
        loginSecurity: {
          sessionTimeout: Number(securityUpdates.loginSecurity?.sessionTimeout) || 480,
          requireEmailVerification: Boolean(securityUpdates.loginSecurity?.requireEmailVerification),
          allowMultipleSessions: Boolean(securityUpdates.loginSecurity?.allowMultipleSessions)
        },
        privacy: {
          profileVisibility: ['public', 'team', 'private'].includes(securityUpdates.privacy?.profileVisibility) 
            ? securityUpdates.privacy.profileVisibility : 'team',
          shareAnalytics: Boolean(securityUpdates.privacy?.shareAnalytics),
          dataRetention: Boolean(securityUpdates.privacy?.dataRetention)
        },
        webauthn: {
          enabled: Boolean(securityUpdates.webauthn?.enabled),
          credentials: securityUpdates.webauthn?.credentials || []
        }
      };

      // Get existing profile settings
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', user.id)
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
        security: validatedSettings
      };

      // Upsert profile with updated settings
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          organization_id: orgData.id,
          email: user.email,
          settings: updatedSettings,
          updated_at: now
        }, {
          onConflict: 'user_id,organization_id'
        })
        .select();

      if (error) {
        console.error('Error updating security settings:', error);
        return NextResponse.json({ error: 'Failed to update security settings' }, { status: 500 });
      }
    }

    // Log the security update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: user.id,
        action: newPassword ? 'PASSWORD_UPDATE' : 'SECURITY_SETTINGS_UPDATE',
        entity_type: 'USER_SECURITY',
        entity_id: user.id,
        details: {
          passwordChanged: !!newPassword,
          settingsUpdated: !!securityUpdates,
          timestamp: now
        }
      });

    return NextResponse.json({
      success: true,
      message: newPassword ? 'Password and security settings updated successfully' : 'Security settings updated successfully'
    });

  } catch (error) {
    console.error('Error in security PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}