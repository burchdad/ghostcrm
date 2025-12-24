import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Database type for user notification preferences
interface UserNotificationPreferencesDB {
  id: string;
  user_id: string;
  organization_id: string;
  email_enabled: boolean;
  email_new_leads: boolean;
  email_lead_updates: boolean;
  email_deal_closed: boolean;
  email_task_reminders: boolean;
  email_system_alerts: boolean;
  email_daily_digest: boolean;
  email_weekly_reports: boolean;
  email_marketing_updates: boolean;
  email_team_mentions: boolean;
  email_security_alerts: boolean;
  sms_enabled: boolean;
  sms_phone_number: string | null;
  sms_urgent_only: boolean;
  sms_deals_closing: boolean;
  sms_high_value_leads: boolean;
  push_enabled: boolean;
  push_browser: boolean;
  push_mobile: boolean;
  push_task_reminders: boolean;
  push_team_messages: boolean;
  push_deal_updates: boolean;
  in_app_enabled: boolean;
  in_app_mentions: boolean;
  in_app_assignments: boolean;
  in_app_comments: boolean;
  in_app_system_updates: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  notification_frequency: string; // immediate, hourly, daily
  created_at: string;
  updated_at: string;
}

// GET - Get user notification preferences
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
      
      // If token is expired, return specific error for client to handle
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Check if we have the required environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get organization data
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      console.error('❌ No organizationId in JWT');
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 404 });
    }

    console.log('🔍 Looking for organization:', jwtOrganizationId);

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
        console.error('❌ Organization not found by ID:', error);
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
        console.error('❌ Organization not found by subdomain:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    console.log('✅ Organization found:', orgData.id);

    // Try to get user notification preferences - with better error handling
    let preferences: UserNotificationPreferencesDB | null = null;
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', jwtUser.userId)
        .eq('organization_id', orgData.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No preferences found for user - will return defaults');
        } else if (error.message?.includes('relation "user_notification_preferences" does not exist')) {
          console.log('⚠️ Notification preferences table does not exist - returning defaults');
        } else {
          console.error('❌ Error fetching notification preferences:', error);
          throw error;
        }
      } else {
        preferences = data;
        console.log('✅ Found user preferences');
      }
    } catch (dbError: any) {
      console.log('⚠️ Database error (likely table doesn\'t exist), returning defaults:', dbError.message);
    }

    // Return preferences or defaults if none exist
    const defaultPreferences = {
      emailNotifications: {
        enabled: true,
        newLeads: true,
        leadUpdates: true,
        dealClosed: true,
        taskReminders: true,
        systemAlerts: true,
        dailyDigest: false,
        weeklyReports: true,
        marketingUpdates: false,
        teamMentions: true,
        securityAlerts: true,
      },
      smsNotifications: {
        enabled: false,
        phoneNumber: '',
        urgentAlertsOnly: true,
        dealsClosing: false,
        highValueLeads: false,
      },
      pushNotifications: {
        enabled: true,
        browser: true,
        mobile: true,
        taskReminders: true,
        teamMessages: true,
        dealUpdates: true,
      },
      inAppNotifications: {
        enabled: true,
        mentions: true,
        assignments: true,
        comments: true,
        systemUpdates: false,
      },
      preferences: {
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        frequency: 'immediate', // immediate, hourly, daily
      },
    };

    let formattedPreferences = defaultPreferences;
    
    if (preferences) {
      formattedPreferences = {
        emailNotifications: {
          enabled: preferences.email_enabled,
          newLeads: preferences.email_new_leads,
          leadUpdates: preferences.email_lead_updates,
          dealClosed: preferences.email_deal_closed,
          taskReminders: preferences.email_task_reminders,
          systemAlerts: preferences.email_system_alerts,
          dailyDigest: preferences.email_daily_digest,
          weeklyReports: preferences.email_weekly_reports,
          marketingUpdates: preferences.email_marketing_updates || false,
          teamMentions: preferences.email_team_mentions || true,
          securityAlerts: preferences.email_security_alerts || true,
        },
        smsNotifications: {
          enabled: preferences.sms_enabled,
          phoneNumber: preferences.sms_phone_number || '',
          urgentAlertsOnly: preferences.sms_urgent_only,
          dealsClosing: preferences.sms_deals_closing || false,
          highValueLeads: preferences.sms_high_value_leads || false,
        },
        pushNotifications: {
          enabled: preferences.push_enabled,
          browser: preferences.push_browser,
          mobile: preferences.push_mobile,
          taskReminders: preferences.push_task_reminders || true,
          teamMessages: preferences.push_team_messages || true,
          dealUpdates: preferences.push_deal_updates || true,
        },
        inAppNotifications: {
          enabled: preferences.in_app_enabled || true,
          mentions: preferences.in_app_mentions || true,
          assignments: preferences.in_app_assignments || true,
          comments: preferences.in_app_comments || true,
          systemUpdates: preferences.in_app_system_updates || false,
        },
        preferences: {
          quietHoursEnabled: preferences.quiet_hours_enabled || false,
          quietHoursStart: preferences.quiet_hours_start || '22:00',
          quietHoursEnd: preferences.quiet_hours_end || '08:00',
          frequency: preferences.notification_frequency || 'immediate',
        },
      };
    }

    return NextResponse.json({
      success: true,
      preferences: formattedPreferences,
      hasCustomPreferences: !!preferences
    });

  } catch (error) {
    console.error('Error in notification preferences GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update user notification preferences
export async function POST(request: NextRequest) {
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
      console.log('✅ JWT verified successfully for POST request');
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError);
      
      // If token is expired, return specific error for client to handle
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
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences data is required' }, { status: 400 });
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

    // Upsert notification preferences
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: jwtUser.userId,
        organization_id: orgData.id,
        email_enabled: preferences.emailNotifications?.enabled ?? true,
        email_new_leads: preferences.emailNotifications?.newLeads ?? true,
        email_lead_updates: preferences.emailNotifications?.leadUpdates ?? true,
        email_deal_closed: preferences.emailNotifications?.dealClosed ?? true,
        email_task_reminders: preferences.emailNotifications?.taskReminders ?? true,
        email_system_alerts: preferences.emailNotifications?.systemAlerts ?? true,
        email_daily_digest: preferences.emailNotifications?.dailyDigest ?? false,
        email_weekly_reports: preferences.emailNotifications?.weeklyReports ?? true,
        sms_enabled: preferences.smsNotifications?.enabled ?? false,
        sms_phone_number: preferences.smsNotifications?.phoneNumber || null,
        sms_urgent_only: preferences.smsNotifications?.urgentAlertsOnly ?? true,
        push_enabled: preferences.pushNotifications?.enabled ?? true,
        push_browser: preferences.pushNotifications?.browser ?? true,
        push_mobile: preferences.pushNotifications?.mobile ?? true,
        updated_at: now
      }, {
        onConflict: 'user_id,organization_id'
      })
      .select();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    // Log the preference update
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: orgData.id,
        user_id: jwtUser.userId,
        action: 'NOTIFICATION_PREFERENCES_UPDATE',
        entity_type: 'USER_PREFERENCES',
        entity_id: jwtUser.userId,
        details: {
          updatedFields: Object.keys(preferences),
          timestamp: now
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: data?.[0] || null
    });

  } catch (error) {
    console.error('Error in notification preferences POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}