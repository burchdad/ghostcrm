"use client";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/SupabaseAuthContext';
import { ReactNode } from 'react';

// Define routes that need authentication context (login pages + protected pages)
const AUTH_REQUIRED_ROUTES = [
  '/login',
  '/login-owner',
  '/login-admin', 
  '/login-salesmanager',
  '/login-salesrep',
  '/register', 
  '/reset-password',
  '/dashboard',
  '/admin',
  '/billing',
  '/settings',
  '/owner',
  '/tenant-owner',
  '/tenant-salesmanager',
  '/tenant-salesrep',
  '/tenant-admin',
  '/leads',
  '/deals',
  '/inventory',
  '/calendar',
  '/reports',
  '/collaboration',
  '/analytics',
  '/finance'
];

// Define truly public routes that don't need auth context (marketing pages)
const PUBLIC_MARKETING_ROUTES = [
  '/',
  '/marketing',
  '/marketing/features',
  '/marketing/pricing',
  '/demo',
  '/terms',
  '/privacy'
];

export function ConditionalAuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route needs authentication context
  const needsAuthContext = AUTH_REQUIRED_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
  
  // Check if it's a truly public marketing route
  const isMarketingRoute = PUBLIC_MARKETING_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
  
  // Provide AuthProvider for login pages and protected routes
  if (needsAuthContext || !isMarketingRoute) {
    return <AuthProvider>{children}</AuthProvider>;
  }
  
  // For marketing routes, no auth context needed
  return <>{children}</>;
}