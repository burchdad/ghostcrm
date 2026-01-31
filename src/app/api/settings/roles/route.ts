import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSystemLevel: boolean;
  requiresApproval: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  department: string;
  level: 'junior' | 'standard' | 'senior' | 'lead' | 'manager' | 'admin';
  permissions: string[];
  isSystemRole: boolean;
  isCustom: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CreateRoleRequest {
  name: string;
  description: string;
  department: string;
  level: 'junior' | 'standard' | 'senior' | 'lead' | 'manager' | 'admin';
  permissions: string[];
}

interface UpdateRoleRequest {
  name?: string;
  description?: string;
  department?: string;
  level?: 'junior' | 'standard' | 'senior' | 'lead' | 'manager' | 'admin';
  permissions?: string[];
}

interface AssignRoleRequest {
  userId: string;
  roleId: string;
  temporary?: boolean;
  expiresAt?: string;
}

// Comprehensive permissions catalog
const mockPermissions: Permission[] = [
  // Lead Management
  { id: 'leads.view', name: 'View Leads', description: 'View lead information and details', category: 'Lead Management', resource: 'leads', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'leads.create', name: 'Create Leads', description: 'Create new leads in the system', category: 'Lead Management', resource: 'leads', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'leads.edit', name: 'Edit Leads', description: 'Modify existing lead information', category: 'Lead Management', resource: 'leads', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'leads.delete', name: 'Delete Leads', description: 'Remove leads from the system', category: 'Lead Management', resource: 'leads', action: 'delete', isSystemLevel: false, requiresApproval: true },
  { id: 'leads.assign', name: 'Assign Leads', description: 'Assign leads to team members', category: 'Lead Management', resource: 'leads', action: 'assign', isSystemLevel: false, requiresApproval: false },
  { id: 'leads.import', name: 'Import Leads', description: 'Bulk import leads from external sources', category: 'Lead Management', resource: 'leads', action: 'import', isSystemLevel: false, requiresApproval: true },
  { id: 'leads.export', name: 'Export Leads', description: 'Export lead data from the system', category: 'Lead Management', resource: 'leads', action: 'export', isSystemLevel: false, requiresApproval: true },

  // Deal Management
  { id: 'deals.view', name: 'View Deals', description: 'View deal information and pipeline', category: 'Deal Management', resource: 'deals', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'deals.create', name: 'Create Deals', description: 'Create new deals and opportunities', category: 'Deal Management', resource: 'deals', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'deals.edit', name: 'Edit Deals', description: 'Modify deal information and status', category: 'Deal Management', resource: 'deals', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'deals.delete', name: 'Delete Deals', description: 'Remove deals from the system', category: 'Deal Management', resource: 'deals', action: 'delete', isSystemLevel: false, requiresApproval: true },
  { id: 'deals.close', name: 'Close Deals', description: 'Mark deals as won or lost', category: 'Deal Management', resource: 'deals', action: 'close', isSystemLevel: false, requiresApproval: false },

  // Contact Management
  { id: 'contacts.view', name: 'View Contacts', description: 'View contact information and history', category: 'Contact Management', resource: 'contacts', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'contacts.create', name: 'Create Contacts', description: 'Add new contacts to the system', category: 'Contact Management', resource: 'contacts', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'contacts.edit', name: 'Edit Contacts', description: 'Modify contact information', category: 'Contact Management', resource: 'contacts', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'contacts.delete', name: 'Delete Contacts', description: 'Remove contacts from the system', category: 'Contact Management', resource: 'contacts', action: 'delete', isSystemLevel: false, requiresApproval: true },

  // Campaign Management
  { id: 'campaigns.view', name: 'View Campaigns', description: 'View marketing campaigns and performance', category: 'Campaign Management', resource: 'campaigns', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'campaigns.create', name: 'Create Campaigns', description: 'Create new marketing campaigns', category: 'Campaign Management', resource: 'campaigns', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'campaigns.edit', name: 'Edit Campaigns', description: 'Modify campaign settings and content', category: 'Campaign Management', resource: 'campaigns', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'campaigns.delete', name: 'Delete Campaigns', description: 'Remove campaigns from the system', category: 'Campaign Management', resource: 'campaigns', action: 'delete', isSystemLevel: false, requiresApproval: true },
  { id: 'campaigns.send', name: 'Send Campaigns', description: 'Launch and send marketing campaigns', category: 'Campaign Management', resource: 'campaigns', action: 'send', isSystemLevel: false, requiresApproval: true },

  // Analytics & Reporting
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics dashboards and insights', category: 'Analytics & Reporting', resource: 'analytics', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'reports.view', name: 'View Reports', description: 'Access standard reports and metrics', category: 'Analytics & Reporting', resource: 'reports', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'reports.create', name: 'Create Reports', description: 'Build custom reports and dashboards', category: 'Analytics & Reporting', resource: 'reports', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'reports.export', name: 'Export Reports', description: 'Export report data and analytics', category: 'Analytics & Reporting', resource: 'reports', action: 'export', isSystemLevel: false, requiresApproval: true },

  // Content Management
  { id: 'content.view', name: 'View Content', description: 'Access marketing content and assets', category: 'Content Management', resource: 'content', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'content.create', name: 'Create Content', description: 'Create new marketing content and assets', category: 'Content Management', resource: 'content', action: 'create', isSystemLevel: false, requiresApproval: false },
  { id: 'content.edit', name: 'Edit Content', description: 'Modify existing content and assets', category: 'Content Management', resource: 'content', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish content to live channels', category: 'Content Management', resource: 'content', action: 'publish', isSystemLevel: false, requiresApproval: true },

  // Team Management
  { id: 'teams.view', name: 'View Teams', description: 'View team information and members', category: 'Team Management', resource: 'teams', action: 'view', isSystemLevel: false, requiresApproval: false },
  { id: 'teams.create', name: 'Create Teams', description: 'Create new teams and groups', category: 'Team Management', resource: 'teams', action: 'create', isSystemLevel: false, requiresApproval: true },
  { id: 'teams.edit', name: 'Edit Teams', description: 'Modify team settings and membership', category: 'Team Management', resource: 'teams', action: 'edit', isSystemLevel: false, requiresApproval: false },
  { id: 'teams.delete', name: 'Delete Teams', description: 'Remove teams from the system', category: 'Team Management', resource: 'teams', action: 'delete', isSystemLevel: false, requiresApproval: true },

  // System Administration
  { id: 'admin.users', name: 'User Administration', description: 'Manage user accounts and access', category: 'System Administration', resource: 'admin', action: 'users', isSystemLevel: true, requiresApproval: true },
  { id: 'admin.roles', name: 'Role Administration', description: 'Manage roles and permissions', category: 'System Administration', resource: 'admin', action: 'roles', isSystemLevel: true, requiresApproval: true },
  { id: 'admin.settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'System Administration', resource: 'admin', action: 'settings', isSystemLevel: true, requiresApproval: true },
  { id: 'admin.audit', name: 'Audit Logs', description: 'Access system audit logs and activity', category: 'System Administration', resource: 'admin', action: 'audit', isSystemLevel: true, requiresApproval: true },
  { id: 'admin.backup', name: 'System Backup', description: 'Manage system backups and restoration', category: 'System Administration', resource: 'admin', action: 'backup', isSystemLevel: true, requiresApproval: true }
];

// Predefined role templates
const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Sales Representative',
    description: 'Standard sales role with lead and deal management capabilities',
    department: 'Sales',
    level: 'standard',
    permissions: ['leads.view', 'leads.create', 'leads.edit', 'deals.view', 'deals.create', 'deals.edit', 'deals.close', 'contacts.view', 'contacts.create', 'contacts.edit', 'reports.view'],
    isSystemRole: true,
    isCustom: false,
    userCount: 12,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-17T10:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'role-2',
    name: 'Sales Manager',
    description: 'Sales leadership role with team management and advanced permissions',
    department: 'Sales',
    level: 'manager',
    permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.import', 'deals.view', 'deals.create', 'deals.edit', 'deals.delete', 'deals.close', 'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete', 'teams.view', 'teams.edit', 'analytics.view', 'reports.view', 'reports.create', 'reports.export'],
    isSystemRole: true,
    isCustom: false,
    userCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-16T15:30:00Z',
    createdBy: 'system'
  },
  {
    id: 'role-3',
    name: 'Marketing Specialist',
    description: 'Marketing role focused on campaigns and content management',
    department: 'Marketing',
    level: 'standard',
    permissions: ['campaigns.view', 'campaigns.create', 'campaigns.edit', 'content.view', 'content.create', 'content.edit', 'analytics.view', 'reports.view', 'contacts.view'],
    isSystemRole: true,
    isCustom: false,
    userCount: 5,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'role-4',
    name: 'Marketing Manager',
    description: 'Marketing leadership with campaign launch and team management',
    department: 'Marketing',
    level: 'manager',
    permissions: ['campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete', 'campaigns.send', 'content.view', 'content.create', 'content.edit', 'content.publish', 'teams.view', 'teams.edit', 'analytics.view', 'reports.view', 'reports.create', 'reports.export'],
    isSystemRole: true,
    isCustom: false,
    userCount: 2,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-10-14T09:15:00Z',
    createdBy: 'system'
  },
  {
    id: 'role-5',
    name: 'System Administrator',
    description: 'Full system access with administrative privileges',
    department: 'IT',
    level: 'admin',
    permissions: mockPermissions.map(p => p.id), // All permissions
    isSystemRole: true,
    isCustom: false,
    userCount: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-10-17T08:00:00Z',
    createdBy: 'system'
  }
];

const departments = ['Sales', 'Marketing', 'Support', 'Development', 'Operations', 'Finance', 'HR', 'IT'];
const levels = ['junior', 'standard', 'senior', 'lead', 'manager', 'admin'];

// Validation functions
const validateRoleName = (name: string, excludeRoleId?: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Role name is required';
  }
  if (name.length < 3) {
    return 'Role name must be at least 3 characters long';
  }
  if (name.length > 100) {
    return 'Role name must be less than 100 characters';
  }
  
  // Check for duplicate name
  const existingRole = mockRoles.find(role => 
    role.id !== excludeRoleId && 
    role.name.toLowerCase() === name.toLowerCase()
  );
  
  if (existingRole) {
    return 'A role with this name already exists';
  }
  
  return null;
};

const validateDepartment = (department: string): string | null => {
  if (!departments.includes(department)) {
    return 'Invalid department selected';
  }
  return null;
};

const validateLevel = (level: string): string | null => {
  if (!levels.includes(level)) {
    return 'Invalid role level selected';
  }
  return null;
};

const validatePermissions = (permissions: string[]): string | null => {
  const validPermissionIds = mockPermissions.map(p => p.id);
  const invalidPermissions = permissions.filter(p => !validPermissionIds.includes(p));
  
  if (invalidPermissions.length > 0) {
    return `Invalid permissions: ${invalidPermissions.join(', ')}`;
  }
  
  return null;
};

// GET /api/settings/roles - List all roles with optional filtering
// GET /api/settings/roles?includePermissions=true - Include full permission details
// GET /api/settings/roles?department=Sales - Filter by department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePermissions = searchParams.get('includePermissions') === 'true';
    const department = searchParams.get('department');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    let filteredRoles = [...mockRoles];

    // Apply filters
    if (department) {
      filteredRoles = filteredRoles.filter(role => role.department === department);
    }

    if (level) {
      filteredRoles = filteredRoles.filter(role => role.level === level);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(searchLower) ||
        role.description.toLowerCase().includes(searchLower)
      );
    }

    // Include permission details if requested
    if (includePermissions) {
      filteredRoles = filteredRoles.map(role => ({
        ...role,
        permissionDetails: role.permissions.map(permId => 
          mockPermissions.find(p => p.id === permId)
        ).filter(Boolean)
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        roles: filteredRoles,
        permissions: mockPermissions,
        departments,
        levels,
        stats: {
          totalRoles: mockRoles.length,
          systemRoles: mockRoles.filter(r => r.isSystemRole).length,
          customRoles: mockRoles.filter(r => r.isCustom).length,
          totalUsers: mockRoles.reduce((sum, role) => sum + role.userCount, 0)
        }
      }
    });

  } catch (error) {
    console.error('Roles API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch roles'
    }, { status: 500 });
  }
}

// POST /api/settings/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoleRequest = await request.json();
    
    // Validate required fields
    const nameError = validateRoleName(body.name);
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

    const levelError = validateLevel(body.level);
    if (levelError) {
      return NextResponse.json({
        success: false,
        error: levelError
      }, { status: 400 });
    }

    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Role description is required'
      }, { status: 400 });
    }

    const permissionsError = validatePermissions(body.permissions);
    if (permissionsError) {
      return NextResponse.json({
        success: false,
        error: permissionsError
      }, { status: 400 });
    }

    // Create new role
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: body.name,
      description: body.description,
      department: body.department,
      level: body.level,
      permissions: body.permissions,
      isSystemRole: false,
      isCustom: true,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-current' // Would be actual user ID
    };

    mockRoles.push(newRole);

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });

  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create role'
    }, { status: 500 });
  }
}

// PUT /api/settings/roles - Update existing role
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateRoleRequest & { roleId: string } = await request.json();
    
    if (!body.roleId) {
      return NextResponse.json({
        success: false,
        error: 'Role ID is required'
      }, { status: 400 });
    }

    const roleIndex = mockRoles.findIndex(role => role.id === body.roleId);
    if (roleIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Role not found'
      }, { status: 404 });
    }

    const role = mockRoles[roleIndex];

    // Prevent modification of system roles
    if (role.isSystemRole && !role.isCustom) {
      return NextResponse.json({
        success: false,
        error: 'System roles cannot be modified'
      }, { status: 403 });
    }

    // Validate updates
    if (body.name) {
      const nameError = validateRoleName(body.name, body.roleId);
      if (nameError) {
        return NextResponse.json({
          success: false,
          error: nameError
        }, { status: 400 });
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

    if (body.level) {
      const levelError = validateLevel(body.level);
      if (levelError) {
        return NextResponse.json({
          success: false,
          error: levelError
        }, { status: 400 });
      }
    }

    if (body.permissions) {
      const permissionsError = validatePermissions(body.permissions);
      if (permissionsError) {
        return NextResponse.json({
          success: false,
          error: permissionsError
        }, { status: 400 });
      }
    }

    // Update role
    const updatedRole = {
      ...role,
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.department && { department: body.department }),
      ...(body.level && { level: body.level }),
      ...(body.permissions && { permissions: body.permissions }),
      updatedAt: new Date().toISOString()
    };

    mockRoles[roleIndex] = updatedRole;

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update role'
    }, { status: 500 });
  }
}

// DELETE /api/settings/roles - Delete role
export async function DELETE(request: NextRequest) {
  try {
    const body: { roleId: string } = await request.json();
    
    if (!body.roleId) {
      return NextResponse.json({
        success: false,
        error: 'Role ID is required'
      }, { status: 400 });
    }

    const roleIndex = mockRoles.findIndex(role => role.id === body.roleId);
    if (roleIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Role not found'
      }, { status: 404 });
    }

    const role = mockRoles[roleIndex];

    // Prevent deletion of system roles
    if (role.isSystemRole && !role.isCustom) {
      return NextResponse.json({
        success: false,
        error: 'System roles cannot be deleted'
      }, { status: 403 });
    }

    // Check if role has users assigned
    if (role.userCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete role with ${role.userCount} assigned users. Please reassign users first.`
      }, { status: 400 });
    }

    mockRoles.splice(roleIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete role'
    }, { status: 500 });
  }
}