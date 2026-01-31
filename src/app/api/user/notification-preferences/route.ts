import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_frequency: string;
  created_at: string;
  updated_at: string;
}

// GET - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for notification preferences request:', user.id);

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

    // Get organization ID
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
        console.error('❌ Organization not found by ID:', error);
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
        console.error('❌ Organization not found by subdomain:', error);
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    console.log('✅ Organization found:', orgData.id);

    // Try to get user notification preferences
    let preferences: UserNotificationPreferencesDB | null = null;
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
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
        frequency: 'immediate',
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
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for POST notification preferences request:', user.id);

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
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences data is required' }, { status: 400 });
    }

    // Get organization ID
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

    // Update user notification preferences using upsert
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        organization_id: orgData.id,
        email_enabled: preferences.emailNotifications?.enabled ?? true,
        email_new_leads: preferences.emailNotifications?.newLeads ?? true,
        email_lead_updates: preferences.emailNotifications?.leadUpdates ?? true,
        email_deal_closed: preferences.emailNotifications?.dealClosed ?? true,
        email_task_reminders: preferences.emailNotifications?.taskReminders ?? true,
        email_system_alerts: preferences.emailNotifications?.systemAlerts ?? true,
        email_daily_digest: preferences.emailNotifications?.dailyDigest ?? false,
        email_weekly_reports: preferences.emailNotifications?.weeklyReports ?? true,
        email_marketing_updates: preferences.emailNotifications?.marketingUpdates ?? false,
        email_team_mentions: preferences.emailNotifications?.teamMentions ?? true,
        email_security_alerts: preferences.emailNotifications?.securityAlerts ?? true,
        sms_enabled: preferences.smsNotifications?.enabled ?? false,
        sms_phone_number: preferences.smsNotifications?.phoneNumber || null,
        sms_urgent_only: preferences.smsNotifications?.urgentAlertsOnly ?? true,
        sms_deals_closing: preferences.smsNotifications?.dealsClosing ?? false,
        sms_high_value_leads: preferences.smsNotifications?.highValueLeads ?? false,
        push_enabled: preferences.pushNotifications?.enabled ?? true,
        push_browser: preferences.pushNotifications?.browser ?? true,
        push_mobile: preferences.pushNotifications?.mobile ?? true,
        push_task_reminders: preferences.pushNotifications?.taskReminders ?? true,
        push_team_messages: preferences.pushNotifications?.teamMessages ?? true,
        push_deal_updates: preferences.pushNotifications?.dealUpdates ?? true,
        in_app_enabled: preferences.inAppNotifications?.enabled ?? true,
        in_app_mentions: preferences.inAppNotifications?.mentions ?? true,
        in_app_assignments: preferences.inAppNotifications?.assignments ?? true,
        in_app_comments: preferences.inAppNotifications?.comments ?? true,
        in_app_system_updates: preferences.inAppNotifications?.systemUpdates ?? false,
        quiet_hours_enabled: preferences.preferences?.quietHoursEnabled ?? false,
        quiet_hours_start: preferences.preferences?.quietHoursStart ?? '22:00',
        quiet_hours_end: preferences.preferences?.quietHoursEnd ?? '08:00',
        notification_frequency: preferences.preferences?.frequency ?? 'immediate',
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
        user_id: user.id,
        action: 'NOTIFICATION_PREFERENCES_UPDATE',
        entity_type: 'USER_PREFERENCES',
        entity_id: user.id,
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