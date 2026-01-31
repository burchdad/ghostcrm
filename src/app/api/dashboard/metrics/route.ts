import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

// Force dynamic rendering for request.url usage
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics for tenant owner
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Get leads count
    const { count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get active deals count
    const { count: dealsCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .neq('status', 'closed');

    // Calculate monthly revenue (mock for now)
    const monthlyRevenue = (dealsCount || 0) * 15000; // Average deal value

    // Calculate conversion rate (mock for now)
    const conversionRate = leadsCount && dealsCount ? 
      Math.round((dealsCount / leadsCount) * 100) : 0;

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('audit_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    const metrics = {
      totalLeads: leadsCount || 0,
      activeDeals: dealsCount || 0,
      monthlyRevenue,
      conversionRate,
      teamPerformance: 0, // Will be calculated from real performance data
      upcomingAppointments: 0,
      recentActivity: (recentActivity || []).map(activity => ({
        id: activity.id,
        type: activity.entity || 'system',
        description: activity.details || activity.action,
        timestamp: new Date(activity.created_at),
        user: activity.user_email || 'System'
      }))
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}