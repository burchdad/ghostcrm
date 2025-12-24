import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

// GET - Export user settings
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Settings export request received');

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

    // Get organization info
    let orgData;
    if (jwtUser.organizationId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain, name')
        .eq('id', jwtUser.organizationId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, subdomain, name')
        .eq('subdomain', jwtUser.subdomain || 'default')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      orgData = data;
    }

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select(`
        id, email, full_name, title, department, location, phone, 
        avatar_url, settings, created_at, updated_at
      `)
      .eq('id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    // Get notification preferences
    const { data: notificationData } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', jwtUser.userId)
      .eq('organization_id', orgData.id)
      .single();

    // Get query parameter for format
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';

    // Prepare export data
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        formatVersion: '1.0',
        source: 'GhostCRM User Settings',
        userId: jwtUser.userId,
        organizationId: orgData.id,
        organizationName: orgData.name
      },
      profile: {
        email: profileData?.email || '',
        fullName: profileData?.full_name || '',
        title: profileData?.title || '',
        department: profileData?.department || '',
        location: profileData?.location || '',
        phone: profileData?.phone || '',
        avatarUrl: profileData?.avatar_url || null,
        memberSince: profileData?.created_at || null
      },
      appearance: profileData?.settings?.appearance || {},
      locale: profileData?.settings?.locale || {},
      security: profileData?.settings?.security || {},
      notifications: notificationData ? {
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
        }
      } : {}
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvLines: string[] = [];
      csvLines.push('Setting Category,Setting Name,Value');
      
      // Profile settings
      Object.entries(exportData.profile).forEach(([key, value]) => {
        csvLines.push(`Profile,${key},"${value || ''}"`);
      });
      
      // Appearance settings
      const flattenObject = (obj: any, prefix: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            flattenObject(value, `${prefix}.${key}`);
          } else {
            csvLines.push(`${prefix},${key},"${value || ''}"`);
          }
        });
      };
      
      if (exportData.appearance && Object.keys(exportData.appearance).length > 0) {
        flattenObject(exportData.appearance, 'Appearance');
      }
      
      if (exportData.locale && Object.keys(exportData.locale).length > 0) {
        flattenObject(exportData.locale, 'Locale');
      }
      
      if (exportData.security && Object.keys(exportData.security).length > 0) {
        flattenObject(exportData.security, 'Security');
      }
      
      if (exportData.notifications && Object.keys(exportData.notifications).length > 0) {
        flattenObject(exportData.notifications, 'Notifications');
      }

      const csvContent = csvLines.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ghostcrm-settings-${Date.now()}.csv"`
        }
      });
    }

    // Default JSON format
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="ghostcrm-settings-${Date.now()}.json"`
      }
    });

  } catch (error: any) {
    console.error('❌ Settings export error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Import user settings
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Settings import request received');

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

    const importData = await request.json();

    // Validate import data structure
    if (!importData || typeof importData !== 'object') {
      return NextResponse.json({ error: 'Invalid import data format' }, { status: 400 });
    }

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

    const results: { success: string[], failed: { section: string, error: string }[] } = { success: [], failed: [] };

    // Import profile settings (excluding sensitive data like email)
    if (importData.profile) {
      try {
        const profileUpdates: any = {};
        
        // Only allow safe profile fields
        const allowedFields = ['full_name', 'title', 'department', 'location', 'phone'];
        allowedFields.forEach(field => {
          const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          if (importData.profile[camelField] !== undefined) {
            profileUpdates[field] = importData.profile[camelField];
          }
        });

        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', jwtUser.userId)
            .eq('organization_id', orgData.id);

          if (error) {
            results.failed.push({ section: 'profile', error: error.message });
          } else {
            results.success.push('profile');
          }
        }
      } catch (error: any) {
        results.failed.push({ section: 'profile', error: error.message });
      }
    }

    // Import appearance settings
    if (importData.appearance) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            settings: supabase.rpc('jsonb_set_nested', {
              target: 'settings',
              path: '{appearance}',
              new_value: JSON.stringify(importData.appearance)
            }),
            updated_at: new Date().toISOString()
          })
          .eq('id', jwtUser.userId)
          .eq('organization_id', orgData.id);

        if (error) {
          results.failed.push({ section: 'appearance', error: error.message });
        } else {
          results.success.push('appearance');
        }
      } catch (error: any) {
        results.failed.push({ section: 'appearance', error: error.message });
      }
    }

    // Import locale settings
    if (importData.locale) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            settings: supabase.rpc('jsonb_set_nested', {
              target: 'settings',
              path: '{locale}',
              new_value: JSON.stringify(importData.locale)
            }),
            updated_at: new Date().toISOString()
          })
          .eq('id', jwtUser.userId)
          .eq('organization_id', orgData.id);

        if (error) {
          results.failed.push({ section: 'locale', error: error.message });
        } else {
          results.success.push('locale');
        }
      } catch (error: any) {
        results.failed.push({ section: 'locale', error: error.message });
      }
    }

    // Import notification settings
    if (importData.notifications) {
      try {
        const notificationUpdates: any = {};
        
        // Map notification settings to database columns
        if (importData.notifications.emailEnabled !== undefined) {
          notificationUpdates.email_enabled = importData.notifications.emailEnabled;
        }
        
        if (importData.notifications.emailSettings) {
          const email = importData.notifications.emailSettings;
          if (email.newLeads !== undefined) notificationUpdates.email_new_leads = email.newLeads;
          if (email.leadUpdates !== undefined) notificationUpdates.email_lead_updates = email.leadUpdates;
          if (email.dealClosed !== undefined) notificationUpdates.email_deal_closed = email.dealClosed;
          if (email.taskReminders !== undefined) notificationUpdates.email_task_reminders = email.taskReminders;
          if (email.systemAlerts !== undefined) notificationUpdates.email_system_alerts = email.systemAlerts;
          if (email.dailyDigest !== undefined) notificationUpdates.email_daily_digest = email.dailyDigest;
          if (email.weeklyReports !== undefined) notificationUpdates.email_weekly_reports = email.weeklyReports;
          if (email.marketingUpdates !== undefined) notificationUpdates.email_marketing_updates = email.marketingUpdates;
          if (email.teamMentions !== undefined) notificationUpdates.email_team_mentions = email.teamMentions;
          if (email.securityAlerts !== undefined) notificationUpdates.email_security_alerts = email.securityAlerts;
        }

        if (Object.keys(notificationUpdates).length > 0) {
          notificationUpdates.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('user_notification_preferences')
            .upsert({
              user_id: jwtUser.userId,
              organization_id: orgData.id,
              ...notificationUpdates
            });

          if (error) {
            results.failed.push({ section: 'notifications', error: error.message });
          } else {
            results.success.push('notifications');
          }
        }
      } catch (error: any) {
        results.failed.push({ section: 'notifications', error: error.message });
      }
    }

    console.log('✅ Settings import completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Settings import completed',
      results
    });

  } catch (error: any) {
    console.error('❌ Settings import error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}