/**
 * MULTI-ENVIRONMENT CONFIGURATION SYSTEM
 * Manages dev, staging, and production environments
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  name: Environment;
  displayName: string;
  url: string;
  database: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey?: string;
  };
  redis: {
    url: string;
    enabled: boolean;
  };
  features: {
    [key: string]: boolean;
  };
  deployment: {
    branch: string;
    autoPromote: boolean;
    requiresApproval: boolean;
  };
}

export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    displayName: 'Development',
    url: 'https://dev.ghostcrm.com',
    database: {
      supabaseUrl: process.env.DEV_SUPABASE_URL || 'https://dev-dcwixbftjlzwptafvhpz.supabase.co',
      supabaseAnonKey: process.env.DEV_SUPABASE_ANON_KEY || 'dev_key_here',
      supabaseServiceRoleKey: process.env.DEV_SUPABASE_SERVICE_ROLE_KEY,
    },
    redis: {
      url: process.env.DEV_REDIS_URL || 'redis://localhost:6379',
      enabled: true,
    },
    features: {
      aiAssistant: true,
      newDashboard: true,
      advancedReports: true,
      betaFeatures: true,
      debugMode: true,
      experimentalUI: true,
    },
    deployment: {
      branch: 'develop',
      autoPromote: false,
      requiresApproval: false,
    },
  },
  
  staging: {
    name: 'staging',
    displayName: 'Staging',
    url: 'https://staging.ghostcrm.com',
    database: {
      supabaseUrl: process.env.STAGING_SUPABASE_URL || 'https://staging-dcwixbftjlzwptafvhpz.supabase.co',
      supabaseAnonKey: process.env.STAGING_SUPABASE_ANON_KEY || 'staging_key_here',
      supabaseServiceRoleKey: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
    },
    redis: {
      url: process.env.STAGING_REDIS_URL || 'redis://staging-redis:6379',
      enabled: true,
    },
    features: {
      aiAssistant: true,
      newDashboard: true,
      advancedReports: true,
      betaFeatures: false,
      debugMode: false,
      experimentalUI: false,
    },
    deployment: {
      branch: 'staging',
      autoPromote: false,
      requiresApproval: true,
    },
  },
  
  production: {
    name: 'production',
    displayName: 'Production',
    url: 'https://app.ghostcrm.com',
    database: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcwixbftjlzwptafvhpz.supabase.co',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_NyBlvIUbEUJF9kfeafyI6A_R5yUx7m8',
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://production-redis:6379',
      enabled: true,
    },
    features: {
      aiAssistant: true,
      newDashboard: true,
      advancedReports: false,
      betaFeatures: false,
      debugMode: false,
      experimentalUI: false,
    },
    deployment: {
      branch: 'main',
      autoPromote: false,
      requiresApproval: true,
    },
  },
};

/**
 * Get current environment based on NODE_ENV and custom environment variable
 */
export function getCurrentEnvironment(): Environment {
  const envVar = process.env.GHOST_ENV || process.env.NODE_ENV;
  
  if (envVar === 'production') return 'production';
  if (envVar === 'staging') return 'staging';
  return 'development';
}

/**
 * Get configuration for current environment
 */
export function getCurrentConfig(): EnvironmentConfig {
  return ENVIRONMENTS[getCurrentEnvironment()];
}

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig(env: Environment): EnvironmentConfig {
  return ENVIRONMENTS[env];
}

/**
 * Check if a feature is enabled in current environment
 */
export function isFeatureEnabled(featureName: string): boolean {
  const config = getCurrentConfig();
  return config.features[featureName] || false;
}

/**
 * Get all environment URLs for admin access
 */
export function getAllEnvironmentUrls(): Record<Environment, string> {
  return {
    development: ENVIRONMENTS.development.url,
    staging: ENVIRONMENTS.staging.url,
    production: ENVIRONMENTS.production.url,
  };
}