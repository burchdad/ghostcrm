import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Return mock recent calls data
    // In production, this would fetch from your call logs database
    const recentCalls = [
      {
        id: '1',
        name: 'Sarah Chen',
        type: 'video',
        duration: '12m 34s',
        time: '2h ago',
        status: 'completed',
        avatar: 'SC',
        participants: 2
      },
      {
        id: '2',
        name: 'Sales Team',
        type: 'audio',
        duration: '25m 15s',
        time: '4h ago',
        status: 'completed',
        avatar: '#',
        participants: 5
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        type: 'video',
        duration: '0s',
        time: '6h ago',
        status: 'missed',
        avatar: 'MR',
        participants: 1
      },
      {
        id: '4',
        name: 'Project Alpha',
        type: 'audio',
        duration: '8m 22s',
        time: '1d ago',
        status: 'completed',
        avatar: 'PA',
        participants: 3
      }
    ];

    return NextResponse.json({
      status: 'success',
      data: {
        calls: recentCalls,
        totalCount: recentCalls.length
      }
    });
    
  } catch (error) {
    console.error('Recent calls API error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch recent calls',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}