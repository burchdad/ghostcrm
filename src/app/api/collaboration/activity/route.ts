import { NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Return mock activity data
    return NextResponse.json({
      status: 'success',
      data: {
        activities: [
          {
            id: '1',
            type: 'lead_created',
            user: 'John Doe',
            timestamp: new Date().toISOString(),
            description: 'Created new lead for Honda Civic'
          },
          {
            id: '2',
            type: 'deal_updated',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            description: 'Updated deal status to pending'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
