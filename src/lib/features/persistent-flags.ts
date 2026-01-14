import { getBrowserSupabase } from '@/utils/supabase/client';
import { getEnvironmentConfig, getCurrentEnvironment } from '../environments/config';

export interface FeatureFlag {
  id: string;
  flag_key: string;
  name: string;
  description?: string;
  environments: Record<string, EnvironmentConfig>;
  rollout_percentage: number;
  user_targeting: Record<string, any>;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface EnvironmentConfig {
  enabled: boolean;
  rollout: number;
  user_segments?: string[];
  override_rules?: Record<string, any>;
}

export interface DeploymentBundle {
  id: string;
  bundle_name: string;
  version: string;
  source_environment: string;
  target_environment: string;
  status: 'pending' | 'approved' | 'deployed' | 'failed' | 'rolled_back';
  features: string[];
  changelog?: string;
  approval_required: boolean;
  approved_at?: string;
  approved_by?: string;
  deployed_at?: string;
  deployed_by?: string;
  created_at: string;
  created_by?: string;
  metadata: Record<string, any>;
}

export interface DeploymentApproval {
  id: string;
  bundle_id: string;
  approver_role: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  created_at: string;
}

export interface EnvironmentConfigDB {
  id: string;
  environment_name: string;
  display_name: string;
  base_url: string;
  database_config: Record<string, any>;
  feature_defaults: Record<string, any>;
  deployment_settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class PersistentFeatureFlagService {
  private supabase;
  private currentEnvironment: string;

  constructor() {
    this.currentEnvironment = getCurrentEnvironment();
    
    // Use singleton browser client to prevent multiple instances
    this.supabase = getBrowserSupabase();
  }

  /**
   * Get all feature flags from database
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feature flags:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeatureFlags:', error);
      return [];
    }
  }

  /**
   * Get a specific feature flag by key
   */
  async getFeatureFlag(flagKey: string): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_key', flagKey)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error(`Error fetching feature flag ${flagKey}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error in getFeatureFlag for ${flagKey}:`, error);
      return null;
    }
  }

  /**
   * Check if a feature is enabled for current environment
   */
  async isFeatureEnabled(flagKey: string, userId?: string): Promise<boolean> {
    try {
      const flag = await this.getFeatureFlag(flagKey);
      
      if (!flag) {
        return false;
      }

      const envConfig = flag.environments[this.currentEnvironment];
      
      if (!envConfig || !envConfig.enabled) {
        return false;
      }

      // Check rollout percentage
      if (envConfig.rollout < 100) {
        // Simple percentage-based rollout
        const userHash = userId ? this.hashString(userId + flagKey) : Math.random();
        const userPercentile = userHash * 100;
        
        if (userPercentile > envConfig.rollout) {
          return false;
        }
      }

      // Check user targeting rules
      if (userId && flag.user_targeting) {
        return this.evaluateUserTargeting(flag.user_targeting, userId);
      }

      return true;
    } catch (error) {
      console.error(`Error checking feature ${flagKey}:`, error);
      return false;
    }
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(flagKey: string, updates: Partial<FeatureFlag>, userId?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update({
          ...updates,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('flag_key', flagKey);

      if (error) {
        console.error(`Error updating feature flag ${flagKey}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error in updateFeatureFlag for ${flagKey}:`, error);
      return false;
    }
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>, userId?: string): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .insert({
          ...flag,
          created_by: userId,
          updated_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feature flag:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createFeatureFlag:', error);
      return null;
    }
  }

  /**
   * Get all deployment bundles
   */
  async getDeploymentBundles(environment?: string): Promise<DeploymentBundle[]> {
    try {
      let query = this.supabase
        .from('deployment_bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (environment) {
        query = query.eq('target_environment', environment);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deployment bundles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDeploymentBundles:', error);
      return [];
    }
  }

  /**
   * Create a new deployment bundle
   */
  async createDeploymentBundle(bundle: Omit<DeploymentBundle, 'id' | 'created_at'>, userId?: string): Promise<DeploymentBundle | null> {
    try {
      const { data, error } = await this.supabase
        .from('deployment_bundles')
        .insert({
          ...bundle,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating deployment bundle:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createDeploymentBundle:', error);
      return null;
    }
  }

  /**
   * Update deployment bundle status
   */
  async updateDeploymentBundleStatus(
    bundleId: string, 
    status: DeploymentBundle['status'], 
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const updates: any = { status };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = userId;
      } else if (status === 'deployed') {
        updates.deployed_at = new Date().toISOString();
        updates.deployed_by = userId;
      }

      if (metadata) {
        updates.metadata = metadata;
      }

      const { error } = await this.supabase
        .from('deployment_bundles')
        .update(updates)
        .eq('id', bundleId);

      if (error) {
        console.error(`Error updating deployment bundle ${bundleId}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error in updateDeploymentBundleStatus for ${bundleId}:`, error);
      return false;
    }
  }

  /**
   * Get environment configurations
   */
  async getEnvironmentConfigs(): Promise<EnvironmentConfigDB[]> {
    try {
      const { data, error } = await this.supabase
        .from('environment_configs')
        .select('*')
        .eq('is_active', true)
        .order('environment_name');

      if (error) {
        console.error('Error fetching environment configs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEnvironmentConfigs:', error);
      return [];
    }
  }

  /**
   * Record deployment history
   */
  async recordDeployment(deployment: {
    bundle_id?: string;
    environment: string;
    deployment_type: 'promotion' | 'rollback' | 'hotfix';
    status: 'success' | 'failed' | 'in_progress';
    git_commit_sha?: string;
    build_number?: string;
    health_check_results?: Record<string, any>;
    performance_metrics?: Record<string, any>;
    error_logs?: string;
    duration_seconds?: number;
  }, userId?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('deployment_history')
        .insert({
          ...deployment,
          deployed_by: userId,
          deployed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording deployment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in recordDeployment:', error);
      return false;
    }
  }

  /**
   * Get deployment history for an environment
   */
  async getDeploymentHistory(environment?: string, limit: number = 50): Promise<any[]> {
    try {
      let query = this.supabase
        .from('deployment_history')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(limit);

      if (environment) {
        query = query.eq('environment', environment);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deployment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDeploymentHistory:', error);
      return [];
    }
  }

  /**
   * Simple hash function for consistent user bucketing
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  /**
   * Evaluate user targeting rules
   */
  private evaluateUserTargeting(targeting: Record<string, any>, userId: string): boolean {
    // Simple implementation - can be extended for complex targeting
    if (targeting.included_users && Array.isArray(targeting.included_users)) {
      return targeting.included_users.includes(userId);
    }
    
    if (targeting.excluded_users && Array.isArray(targeting.excluded_users)) {
      return !targeting.excluded_users.includes(userId);
    }
    
    return true;
  }
}

// Export singleton instance
export const featureFlagService = new PersistentFeatureFlagService();