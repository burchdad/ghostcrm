"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 [AuthProvider] Initializing auth state...');
    
    // Add timeout protection
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AuthProvider] Auth initialization timeout, setting loading to false');
      setIsLoading(false);
    }, 10000); // 10 second timeout
    
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ [AuthProvider] Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ [AuthProvider] Found existing session');
        fetchUserProfile(session.user);
      } else {
        console.log('ℹ️ [AuthProvider] No existing session');
        setIsLoading(false);
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      console.error('💥 [AuthProvider] Auth initialization error:', error);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthProvider] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AuthProvider] User signed in');
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [AuthProvider] User signed out');
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: User) => {
    try {
      console.log('👤 [AuthProvider] Fetching user profile...');
      
      // Get user profile from database
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, email, role, organization_id, requires_password_reset')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ [AuthProvider] Error fetching profile:', error);
        // Create a basic user profile with defaults if database fetch fails
        console.log('🔧 [AuthProvider] Creating fallback user profile...');
        
        // Detect tenant context from hostname
        let detectedTenantId = 'default-org';
        let detectedRole = 'user';
        
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          
          // If we're on a subdomain, use it as tenant context
          if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
            detectedTenantId = subdomain;
            // For burchmotors subdomain, this user should be owner
            if (subdomain === 'burchmotors' && supabaseUser.email === 'burchsl4@gmail.com') {
              detectedRole = 'owner';
            }
          }
        }
        
        const fallbackAuthUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: supabaseUser.user_metadata?.role || detectedRole,
          organizationId: supabaseUser.user_metadata?.organization_id || detectedTenantId,
          tenantId: supabaseUser.user_metadata?.tenant_id || detectedTenantId,
          requires_password_reset: false
        };
        
        console.log('✅ [AuthProvider] Using fallback profile with tenant detection:', fallbackAuthUser);
        setUser(fallbackAuthUser);
        setIsLoading(false);
        return;
      }

      // Get tenant info from metadata, profile, or detect from hostname
      let tenantId = supabaseUser.user_metadata?.tenant_id || userProfile?.organization_id || 'default-org';
      let organizationId = supabaseUser.user_metadata?.organization_id || userProfile?.organization_id || 'default-org';
      
      // Detect tenant context from hostname if not found in metadata
      if (tenantId === 'default-org' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        // If we're on a subdomain, use it as tenant context
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          tenantId = subdomain;
          organizationId = subdomain;
        }
      }
      
      // Improve role detection
      let userRole = userProfile?.role || supabaseUser.user_metadata?.role || 'user';
      
      // Special case for known owner email on burchmotors subdomain
      if (tenantId === 'burchmotors' && supabaseUser.email === 'burchsl4@gmail.com' && userRole === 'user') {
        userRole = 'owner';
        console.log('🔧 [AuthProvider] Detected owner role for burchmotors tenant');
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: userRole,
        organizationId,
        tenantId,
        requires_password_reset: userProfile?.requires_password_reset || false
      };

      console.log('✅ [AuthProvider] User profile loaded with tenant detection:', {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId,
        organizationId: authUser.organizationId
      });

      setUser(authUser);
      setIsLoading(false);
    } catch (error) {
      console.error('💥 [AuthProvider] Unexpected error in fetchUserProfile:', error);
      
      // Detect tenant context for emergency fallback
      let emergencyTenantId = 'default-org';
      let emergencyRole = 'user';
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
          emergencyTenantId = subdomain;
          if (subdomain === 'burchmotors' && supabaseUser.email === 'burchsl4@gmail.com') {
            emergencyRole = 'owner';
          }
        }
      }
      
      // Create emergency fallback user profile
      const emergencyAuthUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: emergencyRole,
        organizationId: emergencyTenantId,
        tenantId: emergencyTenantId,
        requires_password_reset: false
      };
      
      console.log('🚨 [AuthProvider] Using emergency fallback profile with tenant detection:', emergencyAuthUser);
      setUser(emergencyAuthUser);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🔐 [AuthProvider] Attempting login...');
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('❌ [AuthProvider] Login failed:', error.message);
        setIsLoading(false);
        return { success: false, message: error.message };
      }

      if (data.user) {
        console.log('✅ [AuthProvider] Login successful');
        // User profile will be fetched by the auth state change listener
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('💥 [AuthProvider] Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('👋 [AuthProvider] Logging out...');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('💥 [AuthProvider] Logout error:', error);
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