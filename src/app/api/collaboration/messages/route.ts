import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwtToken } from '@/lib/jwt';

// Types for better type safety
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/collaboration/messages
 * Retrieve messages for a specific channel
 */
export async function GET(request: NextRequest) {
  try {
    // Get params from query
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    let tenantId = searchParams.get('tenantId');

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

    // Use organization ID from token if not provided in query
    tenantId = tenantId || decoded.organizationId;

    // Verify user has access to this tenant
    if (decoded.organizationId !== tenantId) {
      return NextResponse.json({ error: 'Unauthorized access to tenant data' }, { status: 403 });
    }

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Verify channel access and tenant ownership
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
        !channel.members?.includes(decoded.userId)) {
      return NextResponse.json(
        { error: 'Access denied to this channel' },
        { status: 403 }
      );
    }

    // Get messages for the channel
    const { data: messages, error } = await supabase
      .from('collaboration_messages')
      .select(`
        id,
        content,
        message_type,
        created_at,
        user_id,
        attachments,
        users:user_id(email, first_name, last_name)
      `)
      .eq('channel_id', channelId)
      .eq('organization_id', tenantId)
      .order('created_at', { ascending: true })
      .limit(100); // Limit to last 100 messages

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const formattedMessages: Message[] = (messages || []).map((message: any) => ({
      id: message.id,
      senderId: message.user_id,
      senderName: message.users && message.users[0] ? 
        `${message.users[0].first_name || ''} ${message.users[0].last_name || ''}`.trim() || 
        message.users[0].email?.split('@')[0] : 
        'Unknown',
      content: message.content,
      timestamp: new Date(message.created_at),
      type: message.message_type || 'text',
      attachments: message.attachments || []
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collaboration/messages
 * Send a new message to a channel
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
    const { content, channelId } = body;

    // Validate input
    if (!content || !channelId) {
      return NextResponse.json(
        { error: 'Content and channel ID are required' },
        { status: 400 }
      );
    }

    // Verify channel access and tenant ownership
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

    // Create message
    const { data: message, error } = await supabase
      .from('collaboration_messages')
      .insert([{
        content,
        channel_id: channelId,
        user_id: userId,
        organization_id: tenantId,
        message_type: 'text'
      }])
      .select(`
        id,
        content,
        message_type,
        created_at,
        user_id,
        users:user_id(email, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update channel's last message
    await supabase
      .from('collaboration_channels')
      .update({ 
        last_message_id: message.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', channelId);

    // Transform to frontend format
    const formattedMessage: Message = {
      id: message.id,
      senderId: message.user_id,
      senderName: message.users && message.users[0] ? 
        `${message.users[0].first_name || ''} ${message.users[0].last_name || ''}`.trim() || 
        message.users[0].email?.split('@')[0] : 
        'Unknown',
      content: message.content,
      timestamp: new Date(message.created_at),
      type: message.message_type || 'text',
      attachments: []
    };

    return NextResponse.json(formattedMessage);

  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}