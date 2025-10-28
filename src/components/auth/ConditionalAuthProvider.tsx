"use client";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

// Define public routes that don't need authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register', 
  '/reset-password',
  '/marketing',
  '/marketing/features',
  '/marketing/pricing',
  '/demo',
  '/terms',
  '/privacy'
];

export function ConditionalAuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
  
  // If it's a public route, don't wrap with AuthProvider
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // For protected routes, use AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}