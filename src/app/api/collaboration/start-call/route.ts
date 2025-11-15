import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwtToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/collaboration/start-call
 * Start video calls for channels
 */
export async function POST(request: NextRequest) {
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

    const tenantId = decoded.organizationId;
    const userId = decoded.userId;

    // Parse request body
    const body = await request.json();
    const { channelId } = body;

    // Validate input
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
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

    // Generate call URL
    const callUrl = `https://meet.ghostcrm.com/instant/${channelId}`;

    // Create call record
    const { data: call, error } = await supabase
      .from('collaboration_calls')
      .insert([{
        channel_id: channelId,
        initiator_id: userId,
        organization_id: tenantId,
        call_url: callUrl,
        call_type: 'video',
        status: 'active',
        participants: [userId]
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating call:', error);
      return NextResponse.json(
        { error: 'Failed to start call' },
        { status: 500 }
      );
    }

    // Return call data
    const callData = {
      callUrl: call.call_url,
      channelId: call.channel_id,
      status: call.status,
      startTime: new Date(call.created_at)
    };

    return NextResponse.json(callData);

  } catch (error) {
    console.error('Error in start call API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}