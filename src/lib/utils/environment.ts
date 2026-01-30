/**
 * Environment-aware configuration utilities
 * Centralizes environment detection and domain handling
 */

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  baseDomain: string;
  apiUrl: string;
  stripePublishableKey: string;
}

/**
 * Get current environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.VERCEL_ENV === 'preview';
  const isProduction = process.env.NODE_ENV === 'production' && 
                      process.env.VERCEL_ENV === 'production';

  // Determine base domain
  let baseDomain = 'ghostcrm.ai';
  
  if (isDevelopment) {
    baseDomain = 'localhost:3000';
  } else if (isStaging) {
    baseDomain = process.env.VERCEL_URL || 'staging.ghostcrm.ai';
  }

  // API URL configuration
  const apiUrl = isDevelopment 
    ? 'http://localhost:3000' 
    : `https://${baseDomain}`;

  return {
    isDevelopment,
    isStaging,
    isProduction,
    baseDomain,
    apiUrl,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  };
}

/**
 * Client-side domain detection (safe for browser)
 */
export function getBaseDomain(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return getEnvironmentConfig().baseDomain;
  }
  
  const hostname = window.location.hostname;
  
  // Development environments
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return hostname.includes(':') ? hostname : 'localhost:3000';
  }
  
  // Staging environments (Vercel preview URLs, etc.)
  if (hostname.includes('vercel.app') || hostname.includes('staging')) {
    return hostname;
  }
  
  // Production
  return 'ghostcrm.ai';
}

/**
 * Check if current request is on a subdomain
 */
export function isSubdomain(hostname?: string): boolean {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  const baseDomain = getBaseDomain();
  
  // Skip localhost and main domain variants
  if (host === 'localhost' || host === '127.0.0.1' || host === baseDomain) {
    return false;
  }
  
  // www subdomain should be treated as main domain
  if (host === `www.${baseDomain}` || host === 'www.ghostcrm.ai') {
    return false;
  }
  
  // Check for actual subdomain patterns (excluding www)
  return host.includes('.localhost') || 
         host.includes('.ghostcrm.ai') || 
         host.includes('.vercel.app') ||
         (host.includes('.') && host !== baseDomain && host !== `www.${baseDomain}`);
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain(hostname?: string): string | null {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  
  if (!isSubdomain(host)) {
    return null;
  }
  
  // Extract subdomain part
  if (host.includes('.localhost')) {
    const subdomain = host.split('.localhost')[0];
    return subdomain === 'www' ? null : subdomain;
  }
  
  if (host.includes('.ghostcrm.ai')) {
    const subdomain = host.split('.ghostcrm.ai')[0];
    return subdomain === 'www' ? null : subdomain;
  }
  
  if (host.includes('.vercel.app')) {
    const parts = host.split('.');
    const subdomain = parts[0];
    return subdomain === 'www' ? null : subdomain;
  }
  
  // Generic fallback
  const parts = host.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    return subdomain === 'www' ? null : subdomain;
  }
  
  return null;
}

/**
 * Build subdomain URL for redirects
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  const baseDomain = getBaseDomain();
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  
  return `${protocol}//${subdomain}.${baseDomain}${path}`;
}

/**
 * Environment-aware Stripe configuration
 */
export function getStripeConfig() {
  const config = getEnvironmentConfig();
  
  return {
    publishableKey: config.stripePublishableKey,
    webhookEndpoint: `${config.apiUrl}/api/webhooks/stripe`,
    successUrl: `${config.apiUrl}/billing/success`,
    cancelUrl: `${config.apiUrl}/billing/cancelled`,
  };
}