import { BILLING_PUBLIC_PATHS } from '@/lib/constants/public-paths';

/**
 * Utility functions for billing flow detection and protection
 */

export function isBillingFlow(pathname: string): boolean {
  return BILLING_PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

export function isBillingSuccessFlow(pathname: string): boolean {
  return pathname.startsWith('/billing/success');
}

export function shouldSkipAuthRedirect(pathname: string, searchParams?: URLSearchParams): boolean {
  // Skip auth redirects for billing flows
  if (isBillingFlow(pathname)) return true;
  
  // Skip if coming from Stripe (common query params)
  if (searchParams) {
    const stripeParams = ['session_id', 'payment_intent', 'setup_intent'];
    if (stripeParams.some(param => searchParams.has(param))) return true;
  }
  
  return false;
}

export function getBillingFlowContext(pathname: string, searchParams?: URLSearchParams) {
  return {
    isBillingFlow: isBillingFlow(pathname),
    isBillingSuccess: isBillingSuccessFlow(pathname),
    shouldSkipAuthRedirect: shouldSkipAuthRedirect(pathname, searchParams),
    hasStripeParams: searchParams ? 
      ['session_id', 'payment_intent', 'setup_intent'].some(param => searchParams.has(param)) : false
  };
}