// Role-based Access Control (RBAC) system for GhostCRM

export interface Permission {
  id: string
  name: string
  description: string
  category: 'users' | 'leads' | 'deals' | 'contacts' | 'reports' | 'settings' | 'billing' | 'organization'
  level: 'read' | 'write' | 'admin'
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  tier?: 'basic' | 'pro' | 'elite'
  isSystemRole: boolean
}

export const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and basic info', category: 'users', level: 'read' },
  { id: 'users.manage', name: 'Manage Users', description: 'Add, edit, and remove users', category: 'users', level: 'admin' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'users', level: 'admin' },

  // Leads Management  
  { id: 'leads.view_own', name: 'View Own Leads', description: 'View leads assigned to you', category: 'leads', level: 'read' },
  { id: 'leads.view_team', name: 'View Team Leads', description: 'View leads for your team', category: 'leads', level: 'read' },
  { id: 'leads.view_all', name: 'View All Leads', description: 'View all organization leads', category: 'leads', level: 'read' },
  { id: 'leads.edit_own', name: 'Edit Own Leads', description: 'Edit leads assigned to you', category: 'leads', level: 'write' },
  { id: 'leads.edit_team', name: 'Edit Team Leads', description: 'Edit leads for your team', category: 'leads', level: 'write' },
  { id: 'leads.edit_all', name: 'Edit All Leads', description: 'Edit any organization lead', category: 'leads', level: 'write' },
  { id: 'leads.assign', name: 'Assign Leads', description: 'Assign leads to other users', category: 'leads', level: 'admin' },
  { id: 'leads.delete', name: 'Delete Leads', description: 'Delete leads from the system', category: 'leads', level: 'admin' },
  { id: 'leads.import', name: 'Import Leads', description: 'Import leads from external sources', category: 'leads', level: 'write' },
  { id: 'leads.export', name: 'Export Leads', description: 'Export leads data', category: 'leads', level: 'write' },

  // Deals Management
  { id: 'deals.view_own', name: 'View Own Deals', description: 'View deals you are involved in', category: 'deals', level: 'read' },
  { id: 'deals.view_team', name: 'View Team Deals', description: 'View deals for your team', category: 'deals', level: 'read' },
  { id: 'deals.view_all', name: 'View All Deals', description: 'View all organization deals', category: 'deals', level: 'read' },
  { id: 'deals.edit_own', name: 'Edit Own Deals', description: 'Edit deals you are involved in', category: 'deals', level: 'write' },
  { id: 'deals.edit_team', name: 'Edit Team Deals', description: 'Edit deals for your team', category: 'deals', level: 'write' },
  { id: 'deals.edit_all', name: 'Edit All Deals', description: 'Edit any organization deal', category: 'deals', level: 'write' },
  { id: 'deals.assign', name: 'Assign Deals', description: 'Assign deals to other users', category: 'deals', level: 'admin' },
  { id: 'deals.delete', name: 'Delete Deals', description: 'Delete deals from the system', category: 'deals', level: 'admin' },

  // Contacts Management
  { id: 'contacts.view', name: 'View Contacts', description: 'View contact information', category: 'contacts', level: 'read' },
  { id: 'contacts.manage', name: 'Manage Contacts', description: 'Add, edit, and organize contacts', category: 'contacts', level: 'write' },
  { id: 'contacts.delete', name: 'Delete Contacts', description: 'Delete contacts from the system', category: 'contacts', level: 'admin' },
  { id: 'contacts.import', name: 'Import Contacts', description: 'Import contacts from external sources', category: 'contacts', level: 'write' },
  { id: 'contacts.export', name: 'Export Contacts', description: 'Export contacts data', category: 'contacts', level: 'write' },

  // Reports & Analytics
  { id: 'reports.basic', name: 'Basic Reports', description: 'View basic performance reports', category: 'reports', level: 'read' },
  { id: 'reports.advanced', name: 'Advanced Reports', description: 'Access advanced analytics and reports', category: 'reports', level: 'read' },
  { id: 'reports.team', name: 'Team Reports', description: 'View team performance and metrics', category: 'reports', level: 'read' },
  { id: 'reports.custom', name: 'Custom Reports', description: 'Create and modify custom reports', category: 'reports', level: 'write' },
  { id: 'reports.export', name: 'Export Reports', description: 'Export report data', category: 'reports', level: 'write' },

  // Settings & Configuration
  { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'settings', level: 'read' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Modify system settings', category: 'settings', level: 'admin' },
  { id: 'settings.integrations', name: 'Manage Integrations', description: 'Configure external integrations', category: 'settings', level: 'admin' },
  { id: 'settings.workflows', name: 'Manage Workflows', description: 'Create and modify automation workflows', category: 'settings', level: 'admin' },
  { id: 'settings.pipelines', name: 'Manage Pipelines', description: 'Configure sales pipelines and stages', category: 'settings', level: 'admin' },

  // Billing Management
  { id: 'billing.view', name: 'View Billing', description: 'View billing information and invoices', category: 'billing', level: 'read' },
  { id: 'billing.manage', name: 'Manage Billing', description: 'Update payment methods and billing', category: 'billing', level: 'admin' },

  // Organization Management
  { id: 'organization.view', name: 'View Organization', description: 'View organization details', category: 'organization', level: 'read' },
  { id: 'organization.manage', name: 'Manage Organization', description: 'Modify organization settings', category: 'organization', level: 'admin' },
  { id: 'organization.audit', name: 'View Audit Logs', description: 'Access audit logs and activity history', category: 'organization', level: 'admin' },
  { id: 'organization.api', name: 'API Access', description: 'Access and manage API keys', category: 'organization', level: 'admin' }
]

export const SYSTEM_ROLES: Role[] = [
  {
    id: 'owner',
    name: 'owner',
    displayName: 'Organization Owner',
    description: 'Full ownership with all permissions',
    isSystemRole: true,
    permissions: PERMISSIONS.map(p => p.id) // Owner gets all permissions
  },
  {
    id: 'admin_basic',
    name: 'admin',
    displayName: 'Administrator (Basic)',
    description: 'Core administrative capabilities',
    tier: 'basic',
    isSystemRole: true,
    permissions: [
      'users.view', 'users.manage', 'users.roles',
      'leads.view_all', 'leads.edit_all', 'leads.assign', 'leads.import', 'leads.export',
      'deals.view_all', 'deals.edit_all', 'deals.assign',
      'contacts.view', 'contacts.manage', 'contacts.import', 'contacts.export',
      'reports.basic', 'reports.team', 'reports.export',
      'settings.view', 'settings.manage', 'settings.pipelines',
      'billing.view', 'billing.manage',
      'organization.view', 'organization.manage'
    ]
  },
  {
    id: 'admin_pro',
    name: 'admin',
    displayName: 'Administrator (Professional)', 
    description: 'Advanced automation and system tools',
    tier: 'pro',
    isSystemRole: true,
    permissions: [
      'users.view', 'users.manage', 'users.roles',
      'leads.view_all', 'leads.edit_all', 'leads.assign', 'leads.delete', 'leads.import', 'leads.export',
      'deals.view_all', 'deals.edit_all', 'deals.assign', 'deals.delete',
      'contacts.view', 'contacts.manage', 'contacts.delete', 'contacts.import', 'contacts.export',
      'reports.basic', 'reports.advanced', 'reports.team', 'reports.custom', 'reports.export',
      'settings.view', 'settings.manage', 'settings.integrations', 'settings.workflows', 'settings.pipelines',
      'billing.view', 'billing.manage',
      'organization.view', 'organization.manage', 'organization.audit'
    ]
  },
  {
    id: 'admin_elite',
    name: 'admin',
    displayName: 'Administrator (Elite)',
    description: 'Complete platform control with enterprise features',
    tier: 'elite',
    isSystemRole: true,
    permissions: PERMISSIONS.filter(p => p.id !== 'users.roles' || p.category !== 'organization').map(p => p.id)
    // Elite admin gets almost everything except changing owner role
  },
  {
    id: 'sales_manager_basic',
    name: 'sales_manager',
    displayName: 'Sales Manager (Basic)',
    description: 'Essential management tools for small teams',
    tier: 'basic',
    isSystemRole: true,
    permissions: [
      'users.view',
      'leads.view_all', 'leads.edit_all', 'leads.assign', 'leads.import',
      'deals.view_all', 'deals.edit_all', 'deals.assign',
      'contacts.view', 'contacts.manage', 'contacts.import',
      'reports.basic', 'reports.team',
      'settings.view'
    ]
  },
  {
    id: 'sales_manager_pro',
    name: 'sales_manager',
    displayName: 'Sales Manager (Professional)',
    description: 'Advanced management and coaching tools',
    tier: 'pro',
    isSystemRole: true,
    permissions: [
      'users.view',
      'leads.view_all', 'leads.edit_all', 'leads.assign', 'leads.import', 'leads.export',
      'deals.view_all', 'deals.edit_all', 'deals.assign',
      'contacts.view', 'contacts.manage', 'contacts.import', 'contacts.export',
      'reports.basic', 'reports.advanced', 'reports.team', 'reports.custom',
      'settings.view', 'settings.pipelines'
    ]
  },
  {
    id: 'sales_manager_elite',
    name: 'sales_manager',
    displayName: 'Sales Manager (Elite)',
    description: 'Complete management suite with AI insights',
    tier: 'elite',
    isSystemRole: true,
    permissions: [
      'users.view',
      'leads.view_all', 'leads.edit_all', 'leads.assign', 'leads.import', 'leads.export',
      'deals.view_all', 'deals.edit_all', 'deals.assign',
      'contacts.view', 'contacts.manage', 'contacts.import', 'contacts.export',
      'reports.basic', 'reports.advanced', 'reports.team', 'reports.custom', 'reports.export',
      'settings.view', 'settings.integrations', 'settings.workflows', 'settings.pipelines'
    ]
  },
  {
    id: 'sales_rep_basic',
    name: 'sales_rep',
    displayName: 'Sales Representative (Basic)',
    description: 'Essential CRM features for individual contributors',
    tier: 'basic',
    isSystemRole: true,
    permissions: [
      'leads.view_own', 'leads.edit_own',
      'deals.view_own', 'deals.edit_own',
      'contacts.view', 'contacts.manage',
      'reports.basic'
    ]
  },
  {
    id: 'sales_rep_pro',
    name: 'sales_rep',
    displayName: 'Sales Representative (Professional)',
    description: 'Enhanced tools for experienced sales professionals',
    tier: 'pro',
    isSystemRole: true,
    permissions: [
      'leads.view_own', 'leads.edit_own', 'leads.import',
      'deals.view_own', 'deals.edit_own',
      'contacts.view', 'contacts.manage', 'contacts.import',
      'reports.basic', 'reports.team'
    ]
  },
  {
    id: 'sales_rep_elite',
    name: 'sales_rep',
    displayName: 'Sales Representative (Elite)',
    description: 'Complete solution with AI and automation',
    tier: 'elite',
    isSystemRole: true,
    permissions: [
      'leads.view_team', 'leads.edit_own', 'leads.import', 'leads.export',
      'deals.view_team', 'deals.edit_own',
      'contacts.view', 'contacts.manage', 'contacts.import', 'contacts.export',
      'reports.basic', 'reports.advanced', 'reports.team'
    ]
  }
]

// Helper functions
export const getRole = (roleId: string): Role | undefined => {
  return SYSTEM_ROLES.find(role => role.id === roleId)
}

export const getRolesByName = (roleName: string): Role[] => {
  return SYSTEM_ROLES.filter(role => role.name === roleName)
}

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

export const getPermissionsByCategory = (category: Permission['category']): Permission[] => {
  return PERMISSIONS.filter(permission => permission.category === category)
}

export const getUserPermissions = (role: Role): Permission[] => {
  return PERMISSIONS.filter(permission => role.permissions.includes(permission.id))
}

// Permission checking utilities for components
export const canViewLeads = (userPermissions: string[], scope: 'own' | 'team' | 'all' = 'own'): boolean => {
  const permissionMap = {
    'own': 'leads.view_own',
    'team': 'leads.view_team', 
    'all': 'leads.view_all'
  }
  
  const requiredPermission = permissionMap[scope]
  return hasPermission(userPermissions, requiredPermission) || 
         hasPermission(userPermissions, 'leads.view_all') // Admin override
}

export const canEditLeads = (userPermissions: string[], scope: 'own' | 'team' | 'all' = 'own'): boolean => {
  const permissionMap = {
    'own': 'leads.edit_own',
    'team': 'leads.edit_team',
    'all': 'leads.edit_all'
  }
  
  const requiredPermission = permissionMap[scope]
  return hasPermission(userPermissions, requiredPermission) || 
         hasPermission(userPermissions, 'leads.edit_all') // Admin override
}

export const canManageUsers = (userPermissions: string[]): boolean => {
  return hasPermission(userPermissions, 'users.manage')
}

export const canViewReports = (userPermissions: string[], level: 'basic' | 'advanced' | 'team' | 'custom' = 'basic'): boolean => {
  const permissionMap = {
    'basic': 'reports.basic',
    'advanced': 'reports.advanced',
    'team': 'reports.team',
    'custom': 'reports.custom'
  }
  
  return hasPermission(userPermissions, permissionMap[level]) ||
         hasPermission(userPermissions, 'reports.advanced') // Advanced includes all others
}

export const canAccessBilling = (userPermissions: string[]): boolean => {
  return hasAnyPermission(userPermissions, ['billing.view', 'billing.manage'])
}

export const canManageOrganization = (userPermissions: string[]): boolean => {
  return hasPermission(userPermissions, 'organization.manage')
}