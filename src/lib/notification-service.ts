import { EmailService } from './email-service';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Notification Types
export type NotificationType = 
  | 'new_lead'
  | 'lead_update' 
  | 'deal_closed'
  | 'task_reminder'
  | 'system_alert'
  | 'daily_digest'
  | 'weekly_report'
  | 'appointment_reminder'
  | 'lead_status_change'
  | 'team_invite'
  | 'security_alert';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  organizationId: string;
  userId?: string;
  entityId?: string;
  entityType?: 'lead' | 'deal' | 'appointment' | 'user' | 'organization';
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  phoneNumber?: string;
}

export interface UserNotificationPreferences {
  userId: string;
  emailNotifications: {
    enabled: boolean;
    newLeads: boolean;
    leadUpdates: boolean;
    dealClosed: boolean;
    taskReminders: boolean;
    systemAlerts: boolean;
    dailyDigest: boolean;
    weeklyReports: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber?: string;
    urgentAlertsOnly: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    browser: boolean;
    mobile: boolean;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send a notification through all enabled channels
   */
  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      console.log(`📢 [NOTIFICATION] Sending ${notificationData.type} notification for org ${notificationData.organizationId}`);
      
      // Get organization notification settings
      const orgSettings = await this.getOrganizationNotificationSettings(notificationData.organizationId);
      
      // Get user preferences if userId provided
      let userPreferences: UserNotificationPreferences | null = null;
      if (notificationData.userId) {
        userPreferences = await this.getUserNotificationPreferences(notificationData.userId);
      }

      const results: boolean[] = [];

      // Send through each requested channel if enabled
      for (const channel of notificationData.channels) {
        switch (channel) {
          case 'email':
            if (this.shouldSendEmail(notificationData, orgSettings, userPreferences)) {
              const emailSent = await this.sendEmailNotification(notificationData, orgSettings, userPreferences);
              results.push(emailSent);
            }
            break;
          
          case 'sms':
            if (this.shouldSendSMS(notificationData, orgSettings, userPreferences)) {
              const smsSent = await this.sendSMSNotification(notificationData, orgSettings, userPreferences);
              results.push(smsSent);
            }
            break;
          
          case 'push':
            if (this.shouldSendPush(notificationData, orgSettings, userPreferences)) {
              const pushSent = await this.sendPushNotification(notificationData, orgSettings, userPreferences);
              results.push(pushSent);
            }
            break;
          
          case 'in_app':
            const inAppSent = await this.createInAppNotification(notificationData);
            results.push(inAppSent);
            break;
        }
      }

      return results.every(result => result === true);

    } catch (error) {
      console.error('❌ [NOTIFICATION] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get organization notification settings from database
   */
  private async getOrganizationNotificationSettings(organizationId: string): Promise<NotificationSettings> {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('settings')
        .eq('organization_id', organizationId)
        .single();

      if (error || !data?.settings?.notifications) {
        // Return default settings if none found
        return {
          emailAlerts: true,
          smsAlerts: false,
          pushNotifications: true,
          weeklyReports: true,
        };
      }

      return data.settings.notifications;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error fetching org settings:', error);
      return {
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        weeklyReports: true,
      };
    }
  }

  /**
   * Get user notification preferences from database
   */
  private async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null; // Use organization defaults
      }

      return data as UserNotificationPreferences;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Check if email notification should be sent
   */
  private shouldSendEmail(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): boolean {
    // Organization level check
    if (!orgSettings.emailAlerts) return false;
    
    // User level check (overrides org settings if exists)
    if (userPreferences?.emailNotifications) {
      if (!userPreferences.emailNotifications.enabled) return false;
      
      // Check specific notification type preferences
      switch (notification.type) {
        case 'new_lead':
          return userPreferences.emailNotifications.newLeads;
        case 'lead_update':
        case 'lead_status_change':
          return userPreferences.emailNotifications.leadUpdates;
        case 'deal_closed':
          return userPreferences.emailNotifications.dealClosed;
        case 'task_reminder':
        case 'appointment_reminder':
          return userPreferences.emailNotifications.taskReminders;
        case 'system_alert':
        case 'security_alert':
          return userPreferences.emailNotifications.systemAlerts;
        case 'daily_digest':
          return userPreferences.emailNotifications.dailyDigest;
        case 'weekly_report':
          return userPreferences.emailNotifications.weeklyReports;
        default:
          return true;
      }
    }

    return true; // Default to enabled if no user preferences
  }

  /**
   * Check if SMS notification should be sent
   */
  private shouldSendSMS(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): boolean {
    // Organization level check
    if (!orgSettings.smsAlerts) return false;
    
    // User level check
    if (userPreferences?.smsNotifications) {
      if (!userPreferences.smsNotifications.enabled) return false;
      if (!userPreferences.smsNotifications.phoneNumber) return false;
      
      // If user has "urgent alerts only" enabled, only send critical notifications
      if (userPreferences.smsNotifications.urgentAlertsOnly) {
        return notification.priority === 'critical';
      }
    }

    // Only send SMS for high/critical priority by default
    return notification.priority === 'high' || notification.priority === 'critical';
  }

  /**
   * Check if push notification should be sent
   */
  private shouldSendPush(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): boolean {
    // Organization level check
    if (!orgSettings.pushNotifications) return false;
    
    // User level check
    if (userPreferences?.pushNotifications) {
      return userPreferences.pushNotifications.enabled;
    }

    return true; // Default to enabled
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): Promise<boolean> {
    try {
      // Get user email if userId provided
      let userEmail = '';
      if (notification.userId) {
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', notification.userId)
          .single();
        
        userEmail = user?.email || '';
      }

      if (!userEmail) {
        console.warn('⚠️ [NOTIFICATION] No user email found for notification');
        return false;
      }

      // Create email template based on notification type
      const emailTemplate = this.createEmailTemplate(notification);
      
      return await this.emailService.sendNotificationEmail(userEmail, emailTemplate);
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error sending email:', error);
      return false;
    }
  }

  /**
   * Send SMS notification (placeholder - requires Twilio integration)
   */
  private async sendSMSNotification(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): Promise<boolean> {
    try {
      // TODO: Implement Twilio SMS integration
      console.log('📱 [SMS] SMS notification would be sent:', notification.title);
      return true; // Placeholder
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send push notification (placeholder - requires service worker)
   */
  private async sendPushNotification(
    notification: NotificationData, 
    orgSettings: NotificationSettings, 
    userPreferences?: UserNotificationPreferences | null
  ): Promise<boolean> {
    try {
      // TODO: Implement web push notifications
      console.log('📧 [PUSH] Push notification would be sent:', notification.title);
      return true; // Placeholder
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error sending push:', error);
      return false;
    }
  }

  /**
   * Create in-app notification record
   */
  private async createInAppNotification(notification: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          organization_id: notification.organizationId,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entity_id: notification.entityId,
          entity_type: notification.entityType,
          priority: notification.priority,
          metadata: notification.metadata,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ [NOTIFICATION] Database insert error:', error);
        return false;
      }

      console.log('✅ [NOTIFICATION] In-app notification created');
      return true;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error creating in-app notification:', error);
      return false;
    }
  }

  /**
   * Create email template based on notification type
   */
  private createEmailTemplate(notification: NotificationData) {
    const templates: Record<NotificationType, { subject: string; template: string }> = {
      new_lead: {
        subject: '🎯 New Lead Received',
        template: `
          <h2>New Lead Alert</h2>
          <p>You have received a new lead:</p>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p>Priority: ${notification.priority}</p>
        `
      },
      lead_update: {
        subject: '📝 Lead Update',
        template: `
          <h2>Lead Update</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      deal_closed: {
        subject: '🎉 Deal Closed!',
        template: `
          <h2>Congratulations!</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      task_reminder: {
        subject: '⏰ Task Reminder',
        template: `
          <h2>Task Reminder</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      system_alert: {
        subject: '🚨 System Alert',
        template: `
          <h2>System Alert</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p>Priority: ${notification.priority}</p>
        `
      },
      daily_digest: {
        subject: '📊 Daily Digest',
        template: `
          <h2>Daily Activity Summary</h2>
          <p>${notification.message}</p>
        `
      },
      weekly_report: {
        subject: '📈 Weekly Report',
        template: `
          <h2>Weekly Performance Report</h2>
          <p>${notification.message}</p>
        `
      },
      appointment_reminder: {
        subject: '📅 Appointment Reminder',
        template: `
          <h2>Appointment Reminder</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      lead_status_change: {
        subject: '🔄 Lead Status Changed',
        template: `
          <h2>Lead Status Update</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      team_invite: {
        subject: '👥 Team Invitation',
        template: `
          <h2>Team Invitation</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
        `
      },
      security_alert: {
        subject: '🔒 Security Alert',
        template: `
          <h2>Security Alert</h2>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p>Priority: ${notification.priority}</p>
        `
      }
    };

    return templates[notification.type] || {
      subject: notification.title,
      template: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
      `
    };
  }

  /**
   * Quick notification methods for common CRM events
   */
  async notifyNewLead(organizationId: string, userId: string, leadData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'new_lead',
      title: 'New Lead Received',
      message: `A new lead "${leadData.name || 'Unknown'}" has been assigned to you.`,
      organizationId,
      userId,
      entityId: leadData.id,
      entityType: 'lead',
      priority: 'medium',
      channels: ['email', 'push', 'in_app'],
      metadata: { leadId: leadData.id, source: leadData.source }
    });
  }

  async notifyDealClosed(organizationId: string, userId: string, dealData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'deal_closed',
      title: 'Deal Closed!',
      message: `Congratulations! Deal "${dealData.name || 'Unknown'}" worth $${dealData.value || '0'} has been closed.`,
      organizationId,
      userId,
      entityId: dealData.id,
      entityType: 'deal',
      priority: 'high',
      channels: ['email', 'push', 'in_app'],
      metadata: { dealId: dealData.id, value: dealData.value }
    });
  }

  async notifyAppointmentReminder(organizationId: string, userId: string, appointmentData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'appointment_reminder',
      title: 'Upcoming Appointment',
      message: `You have an appointment "${appointmentData.title}" scheduled for ${appointmentData.date}.`,
      organizationId,
      userId,
      entityId: appointmentData.id,
      entityType: 'appointment',
      priority: 'medium',
      channels: ['email', 'sms', 'push', 'in_app'],
      metadata: { appointmentId: appointmentData.id, date: appointmentData.date }
    });
  }

  async notifySystemAlert(organizationId: string, title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<boolean> {
    return this.sendNotification({
      type: 'system_alert',
      title,
      message,
      organizationId,
      entityType: 'organization',
      priority,
      channels: ['email', 'push', 'in_app'],
      metadata: { alertType: 'system' }
    });
  }
}

export default NotificationService;