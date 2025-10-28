import { NextRequest, NextResponse } from "next/server";


export const dynamic = 'force-dynamic';
// Notification Settings Interface
interface NotificationSettings {
  // Email Notifications
  emailNotifications: {
    enabled: boolean;
    newLeads: boolean;
    leadUpdates: boolean;
    dealClosed: boolean;
    taskReminders: boolean;
    systemAlerts: boolean;
    dailyDigest: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
  };
  
  // Push Notifications
  pushNotifications: {
    enabled: boolean;
    browserPush: boolean;
    mobilePush: boolean;
    newMessages: boolean;
    appointments: boolean;
    deadlines: boolean;
    mentions: boolean;
    criticalAlerts: boolean;
  };
  
  // SMS Notifications
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
    urgentAlerts: boolean;
    appointmentReminders: boolean;
    leadStatusChanges: boolean;
    systemDowntime: boolean;
    securityAlerts: boolean;
  };
  
  // In-App Notifications
  inAppNotifications: {
    enabled: boolean;
    showDesktopAlerts: boolean;
    playSound: boolean;
    badgeCount: boolean;
    autoMarkRead: boolean;
    persistTime: number; // in seconds
  };
  
  // Scheduling & Frequency
  scheduling: {
    timezone: string;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    weekendNotifications: boolean;
    batchDigest: {
      enabled: boolean;
      frequency: 'hourly' | 'daily' | 'weekly';
      time: string; // HH:MM format
    };
  };
  
  // Advanced Settings
  advanced: {
    rateLimitPerHour: number;
    allowDuplicates: boolean;
    highPriorityBypass: boolean;
    deliveryMethod: 'immediate' | 'batched' | 'scheduled';
    retryFailedDeliveries: boolean;
    maxRetries: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Default notification settings
const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: {
    enabled: true,
    newLeads: true,
    leadUpdates: false,
    dealClosed: true,
    taskReminders: true,
    systemAlerts: true,
    dailyDigest: false,
    weeklyReports: true,
    marketingEmails: false
  },
  
  pushNotifications: {
    enabled: true,
    browserPush: true,
    mobilePush: true,
    newMessages: true,
    appointments: true,
    deadlines: true,
    mentions: true,
    criticalAlerts: true
  },
  
  smsNotifications: {
    enabled: false,
    phoneNumber: '',
    urgentAlerts: false,
    appointmentReminders: false,
    leadStatusChanges: false,
    systemDowntime: true,
    securityAlerts: true
  },
  
  inAppNotifications: {
    enabled: true,
    showDesktopAlerts: true,
    playSound: true,
    badgeCount: true,
    autoMarkRead: false,
    persistTime: 300 // 5 minutes
  },
  
  scheduling: {
    timezone: 'America/Los_Angeles',
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    weekendNotifications: false,
    batchDigest: {
      enabled: true,
      frequency: 'daily',
      time: '09:00'
    }
  },
  
  advanced: {
    rateLimitPerHour: 10,
    allowDuplicates: false,
    highPriorityBypass: true,
    deliveryMethod: 'immediate',
    retryFailedDeliveries: true,
    maxRetries: 3
  },
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// In production, this would come from a database
let notificationSettings: NotificationSettings = { ...defaultNotificationSettings };

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: notificationSettings
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch notification settings" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Validate SMS phone number if SMS is enabled
    if (updates.smsNotifications?.enabled && updates.smsNotifications?.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(updates.smsNotifications.phoneNumber)) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid phone number format" 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate rate limit
    if (updates.advanced?.rateLimitPerHour && updates.advanced.rateLimitPerHour < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Rate limit must be at least 1 per hour" 
        },
        { status: 400 }
      );
    }
    
    // Validate persist time
    if (updates.inAppNotifications?.persistTime && 
        (updates.inAppNotifications.persistTime < 10 || updates.inAppNotifications.persistTime > 3600)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Persist time must be between 10 and 3600 seconds" 
        },
        { status: 400 }
      );
    }
    
    // Update notification settings
    notificationSettings = {
      ...notificationSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // In production, save to database here
    // await db.notificationSettings.update({ where: { userId: userId }, data: notificationSettings });
    
    return NextResponse.json({
      success: true,
      data: notificationSettings,
      message: "Notification settings updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update notification settings" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { field, value } = await request.json();
    
    if (!field) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Field name is required" 
        },
        { status: 400 }
      );
    }
    
    // Update specific field using safer approach
    const updateObject = { ...notificationSettings };
    
    // Handle nested field updates
    if (field.includes('.')) {
      const keys = field.split('.');
      let current: any = updateObject;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    } else {
      (updateObject as any)[field] = value;
    }
    
    notificationSettings = updateObject;
    notificationSettings.updatedAt = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: notificationSettings,
      message: `${field} updated successfully`
    });
    
  } catch (error) {
    console.error("Error updating notification field:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update notification field" 
      },
      { status: 500 }
    );
  }
}

// Reset to defaults endpoint
export async function DELETE(request: NextRequest) {
  try {
    notificationSettings = { 
      ...defaultNotificationSettings,
      createdAt: notificationSettings.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: notificationSettings,
      message: "Notification settings reset to defaults"
    });
    
  } catch (error) {
    console.error("Error resetting notification settings:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to reset notification settings" 
      },
      { status: 500 }
    );
  }
}

// Test notification endpoint
export async function POST(request: NextRequest) {
  try {
    const { type, message } = await request.json();
    
    if (!type || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Type and message are required" 
        },
        { status: 400 }
      );
    }
    
    // Simulate sending test notification
    const testResults = {
      email: notificationSettings.emailNotifications.enabled,
      push: notificationSettings.pushNotifications.enabled,
      sms: notificationSettings.smsNotifications.enabled && !!notificationSettings.smsNotifications.phoneNumber,
      inApp: notificationSettings.inAppNotifications.enabled
    };
    
    // In production, actually send the test notifications here
    // await sendEmailNotification(message);
    // await sendPushNotification(message);
    // etc.
    
    return NextResponse.json({
      success: true,
      message: "Test notification sent",
      results: testResults
    });
    
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send test notification" 
      },
      { status: 500 }
    );
  }
}
