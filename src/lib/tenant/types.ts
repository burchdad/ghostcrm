// Tenant-related TypeScript types

export interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  domain?: string;
  
  // Configuration
  config: TenantConfig;
  branding: TenantBranding;
  settings: TenantSettings;
  
  // Status and metadata
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  
  // Database connection (for separate DB per tenant)
  db_host?: string;
  db_name?: string;
  db_user?: string;
  db_schema?: string;
  
  // Subscription and limits
  plan: 'basic' | 'professional' | 'enterprise';
  user_limit: number;
  storage_limit_mb: number;
  
  // Contact info
  admin_email?: string;
  admin_name?: string;
}

export interface TenantConfig {
  features: string[];
  modules?: string[];
  integrations?: Record<string, any>;
  custom_fields?: Record<string, any>;
}

export interface TenantBranding {
  primary_color: string;
  secondary_color?: string;
  logo_url?: string;
  favicon_url?: string;
  company_name: string;
  tagline?: string;
  custom_css?: string;
}

export interface TenantSettings {
  timezone?: string;
  locale?: string;
  currency?: string;
  date_format?: string;
  time_format?: string;
  business_hours?: BusinessHours;
  notifications?: NotificationSettings;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "17:00"
  closed?: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  digest_frequency: 'daily' | 'weekly' | 'never';
}

// Tenant context type for React
export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  isMarketingSite: boolean;
  subdomain: string | null;
  refreshTenant: () => Promise<void>;
}

// Request context for middleware
export interface TenantRequestContext {
  tenant: Tenant | null;
  subdomain: string | null;
  isMarketingSite: boolean;
  isValidTenant: boolean;
}

// Database query context
export interface TenantQueryContext {
  tenantId: number;
  userId?: string;
  permissions?: string[];
}

// Tenant creation/update types
export interface CreateTenantRequest {
  subdomain: string;
  name: string;
  domain?: string;
  admin_email: string;
  admin_name: string;
  plan?: 'basic' | 'professional' | 'enterprise';
  config?: Partial<TenantConfig>;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  config?: Partial<TenantConfig>;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
  status?: 'active' | 'inactive' | 'suspended';
  plan?: 'basic' | 'professional' | 'enterprise';
  user_limit?: number;
  storage_limit_mb?: number;
}

// Feature flag types for tenant-specific features
export type TenantFeature = 
  | 'leads'
  | 'inventory' 
  | 'finance'
  | 'compliance'
  | 'advanced_reporting'
  | 'api_access'
  | 'custom_branding'
  | 'sso'
  | 'webhooks'
  | 'analytics'
  | 'automation';

// Plan-based feature access
export const PLAN_FEATURES: Record<string, TenantFeature[]> = {
  basic: ['leads', 'inventory'],
  professional: ['leads', 'inventory', 'finance', 'compliance', 'analytics'],
  enterprise: [
    'leads', 
    'inventory', 
    'finance', 
    'compliance', 
    'advanced_reporting',
    'api_access',
    'custom_branding',
    'sso',
    'webhooks',
    'analytics',
    'automation'
  ]
};

// Error types
export class TenantError extends Error {
  constructor(
    message: string,
    public code: 'TENANT_NOT_FOUND' | 'TENANT_INACTIVE' | 'TENANT_SUSPENDED' | 'INVALID_SUBDOMAIN',
    public statusCode: number = 404
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

export class TenantAccessError extends Error {
  constructor(message: string, public feature?: TenantFeature) {
    super(message);
    this.name = 'TenantAccessError';
  }
}