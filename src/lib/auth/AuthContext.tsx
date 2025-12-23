"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dealership: string;
  phone?: string;
  requires_password_reset?: boolean; // For enhanced invitation flow
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearSession: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dealership: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // SECURITY: Only restore session if there's a valid authentication token
    // This prevents auto-authentication from stored demo credentials
    const storedUser = localStorage.getItem('ghostcrm_user');
    const sessionTimestamp = localStorage.getItem('ghostcrm_session_time');
    const authToken = localStorage.getItem('ghostcrm_auth_token');
    
    if (storedUser && sessionTimestamp && authToken) {
      try {
        const userData = JSON.parse(storedUser);
        const sessionTime = parseInt(sessionTimestamp);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check if session is still valid and has proper auth token
        if (currentTime - sessionTime < sessionDuration) {
          // Only restore if we have a proper authentication token
          // This prevents demo mode auto-login
          setUser(userData);
        } else {
          // Session expired, clear storage
          clearAllStoredAuth();
        }
      } catch (error) {
        clearAllStoredAuth();
      }
    } else {
      // No auth token or incomplete session data, clear everything
      clearAllStoredAuth();
    }
    setIsLoading(false);
  }, []);

  const clearAllStoredAuth = () => {
    localStorage.removeItem('ghostcrm_user');
    localStorage.removeItem('ghostcrm_session_time');
    localStorage.removeItem('ghostcrm_auth_token');
    // Don't clear demo/trial mode flags - they should persist until explicitly cleared
    // localStorage.removeItem('ghostcrm_demo_mode');
    // localStorage.removeItem('ghostcrm_trial_mode');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Replace with actual authentication API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData = await response.json();
      
      setUser(userData.user);
      localStorage.setItem('ghostcrm_user', JSON.stringify(userData.user));
      localStorage.setItem('ghostcrm_session_time', Date.now().toString());
      
      // SECURITY: Only store auth token for non-demo users
      // Demo users should not have persistent sessions
      if (!userData.demo_mode) {
        localStorage.setItem('ghostcrm_auth_token', userData.token || 'authenticated');
      }
      
      // Store demo mode if present in response
      if (userData.demo_mode) {
        localStorage.setItem('ghostcrm_demo_mode', 'true');
      } else {
        localStorage.removeItem('ghostcrm_demo_mode');
      }
      
      // Store trial mode if present in response
      if (userData.trial_mode) {
        localStorage.setItem('ghostcrm_trial_mode', 'true');
      } else {
        localStorage.removeItem('ghostcrm_trial_mode');
      }
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Replace with actual registration API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      
      setUser(result.user);
      localStorage.setItem('ghostcrm_user', JSON.stringify(result.user));
      localStorage.setItem('ghostcrm_session_time', Date.now().toString());
      
      // Store demo mode if present in response
      if (result.demo_mode) {
        localStorage.setItem('ghostcrm_demo_mode', 'true');
      } else {
        localStorage.removeItem('ghostcrm_demo_mode');
      }
      
      // Store trial mode if present in response
      if (result.trial_mode) {
        localStorage.setItem('ghostcrm_trial_mode', 'true');
      } else {
        localStorage.removeItem('ghostcrm_trial_mode');
      }
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    clearAllStoredAuth();
    
    // Call logout API to clear server-side cookies
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  };

  const clearSession = async () => {
    setUser(null);
    clearAllStoredAuth();
    
    // Call logout API to clear server-side cookies
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    clearSession
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