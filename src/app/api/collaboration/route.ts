import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Invalid token or missing organization' }, { status: 401 });
    }

    // Get collaboration status from database
    const { data: onlineUsers, error: usersError } = await supabase
      .from('user_organizations')
      .select(`
        user_id,
        users:user_id (
          id,
          name,
          email
        )
      `)
      .eq('organization_id', user.organizationId);

    if (usersError) {
      console.error('Error fetching team members:', usersError);
      return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
    }

    const activeCollaborators = onlineUsers?.length || 0;
    const userList = onlineUsers?.map(item => (item as any).users?.id).filter(Boolean) || [];

    return NextResponse.json({
      status: 'success',
      data: {
        activeCollaborators,
        onlineUsers: userList,
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Collaboration API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaboration status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get authenticated user from Supabase session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'Invalid token or missing organization' }, { status: 401 });
    }

    // Create collaboration session in database
    const { data: session, error } = await supabase
      .from('collaboration_sessions')
      .insert({
        organization_id: user.organizationId,
        user_id: user.id,
        session_type: body.type || 'general',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating collaboration session:', error);
      return NextResponse.json({ error: 'Failed to create collaboration session' }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      data: {
        sessionId: session.id,
        participants: [user.id],
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('Collaboration creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create collaboration session' },
      { status: 500 }
    );
  }
}
