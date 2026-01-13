"use client";
import { ReactNode } from 'react';

/**
 * DEPRECATED: Auth context is now provided globally in app/providers.tsx
 * 
 * This component is kept for backward compatibility but no longer
 * conditionally provides auth context since it's now always available.
 */
export function ConditionalAuthProvider({ children }: { children: ReactNode }) {
  // Auth context is now provided globally, so just pass children through
  return <>{children}</>;
}