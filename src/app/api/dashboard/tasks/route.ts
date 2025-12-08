import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate realistic tasks and alerts
    const tasks = [
      {
        id: 'task_overdue_deals',
        type: 'overdue_deals',
        title: '3 overdue deals',
        description: 'Deals past their expected close date',
        priority: 'high',
        count: 3,
        drilldown: {
          url: '/tenant-owner/deals?filter=overdue',
          action: 'View Overdue Deals'
        }
      },
      {
        id: 'task_uncontacted_leads',
        type: 'uncontacted_leads',
        title: '5 uncontacted leads',
        description: 'New leads waiting for first contact',
        priority: 'medium',
        count: 5,
        drilldown: {
          url: '/tenant-owner/leads?filter=uncontacted',
          action: 'View Uncontacted Leads'
        }
      }
    ];

    const alerts = [
      {
        id: 'alert_upcoming_appointments',
        type: 'upcoming_appointments',
        title: '4 appointments today',
        description: 'Scheduled appointments in the next 24 hours',
        status: 'info',
        count: 4,
        drilldown: {
          url: '/tenant-owner/calendar',
          action: 'View Calendar'
        }
      },
      {
        id: 'alert_system_health',
        type: 'system_health',
        title: 'System healthy',
        description: 'All systems operational',
        status: 'success',
        drilldown: {
          url: '/tenant-owner/settings/system',
          action: 'View System Status'
        }
      },
      {
        id: 'alert_monthly_review',
        type: 'monthly_review',
        title: 'Monthly review',
        description: 'Scheduled for next week',
        status: 'info',
        drilldown: {
          url: '/tenant-owner/analytics/monthly-report',
          action: 'View Monthly Report'
        }
      }
    ];

    return NextResponse.json({
      tasks,
      alerts,
      summary: {
        totalTasks: tasks.length,
        totalAlerts: alerts.length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length
      }
    });

  } catch (error) {
    console.error('Error fetching tasks and alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}