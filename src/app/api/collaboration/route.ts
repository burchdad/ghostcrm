import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwtToken } from '@/lib/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

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
      .eq('organization_id', decoded.organizationId);

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

    // Create collaboration session in database
    const { data: session, error } = await supabase
      .from('collaboration_sessions')
      .insert({
        organization_id: decoded.organizationId,
        user_id: decoded.userId,
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
        participants: [decoded.userId],
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
