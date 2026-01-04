"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  tenantId: string;
  requires_password_reset?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  supabase: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [processedUserId, setProcessedUserId] = useState<string | null>(null);
  const [authTimeoutId, setAuthTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Memoize Supabase client to prevent multiple instances
  const supabase = useMemo(() => createClient(), []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Faster timeout for quicker user experience
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
        setIsFetchingProfile(false);
      }
    }, 8000); // Reduced to 8 seconds for faster experience
    
    setAuthTimeoutId(timeoutId);
    
    // Get initial session with aggressive optimization
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      clearTimeout(timeoutId);
      setAuthTimeoutId(null);
      
      if (error) {
        console.error('❌ [AuthProvider] Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ [AuthProvider] Found existing session');
        setProcessedUserId(session.user.id);
        fetchUserProfile(session.user);
      } else {
        console.log('ℹ️ [AuthProvider] No existing session');
        setIsLoading(false);
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      setAuthTimeoutId(null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Prevent duplicate fetches for the same user during rapid auth state changes
          if (processedUserId !== session.user.id && !isFetchingProfile) {
            setProcessedUserId(session.user.id);
            await fetchUserProfile(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          setIsFetchingProfile(false);
          setProcessedUserId(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      // Clear any pending timeouts on cleanup
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: User) => {
    // Prevent concurrent calls to fetchUserProfile
    if (isFetchingProfile) return;
    
    setIsFetchingProfile(true);
    
    try {
      // Fast tenant detection from hostname first
      let detectedTenantId = 'default-org';
      let detectedRole = 'user';
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          detectedTenantId = subdomain;
          detectedRole = 'owner';
        }
      }

      // Get user profile with minimal query
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, email, role, organization_id, requires_password_reset')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        // Fast fallback without verbose logging
        const fallbackAuthUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: supabaseUser.user_metadata?.role || detectedRole,
          organizationId: supabaseUser.user_metadata?.organization_id || detectedTenantId,
          tenantId: supabaseUser.user_metadata?.tenant_id || detectedTenantId,
          requires_password_reset: false
        };
        
        setUser(fallbackAuthUser);
        setIsLoading(false);
        setIsFetchingProfile(false);
        
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          setAuthTimeoutId(null);
        }
        return;
      }

      // Use detected tenant or database values
      let tenantId = supabaseUser.user_metadata?.tenant_id || userProfile?.organization_id || detectedTenantId;
      let organizationId = supabaseUser.user_metadata?.organization_id || userProfile?.organization_id || detectedTenantId;
      
      // Detect tenant context from hostname if not already set
      if (tenantId === 'default-org' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          tenantId = subdomain;
          organizationId = subdomain;
        }
      }
      
      // Use role from database profile first, then metadata, with proper fallback
      let userRole = userProfile?.role || supabaseUser.user_metadata?.role || 'user';
      
      // If we're on a tenant subdomain and no role is set, assume owner (tenant creator)
      if (tenantId !== 'default-org' && userRole === 'user' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain === tenantId) {
          userRole = 'owner';
        }
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: userRole,
        organizationId,
        tenantId,
        requires_password_reset: userProfile?.requires_password_reset || false
      };

      setUser(authUser);
      setIsLoading(false);
      setIsFetchingProfile(false);
      
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
    } catch (error) {
      // Fast emergency fallback
      let emergencyTenantId = 'default-org';
      let emergencyRole = 'user';
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          emergencyTenantId = subdomain;
          emergencyRole = 'owner';
        }
      }
      
      const emergencyAuthUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: emergencyRole,
        organizationId: emergencyTenantId,
        tenantId: emergencyTenantId,
        requires_password_reset: false
      };
      
      setUser(emergencyAuthUser);
      setIsLoading(false);
      setIsFetchingProfile(false);
      setProcessedUserId(null); // Reset so we can retry
      
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        setIsLoading(false);
        return { success: false, message: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: 'Login failed' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      // Silent logout errors
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    supabase
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