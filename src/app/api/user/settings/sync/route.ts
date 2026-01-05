import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface SyncConflict {
  section: string;
  serverTimestamp: string;
  clientTimestamp: string;
  message: string;
}

interface SyncError {
  section: string;
  error: string;
}

interface SyncResults {
  success: string[];
  failed: SyncError[];
  conflicts: SyncConflict[];
}

// GET - Get settings sync status and recent changes
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Settings sync status request received');

    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for sync status:', user.id);

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

    // Get organization info
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
        .select('id, subdomain')
        .eq('id', organizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('subdomain', organizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    // Get query parameters
    const url = new URL(request.url);
    const lastSync = url.searchParams.get('lastSync');
    const deviceId = url.searchParams.get('deviceId') || 'unknown';

    // Get current profile settings with timestamp
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, settings, updated_at, full_name, email')
      .eq('user_id', user.id)
      .eq('organization_id', orgData.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get notification preferences with timestamp
    const { data: notificationData, error: notificationError } = await supabase
      .from('user_notification_preferences')
      .select('*, updated_at')
      .eq('user_id', user.id)
      .eq('organization_id', orgData.id)
      .single();

    // Check if settings have been updated since last sync
    const profileUpdatedAt = new Date(profileData.updated_at);
    const notificationUpdatedAt = notificationData ? new Date(notificationData.updated_at) : null;
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    const hasProfileUpdates = profileUpdatedAt > lastSyncDate;
    const hasNotificationUpdates = notificationUpdatedAt && notificationUpdatedAt > lastSyncDate;

    // Prepare sync response
    const syncResponse = {
      syncInfo: {
        serverTimestamp: new Date().toISOString(),
        lastProfileUpdate: profileData.updated_at,
        lastNotificationUpdate: notificationData?.updated_at || null,
        deviceId,
        hasUpdates: hasProfileUpdates || hasNotificationUpdates
      },
      updates: {} as any
    };

    // Include updated settings if they exist
    if (hasProfileUpdates) {
      syncResponse.updates.profile = {
        settings: profileData.settings,
        fullName: profileData.full_name,
        updatedAt: profileData.updated_at
      };
    }

    if (hasNotificationUpdates && notificationData) {
      syncResponse.updates.notifications = {
        emailEnabled: notificationData.email_enabled,
        emailSettings: {
          newLeads: notificationData.email_new_leads,
          leadUpdates: notificationData.email_lead_updates,
          dealClosed: notificationData.email_deal_closed,
          taskReminders: notificationData.email_task_reminders,
          systemAlerts: notificationData.email_system_alerts,
          dailyDigest: notificationData.email_daily_digest,
          weeklyReports: notificationData.email_weekly_reports,
          marketingUpdates: notificationData.email_marketing_updates,
          teamMentions: notificationData.email_team_mentions,
          securityAlerts: notificationData.email_security_alerts
        },
        smsEnabled: notificationData.sms_enabled,
        smsSettings: {
          phoneNumber: notificationData.sms_phone_number,
          urgentOnly: notificationData.sms_urgent_only,
          dealsClosing: notificationData.sms_deals_closing,
          highValueLeads: notificationData.sms_high_value_leads
        },
        pushEnabled: notificationData.push_enabled,
        pushSettings: {
          browser: notificationData.push_browser,
          mobile: notificationData.push_mobile,
          taskReminders: notificationData.push_task_reminders,
          teamMessages: notificationData.push_team_messages,
          dealUpdates: notificationData.push_deal_updates
        },
        inAppSettings: {
          enabled: notificationData.in_app_enabled,
          mentions: notificationData.in_app_mentions,
          assignments: notificationData.in_app_assignments,
          comments: notificationData.in_app_comments,
          systemUpdates: notificationData.in_app_system_updates
        },
        preferences: {
          quietHoursEnabled: notificationData.quiet_hours_enabled,
          quietHoursStart: notificationData.quiet_hours_start,
          quietHoursEnd: notificationData.quiet_hours_end,
          frequency: notificationData.notification_frequency
        },
        updatedAt: notificationData.updated_at
      };
    }

    // Log sync activity (optional - for debugging/analytics)
    if (hasProfileUpdates || hasNotificationUpdates) {
      console.log(`🔄 Settings sync for user ${user.id} on device ${deviceId}: ${hasProfileUpdates ? 'profile' : ''}${hasProfileUpdates && hasNotificationUpdates ? ' + ' : ''}${hasNotificationUpdates ? 'notifications' : ''}`);
    }

    return NextResponse.json(syncResponse);

  } catch (error: any) {
    console.error('❌ Settings sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Push local settings changes for sync
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Settings sync push request received');

    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized - No JWT cookie' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    const syncData = await request.json();

    // Get organization info
    let orgData;
    if (jwtUser.organizationId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('id', jwtUser.organizationId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('subdomain', jwtUser.subdomain || 'default')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    }

    const results: SyncResults = { 
      success: [], 
      failed: [], 
      conflicts: [] 
    };
    const deviceId = syncData.deviceId || 'unknown';
    const clientTimestamp = syncData.timestamp;

    // Check for conflicts by comparing timestamps
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('updated_at, settings')
      .eq('id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    // Sync appearance settings
    if (syncData.appearance) {
      try {
        const currentAppearanceTimestamp = currentProfile?.settings?.appearance?.updatedAt;
        const clientAppearanceTimestamp = syncData.appearance.updatedAt;

        // Check for conflicts
        if (currentAppearanceTimestamp && clientAppearanceTimestamp && 
            new Date(currentAppearanceTimestamp) > new Date(clientAppearanceTimestamp)) {
          results.conflicts.push({
            section: 'appearance',
            serverTimestamp: currentAppearanceTimestamp,
            clientTimestamp: clientAppearanceTimestamp,
            message: 'Server has newer appearance settings'
          });
        } else {
          // Update appearance settings
          const updatedSettings = {
            ...currentProfile?.settings,
            appearance: {
              ...syncData.appearance,
              updatedAt: new Date().toISOString(),
              syncedFrom: deviceId
            }
          };

          const { error } = await supabase
            .from('profiles')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString()
            })
            .eq('id', jwtUser.userId)
            .eq('organization_id', orgData.id);

          if (error) {
            results.failed.push({ section: 'appearance', error: error.message });
          } else {
            results.success.push('appearance');
          }
        }
      } catch (error: any) {
        results.failed.push({ section: 'appearance', error: error.message });
      }
    }

    // Sync locale settings
    if (syncData.locale) {
      try {
        const currentLocaleTimestamp = currentProfile?.settings?.locale?.updatedAt;
        const clientLocaleTimestamp = syncData.locale.updatedAt;

        if (currentLocaleTimestamp && clientLocaleTimestamp && 
            new Date(currentLocaleTimestamp) > new Date(clientLocaleTimestamp)) {
          results.conflicts.push({
            section: 'locale',
            serverTimestamp: currentLocaleTimestamp,
            clientTimestamp: clientLocaleTimestamp,
            message: 'Server has newer locale settings'
          });
        } else {
          const updatedSettings = {
            ...currentProfile?.settings,
            locale: {
              ...syncData.locale,
              updatedAt: new Date().toISOString(),
              syncedFrom: deviceId
            }
          };

          const { error } = await supabase
            .from('profiles')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString()
            })
            .eq('id', jwtUser.userId)
            .eq('organization_id', orgData.id);

          if (error) {
            results.failed.push({ section: 'locale', error: error.message });
          } else {
            results.success.push('locale');
          }
        }
      } catch (error: any) {
        results.failed.push({ section: 'locale', error: error.message });
      }
    }

    // Sync security settings
    if (syncData.security) {
      try {
        const currentSecurityTimestamp = currentProfile?.settings?.security?.updatedAt;
        const clientSecurityTimestamp = syncData.security.updatedAt;

        if (currentSecurityTimestamp && clientSecurityTimestamp && 
            new Date(currentSecurityTimestamp) > new Date(clientSecurityTimestamp)) {
          results.conflicts.push({
            section: 'security',
            serverTimestamp: currentSecurityTimestamp,
            clientTimestamp: clientSecurityTimestamp,
            message: 'Server has newer security settings'
          });
        } else {
          const updatedSettings = {
            ...currentProfile?.settings,
            security: {
              ...syncData.security,
              updatedAt: new Date().toISOString(),
              syncedFrom: deviceId
            }
          };

          const { error } = await supabase
            .from('profiles')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString()
            })
            .eq('id', jwtUser.userId)
            .eq('organization_id', orgData.id);

          if (error) {
            results.failed.push({ section: 'security', error: error.message });
          } else {
            results.success.push('security');
          }
        }
      } catch (error: any) {
        results.failed.push({ section: 'security', error: error.message });
      }
    }

    console.log(`✅ Settings sync completed for device ${deviceId}:`, results);

    return NextResponse.json({
      success: true,
      message: 'Settings sync completed',
      results,
      serverTimestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Settings sync push error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}