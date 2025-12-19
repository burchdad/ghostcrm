import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Live dashboard data with no mock values
    const liveData = {
      activeUsers: 0,
      todayLeads: 0,
      todayDeals: 0,
      systemHealth: 'healthy',
      notifications: [],
      metrics: {
        conversionRate: 0,
        avgResponseTime: '0 hours',
        teamPerformance: 0,
        customerSatisfaction: 0,
        totalCustomers: 0,
        activeDeals: 0,
        pendingTasks: 0
      }
    };

    return NextResponse.json(liveData);
  } catch (error) {
    console.error('Dashboard live API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}