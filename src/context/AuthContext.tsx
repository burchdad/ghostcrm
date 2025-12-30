"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { User, Tenant, UserRole, AuthService, sampleUsers, sampleTenants } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  authReady: boolean; // Track when auth initialization is complete
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const initializingRef = useRef(false);
  const previousPathRef = useRef<string>();

  // Enhanced logging for state changes
  const setUserWithLogging = (newUser: User | null) => {
    if (newUser !== user) {
      console.log('🔄 [AUTH] User state changing:', { 
        from: user?.email || 'null', 
        to: newUser?.email || 'null',
        stack: new Error().stack?.split('\n')[1]?.trim()
      });
      setUser(newUser);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    if (!initializingRef.current) {
      console.log('🔧 [AUTH] AuthProvider mounted, calling initializeAuth');
      initializingRef.current = true;
      initializeAuth().finally(() => {
        initializingRef.current = false;
      });
    } else {
      console.log('🚫 [AUTH] AuthProvider mount blocked - already initializing');
    }
  }, []);

  // Route change detection - check for preserved state on navigation
  useEffect(() => {
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      // Only log route changes that matter for auth restoration
      if (!user && authReady && !initializingRef.current) {
        console.log('🛣️ [AUTH] Route change - user lost, checking preservation:', { 
          from: previousPathRef.current, 
          to: pathname 
        });
        
        if (typeof window !== 'undefined') {
          const preserved = sessionStorage.getItem('ghost_auth_state');
          const backup = sessionStorage.getItem('ghost_auth_backup');
          
          if (preserved || backup) {
            console.log('🔄 [AUTH] Found preserved state after route change, calling initializeAuth');
            initializeAuth(true).catch(error => {
              console.error('❌ [AUTH] Route change restoration failed:', error);
            });
          }
        }
      }
    }
    previousPathRef.current = pathname;
  }, [pathname, user, authReady]);

  // Simple state preservation - preserve when user changes
  useEffect(() => {
    if (user && user.email && tenant) {
      console.log('💾 [AUTH] User state updated, preserving for navigation');
      const backupState = JSON.stringify({ user, tenant });
      sessionStorage.setItem('ghost_auth_backup', backupState);
      console.log('💾 [AUTH] Backup state saved:', { 
        userEmail: user.email, 
        tenantId: tenant.id,
        length: backupState.length 
      });
    }
  }, [user, tenant]);

  async function initializeAuth(skipLoadingState = false) {
    try {
      console.log('🔧 [AUTH] initializeAuth called:', { skipLoadingState });
      
      // Always check for preserved state first (for navigation scenarios)
      if (typeof window !== 'undefined') {
        const preserved = sessionStorage.getItem('ghost_auth_state');
        const backup = sessionStorage.getItem('ghost_auth_backup');
        const stateToRestore = preserved || backup;
        
        console.log('🔍 [AUTH] Checking for preserved state:', { 
          hasPreserved: !!preserved, 
          hasBackup: !!backup,
          hasCurrentUser: !!user,
          preservedLength: preserved?.length || 0,
          backupLength: backup?.length || 0,
          isPrivateMode: !window.indexedDB, // Simple private mode detection
          initializingFlag: initializingRef.current,
          stateToRestore: stateToRestore ? 'FOUND' : 'NONE',
          skipLoadingState
        });
        
        if (stateToRestore) {
          try {
            const parsedState = JSON.parse(stateToRestore);
            const { user: preservedUser, tenant: preservedTenant } = parsedState;
            
            console.log('🔍 [AUTH] Parsed preserved state:', {
              hasUser: !!preservedUser,
              hasTenant: !!preservedTenant,
              userEmail: preservedUser?.email,
              userRole: preservedUser?.role
            });
            
            if (preservedUser && preservedUser.email) {
              console.log('♻️ [AUTH] Restoring preserved state:', { 
                userEmail: preservedUser.email, 
                userRole: preservedUser.role,
                source: preserved ? 'ghost_auth_state' : 'ghost_auth_backup',
                tenantId: preservedUser.tenantId
              });
              
              // Create tenant from preserved user if not provided
              const tenantToSet = preservedTenant || {
                id: preservedUser.tenantId,
                name: preservedUser.organizationName || 'Ghost Auto CRM',
                domain: 'localhost',
                type: 'dealership',
                isActive: true,
                subscription: {
                  plan: 'professional',
                  status: 'active',
                  expiresAt: '2025-12-31'
                }
              };
              
              setUser(preservedUser);
              setTenant(tenantToSet);
              setAuthReady(true);
              if (!skipLoadingState) setIsLoading(false);
              
              // Only clean up the primary storage, keep backup temporarily
              if (preserved) {
                sessionStorage.removeItem('ghost_auth_state');
                console.log('🧹 [AUTH] Removed ghost_auth_state, keeping backup for redundancy');
              }
              
              console.log('✅ [AUTH] Successfully restored from preserved state - RETURNING EARLY');
              return; // Skip API call if we restored from session
            } else {
              console.log('❌ [AUTH] Preserved state invalid - no user or email found');
            }
          } catch (error) {
            console.error('❌ [AUTH] Error parsing preserved state:', error);
            sessionStorage.removeItem('ghost_auth_state');
            sessionStorage.removeItem('ghost_auth_backup');
          }
        } else {
          console.log('❌ [AUTH] No preserved state found - continuing with API check');
        }
      }
      
      if (!skipLoadingState) {
        console.log('🔧 [AUTH] Setting loading state to true');
        setIsLoading(true);
      }
      
      // Check for JWT cookie instead of localStorage
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      
      console.log('🔧 [AUTH] Auth check response:', { 
        ok: response.ok, 
        status: response.status 
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.user) {
          // Convert database user to AuthProvider format
          const authUser: User = {
            id: userData.user.userId,
            email: userData.user.email,
            firstName: userData.user.email.split('@')[0], // Use email prefix as firstName
            lastName: '', // No lastName from JWT
            role: userData.user.role as UserRole,
            tenantId: userData.user.tenantId,
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              permissions: [], // Will be handled by role-based permissions
              settings: {
                theme: 'light',
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                },
                language: 'en',
                timezone: 'UTC'
              }
            }
          };
          
          const authTenant: Tenant = {
            id: userData.user.tenantId,
            name: userData.user.organizationName || userData.user.companyName || 'Ghost Auto CRM',
            domain: 'localhost',
            type: 'dealership',
            isActive: true,
            subscription: {
              plan: 'professional',
              status: 'active',
              expiresAt: '2025-12-31'
            },
            settings: {
              branding: {
                primaryColor: '#3B82F6',
                secondaryColor: '#1E40AF',
                companyName: userData.user.organizationName || userData.user.companyName || 'Ghost Auto CRM'
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
                maxVehicles: 1000,
                maxStorage: 10
              }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUser(authUser);
          setTenant(authTenant);
          console.log('✅ [AUTH] User and tenant set:', { 
            userEmail: authUser.email, 
            userRole: authUser.role,
            tenantId: authUser.tenantId 
          });
        } else {
          // No valid JWT cookie found
          console.log('❌ [AUTH] No valid auth found, clearing user state');
          setUser(null);
          setTenant(null);
        }
      } else {
        // Response not ok
        console.log('❌ [AUTH] Auth response not ok, clearing user state');
        setUser(null);
        setTenant(null);
      }
    } catch (error) {
        console.error('❌ [AUTH] Error initializing auth:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
        setTenant(null);
      } finally {
        if (!skipLoadingState) {
          console.log('🔧 [AUTH] Setting loading state to false');
          setIsLoading(false);
        }
        console.log('🔧 [AUTH] Setting authReady to true');
        setAuthReady(true); // Auth initialization complete
        
        // Force a small delay to ensure state propagation
        if (skipLoadingState) {
          console.log('🔧 [AUTH] Forcing state update after login');
          setTimeout(() => {
            setIsLoading(false);
          }, 10);
        }
      }
    }

  async function login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      setIsLoading(true);
      
      // Call the actual login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      // If login successful, refresh auth state without triggering loading state
      console.log('🔧 [LOGIN] About to call initializeAuth after successful login');
      await initializeAuth(true);
      
      console.log('🔧 [LOGIN] Login complete, auth state should be updated');
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      // Call logout API to clear HTTP-only cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error calling logout API:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_token');
      setUser(null);
      setTenant(null);
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  function hasPermission(permission: string): boolean {
    if (!user) return false;
    return AuthService.hasPermission(user, permission as any);
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (!user) return false;
    return AuthService.hasAnyPermission(user, permissions as any);
  }

  function canAccessTenant(tenantId: string): boolean {
    if (!user) return false;
    return AuthService.canAccessTenant(user, tenantId);
  }

  async function switchTenant(tenantId: string): Promise<boolean> {
    if (!user || !canAccessTenant(tenantId)) {
      return false;
    }
    
    const newTenant = sampleTenants.find(t => t.id === tenantId);
    if (!newTenant) return false;
    
    setTenant(newTenant);
    
    // Update token with new tenant
    const token = AuthService.generateSessionToken({ ...user, tenantId });
    localStorage.setItem('auth_token', token);
    
    return true;
  }

  const value: AuthContextType = {
    user,
    tenant,
    isLoading,
    authReady,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    canAccessTenant,
    switchTenant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // Debug logging - only for meaningful transitions
  const prevUserRef = React.useRef<User | null>();
  const prevAuthReadyRef = React.useRef<boolean>();
  const logCountRef = React.useRef(0);
  
  React.useEffect(() => {
    const userChanged = prevUserRef.current !== context?.user;
    const authReadyChanged = prevAuthReadyRef.current !== context?.authReady;
    
    // Only log initial auth, user login/logout, and auth ready state changes
    const shouldLog = (
      (userChanged && (context?.user || prevUserRef.current)) || // User login/logout only
      (authReadyChanged && context?.authReady) || // Auth ready transition only
      (logCountRef.current < 2) // Allow first few logs for debugging
    );
    
    if (shouldLog) {
      console.log('🔍 [useAuth] State transition:', {
        user: context?.user?.email || 'null',
        authReady: context?.authReady,
        isLoading: context?.isLoading,
        trigger: userChanged ? 'user-change' : authReadyChanged ? 'auth-ready' : 'initial'
      });
      logCountRef.current++;
    }
    
    prevUserRef.current = context?.user;
    prevAuthReadyRef.current = context?.authReady;
  }, [context?.user, context?.isLoading, context?.authReady]);
  
  if (context === undefined) {
    console.log('🔍 [useAuth] No context available, returning defaults');
    // Return default values for public pages where AuthProvider isn't available
    return {
      user: null,
      tenant: null,
      isLoading: false,
      authReady: true, // For public pages, auth is always "ready"
      login: async () => ({ success: false, message: 'Auth not available' }),
      logout: async () => {},
      hasPermission: () => false,
      hasAnyPermission: () => false,
      canAccessTenant: () => false,
      switchTenant: async () => false,
    };
  }
  return context;
}

// Higher-order component for route protection
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermissions?: string[]
) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading, hasAnyPermission } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      // Don't redirect from billing page - let middleware handle it
      if (typeof window !== 'undefined' && window.location.pathname === '/billing') {
        return <div>Loading...</div>;
      }
      window.location.href = '/login';
      return null;
    }
    
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Component for tenant-specific data filtering
export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, tenant } = useAuth();
  
  const tenantUtils = {
    filterData: <T extends { tenantId?: string }>(data: T[]): T[] => {
      if (!user) return [];
      return AuthService.filterByTenant(user, data);
    },
    
    isTenantData: (item: { tenantId?: string }): boolean => {
      if (!user || !item.tenantId) return false;
      return AuthService.canAccessTenant(user, item.tenantId);
    },
    
    getCurrentTenantId: (): string | null => {
      return tenant?.id || null;
    }
  };
  
  return (
    <TenantContext.Provider value={tenantUtils}>
      {children}
    </TenantContext.Provider>
  );
}

const TenantContext = createContext<{
  filterData: <T extends { tenantId?: string }>(data: T[]) => T[];
  isTenantData: (item: { tenantId?: string }) => boolean;
  getCurrentTenantId: () => string | null;
} | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}