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
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [processedUserId, setProcessedUserId] = useState<string | null>(null);
  const [authTimeoutId, setAuthTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 [AuthProvider] Initializing auth state...');
    
    // Add timeout protection with longer duration for profile fetch
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AuthProvider] Auth initialization timeout (30s), setting loading to false');
      setIsLoading(false);
      setIsFetchingProfile(false);
    }, 30000); // 30 second timeout
    
    setAuthTimeoutId(timeoutId);
    
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
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
      console.error('💥 [AuthProvider] Auth initialization error:', error);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthProvider] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AuthProvider] User signed in');
          // Prevent duplicate fetches for the same user during rapid auth state changes
          if (processedUserId !== session.user.id && !isFetchingProfile) {
            console.log('📝 [AuthProvider] Processing new user:', session.user.id);
            setProcessedUserId(session.user.id);
            await fetchUserProfile(session.user);
          } else {
            console.log('⏭️ [AuthProvider] User already processed or fetch in progress, skipping');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [AuthProvider] User signed out');
          setUser(null);
          setIsLoading(false);
          setIsFetchingProfile(false);
          setProcessedUserId(null);
          setProcessedUserId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: User) => {
    // Prevent concurrent calls to fetchUserProfile
    if (isFetchingProfile) {
      console.log('⏸️ [AuthProvider] Profile fetch already in progress, skipping...');
      return;
    }
    
    setIsFetchingProfile(true);
    
    try {
      console.log('👤 [AuthProvider] Fetching user profile...');
      const fetchStartTime = Date.now();
      
      // Get user profile from database
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, email, role, organization_id, requires_password_reset')
        .eq('id', supabaseUser.id)
        .single();
        
      console.log(`⏱️ [AuthProvider] Database query took ${Date.now() - fetchStartTime}ms`);

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
          
          // If we're on a subdomain (tenant), use it as tenant context
          if (subdomain && subdomain !== hostname && !hostname.includes('localhost')) {
            detectedTenantId = subdomain;
            // Anyone accessing their own subdomain should be treated as potential owner
            // The database will have the definitive role, this is just fallback
            detectedRole = 'owner';
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
        setIsFetchingProfile(false);
        
        // Clear auth timeout since we completed
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          setAuthTimeoutId(null);
        }
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
      
      // Use role from database profile first, then metadata, with proper fallback
      let userRole = userProfile?.role || supabaseUser.user_metadata?.role || 'user';
      
      // If we're on a tenant subdomain and no role is set, assume owner (tenant creator)
      // This helps with new registrations before database sync
      if (tenantId !== 'default-org' && userRole === 'user' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain === tenantId) {
          userRole = 'owner';
          console.log('🔧 [AuthProvider] Detected tenant owner accessing their subdomain:', tenantId);
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

      console.log('✅ [AuthProvider] User profile loaded with tenant detection:', {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId,
        organizationId: authUser.organizationId
      });

      setUser(authUser);
      setIsLoading(false);
      setIsFetchingProfile(false);
      
      // Clear auth timeout since we completed successfully
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
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
          // If accessing their own tenant subdomain, assume owner role
          emergencyRole = 'owner';
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
      setIsFetchingProfile(false);
      setProcessedUserId(null); // Reset so we can retry
      
      // Clear auth timeout
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
        setAuthTimeoutId(null);
      }
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