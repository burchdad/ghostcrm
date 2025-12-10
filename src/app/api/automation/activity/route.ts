import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwtToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/automation/activity
 * Fetch recent automation activity for organization
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = request.cookies.get('ghostcrm_jwt')?.value || 
                  request.cookies.get('jwt')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Invalid token or missing organization' }, { status: 401 });
    }

    const organizationId = decoded.organizationId;

    try {
      // Try to fetch from automation_activity table
      const { data: activities, error } = await supabase
        .from('automation_activity')
        .select(`
          id,
          workflow_id,
          workflow_name,
          action_type,
          status,
          created_at,
          automation_workflows(name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && !error.message.includes('relation "automation_activity" does not exist')) {
        throw error;
      }

      if (error) {
        console.error('Error fetching automation activity:', error);
        return NextResponse.json({ error: 'Failed to fetch automation activity' }, { status: 500 });
      }

      // Format activities for frontend
      const formattedActivities = (activities || []).map(activity => ({
        id: activity.id,
        type: 'workflow',
        name: activity.workflow_name || (activity as any).automation_workflows?.name || 'Unknown Workflow',
        action: activity.action_type,
        timestamp: formatTimestamp(activity.created_at),
        status: activity.status
      }));

      return NextResponse.json({ activity: formattedActivities });

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in activity API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

