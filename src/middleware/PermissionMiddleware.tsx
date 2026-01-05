"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Permission } from '@/lib/permissions';

// Safe auth hook that handles missing context
function useSafeAuth() {
  try {
    const { useAuth } = require('@/context/SupabaseAuthContext');
    return useAuth();
  } catch (error) {
    // Return default values when auth context is not available
    return { user: null, isLoading: false };
  }
}

// Simple role-based permission checker for new auth context
function checkUserPermission(user: any, permissionId: string): boolean {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === 'admin') return true;
  
  // Owner has most permissions
  if (user.role === 'owner') {
    return ![
      'system_admin', 'global_settings', 'user_management'
    ].includes(permissionId);
  }
  
  // Manager has moderate permissions
  if (user.role === 'manager') {
    return [
      'view_dashboard', 'manage_leads', 'view_analytics', 
      'manage_deals', 'team_management', 'view_reports'
    ].includes(permissionId);
  }
  
  // Sales rep has basic permissions
  if (user.role === 'sales_rep') {
    return [
      'view_dashboard', 'manage_leads', 'view_own_deals'
    ].includes(permissionId);
  }
  
  // Default user permissions
  return ['view_dashboard'].includes(permissionId);
}

// Route permission configuration
interface RoutePermission {
  path: string;
  requiredPermissions: string[]; // Permission IDs as strings
  allowedRoles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[];
  requireTenantAccess?: boolean;
}

// Define protected routes and their required permissions
const PROTECTED_ROUTES: RoutePermission[] = [
  // NOTE: /billing is now public (defined in middleware.ts PUBLIC_PATHS)
  // No permission check needed for plan selection page

  // Owner routes - handled separately in the useEffect
  // {
  //   path: '/owner',
  //   requiredPermissions: ['system.owner'],
  //   allowedRoles: ['owner'],
  //   requireTenantAccess: false
  // },

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

  // Inventory Management
  {
    path: '/inventory',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },

  // Customer Management - Now tenant-specific
  {
    path: '/leads',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-owner/leads',
    requiredPermissions: [], // Owner has unrestricted access
    allowedRoles: ['owner'],
    requireTenantAccess: false // Owner has access regardless
  },
  {
    path: '/tenant-salesmanager/leads',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['admin', 'manager'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-salesrep/leads',
    requiredPermissions: ['customers.view'],
    allowedRoles: ['sales_rep', 'user'],
    requireTenantAccess: true
  },

  // Deal Management - Tenant-specific
  {
    path: '/deals',
    requiredPermissions: ['deals.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-owner/deals',
    requiredPermissions: [], // Owner has unrestricted access
    allowedRoles: ['owner'],
    requireTenantAccess: false
  },
  {
    path: '/tenant-salesmanager/deals',
    requiredPermissions: ['deals.view'],
    allowedRoles: ['admin', 'manager'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-salesrep/deals',
    requiredPermissions: ['deals.view'],
    allowedRoles: ['sales_rep', 'user'],
    requireTenantAccess: true
  },

  // Inventory Management - Tenant-specific
  {
    path: '/inventory',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-owner/inventory',
    requiredPermissions: [], // Owner has unrestricted access
    allowedRoles: ['owner'],
    requireTenantAccess: false
  },
  {
    path: '/tenant-salesmanager/inventory',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['admin', 'manager'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-salesrep/inventory',
    requiredPermissions: ['inventory.view'],
    allowedRoles: ['sales_rep', 'user'],
    requireTenantAccess: true
  },

  // Calendar/Appointments - Tenant-specific
  {
    path: '/calendar',
    requiredPermissions: ['appointments.view'],
    allowedRoles: ['owner', 'admin', 'manager', 'sales_rep'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-owner/calendar',
    requiredPermissions: [], // Owner has unrestricted access
    allowedRoles: ['owner'],
    requireTenantAccess: false
  },
  {
    path: '/tenant-salesmanager/calendar',
    requiredPermissions: ['appointments.view'],
    allowedRoles: ['admin', 'manager'],
    requireTenantAccess: true
  },
  {
    path: '/tenant-salesrep/calendar',
    requiredPermissions: ['appointments.view'],
    allowedRoles: ['sales_rep', 'user'],
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
  const { user, isLoading } = useSafeAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const authCheckInProgress = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to set authorization and reset check flag
  const setAuthorizationResult = (authorized: boolean) => {
    authCheckInProgress.current = false;
    setIsCheckingRedirect(false);
    setIsAuthorized(authorized);
    
    // Clear any pending timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  };

  // Helper function for path matching
  const startsWithSeg = (path: string, base: string) =>
    path === base || path.startsWith(base + '/');

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Route guard effect - silent mode for production

    // Reset authorization state when auth context changes
    if (isLoading) {
      // Auth loading, resetting state
      setIsAuthorized(null);
      setIsCheckingRedirect(true);
      authCheckInProgress.current = false;
      return;
    }

    // If already authorized and not checking redirects, don't re-run unless user/path changes
    if (isAuthorized === true && !isCheckingRedirect && authCheckInProgress.current === false) {
      // Already authorized and stable, skipping check
      return;
    }
    
    if (authCheckInProgress.current) {
      // Auth check already in progress, skipping
      return; // Critical: don't decide if check is already in progress
    }

    authCheckInProgress.current = true;
    setIsCheckingRedirect(true); // Start checking for redirects

    // Set a timeout as a safety net to prevent infinite loading
    checkTimeoutRef.current = setTimeout(() => {
      if (authCheckInProgress.current) {
        setAuthorizationResult(true);
      }
    }, 5000); // 5 second timeout

    // Starting authorization check - silent mode

    // Define public paths that don't require authentication
    const publicPaths = [
      '/',             // landing
      '/login',
      '/register',
      '/reset-password',
      '/login-owner',      // owner role-specific login
      '/login-salesmanager', // sales manager role-specific login  
      '/login-salesrep',   // sales rep role-specific login
      '/owner/login',  // software owner login
      '/marketing',    // marketing section root
      '/pricing',      // public pricing page  
      '/features',     // public features page
      '/demo',         // free demo landing
      '/inventory/qr-vehicle-profile', // Public QR vehicle profiles
      '/terms',
      '/privacy'
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => startsWithSeg(pathname, path));

    // If it's a public path, allow access without authentication
    if (isPublicPath) {
      // Public path access granted
      setAuthorizationResult(true);
      return;
    }

    // If not logged in and not on public path, redirect to login
    if (!user) {
      authCheckInProgress.current = false;
      setIsCheckingRedirect(false);
      router.push('/login');
      return;
    }

    // Special handling for software owner routes
    if (startsWithSeg(pathname, '/owner')) {
      // Check for owner session in localStorage
      const ownerSession = localStorage.getItem('ownerSession');
      if (ownerSession) {
        try {
          const session = JSON.parse(ownerSession);
          const expires = new Date(session.expires);
          
          // Check if session is still valid
          if (expires > new Date()) {
            // Owner session valid - allowing access
            setAuthorizationResult(true);
            return;
          } else {
            localStorage.removeItem('ownerSession');
          }
        } catch (error) {
          localStorage.removeItem('ownerSession');
        }
      }
      
      // No valid owner session for owner route
      authCheckInProgress.current = false;
      setIsCheckingRedirect(false);
      router.push('/owner/login');
      return;
    }

    // If not logged in and not on public path, redirect to login
    if (!user) {
      authCheckInProgress.current = false;
      setIsCheckingRedirect(false);
      router.push('/login');
      return;
    }

    // User authenticated - proceeding with route checks - silent mode

    // Auto-redirect users from legacy routes to tenant-specific routes
    const tenantRouteRedirects: Record<string, Record<string, string>> = {
      '/dashboard': {
        'owner': '/tenant-owner/dashboard',
        'admin': '/tenant-salesmanager/dashboard',
        'manager': '/tenant-salesmanager/dashboard',
        'sales_rep': '/tenant-salesrep/dashboard',
        'user': '/tenant-salesrep/dashboard'
      },
      '/leads': {
        'owner': '/tenant-owner/leads',
        'admin': '/tenant-salesmanager/leads',
        'manager': '/tenant-salesmanager/leads',
        'sales_rep': '/tenant-salesrep/leads',
        'user': '/tenant-salesrep/leads'
      },
      '/deals': {
        'owner': '/tenant-owner/deals',
        'admin': '/tenant-salesmanager/deals',
        'manager': '/tenant-salesmanager/deals',
        'sales_rep': '/tenant-salesrep/deals',
        'user': '/tenant-salesrep/deals'
      },
      '/inventory': {
        'owner': '/tenant-owner/inventory',
        'admin': '/tenant-salesmanager/inventory',
        'manager': '/tenant-salesmanager/inventory',
        'sales_rep': '/tenant-salesrep/inventory',
        'user': '/tenant-salesrep/inventory'
      },
      '/calendar': {
        'owner': '/tenant-owner/calendar',
        'admin': '/tenant-salesmanager/calendar',
        'manager': '/tenant-salesmanager/calendar',
        'sales_rep': '/tenant-salesrep/calendar',
        'user': '/tenant-salesrep/calendar'
      }
    };

    // Check if current path should be redirected to tenant-specific route
    const redirectTarget = tenantRouteRedirects[pathname]?.[user.role];
    if (redirectTarget) {
      // Redirecting user to appropriate path
      authCheckInProgress.current = false;
      setIsCheckingRedirect(false); // Complete redirect check
      router.push(redirectTarget);
      return;
    }

    // No redirect needed, continue with authorization checks
    authCheckInProgress.current = false;
    setIsCheckingRedirect(false);

    // Find matching route configuration (includes /billing rule above)
    const routeConfig = PROTECTED_ROUTES.find(route => startsWithSeg(pathname, route.path));
    
    if (!routeConfig) {
      // No specific route protection, allow access
      // No route config found - allowing access
      // Setting isCheckingRedirect=false, isAuthorized=true - silent mode
      
      // Use the helper function for consistent state management
      setAuthorizationResult(true);
      return;
    }

    // Check role authorization
    if (routeConfig.allowedRoles && !routeConfig.allowedRoles.includes(user.role as any)) {
      setAuthorizationResult(false);
      return;
    }

    // Check permission authorization
    const hasRequiredPermissions = routeConfig.requiredPermissions.every(permission => 
      checkUserPermission(user, permission)
    );

    if (!hasRequiredPermissions) {
      setAuthorizationResult(false);
      return;
    }

    // Check tenant access if required
    if (routeConfig.requireTenantAccess && !user.tenantId) {
      // Special case: if user is an owner and we're on a tenant subdomain, allow access
      // This handles the case where owner logs in via subdomain but JWT doesn't have tenantId yet
      if (user.role === 'owner' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        // If we're on a subdomain (not just localhost), allow owner access
        if (subdomain && subdomain !== 'localhost' && hostname.includes('localhost')) {
          setAuthorizationResult(true);
          return;
        }
      }
      setAuthorizationResult(false);
      return;
    }

    // All checks passed - authorizing access
    setAuthorizationResult(true);
  }, [isLoading, user?.role, user?.id, pathname]); // Removed hasPermission and router to prevent unnecessary re-runs

  // Show loading state - including while checking for redirects
  if (isLoading || isAuthorized === null || isCheckingRedirect) {
    const loadingReason = isLoading ? 'auth loading' : 
                         isAuthorized === null ? 'authorization not determined' : 
                         'checking redirects';
    
    // Showing loading state - silent mode
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
  permissions: string[]; // Permission IDs as strings
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
  const { user } = useSafeAuth();

  if (!user) return fallback;

  // Check role authorization
  if (roles && !roles.includes(user.role as any)) {
    return <>{fallback}</>;
  }

  // Check permission authorization
  const hasRequiredPermissions = permissions.every(permission => checkUserPermission(user, permission));
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
  const { user } = useSafeAuth();

  const canAccess = (
    permissions: string[], // Permission IDs as strings
    roles?: ('owner' | 'admin' | 'manager' | 'sales_rep' | 'user')[],
    requireTenantAccess: boolean = true
  ): boolean => {
    if (!user) return false;

    // Check role authorization
    if (roles && !roles.includes(user.role as any)) return false;

    // Check permission authorization
    const hasRequiredPermissions = permissions.every(permission => checkUserPermission(user, permission));
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
  permissions: string[], // Permission IDs as strings
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