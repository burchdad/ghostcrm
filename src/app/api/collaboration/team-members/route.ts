import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJwtToken } from '@/lib/jwt';

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
    // Get tenant ID from query params or JWT
    const { searchParams } = new URL(request.url);
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