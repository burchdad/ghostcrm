import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface UserRoleAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  isTemporary: boolean;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
}

interface AssignRoleRequest {
  userId: string;
  roleId: string;
  temporary?: boolean;
  expiresAt?: string;
}

interface RevokeRoleRequest {
  userId: string;
  roleId: string;
}

interface BulkAssignRequest {
  userIds: string[];
  roleId: string;
  temporary?: boolean;
  expiresAt?: string;
}

// Mock user role assignments
let mockAssignments: UserRoleAssignment[] = [
  {
    id: 'assignment-1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    roleId: 'role-2',
    roleName: 'Sales Manager',
    assignedAt: '2024-01-15T10:00:00Z',
    assignedBy: 'admin',
    isTemporary: false,
    status: 'active'
  },
  {
    id: 'assignment-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    roleId: 'role-1',
    roleName: 'Sales Representative',
    assignedAt: '2024-02-01T10:00:00Z',
    assignedBy: 'user-1',
    isTemporary: false,
    status: 'active'
  },
  {
    id: 'assignment-3',
    userId: 'user-3',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    roleId: 'role-4',
    roleName: 'Marketing Manager',
    assignedAt: '2024-01-20T10:00:00Z',
    assignedBy: 'admin',
    isTemporary: true,
    expiresAt: '2024-12-31T23:59:59Z',
    status: 'active'
  }
];

// Mock users available for role assignment
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', department: 'Sales' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', department: 'Sales' },
  { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', department: 'Marketing' },
  { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com', department: 'Marketing' },
  { id: 'user-5', name: 'Tom Brown', email: 'tom@example.com', department: 'Sales' },
  { id: 'user-6', name: 'Lisa Davis', email: 'lisa@example.com', department: 'Support' },
  { id: 'user-7', name: 'Alex Garcia', email: 'alex@example.com', department: 'Development' },
  { id: 'user-8', name: 'Emma Taylor', email: 'emma@example.com', department: 'Operations' }
];

// Validation functions
const validateUserId = (userId: string): string | null => {
  if (!userId) {
    return 'User ID is required';
  }
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return 'User not found';
  }
  
  return null;
};

const validateRoleId = (roleId: string): string | null => {
  if (!roleId) {
    return 'Role ID is required';
  }
  
  // In real app, would check against roles database
  return null;
};

const validateTemporaryAssignment = (isTemporary: boolean, expiresAt?: string): string | null => {
  if (isTemporary) {
    if (!expiresAt) {
      return 'Expiration date is required for temporary assignments';
    }
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    if (expirationDate <= now) {
      return 'Expiration date must be in the future';
    }
    
    // Check if expiration is not too far in the future (e.g., max 2 years)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (expirationDate > maxDate) {
      return 'Expiration date cannot be more than 2 years in the future';
    }
  }
  
  return null;
};

// GET /api/settings/roles/assignments - Get role assignments
// GET /api/settings/roles/assignments?userId=xxx - Get assignments for specific user
// GET /api/settings/roles/assignments?roleId=xxx - Get users assigned to specific role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const available = searchParams.get('available') === 'true';

    if (available) {
      // Return available users for assignment
      return NextResponse.json({
        success: true,
        data: {
          users: mockUsers,
          totalUsers: mockUsers.length
        }
      });
    }

    let filteredAssignments = [...mockAssignments];

    // Filter by user
    if (userId) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.userId === userId);
    }

    // Filter by role
    if (roleId) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.roleId === roleId);
    }

    // Filter expired assignments
    if (!includeExpired) {
      const now = new Date();
      filteredAssignments = filteredAssignments.filter(assignment => {
        if (assignment.isTemporary && assignment.expiresAt) {
          return new Date(assignment.expiresAt) > now;
        }
        return assignment.status === 'active';
      });
    }

    // Update expired assignments status
    const now = new Date();
    filteredAssignments = filteredAssignments.map(assignment => {
      if (assignment.isTemporary && assignment.expiresAt && new Date(assignment.expiresAt) <= now) {
        return { ...assignment, status: 'expired' as const };
      }
      return assignment;
    });

    return NextResponse.json({
      success: true,
      data: {
        assignments: filteredAssignments,
        total: filteredAssignments.length,
        stats: {
          active: filteredAssignments.filter(a => a.status === 'active').length,
          temporary: filteredAssignments.filter(a => a.isTemporary).length,
          expired: filteredAssignments.filter(a => a.status === 'expired').length
        }
      }
    });

  } catch (error) {
    console.error('Get role assignments error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch role assignments'
    }, { status: 500 });
  }
}

// POST /api/settings/roles/assignments - Assign role to user
export async function POST(request: NextRequest) {
  try {
    const body: AssignRoleRequest = await request.json();
    
    // Validate request
    const userError = validateUserId(body.userId);
    if (userError) {
      return NextResponse.json({
        success: false,
        error: userError
      }, { status: 400 });
    }

    const roleError = validateRoleId(body.roleId);
    if (roleError) {
      return NextResponse.json({
        success: false,
        error: roleError
      }, { status: 400 });
    }

    const tempError = validateTemporaryAssignment(body.temporary || false, body.expiresAt);
    if (tempError) {
      return NextResponse.json({
        success: false,
        error: tempError
      }, { status: 400 });
    }

    // Check if user already has this role assigned
    const existingAssignment = mockAssignments.find(assignment => 
      assignment.userId === body.userId && 
      assignment.roleId === body.roleId &&
      assignment.status === 'active'
    );

    if (existingAssignment) {
      return NextResponse.json({
        success: false,
        error: 'User already has this role assigned'
      }, { status: 409 });
    }

    // Get user and role details
    const user = mockUsers.find(u => u.id === body.userId);
    
    // Create new assignment
    const newAssignment: UserRoleAssignment = {
      id: `assignment-${Date.now()}`,
      userId: body.userId,
      userName: user!.name,
      userEmail: user!.email,
      roleId: body.roleId,
      roleName: 'Role Name', // Would be fetched from roles API
      assignedAt: new Date().toISOString(),
      assignedBy: 'current-user', // Would be actual current user ID
      isTemporary: body.temporary || false,
      expiresAt: body.expiresAt,
      status: 'active'
    };

    mockAssignments.push(newAssignment);

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: 'Role assigned successfully'
    });

  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to assign role'
    }, { status: 500 });
  }
}

// PUT /api/settings/roles/assignments - Update role assignment (extend expiration, change status)
export async function PUT(request: NextRequest) {
  try {
    const body: { assignmentId: string; expiresAt?: string; status?: 'active' | 'inactive' } = await request.json();
    
    if (!body.assignmentId) {
      return NextResponse.json({
        success: false,
        error: 'Assignment ID is required'
      }, { status: 400 });
    }

    const assignmentIndex = mockAssignments.findIndex(assignment => assignment.id === body.assignmentId);
    if (assignmentIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found'
      }, { status: 404 });
    }

    const assignment = mockAssignments[assignmentIndex];

    // Validate expiration date if provided
    if (body.expiresAt) {
      const tempError = validateTemporaryAssignment(true, body.expiresAt);
      if (tempError) {
        return NextResponse.json({
          success: false,
          error: tempError
        }, { status: 400 });
      }
    }

    // Update assignment
    const updatedAssignment = {
      ...assignment,
      ...(body.expiresAt && { expiresAt: body.expiresAt }),
      ...(body.status && { status: body.status })
    };

    mockAssignments[assignmentIndex] = updatedAssignment;

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update assignment'
    }, { status: 500 });
  }
}

// DELETE /api/settings/roles/assignments - Revoke role from user
export async function DELETE(request: NextRequest) {
  try {
    const body: RevokeRoleRequest = await request.json();
    
    const userError = validateUserId(body.userId);
    if (userError) {
      return NextResponse.json({
        success: false,
        error: userError
      }, { status: 400 });
    }

    const roleError = validateRoleId(body.roleId);
    if (roleError) {
      return NextResponse.json({
        success: false,
        error: roleError
      }, { status: 400 });
    }

    // Find and remove assignment
    const assignmentIndex = mockAssignments.findIndex(assignment => 
      assignment.userId === body.userId && 
      assignment.roleId === body.roleId &&
      assignment.status === 'active'
    );

    if (assignmentIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Active assignment not found'
      }, { status: 404 });
    }

    mockAssignments.splice(assignmentIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Role revoked successfully'
    });

  } catch (error) {
    console.error('Revoke role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to revoke role'
    }, { status: 500 });
  }
}