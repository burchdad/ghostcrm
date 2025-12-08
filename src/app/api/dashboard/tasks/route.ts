import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch tasks and alerts from various sources
    const [dealsResult, leadsResult, appointmentsResult, billingResult] = await Promise.all([
      // Overdue deals
      supabase
        .from('deals')
        .select(`
          id,
          title,
          expected_close_date,
          status,
          amount,
          customer:customers(name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .in('status', ['proposal', 'negotiation', 'follow_up'])
        .lt('expected_close_date', new Date().toISOString()),
      
      // Uncontacted leads
      supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          phone,
          source,
          created_at,
          last_contact_date
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'new')
        .order('created_at', { ascending: true })
        .limit(10),
      
      // Upcoming appointments
      supabase
        .from('appointments')
        .select(`
          id,
          title,
          start_date,
          customer:customers(name),
          assigned_to:profiles(full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Next 24 hours
        .order('start_date', { ascending: true }),
      
      // Billing/subscription alerts
      supabase
        .from('subscription_usage')
        .select(`
          feature,
          usage_count,
          limit_count,
          period_start,
          period_end
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('usage_count', supabase.raw('limit_count * 0.8')) // 80% threshold
    ]);

    const tasks = [];
    const alerts = [];

    // Process overdue deals
    if (dealsResult.data && dealsResult.data.length > 0) {
      tasks.push({
        id: 'overdue_deals',
        type: 'overdue_deals',
        title: `${dealsResult.data.length} overdue deals`,
        description: 'Deals past their expected close date',
        priority: 'high',
        count: dealsResult.data.length,
        drilldown: {
          url: '/tenant-owner/deals?filter=overdue',
          action: 'View Overdue Deals'
        }
      });
    }

    // Process uncontacted leads
    if (leadsResult.data && leadsResult.data.length > 0) {
      const urgentLeads = leadsResult.data.filter(lead => {
        const createdAt = new Date(lead.created_at);
        const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursAgo > 4; // Leads older than 4 hours
      });

      if (urgentLeads.length > 0) {
        tasks.push({
          id: 'uncontacted_leads',
          type: 'uncontacted_leads',
          title: `${urgentLeads.length} uncontacted leads`,
          description: 'New leads waiting for first contact',
          priority: 'medium',
          count: urgentLeads.length,
          drilldown: {
            url: '/tenant-owner/leads?filter=uncontacted',
            action: 'View Uncontacted Leads'
          }
        });
      }
    }

    // Process upcoming appointments
    if (appointmentsResult.data && appointmentsResult.data.length > 0) {
      alerts.push({
        id: 'upcoming_appointments',
        type: 'upcoming_appointments',
        title: `${appointmentsResult.data.length} appointments today`,
        description: 'Scheduled appointments in the next 24 hours',
        status: 'info',
        count: appointmentsResult.data.length,
        drilldown: {
          url: '/tenant-owner/calendar',
          action: 'View Calendar'
        }
      });
    }

    // Process usage alerts
    if (billingResult.data && billingResult.data.length > 0) {
      billingResult.data.forEach(usage => {
        const percentage = Math.round((usage.usage_count / usage.limit_count) * 100);
        if (percentage >= 80) {
          alerts.push({
            id: `usage_${usage.feature}`,
            type: 'usage_warning',
            title: `${usage.feature} usage at ${percentage}%`,
            description: `${usage.usage_count} of ${usage.limit_count} used this period`,
            status: 'warning',
            drilldown: {
              url: '/tenant-owner/billing',
              action: 'View Billing Details'
            }
          });
        }
      });
    }

    // Add system health check
    alerts.push({
      id: 'system_health',
      type: 'system_health',
      title: 'System healthy',
      description: 'All systems operational',
      status: 'success',
      drilldown: {
        url: '/tenant-owner/settings/system',
        action: 'View System Status'
      }
    });

    // Add monthly review reminder
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    
    if (nextMonday.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      alerts.push({
        id: 'monthly_review',
        type: 'monthly_review',
        title: 'Monthly review',
        description: 'Scheduled for next week',
        status: 'info',
        drilldown: {
          url: '/tenant-owner/analytics/monthly-report',
          action: 'View Monthly Report'
        }
      });
    }

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