import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock live dashboard data - realistic automotive dealership metrics
    const liveData = {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      todayLeads: Math.floor(Math.random() * 20) + 5,
      todayDeals: Math.floor(Math.random() * 10) + 8, // More realistic for active deals
      systemHealth: 'healthy',
      notifications: [
        {
          id: 1,
          type: 'info',
          message: 'New lead assigned to your team',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'success',
          message: 'Deal closed successfully',
          timestamp: new Date().toISOString()
        }
      ],
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