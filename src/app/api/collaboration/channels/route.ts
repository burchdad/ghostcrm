import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth/server';

// Types for better type safety
interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  memberCount: number;
  lastMessage?: any;
  unreadCount: number;
  createdAt: Date;
  createdBy: string;
}

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/collaboration/channels
 * Retrieve all channels for the authenticated user's tenant/organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from query params
    const { searchParams } = new URL(request.url);
    let tenantId = searchParams.get('tenantId');

    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'TOKEN_MISSING' }, { status: 401 });
    }

    // Use organization ID from user if not provided in query
    tenantId = tenantId || user.organizationId;
    const userId = user.id;

    // Verify user has access to this tenant
    if (user.organizationId !== tenantId) {
      return NextResponse.json({ error: 'Unauthorized access to tenant data' }, { status: 403 });
    }

    // Get channels for the organization
    const { data: channels, error } = await supabase
      .from('collaboration_channels')
      .select(`
        id,
        name,
        type,
        description,
        created_at,
        created_by,
        organization_id,
        member_count,
        last_message_id
      `)
      .eq('organization_id', tenantId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }

    // Get last messages for channels that have them
    const channelIds = channels?.filter(c => c.last_message_id).map(c => c.last_message_id) || [];
    let lastMessages: any[] = [];
    
    if (channelIds.length > 0) {
      const { data: messages } = await supabase
        .from('collaboration_messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users:user_id(email, first_name, last_name)
        `)
        .in('id', channelIds);
      
      lastMessages = messages || [];
    }

    // Transform to frontend format
    const formattedChannels: Channel[] = (channels || []).map((channel: any) => {
      const lastMessage = lastMessages.find(m => m.id === channel.last_message_id);
      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        description: channel.description,
        memberCount: channel.member_count || 0,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          timestamp: new Date(lastMessage.created_at),
          senderName: lastMessage.users ? 
            `${lastMessage.users.first_name || ''} ${lastMessage.users.last_name || ''}`.trim() || 
            lastMessage.users.email?.split('@')[0] : 
            'Unknown'
        } : null,
        unreadCount: 0, // TODO: Implement unread message count
        createdAt: new Date(channel.created_at),
        createdBy: channel.created_by
      };
    });

    return NextResponse.json({
      success: true,
      channels: formattedChannels
    });

  } catch (error) {
    console.error('Error in channels API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collaboration/channels
 * Create a new channel for the authenticated user's tenant/organization
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const tenantId = user.organizationId;
    const userId = user.id;

    // Parse request body
    const body = await request.json();
    const { name, description, type } = body;

    // Validate input
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (!['public', 'private', 'direct'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid channel type' },
        { status: 400 }
      );
    }

    // Create channel
    const { data: channel, error } = await supabase
      .from('collaboration_channels')
      .insert([{
        name,
        description: description || null,
        type,
        created_by: userId,
        organization_id: tenantId,
        member_count: 1,
        members: [userId] // Add creator as first member
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return NextResponse.json(
        { error: 'Failed to create channel' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const formattedChannel: Channel = {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      description: channel.description,
      memberCount: 1,
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date(channel.created_at),
      createdBy: channel.created_by
    };

    return NextResponse.json({
      success: true,
      channel: formattedChannel
    });

  } catch (error) {
    console.error('Error in create channel API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}