'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getClient } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  tenantId: string;
  requires_password_reset?: boolean;
}

type AuthState = {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Backward compatibility alias for loading
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  supabase: any;
};

const FALLBACK_AUTH: AuthState = {
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  isLoading: true, // Backward compatibility
  isAuthenticated: false,
  signOut: async () => {},
  refresh: async () => {},
  login: async () => ({ success: false, message: 'Auth provider not available' }),
  supabase: null,
};

// Context allows undefined so hook can detect missing provider
const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // Initialize Supabase client
  useEffect(() => {
    (async () => {
      try {
        const client = await getClient();
        setSupabaseClient(client);
      } catch (error) {
        console.error('❌ [Auth] Failed to initialize Supabase client:', error);
        setLoading(false);
      }
    })();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (!supabaseClient) return;

    let unsub: { data?: { subscription?: { unsubscribe: () => void } } } | null = null;

    (async () => {
      try {
        // Initial session load
        const { data } = await supabaseClient.auth.getSession();
        setSession(data.session ?? null);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);

        // Subscribe to changes
        unsub = supabaseClient.auth.onAuthStateChange(async (_event, newSession) => {
          setSession(newSession ?? null);
          
          if (newSession?.user) {
            await fetchUserProfile(newSession.user);
          } else {
            setUser(null);
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error('❌ [Auth] Session initialization failed:', error);
        setLoading(false);
      }
    })();

    return () => {
      unsub?.data?.subscription?.unsubscribe?.();
    };
  }, [supabaseClient]);

  // Fetch user profile from database
  const fetchUserProfile = async (supabaseUser: User) => {
    if (!supabaseClient) return;

    try {
      // First, ensure the profile exists by calling bootstrap
      await fetch("/api/auth/bootstrap-profile", { method: "POST" });

      // Then fetch with maybeSingle to prevent 406 errors
      const { data: profile, error } = await supabaseClient
        .from('users')
        .select('id, email, role, organization_id, tenant_id, requires_password_reset')
        .eq('id', supabaseUser.id)
        .maybeSingle(); // ✅ returns null if missing, no 406

      if (error) {
        console.error('❌ [Auth] Failed to fetch user profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          role: profile.role || 'user',
          organizationId: profile.organization_id || '',
          tenantId: profile.tenant_id || '',
          requires_password_reset: profile.requires_password_reset || false,
        });
      } else {
        // Profile still null after bootstrap - create fallback
        console.warn('⚠️ [Auth] Profile is null after bootstrap, creating fallback user');
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: 'user',
          organizationId: '',
          tenantId: '',
          requires_password_reset: false,
        });
      }
    } catch (error) {
      console.error('❌ [Auth] Profile fetch error:', error);
      // Create fallback user on any error
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'user',
        organizationId: '',
        tenantId: '',
        requires_password_reset: false,
      });
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!supabaseClient) {
      return { success: false, message: 'Authentication service not available' };
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ [Auth] Login failed:', error);
        return { success: false, message: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user);
        return { success: true };
      }

      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('❌ [Auth] Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const value: AuthState = useMemo(() => {
    return {
      user,
      supabaseUser: session?.user ?? null,
      session,
      loading,
      isLoading: loading, // Backward compatibility alias
      isAuthenticated: !!session?.user && !!user,
      signOut: async () => {
        if (supabaseClient) {
          await supabaseClient.auth.signOut();
        }
      },
      refresh: async () => {
        if (supabaseClient) {
          const { data } = await supabaseClient.auth.getSession();
          setSession(data.session ?? null);
          if (data.session?.user) {
            await fetchUserProfile(data.session.user);
          }
        }
      },
      login,
      supabase: supabaseClient,
    };
  }, [session, user, loading, supabaseClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * SAFE hook: never throws.
 * If provider is missing, returns a fallback state instead of crashing.
 * 
 * This prevents "Something went wrong" white screens when auth context
 * is accidentally missing from the provider tree.
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      // Dev-only warning so it gets caught during development
      // but won't take production down.
      console.warn('[Auth] useAuth() used outside <AuthProvider>. Returning fallback auth state.');
      console.warn('[Auth] Make sure your component is wrapped in <AuthProvider> in app/providers.tsx');
    }
    return FALLBACK_AUTH;
  }

  return ctx;
}

// Backward compatibility export for existing code
export { useAuth as useSupabaseAuth };