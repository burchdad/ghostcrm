// Authentication and Authorization System
export type UserRole = 'owner' | 'admin' | 'manager' | 'sales_rep' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string; // Company/Dealership ID
  organizationId?: string; // Organization/Company UUID
  organizationSubdomain?: string; // Subdomain for tenant access
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
}

export interface UserProfile {
  phone?: string;
  avatar?: string;
  department?: string;
  title?: string;
  hireDate?: string;
  permissions: Permission[];
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string; // e.g., "dealer1.ghostcrm.com"
  type: 'dealership' | 'corporate' | 'franchise';
  isActive: boolean;
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    expiresAt: string;
  };
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
  };
  features: {
    inventory: boolean;
    crm: boolean;
    finance: boolean;
    reports: boolean;
    aiAgents: boolean;
    collaboration: boolean;
  };
  limits: {
    maxUsers: number;
    maxVehicles: number;
    maxStorage: number; // in GB
  };
}

export type Permission = 
  // System-wide permissions
  | 'system.admin'
  | 'system.owner'
  
  // User management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Inventory management
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.edit'
  | 'inventory.delete'
  | 'inventory.manage'
  | 'inventory.qr_codes'
  | 'inventory.analytics'
  
  // Customer management
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'customers.assign'
  
  // Sales and deals
  | 'deals.view'
  | 'deals.create'
  | 'deals.edit'
  | 'deals.delete'
  | 'deals.manage'
  | 'deals.assign'
  
  // Appointments and scheduling
  | 'appointments.view'
  | 'appointments.create'
  | 'appointments.edit'
  | 'appointments.delete'
  | 'appointments.manage'
  
  // Financial and reporting
  | 'finance.view'
  | 'finance.manage'
  | 'reports.view'
  | 'reports.create'
  | 'reports.advanced'
  
  // AI and automation
  | 'ai.view'
  | 'ai.manage'
  | 'ai.configure'
  
  // Settings and configuration
  | 'settings.view'
  | 'settings.edit'
  | 'settings.tenant'
  | 'settings.integrations'
  
  // Billing management
  | 'billing.manage';

// Role definitions with default permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    'system.owner',
    'system.admin',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage', 'inventory.qr_codes', 'inventory.analytics',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.assign',
    'deals.view', 'deals.create', 'deals.edit', 'deals.delete', 'deals.manage', 'deals.assign',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete', 'appointments.manage',
    'finance.view', 'finance.manage',
    'reports.view', 'reports.create', 'reports.advanced',
    'ai.view', 'ai.manage', 'ai.configure',
    'billing.manage', // Owner-only billing access
    'settings.view', 'settings.edit', 'settings.tenant', 'settings.integrations'
  ],
  
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.manage_roles',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage', 'inventory.qr_codes', 'inventory.analytics',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.assign',
    'deals.view', 'deals.create', 'deals.edit', 'deals.delete', 'deals.manage', 'deals.assign',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete', 'appointments.manage',
    'finance.view', 'finance.manage',
    'reports.view', 'reports.create', 'reports.advanced',
    'ai.view', 'ai.manage',
    'settings.view', 'settings.edit', 'settings.integrations'
  ],
  
  manager: [
    'users.view',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.qr_codes', 'inventory.analytics',
    'customers.view', 'customers.create', 'customers.edit', 'customers.assign',
    'deals.view', 'deals.create', 'deals.edit', 'deals.manage', 'deals.assign',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.manage',
    'finance.view',
    'reports.view', 'reports.create',
    'ai.view',
    'settings.view'
  ],
  
  sales_rep: [
    'inventory.view', 'inventory.qr_codes',
    'customers.view', 'customers.create', 'customers.edit',
    'deals.view', 'deals.create', 'deals.edit',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'reports.view',
    'settings.view'
  ],
  
  user: [
    'inventory.view',
    'reports.view',
    'settings.view'
  ]
};

// Sample tenant data
export const sampleTenants: Tenant[] = [
  {
    id: 'TENT001',
    name: 'Premier Auto Dealership',
    domain: 'premier.ghostcrm.com',
    type: 'dealership',
    isActive: true,
    subscription: {
      plan: 'professional',
      status: 'active',
      expiresAt: '2025-12-31T23:59:59Z'
    },
    settings: {
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        companyName: 'Premier Auto Dealership'
      },
      features: {
        inventory: true,
        crm: true,
        finance: true,
        reports: true,
        aiAgents: true,
        collaboration: true
      },
      limits: {
        maxUsers: 25,
        maxVehicles: 500,
        maxStorage: 100
      }
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-26T14:30:00Z'
  },
  {
    id: 'TENT002',
    name: 'City Motors Group',
    domain: 'citymotors.ghostcrm.com',
    type: 'franchise',
    isActive: true,
    subscription: {
      plan: 'enterprise',
      status: 'active',
      expiresAt: '2025-06-30T23:59:59Z'
    },
    settings: {
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#374151',
        companyName: 'City Motors Group'
      },
      features: {
        inventory: true,
        crm: true,
        finance: true,
        reports: true,
        aiAgents: true,
        collaboration: true
      },
      limits: {
        maxUsers: 100,
        maxVehicles: 2000,
        maxStorage: 500
      }
    },
    createdAt: '2024-03-22T09:15:00Z',
    updatedAt: '2024-10-25T16:45:00Z'
  }
];

// Sample users with different roles and tenant assignments
export const sampleUsers: User[] = [
  {
    id: 'USR001',
    email: 'admin@premier-auto.com',
    firstName: 'John',
    lastName: 'Anderson',
    role: 'admin',
    tenantId: 'TENT001',
    isActive: true,
    lastLogin: '2024-10-27T08:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-10-26T15:20:00Z',
    profile: {
      phone: '(555) 123-4567',
      department: 'Administration',
      title: 'General Manager',
      hireDate: '2024-01-15',
      permissions: rolePermissions.admin,
      settings: {
        theme: 'light',
        notifications: { email: true, push: true, sms: false },
        language: 'en',
        timezone: 'America/New_York'
      }
    }
  },
  {
    id: 'USR002',
    email: 'mike.rodriguez@premier-auto.com',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    role: 'sales_rep',
    tenantId: 'TENT001',
    isActive: true,
    lastLogin: '2024-10-27T07:45:00Z',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-10-26T14:30:00Z',
    profile: {
      phone: '(555) 234-5678',
      department: 'Sales',
      title: 'Senior Sales Representative',
      hireDate: '2024-02-01',
      permissions: rolePermissions.sales_rep,
      settings: {
        theme: 'light',
        notifications: { email: true, push: true, sms: true },
        language: 'en',
        timezone: 'America/New_York'
      }
    }
  },
  {
    id: 'USR003',
    email: 'sarah.chen@premier-auto.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'sales_rep',
    tenantId: 'TENT001',
    isActive: true,
    lastLogin: '2024-10-26T18:20:00Z',
    createdAt: '2024-02-15T11:30:00Z',
    updatedAt: '2024-10-25T16:15:00Z',
    profile: {
      phone: '(555) 345-6789',
      department: 'Sales',
      title: 'Sales Representative',
      hireDate: '2024-02-15',
      permissions: rolePermissions.sales_rep,
      settings: {
        theme: 'dark',
        notifications: { email: true, push: false, sms: true },
        language: 'en',
        timezone: 'America/New_York'
      }
    }
  },
  {
    id: 'USR004',
    email: 'manager@citymotors.com',
    firstName: 'Robert',
    lastName: 'Thompson',
    role: 'manager',
    tenantId: 'TENT002',
    isActive: true,
    lastLogin: '2024-10-27T09:15:00Z',
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-10-26T13:45:00Z',
    profile: {
      phone: '(555) 456-7890',
      department: 'Sales Management',
      title: 'Sales Manager',
      hireDate: '2024-03-22',
      permissions: rolePermissions.manager,
      settings: {
        theme: 'light',
        notifications: { email: true, push: true, sms: false },
        language: 'en',
        timezone: 'America/Chicago'
      }
    }
  },
  {
    id: 'USR005',
    email: 'jennifer.walsh@citymotors.com',
    firstName: 'Jennifer',
    lastName: 'Walsh',
    role: 'sales_rep',
    tenantId: 'TENT002',
    isActive: true,
    lastLogin: '2024-10-26T17:30:00Z',
    createdAt: '2024-04-10T14:20:00Z',
    updatedAt: '2024-10-24T11:10:00Z',
    profile: {
      phone: '(555) 567-8901',
      department: 'Sales',
      title: 'Sales Representative',
      hireDate: '2024-04-10',
      permissions: rolePermissions.sales_rep,
      settings: {
        theme: 'light',
        notifications: { email: true, push: true, sms: true },
        language: 'en',
        timezone: 'America/Chicago'
      }
    }
  }
];

// Authentication utilities
export class AuthService {
  // Check if user has specific permission
  static hasPermission(user: User, permission: Permission): boolean {
    return user.profile.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => user.profile.permissions.includes(permission));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => user.profile.permissions.includes(permission));
  }

  // Check if user belongs to specific tenant
  static belongsToTenant(user: User, tenantId: string): boolean {
    return user.tenantId === tenantId;
  }

  // Check if user can access resource in tenant
  static canAccessTenant(user: User, targetTenantId: string): boolean {
    // Owner can access any tenant
    if (user.role === 'owner') return true;
    
    // Everyone else can only access their own tenant
    return user.tenantId === targetTenantId;
  }

  // Get user's role hierarchy level (higher number = more permissions)
  static getRoleLevel(role: UserRole): number {
    const levels = {
      'owner': 100,
      'admin': 80,
      'manager': 60,
      'sales_rep': 40,
      'user': 20
    };
    return levels[role] || 0;
  }

  // Check if user can manage another user
  static canManageUser(currentUser: User, targetUser: User): boolean {
    // Can't manage users from different tenants (unless owner)
    if (!this.canAccessTenant(currentUser, targetUser.tenantId)) {
      return false;
    }

    // Can't manage users with higher or equal role level
    const currentLevel = this.getRoleLevel(currentUser.role);
    const targetLevel = this.getRoleLevel(targetUser.role);
    
    return currentLevel > targetLevel;
  }

  // Filter data based on user's tenant access
  static filterByTenant<T extends { tenantId?: string }>(
    user: User, 
    data: T[]
  ): T[] {
    // Owner can see all data
    if (user.role === 'owner') return data;
    
    // Everyone else sees only their tenant's data
    return data.filter(item => item.tenantId === user.tenantId);
  }

  // Generate user session token
  static generateSessionToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.profile.permissions,
      iat: Date.now()
    };
    
    // In production, use proper JWT signing
    return btoa(JSON.stringify(payload));
  }

  // Validate and parse session token
  static parseSessionToken(token: string): any {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }
}

// Route protection utilities
export class RouteGuard {
  // Check if route is accessible by user
  static canAccessRoute(user: User, route: string): boolean {
    const routePermissions: Record<string, Permission[]> = {
      '/dashboard': [],
      '/inventory': ['inventory.view'],
      '/inventory/create': ['inventory.create'],
      '/inventory/manage': ['inventory.manage'],
      '/inventory/analytics': ['inventory.analytics'],
      '/customers': ['customers.view'],
      '/customers/create': ['customers.create'],
      '/deals': ['deals.view'],
      '/deals/create': ['deals.create'],
      '/appointments': ['appointments.view'],
      '/reports': ['reports.view'],
      '/reports/advanced': ['reports.advanced'],
      '/ai-agents': ['ai.view'],
      '/ai-agents/manage': ['ai.manage'],
      '/settings': ['settings.view'],
      '/settings/users': ['users.view'],
      '/settings/tenant': ['settings.tenant'],
      '/owner': ['system.owner'],
      '/admin': ['system.admin', 'users.manage_roles']
    };

    const requiredPermissions = routePermissions[route] || [];
    if (requiredPermissions.length === 0) return true;

    return AuthService.hasAllPermissions(user, requiredPermissions);
  }

  // Get accessible routes for user
  static getAccessibleRoutes(user: User): string[] {
    const allRoutes = [
      '/dashboard',
      '/inventory',
      '/inventory/create',
      '/inventory/manage',
      '/inventory/analytics',
      '/customers',
      '/customers/create',
      '/deals',
      '/deals/create',
      '/appointments',
      '/reports',
      '/reports/advanced',
      '/ai-agents',
      '/ai-agents/manage',
      '/settings',
      '/settings/users',
      '/settings/tenant',
      '/owner',
      '/admin'
    ];

    return allRoutes.filter(route => this.canAccessRoute(user, route));
  }
}