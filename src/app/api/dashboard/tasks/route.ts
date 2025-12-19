import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return empty tasks and alerts - data will come from real business logic
    const tasks = [];
    const alerts = [];

    return NextResponse.json({ 
      tasks, 
      alerts,
      summary: {
        totalTasks: 0,
        highPriorityTasks: 0,
        overdueTasks: 0
      }
    });
  } catch (error) {
    console.error('Error fetching tasks and alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}