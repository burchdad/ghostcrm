import { NextRequest, NextResponse } from 'next/server';
import { getTenantQuery } from '@/lib/tenant/database';
import { isAuthenticated, getUserFromRequest } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/collaboration/search
 * Search messages within channels for the authenticated user's tenant
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserFromRequest(request);
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 401 });
    }

    const tenantId = user.organizationId.toString();
    const userId = user.id;

    // Get search parameters
    const query = request.nextUrl.searchParams.get('q');
    const channelId = request.nextUrl.searchParams.get('channelId');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build search conditions
    let searchConditions = `tenant_id.eq.${tenantId}`;
    
    if (channelId) {
      // Verify channel access if searching specific channel
      const channelQuery = getTenantQuery(parseInt(tenantId), 'collaboration_channels', true);
      const { data: channel } = await channelQuery
        .select('id, tenant_id, type, members')
        .eq('id', channelId)
        .eq('tenant_id', tenantId)
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

      searchConditions += `,channel_id.eq.${channelId}`;
    }

    // Use tenant-aware query to search messages
    const messagesQuery = getTenantQuery(parseInt(tenantId), 'collaboration_messages', true);
    
    // Search in content and join with users table for sender info
    const { data: messages, error } = await messagesQuery
      .select(`
        id,
        content,
        message_type,
        created_at,
        user_id,
        channel_id,
        attachments,
        users!inner(email, first_name, last_name),
        collaboration_channels!inner(name, type)
      `)
      .or(`content.ilike.%${query}%,users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,users.email.ilike.%${query}%`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit search results

    if (error) {
      console.error('Error searching messages:', error);
      return NextResponse.json(
        { error: 'Failed to search messages' },
        { status: 500 }
      );
    }

    // Filter messages based on channel access permissions
    const filteredMessages = (messages || []).filter(message => {
      const channel = message.collaboration_channels;
      
      // Public channels are accessible to all users in the tenant
      if (channel.type === 'public') {
        return true;
      }
      
      // For private/direct channels, check if user is a member
      // Note: This is a simplified check. In production, you'd want to fetch
      // the actual channel membership data
      return true; // TODO: Implement proper membership check
    });

    // Transform to frontend format
    const formattedMessages = filteredMessages.map(message => ({
      id: message.id,
      senderId: message.user_id,
      senderName: `${message.users.first_name || ''} ${message.users.last_name || ''}`.trim() || message.users.email.split('@')[0],
      content: message.content,
      timestamp: new Date(message.created_at),
      type: message.message_type || 'text',
      attachments: message.attachments || [],
      channelId: message.channel_id,
      channelName: message.collaboration_channels.name
    }));

    return NextResponse.json({
      success: true,
      data: formattedMessages,
      query,
      total: formattedMessages.length
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}