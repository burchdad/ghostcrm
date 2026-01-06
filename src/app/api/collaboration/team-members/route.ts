import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

// Types for better type safety
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/collaboration/team-members
 * Retrieve all team members for the authenticated user's tenant/organization
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Invalid user or missing organization' }, { status: 401 });
    }

    const tenantId = user.organizationId;

    // Get team members for the organization using organization_memberships
    const { data: members, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        status,
        last_seen,
        avatar_url
      `)
      .eq('organization_id', tenantId);

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const formattedMembers: TeamMember[] = (members || []).map((member: any) => ({
      id: member.id,
      name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email.split('@')[0],
      email: member.email,
      role: member.role || 'member',
      avatar: member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.email)}&background=667eea&color=white`,
      status: member.status || 'offline',
      lastSeen: new Date(member.last_seen || new Date())
    }));

    return NextResponse.json(formattedMembers);

  } catch (error) {
    console.error('Error in team-members API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}