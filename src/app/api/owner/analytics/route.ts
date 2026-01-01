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

    // Return empty analytics data - will be populated with real business data
    const analyticsData = {
      revenue: {
        total: 0,
        monthly: 0,
        growth: 0,
        target: 0
      },
      customers: {
        total: 0,
        new: 0,
        retention: 0,
        satisfaction: 0
      },
      performance: {
        leadsGenerated: 0,
        conversionRate: 0,
        avgDealSize: 0,
        salesCycle: 0
      },
      team: {
        totalMembers: 0,
        activeMembers: 0,
        productivity: 0,
        topPerformer: null
      },
      trends: {
        dailyRevenue: [],
        weeklyLeads: [],
        monthlyGrowth: []
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Owner analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}