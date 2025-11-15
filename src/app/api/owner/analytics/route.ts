import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock owner analytics data
    const analyticsData = {
      revenue: {
        total: 485000,
        monthly: 45000,
        growth: 12.5,
        target: 500000
      },
      customers: {
        total: 245,
        new: 18,
        retention: 94.2,
        satisfaction: 4.6
      },
      performance: {
        leadsGenerated: 156,
        conversionRate: 24.8,
        avgDealSize: 3200,
        salesCycle: 18
      },
      team: {
        totalMembers: 12,
        activeMembers: 11,
        productivity: 87,
        topPerformer: 'Sarah Johnson'
      },
      trends: {
        dailyRevenue: [3200, 4100, 2800, 5500, 4200, 3800, 4600],
        weeklyLeads: [45, 52, 38, 61, 49, 44, 56],
        monthlyGrowth: [8.2, 12.1, 9.8, 15.3, 11.7, 13.2, 12.5]
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Owner analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}