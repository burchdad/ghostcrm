// Shared constants for both middleware systems
export const BILLING_PUBLIC_PATHS = [
  '/billing/success',
  '/billing/cancel', 
  '/billing/webhook', // Add webhook paths too
  '/billing/return'   // Add any other billing-related paths
] as const;

export const AUTH_PUBLIC_PATHS = [
  '/',
  '/login',
  '/register', 
  '/reset-password',
  '/verify-email',
  '/forgot-password'
] as const;

export const MARKETING_PUBLIC_PATHS = [
  '/marketing/pricing',
  '/features', 
  '/demo',
  '/terms',
  '/privacy'
] as const;

export const ALL_PUBLIC_PATHS = [
  ...BILLING_PUBLIC_PATHS,
  ...AUTH_PUBLIC_PATHS,
  ...MARKETING_PUBLIC_PATHS
] as const;