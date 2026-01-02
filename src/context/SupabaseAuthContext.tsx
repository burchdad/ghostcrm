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
        
        const fallbackAuthUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: supabaseUser.user_metadata?.role || 'user',
          organizationId: supabaseUser.user_metadata?.organization_id || 'default-org',
          tenantId: supabaseUser.user_metadata?.tenant_id || 'default-org',
          requires_password_reset: false
        };
        
        console.log('✅ [AuthProvider] Using fallback profile:', fallbackAuthUser);
        setUser(fallbackAuthUser);
        setIsLoading(false);
        return;
      }

      // Get tenant info from metadata or profile
      const tenantId = supabaseUser.user_metadata?.tenant_id || userProfile?.organization_id || 'default-org';
      const organizationId = supabaseUser.user_metadata?.organization_id || userProfile?.organization_id || 'default-org';

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: userProfile?.role || supabaseUser.user_metadata?.role || 'user',
        organizationId,
        tenantId,
        requires_password_reset: userProfile?.requires_password_reset || false
      };

      console.log('✅ [AuthProvider] User profile loaded:', {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId
      });

      setUser(authUser);
      setIsLoading(false);
    } catch (error) {
      console.error('💥 [AuthProvider] Unexpected error in fetchUserProfile:', error);
      
      // Create emergency fallback user profile
      const emergencyAuthUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: 'user',
        organizationId: 'default-org',
        tenantId: 'default-org',
        requires_password_reset: false
      };
      
      console.log('🚨 [AuthProvider] Using emergency fallback profile:', emergencyAuthUser);
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