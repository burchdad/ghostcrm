"use client";
import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface FloatingUIContextType {
  shouldShowFloatingButtons: boolean;
}

const FloatingUIContext = createContext<FloatingUIContextType>({
  shouldShowFloatingButtons: true,
});

export function useFloatingUI() {
  return useContext(FloatingUIContext);
}

export function FloatingUIProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const shouldShowFloatingButtons = useMemo(() => {
    // 🚨 CRITICAL: Only show floating buttons on authenticated tenant pages
    // Not on: public pages, billing signup, marketing, login/register
    
    // Hide floating buttons on marketing, auth, and public pages
    const hideOnPages = [
      '/',
      '/login',
      '/register', 
      '/reset-password',
      '/unauthorized',
      '/billing', // 🔧 FIX: Hide on public billing/signup page (not tenant billing)
      '/demo',
      '/marketing',
      '/about',
      '/contact',
      '/privacy',
      '/terms'
    ];
    
    // Check conditions for hiding
    const isPublicPage = hideOnPages.includes(pathname);
    const isMarketingPage = pathname.includes('/marketing');
    const isNotAuthenticated = !isAuthenticated;
    const hasNoTenantContext = !user?.tenantId; // Must have tenant context
    
    // Only show if:
    // 1. Not on public/marketing/auth pages
    // 2. User is authenticated
    // 3. User has tenant context (tenantId)
    const shouldShow = !isPublicPage && !isMarketingPage && isAuthenticated && !!user?.tenantId;
    
    return shouldShow;
  }, [pathname, isAuthenticated, user?.tenantId]);

  return (
    <FloatingUIContext.Provider value={{ shouldShowFloatingButtons }}>
      {children}
    </FloatingUIContext.Provider>
  );
}