import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
      return NextResponse.json({ error: 'Failed to fetch security settings' }, { status: 500 });
    }

    // Get user's auth data for TOTP/WebAuthn status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('totp_secret, webauthn_credentials')
      .eq('id', jwtUser.userId)
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
    const { settings: securityUpdates, currentPassword, newPassword } = body;

    if (!securityUpdates && !newPassword) {
      return NextResponse.json({ error: 'Security settings or password data is required' }, { status: 400 });
    }

    // Get organization data
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
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
        security: validatedSettings
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
        console.error('Error updating security settings:', error);
        return NextResponse.json({ error: 'Failed to update security settings' }, { status: 500 });
      }
    }

    // Log the security update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: jwtUser.userId,
        action: newPassword ? 'PASSWORD_UPDATE' : 'SECURITY_SETTINGS_UPDATE',
        entity_type: 'USER_SECURITY',
        entity_id: jwtUser.userId,
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