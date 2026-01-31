import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface AddMemberRequest {
  teamId: string;
  userId: string;
  role: string;
  permissions?: string[];
}

interface UpdateMemberRequest {
  teamId: string;
  userId: string;
  role?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'pending';
}

interface RemoveMemberRequest {
  teamId: string;
  userId: string;
}

// Import mock data from teams route (in real app this would be from database)
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com' },
  { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com' },
  { id: 'user-5', name: 'Tom Brown', email: 'tom@example.com' },
  { id: 'user-6', name: 'Lisa Davis', email: 'lisa@example.com' },
];

const availableRoles = [
  'Team Lead',
  'Senior Sales Rep',
  'Sales Rep',
  'Junior Sales Rep',
  'Marketing Manager',
  'Marketing Specialist',
  'Support Manager',
  'Support Agent',
  'Developer',
  'Senior Developer',
  'Project Manager'
];

const availablePermissions = [
  'leads.view',
  'leads.edit',
  'leads.create',
  'leads.delete',
  'deals.view',
  'deals.edit',
  'deals.create',
  'deals.delete',
  'contacts.view',
  'contacts.edit',
  'contacts.create',
  'contacts.delete',
  'campaigns.view',
  'campaigns.edit',
  'campaigns.create',
  'campaigns.delete',
  'analytics.view',
  'reports.view',
  'reports.create',
  'content.manage',
  'settings.view',
  'settings.edit',
  'admin.access'
];

// GET /api/settings/teams/members?teamId=xxx - Get team members
// GET /api/settings/teams/members?available=true - Get available users to add
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const available = searchParams.get('available') === 'true';

    if (available) {
      // Return empty arrays for new tenants - no mock data
      return NextResponse.json({
        success: true,
        data: {
          users: [], // No mock users for new tenants
          roles: availableRoles,
          permissions: availablePermissions
        }
      });
    }

    if (!teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    // Return empty members for new tenants - no mock data
    return NextResponse.json({
      success: true,
      data: {
        teamId,
        members: [], // Empty for new tenants
        roles: availableRoles,
        permissions: availablePermissions
      }
    });

  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team members'
    }, { status: 500 });
  }
}

// POST /api/settings/teams/members - Add member to team
export async function POST(request: NextRequest) {
  try {
    const body: AddMemberRequest = await request.json();
    
    // Validate required fields
    if (!body.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    if (!body.userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!body.role) {
      return NextResponse.json({
        success: false,
        error: 'Role is required'
      }, { status: 400 });
    }

    // Validate role
    if (!availableRoles.includes(body.role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role specified'
      }, { status: 400 });
    }

    // Validate permissions
    if (body.permissions) {
      const invalidPermissions = body.permissions.filter(p => !availablePermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Invalid permissions: ${invalidPermissions.join(', ')}`
        }, { status: 400 });
      }
    }

    // Check if user exists
    const user = mockUsers.find(u => u.id === body.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // In real app: check if team exists, if user is already a member, if team is at capacity, etc.

    const newMember = {
      id: body.userId,
      name: user.name,
      email: user.email,
      role: body.role,
      department: 'Sales', // Would be determined based on team
      status: 'active' as const,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: body.permissions || []
    };

    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'Member added successfully'
    });

  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add team member'
    }, { status: 500 });
  }
}

// PUT /api/settings/teams/members - Update team member
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateMemberRequest = await request.json();
    
    // Validate required fields
    if (!body.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    if (!body.userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Validate role if provided
    if (body.role && !availableRoles.includes(body.role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role specified'
      }, { status: 400 });
    }

    // Validate permissions if provided
    if (body.permissions) {
      const invalidPermissions = body.permissions.filter(p => !availablePermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Invalid permissions: ${invalidPermissions.join(', ')}`
        }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status && !['active', 'inactive', 'pending'].includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status specified'
      }, { status: 400 });
    }

    // In real app: find team and member, update member details

    const updatedMember = {
      id: body.userId,
      name: 'Updated User', // Would be fetched from database
      email: 'user@example.com',
      role: body.role || 'Sales Rep',
      department: 'Sales',
      status: body.status || 'active',
      joinedAt: '2024-01-15T10:00:00Z',
      lastActive: new Date().toISOString(),
      permissions: body.permissions || []
    };

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Member updated successfully'
    });

  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update team member'
    }, { status: 500 });
  }
}

// DELETE /api/settings/teams/members - Remove member from team
export async function DELETE(request: NextRequest) {
  try {
    const body: RemoveMemberRequest = await request.json();
    
    // Validate required fields
    if (!body.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    if (!body.userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // In real app: find team and member, check if user is team leader, remove member

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove team member'
    }, { status: 500 });
  }
}