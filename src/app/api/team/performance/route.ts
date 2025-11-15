import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock team performance data
    const performanceData = {
      overview: {
        totalMembers: 12,
        activeToday: 11,
        avgPerformance: 87.3,
        totalDeals: 45,
        totalRevenue: 285000
      },
      members: [
        {
          id: 1,
          name: 'Sarah Johnson',
          role: 'Sales Manager',
          performance: 94,
          deals: 12,
          revenue: 85000,
          status: 'online'
        },
        {
          id: 2,
          name: 'Mike Chen',
          role: 'Sales Rep',
          performance: 89,
          deals: 8,
          revenue: 45000,
          status: 'online'
        },
        {
          id: 3,
          name: 'Emily Davis',
          role: 'Sales Rep',
          performance: 91,
          deals: 10,
          revenue: 62000,
          status: 'away'
        },
        {
          id: 4,
          name: 'Alex Rodriguez',
          role: 'Sales Rep',
          performance: 82,
          deals: 6,
          revenue: 38000,
          status: 'online'
        },
        {
          id: 5,
          name: 'Lisa Wang',
          role: 'Sales Rep',
          performance: 88,
          deals: 9,
          revenue: 55000,
          status: 'offline'
        }
      ],
      metrics: {
        avgDealsPerPerson: 9,
        topPerformer: 'Sarah Johnson',
        teamGoalCompletion: 78,
        monthlyTarget: 350000,
        currentProgress: 285000
      },
      activities: [
        {
          member: 'Sarah Johnson',
          action: 'Closed deal worth $15,000',
          timestamp: '2 hours ago'
        },
        {
          member: 'Mike Chen',
          action: 'Added new lead from LinkedIn',
          timestamp: '3 hours ago'
        },
        {
          member: 'Emily Davis',
          action: 'Scheduled demo for tomorrow',
          timestamp: '4 hours ago'
        }
      ]
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Team performance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}