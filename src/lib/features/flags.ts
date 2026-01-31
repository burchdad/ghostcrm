/**
 * FEATURE FLAG SYSTEM
 * Controls which features are active in each environment
 */

import { getCurrentEnvironment, isFeatureEnabled } from '@/lib/environments/config';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environments: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
  rolloutPercentage: number;
  targetUsers?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
}

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: Map<string, FeatureFlag> = new Map();

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
      FeatureFlagManager.instance.initializeFlags();
    }
    return FeatureFlagManager.instance;
  }

  private initializeFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'aiAssistant',
        name: 'AI Assistant',
        description: 'Enhanced AI assistant with multi-language support',
        enabled: true,
        environments: { development: true, staging: true, production: true },
        rolloutPercentage: 100,
      },
      {
        id: 'newDashboard',
        name: 'New Dashboard',
        description: 'Redesigned dashboard with improved UX',
        enabled: true,
        environments: { development: true, staging: true, production: true },
        rolloutPercentage: 100,
      },
      {
        id: 'advancedReports',
        name: 'Advanced Reports',
        description: 'Custom reporting with advanced charts',
        enabled: true,
        environments: { development: true, staging: true, production: false },
        rolloutPercentage: 50,
      },
      {
        id: 'betaFeatures',
        name: 'Beta Features',
        description: 'Early access to experimental features',
        enabled: true,
        environments: { development: true, staging: false, production: false },
        rolloutPercentage: 25,
      },
      {
        id: 'debugMode',
        name: 'Debug Mode',
        description: 'Enhanced debugging tools and logging',
        enabled: true,
        environments: { development: true, staging: false, production: false },
        rolloutPercentage: 100,
      },
      {
        id: 'experimentalUI',
        name: 'Experimental UI',
        description: 'New UI components and interactions',
        enabled: true,
        environments: { development: true, staging: false, production: false },
        rolloutPercentage: 30,
      },
      {
        id: 'multiLanguage',
        name: 'Multi-Language Support',
        description: 'Full internationalization support',
        enabled: true,
        environments: { development: true, staging: true, production: false },
        rolloutPercentage: 75,
      },
      {
        id: 'customCharts',
        name: 'Custom Charts',
        description: 'Advanced chart builder and customization',
        enabled: true,
        environments: { development: true, staging: false, production: false },
        rolloutPercentage: 40,
      },
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.id, flag);
    });
  }

  /**
   * Check if a feature is enabled for current environment and user
   */
  isEnabled(featureId: string, userId?: string): boolean {
    const flag = this.flags.get(featureId);
    if (!flag) return false;

    const currentEnv = getCurrentEnvironment();
    
    // Check if feature is enabled for current environment
    if (!flag.environments[currentEnv]) return false;
    
    // Check global enabled status
    if (!flag.enabled) return false;
    
    // Check date constraints
    if (flag.startDate && new Date() < flag.startDate) return false;
    if (flag.endDate && new Date() > flag.endDate) return false;
    
    // Check user targeting
    if (flag.targetUsers && userId) {
      return flag.targetUsers.includes(userId);
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashUserId(userId || 'anonymous', featureId);
      return hash % 100 < flag.rolloutPercentage;
    }
    
    return true;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag by ID
   */
  getFlag(featureId: string): FeatureFlag | undefined {
    return this.flags.get(featureId);
  }

  /**
   * Update feature flag
   */
  updateFlag(featureId: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(featureId);
    if (flag) {
      this.flags.set(featureId, { ...flag, ...updates });
    }
  }

  /**
   * Create new feature flag
   */
  createFlag(flag: FeatureFlag): void {
    this.flags.set(flag.id, flag);
  }

  /**
   * Delete feature flag
   */
  deleteFlag(featureId: string): void {
    this.flags.delete(featureId);
  }

  /**
   * Get features enabled for current environment
   */
  getEnabledFeatures(userId?: string): string[] {
    return Array.from(this.flags.keys()).filter(flagId => 
      this.isEnabled(flagId, userId)
    );
  }

  /**
   * Bulk update environment settings
   */
  updateEnvironmentFlags(environment: string, flagUpdates: Record<string, boolean>): void {
    Object.entries(flagUpdates).forEach(([flagId, enabled]) => {
      const flag = this.flags.get(flagId);
      if (flag) {
        this.flags.set(flagId, {
          ...flag,
          environments: {
            ...flag.environments,
            [environment]: enabled,
          },
        });
      }
    });
  }

  /**
   * Simple hash function for consistent user-based rollouts
   */
  private hashUserId(userId: string, featureId: string): number {
    const str = `${userId}-${featureId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Convenience hooks and functions
export function useFeatureFlag(featureId: string, userId?: string): boolean {
  const manager = FeatureFlagManager.getInstance();
  return manager.isEnabled(featureId, userId);
}

export function withFeatureFlag<T>(
  featureId: string,
  component: T,
  fallback?: T,
  userId?: string
): T | undefined {
  const manager = FeatureFlagManager.getInstance();
  return manager.isEnabled(featureId, userId) ? component : fallback;
}

// Export singleton instance
export const featureFlags = FeatureFlagManager.getInstance();