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
    
    // Much faster timeout for better UX - only 3 seconds
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ [AuthProvider] Auth timeout reached - setting loading to false');
        setIsLoading(false);
        setIsFetchingProfile(false);
      }
    }, 3000); // Reduced from 8 to 3 seconds
    
    setAuthTimeoutId(timeoutId);
    
    // Get initial session with better error handling
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
        console.log('✅ [AuthProvider] Found existing session for:', session.user.email);
        setProcessedUserId(session.user.id);
        fetchUserProfile(session.user);
      } else {
        console.log('ℹ️ [AuthProvider] No existing session found');
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('❌ [AuthProvider] Session fetch failed:', error);
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
    if (isFetchingProfile) {
      console.log('🔄 [AuthProvider] Profile fetch already in progress');
      return;
    }
    
    setIsFetchingProfile(true);
    console.log('🔍 [AuthProvider] Starting profile fetch for:', supabaseUser.email);
    
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
        console.log('🌐 [AuthProvider] Detected tenant from hostname:', { hostname, subdomain, detectedTenantId, detectedRole });
      }

      // Use API endpoint instead of direct database query to avoid authentication issues
      const profilePromise = fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });

      // Add timeout to profile query
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 2000)
      );

      const response = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as Response;

      let userProfile: any = null;
      let error: { message: string } | null = null;

      if (response && response.ok) {
        const data = await response.json();
        if (data.user) {
          userProfile = data.user;
        } else {
          error = { message: 'No user data returned' };
        }
      } else {
        error = { message: `API error: ${response?.status || 'Unknown'}` };
      }

      if (error || !userProfile) {
        console.warn('⚠️ [AuthProvider] Profile API failed, using fallback:', error?.message);
        // Fast fallback without verbose logging
        const fallbackAuthUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: supabaseUser.user_metadata?.role || detectedRole,
          organizationId: supabaseUser.user_metadata?.organization_id || detectedTenantId,
          tenantId: supabaseUser.user_metadata?.tenant_id || detectedTenantId,
          requires_password_reset: false
        };
        
        console.log('✅ [AuthProvider] Using fallback user profile:', fallbackAuthUser);
        setUser(fallbackAuthUser);
        setIsLoading(false);
        setIsFetchingProfile(false);
        
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          setAuthTimeoutId(null);
        }
        return;
      }

      // Use API response data (userProfile now contains the data from /api/auth/me)
      let tenantId = userProfile.tenantId || supabaseUser.user_metadata?.tenant_id || detectedTenantId;
      let organizationId = userProfile.organizationId || supabaseUser.user_metadata?.organization_id || detectedTenantId;
      
      // Detect tenant context from hostname if not already set
      if (tenantId === 'default-org' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          tenantId = subdomain;
          organizationId = subdomain;
        }
      }
      
      // Use role from API response first, then metadata, with proper fallback
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
        requires_password_reset: supabaseUser.user_metadata?.requires_password_reset || false
      };

      console.log('✅ [AuthProvider] Successfully created auth user:', authUser);
      setUser(authUser);
      setIsLoading(false);
      setIsFetchingProfile(false);
      
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
    } catch (error) {
      console.error('❌ [AuthProvider] Profile fetch failed completely:', error);
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
      
      console.log('🚨 [AuthProvider] Using emergency fallback user:', emergencyAuthUser);
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