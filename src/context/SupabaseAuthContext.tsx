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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('✅ [AuthProvider] Found existing session');
        fetchUserProfile(session.user);
      } else {
        console.log('ℹ️ [AuthProvider] No existing session');
        setIsLoading(false);
      }
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
        .select('id, email, role, organization_id')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ [AuthProvider] Error fetching profile:', error);
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
        tenantId
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
      console.error('💥 [AuthProvider] Unexpected error:', error);
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