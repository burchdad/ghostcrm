import { AgentConfig } from './types';

/**
 * Agent Configuration Manager
 * Handles loading, saving, and managing agent configurations
 */
export class AgentConfigManager {
  private configs: Map<string, AgentConfig> = new Map();
  private configPath: string;
  private autoSave: boolean;

  constructor(configPath = './agent-configs.json', autoSave = true) {
    this.configPath = configPath;
    this.autoSave = autoSave;
  }

  /**
   * Load configurations from storage
   */
  public async loadConfigurations(): Promise<void> {
    try {
      // In a real implementation, this would load from a file or database
      // For now, we'll use default configurations
      await this.loadDefaultConfigurations();
    } catch (error) {
      console.warn('Failed to load agent configurations, using defaults:', error);
      await this.loadDefaultConfigurations();
    }
  }

  /**
   * Save configurations to storage
   */
  public async saveConfigurations(): Promise<void> {
    try {
      const configData = Object.fromEntries(this.configs);
      
      // In a real implementation, this would save to a file or database
      console.log('Agent configurations saved:', configData);
      
      // TODO: Implement actual file/database saving
    } catch (error) {
      console.error('Failed to save agent configurations:', error);
      throw error;
    }
  }

  /**
   * Get configuration for a specific agent
   */
  public getConfig(agentId: string): AgentConfig | null {
    return this.configs.get(agentId) || null;
  }

  /**
   * Set configuration for a specific agent
   */
  public async setConfig(agentId: string, config: AgentConfig): Promise<void> {
    this.configs.set(agentId, { ...config });
    
    if (this.autoSave) {
      await this.saveConfigurations();
    }
  }

  /**
   * Update partial configuration for an agent
   */
  public async updateConfig(agentId: string, partialConfig: Partial<AgentConfig>): Promise<void> {
    const existingConfig = this.configs.get(agentId);
    if (!existingConfig) {
      throw new Error(`Configuration for agent ${agentId} not found`);
    }

    const updatedConfig = { ...existingConfig, ...partialConfig };
    await this.setConfig(agentId, updatedConfig);
  }

  /**
   * Delete configuration for an agent
   */
  public async deleteConfig(agentId: string): Promise<void> {
    this.configs.delete(agentId);
    
    if (this.autoSave) {
      await this.saveConfigurations();
    }
  }

  /**
   * Get all configurations
   */
  public getAllConfigs(): Record<string, AgentConfig> {
    return Object.fromEntries(this.configs);
  }

  /**
   * Reset to default configurations
   */
  public async resetToDefaults(): Promise<void> {
    this.configs.clear();
    await this.loadDefaultConfigurations();
    
    if (this.autoSave) {
      await this.saveConfigurations();
    }
  }

  /**
   * Load default configurations for all agents
   */
  private async loadDefaultConfigurations(): Promise<void> {
    // Database Connectivity Agent Configuration
    this.configs.set('db-connectivity-monitor', {
      enabled: true,
      schedule: {
        interval: 30000, // 30 seconds
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxDelay: 30000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [
          {
            type: 'database',
            config: {
              table: 'agent_notifications',
            },
            enabled: true,
          },
        ],
      },
      customSettings: {
        autoFix: true,
        alertThreshold: 3,
        connectionTimeout: 10000,
        parallelChecks: true,
        criticalConnectionsOnly: false,
        maxConcurrentChecks: 5,
      },
    });

    // Performance Monitor Agent Configuration (future)
    this.configs.set('performance-monitor', {
      enabled: false, // Disabled by default until implemented
      schedule: {
        interval: 60000, // 1 minute
      },
      retryPolicy: {
        maxAttempts: 2,
        backoffMultiplier: 1.5,
        maxDelay: 15000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [],
      },
      customSettings: {
        cpuThreshold: 80,
        memoryThreshold: 85,
        responseTimeThreshold: 2000,
        alertCooldown: 300000, // 5 minutes
      },
    });

    // Security Monitor Agent Configuration (future)
    this.configs.set('security-monitor', {
      enabled: false, // Disabled by default until implemented
      schedule: {
        interval: 120000, // 2 minutes
      },
      retryPolicy: {
        maxAttempts: 1,
        backoffMultiplier: 1,
        maxDelay: 5000,
      },
      logging: {
        level: 'warn',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [],
      },
      customSettings: {
        failedLoginThreshold: 5,
        suspiciousActivityThreshold: 10,
        monitorApiUsage: true,
        blockSuspiciousIPs: false,
      },
    });

    // Data Sync Agent Configuration (future)
    this.configs.set('data-sync', {
      enabled: false, // Disabled by default until implemented
      schedule: {
        interval: 300000, // 5 minutes
      },
      retryPolicy: {
        maxAttempts: 5,
        backoffMultiplier: 2,
        maxDelay: 60000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: true,
        channels: [],
      },
      customSettings: {
        batchSize: 100,
        syncIntegrations: true,
        conflictResolution: 'latest_wins',
        preserveDeleted: true,
      },
    });

    // Integration Health Agent Configuration (future)
    this.configs.set('integration-health', {
      enabled: false, // Disabled by default until implemented
      schedule: {
        interval: 180000, // 3 minutes
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxDelay: 45000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [],
      },
      customSettings: {
        testAllEndpoints: false,
        rateLimit: 10, // requests per minute
        timeoutMs: 5000,
        expectedHttpCodes: [200, 201, 204],
      },
    });
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: AgentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (typeof config.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }

    if (config.schedule?.interval && typeof config.schedule.interval !== 'number') {
      errors.push('schedule.interval must be a number');
    }

    if (config.schedule?.interval && config.schedule.interval < 1000) {
      errors.push('schedule.interval must be at least 1000ms');
    }

    // Validate retry policy
    if (config.retryPolicy.maxAttempts < 1) {
      errors.push('retryPolicy.maxAttempts must be at least 1');
    }

    if (config.retryPolicy.backoffMultiplier < 1) {
      errors.push('retryPolicy.backoffMultiplier must be at least 1');
    }

    if (config.retryPolicy.maxDelay < 1000) {
      errors.push('retryPolicy.maxDelay must be at least 1000ms');
    }

    // Validate logging
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(config.logging.level)) {
      errors.push(`logging.level must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate notification channels
    for (const channel of config.notifications.channels) {
      const validChannelTypes = ['email', 'slack', 'webhook', 'database'];
      if (!validChannelTypes.includes(channel.type)) {
        errors.push(`notification channel type must be one of: ${validChannelTypes.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get configuration template for a new agent
   */
  public getConfigTemplate(): AgentConfig {
    return {
      enabled: true,
      schedule: {
        interval: 60000, // 1 minute
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxDelay: 30000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [],
      },
      customSettings: {},
    };
  }
}

// Singleton instance
let configManagerInstance: AgentConfigManager | null = null;

/**
 * Get the singleton AgentConfigManager instance
 */
export function getConfigManager(): AgentConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new AgentConfigManager();
  }
  return configManagerInstance;
}