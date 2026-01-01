import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering for cookies() usage
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return empty team performance data - will be populated with real data
    const performanceData = {
      overview: {
        totalMembers: 0,
        activeToday: 0,
        avgPerformance: 0,
        totalDeals: 0,
        totalRevenue: 0
      },
      members: [],
      metrics: {
        totalSales: 0,
        avgDealSize: 0,
        conversionRate: 0,
        customerSatisfaction: 0
      },
      recentActivity: []
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Team performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}