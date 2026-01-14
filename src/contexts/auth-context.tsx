'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';
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
  
  // Guards to prevent multiple bootstrap calls - persistent across renders
  const bootstrapRanRef = useRef(false);
  const bootstrapPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    setLoading(true);
  }, []);

  // Handle auth state changes
  useEffect(() => {
    console.log('🔄 [Auth] Setting up auth state listener');
    const client = getBrowserSupabase();
    let unsub: { data?: { subscription?: { unsubscribe: () => void } } } | null = null;

    (async () => {
      try {
        console.log('🔍 [Auth] Getting initial session...');
        // Initial session load
        const { data } = await client.auth.getSession();
        console.log('🔍 [Auth] Initial session result:', { 
          hasSession: !!data.session, 
          hasUser: !!data.session?.user,
          userEmail: data.session?.user?.email 
        });
        
        setSession(data.session ?? null);
        
        if (data.session?.user) {
          console.log('👤 [Auth] Initial user found, fetching profile...');
          await fetchUserProfile(data.session.user);
        } else {
          console.log('👤 [Auth] No initial user, setting user to null');
          setUser(null);
        }
        
        setLoading(false);

        // Subscribe to changes
        console.log('🔔 [Auth] Setting up auth state change listener');
        unsub = client.auth.onAuthStateChange(async (event, newSession) => {
          console.log('🔔 [Auth] Auth state changed:', { 
            event, 
            hasSession: !!newSession, 
            hasUser: !!newSession?.user,
            userEmail: newSession?.user?.email 
          });
          
          setSession(newSession ?? null);
          
          if (newSession?.user) {
            console.log('👤 [Auth] New user detected, fetching profile...');
            await fetchUserProfile(newSession.user);
          } else {
            console.log('👤 [Auth] User logged out, setting user to null');
            setUser(null);
          }
          
          setLoading(false);
        });
        
        console.log('✅ [Auth] Auth state listener setup complete');
      } catch (error) {
        console.error('❌ [Auth] Session initialization failed:', error);
        setLoading(false);
      }
    })();

    return () => {
      console.log('🧹 [Auth] Cleaning up auth state listener');
      unsub?.data?.subscription?.unsubscribe?.();
    };
  }, []); // No dependencies since we're using getBrowserSupabase() directly

  async function ensureProfileBootstrapped(accessToken?: string) {
    // No token = no bootstrap attempt
    if (!accessToken) {
      console.log('🚫 [BOOTSTRAP] No access token, skipping bootstrap');
      return;
    }
    
    if (!bootstrapPromiseRef.current) {
      bootstrapPromiseRef.current = (async () => {
        try {
          console.log('🔄 [BOOTSTRAP] Starting profile bootstrap with Bearer token');
          
          const res = await fetch('/api/auth/bootstrap-profile', {
            method: 'POST',
            credentials: 'include', // keep cookies as fallback
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, // ✅ bulletproof
            },
          });

          console.log('📡 [BOOTSTRAP] Response status:', res.status, res.statusText);
          
          // Make endpoint return 204 when it decides to noop
          if (!res.ok && res.status !== 204) {
            const errorText = await res.text().catch(() => 'Unable to read response');
            console.warn('⚠️ [BOOTSTRAP] Failed with status', res.status, ':', errorText);
          } else {
            console.log('✅ [BOOTSTRAP] Profile bootstrap completed successfully');
          }
        } catch (e) {
          console.error('❌ [BOOTSTRAP] Network or parsing error:', e);
        }
      })().finally(() => {
        bootstrapPromiseRef.current = null;
      });
    }

    return bootstrapPromiseRef.current;
  }

  // Fetch user profile from database
  const fetchUserProfile = async (supabaseUser: User) => {
    console.log('👤 [Auth] Starting fetchUserProfile for user:', supabaseUser.email);
    const client = getBrowserSupabase();

    try {
      // Get session data with access token for bulletproof bootstrap
      const { data: sessionData } = await client.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      console.log('🔑 [Auth] Access token available:', !!accessToken);

      // Bootstrap only when we have a real token (prevents half-initialized session calls)
      console.log('🚀 [Auth] Calling ensureProfileBootstrapped...');
      await ensureProfileBootstrapped(accessToken);

      // Then fetch with maybeSingle to prevent 406 errors
      console.log('📊 [Auth] Querying profiles table...');
      const { data: profile, error } = await client
        .from('profiles')
        .select('id, email, role, organization_id, tenant_id, requires_password_reset')
        .eq('id', supabaseUser.id)
        .maybeSingle(); // ✅ returns null if missing, no 406

      console.log('📊 [Auth] Profile query result:', { profile, error });

      if (error) {
        console.error('❌ [Auth] Failed to fetch user profile:', error);
        return;
      }

      if (profile) {
        console.log('✅ [Auth] Profile found, setting user state');
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

  // Login function - bulletproof server + client verification
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🚀 [Auth] Starting login process for:', email);
      
      // Call server-side login route that sets cookies
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 [Auth] Login API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Auth] Server login failed:', errorText);
        return { success: false, message: errorText || 'Login failed' };
      }

      console.log('✅ [Auth] Server login successful - cookies set');

      // Allow small delay for cookie propagation in browser
      await new Promise(resolve => setTimeout(resolve, 100));

      // IMPORTANT: after server sets cookies, confirm user via supabase client
      const client = getBrowserSupabase();
      console.log('🔍 [Auth] Checking user session with client...');
      
      const { data: userData, error: userError } = await client.auth.getUser();

      console.log('🔍 [Auth] getUser result:', { 
        user: userData?.user ? { id: userData.user.id, email: userData.user.email } : null, 
        error: userError 
      });

      if (userError || !userData?.user) {
        console.error('❌ [Auth] Login cookie set, but session not available:', userError);
        return { success: false, message: 'Login cookie set, but session not available yet (auth.getUser returned null).' };
      }

      console.log('✅ [Auth] User verified via supabase client:', userData.user.email);
      
      // Fetch user profile to complete authentication
      console.log('🔍 [Auth] Fetching user profile...');
      await fetchUserProfile(userData.user);
      
      console.log('✅ [Auth] Login complete - ready for redirect');
      return { success: true };
    } catch (error) {
      console.error('❌ [Auth] Login error:', error);
      return { success: false, message: 'Network error during login' };
    }
  };

  const value: AuthState = useMemo(() => {
    const isAuthenticated = !!session?.user && !!user;
    console.log('🧮 [Auth] Computing auth state:', { 
      hasSession: !!session, 
      hasSessionUser: !!session?.user, 
      hasUser: !!user, 
      isAuthenticated,
      userEmail: user?.email 
    });
    
    return {
      user,
      supabaseUser: session?.user ?? null,
      session,
      loading,
      isLoading: loading, // Backward compatibility alias
      isAuthenticated,
      signOut: async () => {
        console.log('🚪 [Auth] Signing out...');
        const client = getBrowserSupabase();
        // Reset bootstrap guards when signing out
        bootstrapRanRef.current = false;
        bootstrapPromiseRef.current = null;
        await client.auth.signOut();
      },
      refresh: async () => {
        console.log('🔄 [Auth] Refreshing auth state...');
        const client = getBrowserSupabase();
        // Reset bootstrap guards on refresh
        bootstrapRanRef.current = false;
        bootstrapPromiseRef.current = null;
        const { data } = await client.auth.getSession();
        setSession(data.session ?? null);
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        }
      },
      login,
      supabase: getBrowserSupabase(),
    };
  }, [session, user, loading]); // Removed supabaseClient dependency

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