import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
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