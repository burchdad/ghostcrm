"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthService, Permission } from '@/lib/auth';

// Route permission configuration
interface RoutePermission {
  path: string;
  requiredPermissions: Permission[];
  allowedRoles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[];
  requireTenantAccess?: boolean;
}

// Define protected routes and their required permissions
const PROTECTED_ROUTES: RoutePermission[] = [
  // Owner routes
  {
    path: '/owner',
    requiredPermissions: ['system.owner'],
    allowedRoles: ['owner'],
    requireTenantAccess: false
  },

  // Admin routes
  {
    path: '/admin',
    requiredPermissions: ['users.view', 'settings.view'],
    allowedRoles: ['owner', 'admin'],
    requireTenantAccess: true
  },

  // Agent Control Panel
  {
    path: '/agent-control-panel',
    requiredPermissions: ['users.view', 'settings.view'],
    allowedRoles: ['owner', 'admin'],
    requireTenantAccess: true
  },

  // Business Intelligence
  {
    path: '/bi',
    requiredPermissions: ['reports.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Billing
  {
    path: '/billing',
    requiredPermissions: ['finance.manage'],
    allowedRoles: ['owner', 'admin'],
    requireTenantAccess: true
  },

  // Inventory Management
  {
    path: '/inventory',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Customer Management
  {
    path: '/leads',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Deal Management
  {
    path: '/deals',
    requiredPermissions: ['deals.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Reports
  {
    path: '/reports',
    requiredPermissions: ['reports.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Settings
  {
    path: '/settings',
    requiredPermissions: ['settings.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Calendar/Appointments
  {
    path: '/calendar',
    requiredPermissions: ['appointments.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/appointments',
    requiredPermissions: ['appointments.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Marketing
  {
    path: '/marketing',
    requiredPermissions: ['settings.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Automation
  {
    path: '/automation',
    requiredPermissions: ['ai.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },
  {
    path: '/workflow',
    requiredPermissions: ['ai.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Finance
  {
    path: '/finance',
    requiredPermissions: ['finance.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Compliance
  {
    path: '/compliance',
    requiredPermissions: ['settings.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // File Management
  {
    path: '/file',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Performance
  {
    path: '/performance',
    requiredPermissions: ['reports.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  },

  // Messaging/Inbox
  {
    path: '/messaging',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/inbox',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Charts/Analytics
  {
    path: '/charts',
    requiredPermissions: ['reports.view'],
    allowedRoles: ['owner', 'admin', 'manager'],
    requireTenantAccess: true
  }
];

interface PermissionMiddlewareProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
}

// Component to protect individual routes
export function RouteGuard({ children, fallbackComponent: FallbackComponent }: PermissionMiddlewareProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // Define public paths that don't require authentication
    const publicPaths = [
      '/',
      '/login',
      '/register',
      '/reset-password',
      '/pricing',
      '/marketing',
      '/demo',
      '/terms',
      '/privacy'
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    // If it's a public path, allow access without authentication
    if (isPublicPath) {
      setIsAuthorized(true);
      return;
    }

    // If not logged in and not on public path, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Find matching route configuration
    const routeConfig = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));
    
    if (!routeConfig) {
      // No specific route protection, allow access
      setIsAuthorized(true);
      return;
    }

    // Check role authorization
    if (routeConfig.allowedRoles && !routeConfig.allowedRoles.includes(user.role)) {
      setIsAuthorized(false);
      return;
    }

    // Check permission authorization
    const hasRequiredPermissions = routeConfig.requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      setIsAuthorized(false);
      return;
    }

    // Check tenant access if required
    if (routeConfig.requireTenantAccess && !user.tenantId) {
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoading, pathname, hasPermission, router]);

  // Show loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Component to protect specific features/components
interface FeatureGuardProps {
  permissions: Permission[];
  roles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireTenantAccess?: boolean;
}

export function FeatureGuard({ 
  permissions, 
  roles, 
  children, 
  fallback = null,
  requireTenantAccess = true
}: FeatureGuardProps) {
  const { user, hasPermission } = useAuth();

  if (!user) return fallback;

  // Check role authorization
  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check permission authorization
  const hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  // Check tenant access if required
  if (requireTenantAccess && !user.tenantId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for conditional rendering based on permissions
export function usePermissionCheck() {
  const { user, hasPermission } = useAuth();

  const canAccess = (
    permissions: Permission[],
    roles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[],
    requireTenantAccess: boolean = true
  ): boolean => {
    if (!user) return false;

    // Check role authorization
    if (roles && !roles.includes(user.role)) return false;

    // Check permission authorization
    const hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
    if (!hasRequiredPermissions) return false;

    // Check tenant access if required
    if (requireTenantAccess && !user.tenantId) return false;

    return true;
  };

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isSalesRep = user?.role === 'sales_rep';
  const isUser = user?.role === 'user';

  const canManageSystem = canAccess(['system.owner'], ['owner'], false);
  const canManageUsers = canAccess(['users.view'], ['owner', 'admin']);
  const canManageInventory = canAccess(['inventory.view'], ['owner', 'admin', 'manager', 'sales_rep']);
  const canViewReports = canAccess(['reports.view'], ['owner', 'admin', 'manager']);
  const canManageDeals = canAccess(['deals.view'], ['owner', 'admin', 'manager', 'sales_rep']);

  return {
    canAccess,
    isOwner,
    isAdmin,
    isManager,
    isSalesRep,
    isUser,
    canManageSystem,
    canManageUsers,
    canManageInventory,
    canViewReports,
    canManageDeals,
    user
  };
}

// Higher-order component for page-level protection
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissions: Permission[],
  roles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[],
  fallbackComponent?: React.ComponentType
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <FeatureGuard
        permissions={permissions}
        roles={roles}
        fallback={fallbackComponent ? React.createElement(fallbackComponent) : undefined}
      >
        <WrappedComponent {...props} />
      </FeatureGuard>
    );
  };
}

export default RouteGuard;