import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  leaderId: string;
  memberCount: number;
  members: TeamMember[];
  permissions: string[];
  settings: {
    isPrivate: boolean;
    allowSelfJoin: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateTeamRequest {
  name: string;
  description?: string;
  department: string;
  leaderId?: string;
  isPrivate?: boolean;
  allowSelfJoin?: boolean;
  requireApproval?: boolean;
  maxMembers?: number;
}

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  department?: string;
  leaderId?: string;
  settings?: {
    isPrivate?: boolean;
    allowSelfJoin?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
}

interface AddMemberRequest {
  userId: string;
  role: string;
  permissions?: string[];
}

interface UpdateMemberRequest {
  role?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'pending';
}

// Mock data for demonstration
let mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Sales Team',
    description: 'Responsible for lead generation and deal closure',
    department: 'Sales',
    leaderId: 'user-1',
    memberCount: 5,
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Team Lead',
        department: 'Sales',
        status: 'active',
        joinedAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-10-17T14:30:00Z',
        permissions: ['leads.view', 'leads.edit', 'deals.view', 'deals.edit', 'reports.view']
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Senior Sales Rep',
        department: 'Sales',
        status: 'active',
        joinedAt: '2024-02-01T10:00:00Z',
        lastActive: '2024-10-17T13:45:00Z',
        permissions: ['leads.view', 'leads.edit', 'deals.view', 'deals.edit']
      }
    ],
    permissions: ['leads.view', 'leads.edit', 'deals.view', 'deals.edit', 'reports.view'],
    settings: {
      isPrivate: false,
      allowSelfJoin: true,
      requireApproval: false,
      maxMembers: 10
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-17T10:00:00Z'
  },
  {
    id: 'team-2',
    name: 'Marketing Team',
    description: 'Campaign management and brand strategy',
    department: 'Marketing',
    leaderId: 'user-3',
    memberCount: 3,
    members: [
      {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'Marketing Manager',
        department: 'Marketing',
        status: 'active',
        joinedAt: '2024-01-20T10:00:00Z',
        lastActive: '2024-10-17T15:00:00Z',
        permissions: ['campaigns.view', 'campaigns.edit', 'analytics.view', 'content.manage']
      }
    ],
    permissions: ['campaigns.view', 'campaigns.edit', 'analytics.view'],
    settings: {
      isPrivate: true,
      allowSelfJoin: false,
      requireApproval: true,
      maxMembers: 8
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-10-16T16:30:00Z'
  }
];

// Validation functions
const validateTeamName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Team name is required';
  }
  if (name.length < 2) {
    return 'Team name must be at least 2 characters long';
  }
  if (name.length > 100) {
    return 'Team name must be less than 100 characters';
  }
  return null;
};

const validateDepartment = (department: string): string | null => {
  const validDepartments = ['Sales', 'Marketing', 'Support', 'Development', 'Operations', 'Finance', 'HR'];
  if (!validDepartments.includes(department)) {
    return 'Invalid department';
  }
  return null;
};

const validateMaxMembers = (maxMembers: number): string | null => {
  if (maxMembers < 1 || maxMembers > 100) {
    return 'Max members must be between 1 and 100';
  }
  return null;
};

// GET /api/settings/teams - List all teams
// GET /api/settings/teams?search=query - Search teams
// GET /api/settings/teams?department=Sales - Filter by department
export async function GET(request: NextRequest) {
  try {
    // Return empty teams array for new tenants - no mock data
    // TODO: Replace with actual database queries based on tenant
    
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch teams',
        data: []
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/teams - Create new team
export async function POST(request: NextRequest) {
  try {
    const body: CreateTeamRequest = await request.json();
    
    // Validate required fields
    const nameError = validateTeamName(body.name);
    if (nameError) {
      return NextResponse.json({
        success: false,
        error: nameError
      }, { status: 400 });
    }

    const departmentError = validateDepartment(body.department);
    if (departmentError) {
      return NextResponse.json({
        success: false,
        error: departmentError
      }, { status: 400 });
    }

    if (body.maxMembers && validateMaxMembers(body.maxMembers)) {
      return NextResponse.json({
        success: false,
        error: validateMaxMembers(body.maxMembers)
      }, { status: 400 });
    }

    // Check for duplicate team name in same department
    const existingTeam = mockTeams.find(team => 
      team.name.toLowerCase() === body.name.toLowerCase() && 
      team.department === body.department
    );
    
    if (existingTeam) {
      return NextResponse.json({
        success: false,
        error: 'A team with this name already exists in this department'
      }, { status: 409 });
    }

    // Create new team
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      department: body.department,
      leaderId: body.leaderId || '',
      memberCount: 0,
      members: [],
      permissions: [],
      settings: {
        isPrivate: body.isPrivate || false,
        allowSelfJoin: body.allowSelfJoin || true,
        requireApproval: body.requireApproval || false,
        maxMembers: body.maxMembers || 20
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockTeams.push(newTeam);

    return NextResponse.json({
      success: true,
      data: newTeam,
      message: 'Team created successfully'
    });

  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create team'
    }, { status: 500 });
  }
}

// PUT /api/settings/teams - Update team (requires teamId in body)
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateTeamRequest & { teamId: string } = await request.json();
    
    if (!body.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    const teamIndex = mockTeams.findIndex(team => team.id === body.teamId);
    if (teamIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    const team = mockTeams[teamIndex];

    // Validate updates
    if (body.name) {
      const nameError = validateTeamName(body.name);
      if (nameError) {
        return NextResponse.json({
          success: false,
          error: nameError
        }, { status: 400 });
      }

      // Check for duplicate name (excluding current team)
      const existingTeam = mockTeams.find(t => 
        t.id !== body.teamId &&
        t.name.toLowerCase() === body.name?.toLowerCase() && 
        t.department === (body.department || team.department)
      );
      
      if (existingTeam) {
        return NextResponse.json({
          success: false,
          error: 'A team with this name already exists in this department'
        }, { status: 409 });
      }
    }

    if (body.department) {
      const departmentError = validateDepartment(body.department);
      if (departmentError) {
        return NextResponse.json({
          success: false,
          error: departmentError
        }, { status: 400 });
      }
    }

    if (body.settings?.maxMembers) {
      const maxMembersError = validateMaxMembers(body.settings.maxMembers);
      if (maxMembersError) {
        return NextResponse.json({
          success: false,
          error: maxMembersError
        }, { status: 400 });
      }

      // Check if new max is less than current member count
      if (body.settings.maxMembers < team.memberCount) {
        return NextResponse.json({
          success: false,
          error: `Cannot set max members to ${body.settings.maxMembers}. Team currently has ${team.memberCount} members.`
        }, { status: 400 });
      }
    }

    // Update team
    const updatedTeam = {
      ...team,
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.department && { department: body.department }),
      ...(body.leaderId && { leaderId: body.leaderId }),
      ...(body.settings && { settings: { ...team.settings, ...body.settings } }),
      updatedAt: new Date().toISOString()
    };

    mockTeams[teamIndex] = updatedTeam;

    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully'
    });

  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update team'
    }, { status: 500 });
  }
}

// DELETE /api/settings/teams - Delete team (requires teamId in body)
export async function DELETE(request: NextRequest) {
  try {
    const body: { teamId: string } = await request.json();
    
    if (!body.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Team ID is required'
      }, { status: 400 });
    }

    const teamIndex = mockTeams.findIndex(team => team.id === body.teamId);
    if (teamIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    const team = mockTeams[teamIndex];

    // Check if team has members
    if (team.memberCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete team with active members. Please remove all members first.'
      }, { status: 400 });
    }

    mockTeams.splice(teamIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete team'
    }, { status: 500 });
  }
}