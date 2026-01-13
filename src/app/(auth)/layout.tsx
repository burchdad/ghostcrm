"use client";

/**
 * AUTH LAYOUT - Simplified
 * 
 * Auth context is now provided globally in app/providers.tsx,
 * so this layout just passes children through.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}