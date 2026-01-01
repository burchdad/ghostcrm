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

    // Return empty activities - data will come from real audit events
    const activities = [];

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