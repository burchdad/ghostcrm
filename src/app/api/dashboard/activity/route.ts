import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate realistic recent activities
    const activities = [
      {
        id: 'activity_1',
        type: 'sale_completed',
        title: 'New sale completed',
        description: '2024 Honda Civic - $28,500',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'success',
        drilldown: {
          url: '/tenant-owner/deals/deal_123',
          action: 'View Deal Details'
        }
      },
      {
        id: 'activity_2',
        type: 'team_member_added',
        title: 'Team member added',
        description: 'Sarah Johnson joined as Sales Rep',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        status: 'info',
        drilldown: {
          url: '/tenant-owner/team/sarah_johnson',
          action: 'View Team Member'
        }
      },
      {
        id: 'activity_3',
        type: 'inventory_update',
        title: 'Inventory update',
        description: '15 new vehicles added',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'warning',
        drilldown: {
          url: '/tenant-owner/inventory',
          action: 'View Inventory'
        }
      },
      {
        id: 'activity_4',
        type: 'new_lead',
        title: 'New lead generated',
        description: 'Mike Rodriguez via website',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        status: 'info',
        drilldown: {
          url: '/tenant-owner/leads/lead_456',
          action: 'View Lead Details'
        }
      }
    ];

    return NextResponse.json({
      activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}