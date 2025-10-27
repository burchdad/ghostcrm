"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant, AuthService, sampleUsers, sampleTenants } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      setIsLoading(true);
      
      // Check for existing session
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = AuthService.parseSessionToken(token);
        if (payload && payload.userId) {
          const userData = sampleUsers.find(u => u.id === payload.userId);
          const tenantData = sampleTenants.find(t => t.id === payload.tenantId);
          
          if (userData && tenantData) {
            setUser(userData);
            setTenant(tenantData);
          } else {
            // Invalid session, clear it
            localStorage.removeItem('auth_token');
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email
      const userData = sampleUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!userData) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      if (!userData.isActive) {
        return { success: false, message: 'Account is deactivated. Please contact your administrator.' };
      }
      
      // Find tenant
      const tenantData = sampleTenants.find(t => t.id === userData.tenantId);
      
      if (!tenantData || !tenantData.isActive) {
        return { success: false, message: 'Company account is not active. Please contact support.' };
      }
      
      // Check subscription status
      if (tenantData.subscription.status !== 'active') {
        return { success: false, message: 'Company subscription is not active. Please contact your administrator.' };
      }
      
      // Update last login
      userData.lastLogin = new Date().toISOString();
      
      // Generate session token
      const token = AuthService.generateSessionToken(userData);
      localStorage.setItem('auth_token', token);
      
      setUser(userData);
      setTenant(tenantData);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setUser(null);
    setTenant(null);
    
    // Redirect to login
    window.location.href = '/login';
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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