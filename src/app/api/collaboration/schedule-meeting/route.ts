import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/collaboration/schedule-meeting
 * Schedule meetings for channels
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Invalid token or missing organization' }, { status: 401 });
    }

    const tenantId = user.organizationId;
    const userId = user.id;

    // Parse request body
    const body = await request.json();
    const { title, description, start, end, attendees, channelId } = body;

    // Validate input
    if (!title || !start || !end || !channelId) {
      return NextResponse.json(
        { error: 'Title, start time, end time, and channel ID are required' },
        { status: 400 }
      );
    }

    // Verify channel access
    const { data: channel } = await supabase
      .from('collaboration_channels')
      .select('id, organization_id, type, members')
      .eq('id', channelId)
      .eq('organization_id', tenantId)
      .single();

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found or access denied' },
        { status: 404 }
      );
    }

    // For private/direct channels, verify user is a member
    if ((channel.type === 'private' || channel.type === 'direct') && 
        !channel.members?.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied to this channel' },
        { status: 403 }
      );
    }

    // Generate meeting link
    const meetingLink = `https://meet.ghostcrm.com/room/${Date.now()}`;

    // Create meeting
    const { data: meeting, error } = await supabase
      .from('collaboration_meetings')
      .insert([{
        title,
        description: description || null,
        start_time: start,
        end_time: end,
        attendees: attendees || [],
        channel_id: channelId,
        organizer_id: userId,
        organization_id: tenantId,
        meeting_link: meetingLink,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      return NextResponse.json(
        { error: 'Failed to schedule meeting' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const formattedMeeting = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      start: new Date(meeting.start_time),
      end: new Date(meeting.end_time),
      type: 'meeting' as const,
      attendees: meeting.attendees,
      channelId: meeting.channel_id,
      meetingLink: meeting.meeting_link
    };

    return NextResponse.json(formattedMeeting);

  } catch (error) {
    console.error('Error in schedule meeting API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}