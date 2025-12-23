import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { NotificationService } from '@/lib/notification-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST - Send test notification
export async function POST(request: NextRequest) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationType } = body;

    if (!notificationType) {
      return NextResponse.json({ error: 'Notification type is required' }, { status: 400 });
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
        .select('id, name')
        .eq('id', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('subdomain', jwtOrganizationId)
        .single();
      orgData = data;
      if (error) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    const notificationService = NotificationService.getInstance();

    // Define test notifications
    const testNotifications = {
      new_lead: {
        type: 'new_lead' as const,
        title: 'Test: New Lead Received',
        message: 'This is a test notification for a new lead. A potential customer "John Doe" has submitted an inquiry about a 2024 Tesla Model 3.',
        priority: 'medium' as const,
        channels: ['email', 'push', 'in_app']
      },
      deal_closed: {
        type: 'deal_closed' as const,
        title: 'Test: Deal Closed!',
        message: 'Congratulations! This is a test notification for a closed deal. Deal "2024 BMW X5 - Sarah Johnson" worth $45,000 has been successfully closed.',
        priority: 'high' as const,
        channels: ['email', 'push', 'in_app']
      },
      task_reminder: {
        type: 'task_reminder' as const,
        title: 'Test: Task Reminder',
        message: 'This is a test reminder notification. You have a task "Follow up with Mike Wilson" due today at 3:00 PM.',
        priority: 'medium' as const,
        channels: ['email', 'push', 'in_app']
      },
      appointment_reminder: {
        type: 'appointment_reminder' as const,
        title: 'Test: Appointment Reminder',
        message: 'This is a test appointment notification. You have an appointment "Vehicle Test Drive - Lisa Chen" scheduled for tomorrow at 2:00 PM.',
        priority: 'medium' as const,
        channels: ['email', 'sms', 'push', 'in_app']
      },
      system_alert: {
        type: 'system_alert' as const,
        title: 'Test: System Alert',
        message: 'This is a test system alert notification. Your inventory sync completed successfully with 25 vehicles updated.',
        priority: 'low' as const,
        channels: ['email', 'push', 'in_app']
      },
      weekly_report: {
        type: 'weekly_report' as const,
        title: 'Test: Weekly Report',
        message: 'This is a test weekly report notification. Your team closed 12 deals this week totaling $340,000 in sales. Great work!',
        priority: 'low' as const,
        channels: ['email', 'in_app']
      }
    };

    const testNotification = testNotifications[notificationType as keyof typeof testNotifications];
    
    if (!testNotification) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send the test notification
    const result = await notificationService.sendNotification({
      ...testNotification,
      organizationId: orgData.id,
      userId: jwtUser.userId,
      entityType: 'test',
      metadata: {
        isTest: true,
        sentBy: jwtUser.userId,
        organizationName: orgData.name
      }
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test notification "${testNotification.title}" sent successfully!`,
        notificationType,
        channels: testNotification.channels
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test notification. Check your notification settings and try again.',
        notificationType
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get available test notification types
export async function GET(request: NextRequest) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    const availableTests = [
      {
        type: 'new_lead',
        name: 'New Lead Alert',
        description: 'Test notification for when a new lead is received',
        channels: ['email', 'push', 'in_app'],
        priority: 'medium'
      },
      {
        type: 'deal_closed',
        name: 'Deal Closed Celebration',
        description: 'Test notification for successful deal closure',
        channels: ['email', 'push', 'in_app'],
        priority: 'high'
      },
      {
        type: 'task_reminder',
        name: 'Task Reminder',
        description: 'Test notification for upcoming task reminders',
        channels: ['email', 'push', 'in_app'],
        priority: 'medium'
      },
      {
        type: 'appointment_reminder',
        name: 'Appointment Reminder',
        description: 'Test notification for appointment reminders',
        channels: ['email', 'sms', 'push', 'in_app'],
        priority: 'medium'
      },
      {
        type: 'system_alert',
        name: 'System Alert',
        description: 'Test notification for system alerts and updates',
        channels: ['email', 'push', 'in_app'],
        priority: 'low'
      },
      {
        type: 'weekly_report',
        name: 'Weekly Report',
        description: 'Test notification for weekly performance reports',
        channels: ['email', 'in_app'],
        priority: 'low'
      }
    ];

    return NextResponse.json({
      success: true,
      availableTests,
      totalTests: availableTests.length
    });

  } catch (error) {
    console.error('Error fetching test notification types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}