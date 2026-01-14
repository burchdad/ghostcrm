"use client";
import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";

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

  const shouldShowFloatingButtons = useMemo(() => {
    // Hide floating buttons on login/auth pages
    const hideOnPages = [
      '/',
      '/login',
      '/register', 
      '/reset-password',
      '/unauthorized'
    ];
    
    return !hideOnPages.includes(pathname) && !pathname.includes('/marketing');
  }, [pathname]);

  return (
    <FloatingUIContext.Provider value={{ shouldShowFloatingButtons }}>
      {children}
    </FloatingUIContext.Provider>
  );
}