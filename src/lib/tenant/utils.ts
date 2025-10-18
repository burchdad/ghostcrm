import type { Tenant, TenantFeature } from './types';
import { PLAN_FEATURES, TenantError, TenantAccessError } from './types';

/**
 * Extract subdomain from hostname
 * Examples:
 * - demo.ghostautocrm.com -> "demo"
 * - acme-auto.ghostautocrm.com -> "acme-auto"
 * - localhost:3000 -> null (development)
 * - ghostautocrm.com -> null (marketing site)
 */
export function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }

  const parts = hostname.split('.');
  
  // Need at least 3 parts for a subdomain (sub.domain.com)
  if (parts.length < 3) {
    return null;
  }

  // Extract subdomain (first part)
  const subdomain = parts[0];
  
  // Return null for www or if it's the marketing site
  if (subdomain === 'www' || subdomain === 'ghostautocrm') {
    return null;
  }

  return subdomain;
}

/**
 * Check if the current request is for the marketing site
 */
export function isMarketingSite(hostname: string): boolean {
  if (hostname.includes('localhost')) {
    // In development, check for specific marketing paths or no subdomain
    return true;
  }
  
  return hostname === 'ghostautocrm.com' || 
         hostname === 'www.ghostautocrm.com' ||
         getSubdomain(hostname) === null;
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Subdomain rules:
  // - 3-63 characters
  // - Only lowercase letters, numbers, and hyphens
  // - Must start and end with alphanumeric character
  // - Cannot be 'www', 'api', 'admin', etc.
  
  const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  const reservedSubdomains = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog',
    'support', 'help', 'docs', 'status', 'dev', 'staging'
  ];

  return (
    subdomain.length >= 3 && 
    subdomain.length <= 63 &&
    regex.test(subdomain) &&
    !reservedSubdomains.includes(subdomain)
  );
}

/**
 * Build tenant-specific URLs
 */
export function getTenantUrl(subdomain: string, path: string = '/'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(baseUrl);
  
  if (process.env.NODE_ENV === 'development') {
    // In development, use query parameter for tenant
    url.searchParams.set('tenant', subdomain);
    url.pathname = path;
  } else {
    // In production, use subdomain
    url.hostname = `${subdomain}.${url.hostname}`;
    url.pathname = path;
  }
  
  return url.toString();
}

/**
 * Get marketing site URL
 */
export function getMarketingUrl(path: string = '/'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(baseUrl);
  url.pathname = path;
  return url.toString();
}

/**
 * Check if tenant has access to a specific feature
 */
export function hasFeatureAccess(tenant: Tenant, feature: TenantFeature): boolean {
  // Check plan-based features first
  const planFeatures = PLAN_FEATURES[tenant.plan] || [];
  if (planFeatures.includes(feature)) {
    return true;
  }

  // Check custom tenant configuration
  const customFeatures = tenant.config.features || [];
  return customFeatures.includes(feature);
}

/**
 * Get all available features for a tenant
 */
export function getTenantFeatures(tenant: Tenant): TenantFeature[] {
  const planFeatures = PLAN_FEATURES[tenant.plan] || [];
  const customFeatures = (tenant.config.features || []) as TenantFeature[];
  
  // Combine and deduplicate features
  return [...new Set([...planFeatures, ...customFeatures])];
}

/**
 * Validate tenant status and throw appropriate errors
 */
export function validateTenantAccess(tenant: Tenant | null): asserts tenant is Tenant {
  if (!tenant) {
    throw new TenantError('Tenant not found', 'TENANT_NOT_FOUND', 404);
  }

  if (tenant.status === 'inactive') {
    throw new TenantError('Tenant is inactive', 'TENANT_INACTIVE', 403);
  }

  if (tenant.status === 'suspended') {
    throw new TenantError('Tenant account is suspended', 'TENANT_SUSPENDED', 403);
  }
}

/**
 * Validate feature access and throw error if not allowed
 */
export function validateFeatureAccess(tenant: Tenant, feature: TenantFeature): void {
  if (!hasFeatureAccess(tenant, feature)) {
    throw new TenantAccessError(
      `Access denied: Feature '${feature}' not available for plan '${tenant.plan}'`,
      feature
    );
  }
}

/**
 * Get tenant branding CSS variables
 */
export function getTenantCSSVariables(tenant: Tenant): Record<string, string> {
  const { branding } = tenant;
  
  return {
    '--tenant-primary-color': branding.primary_color || '#1f2937',
    '--tenant-secondary-color': branding.secondary_color || '#374151',
    '--tenant-company-name': `"${branding.company_name || tenant.name}"`,
  };
}

/**
 * Generate tenant-specific metadata for SEO
 */
export function getTenantMetadata(tenant: Tenant, page?: string) {
  const { branding } = tenant;
  
  const baseTitle = branding.company_name || tenant.name;
  const title = page ? `${page} | ${baseTitle}` : baseTitle;
  const description = branding.tagline || `${baseTitle} - Automotive CRM Platform`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: baseTitle,
    },
    twitter: {
      title,
      description,
    },
  };
}

/**
 * Check if tenant is within usage limits
 */
export function checkTenantLimits(tenant: Tenant, currentUsage: { users: number; storage_mb: number }) {
  const issues = [];
  
  if (currentUsage.users > tenant.user_limit) {
    issues.push(`User limit exceeded: ${currentUsage.users}/${tenant.user_limit}`);
  }
  
  if (currentUsage.storage_mb > tenant.storage_limit_mb) {
    issues.push(`Storage limit exceeded: ${currentUsage.storage_mb}MB/${tenant.storage_limit_mb}MB`);
  }
  
  return {
    withinLimits: issues.length === 0,
    issues,
  };
}