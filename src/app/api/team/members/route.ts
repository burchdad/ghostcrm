import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ User or organization not found');
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    console.log('🔍 [TEAM API] User:', {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    });

    // Only owners can access team data
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    }

    // Get team members for this organization
    const { data: teamMembers, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        is_active,
        last_login,
        created_at,
        organization_id
      `)
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query failed:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch team members',
        members: [] 
      }, { status: 500 });
    }

    // Transform data to match frontend interface
    const transformedMembers = teamMembers?.map(member => ({
      id: member.id,
      name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown User',
      email: member.email,
      role: member.role === 'owner' ? 'Owner' : 
            member.role === 'admin' ? 'Admin' :
            member.role === 'sales_manager' ? 'Sales Manager' :
            member.role === 'sales_rep' ? 'Sales Representative' :
            member.role === 'finance_manager' ? 'Finance Manager' :
            member.role === 'service_advisor' ? 'Service Advisor' : 
            'Team Member',
      department: member.role === 'owner' || member.role === 'admin' ? 'Management' :
                  member.role?.includes('sales') ? 'Sales' :
                  member.role?.includes('finance') ? 'Finance' :
                  member.role?.includes('service') ? 'Service' : 'General',
      status: member.is_active ? 'active' : 'inactive',
      lastActivity: member.last_login ? getRelativeTime(new Date(member.last_login)) : 'Never',
      performanceScore: Math.floor(Math.random() * 30) + 70, // TODO: Replace with real performance data
      salesThisMonth: Math.floor(Math.random() * 20), // TODO: Replace with real sales data
      joinDate: member.created_at,
      avatar: `/avatars/${member.first_name?.toLowerCase()}.jpg`
    })) || [];

    // Calculate summary statistics
    const totalMembers = transformedMembers.length;
    const activeMembers = transformedMembers.filter(m => m.status === 'active').length;
    const pendingMembers = transformedMembers.filter(m => m.status === 'pending').length;
    const avgPerformance = totalMembers > 0 ? 
      Math.round(transformedMembers.reduce((sum, m) => sum + m.performanceScore, 0) / totalMembers) : 0;

    return NextResponse.json({
      success: true,
      members: transformedMembers,
      summary: {
        totalMembers,
        activeMembers,
        pendingMembers,
        avgPerformance
      }
    });

  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      members: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ User or organization not found');
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    // Verify user role - only owners can add team members
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, email, role, department } = body;

    // Insert new team member
    const { data: newMember, error } = await supabase
      .from('users')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role.toLowerCase().replace(' ', '_'),
        organization_id: user.organizationId,
        password_hash: 'temp_invite_pending', // Will be set when they accept invite
        is_active: false // Pending until they accept invite
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create team member:', error);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      member: newMember,
      message: 'Team member added successfully' 
    });

  } catch (error) {
    console.error('Team member creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) {
    return `${diffInMins} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return '1 day ago';
  } else {
    return `${diffInDays} days ago`;
  }
}