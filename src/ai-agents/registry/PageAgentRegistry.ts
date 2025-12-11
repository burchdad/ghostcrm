import { 
  LeadsAgent,
  DealsAgent,
  InventoryAgent,
  CalendarAgent,
  CollaborationAgent,
  WorkflowAgent,
} from '../pages';
import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentMetrics, AgentHealth } from '../core/types';

/**
 * Page AI Agent Registry
 * 
 * Centralized registry for managing all page-specific AI agents.
 * Provides unified interface for configuration, monitoring, and control.
 */

export interface PageAgentInfo {
  id: string;
  name: string;
  description: string;
  page: string;
  category: 'sales' | 'management' | 'productivity' | 'automation';
  status: 'active' | 'inactive' | 'error' | 'initializing';
  instance: BaseAgent;
  config: AgentConfig;
  lastActivity: Date;
  metrics?: AgentMetrics;
  health?: AgentHealth;
}

export interface AgentRegistryConfig {
  autoStart: boolean;
  healthCheckInterval: number;
  metricsCollectionInterval: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class PageAgentRegistry {
  private agents: Map<string, PageAgentInfo> = new Map();
  private registryConfig: AgentRegistryConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private initialized = false;

  constructor() {
    this.registryConfig = {
      autoStart: true,
      healthCheckInterval: 60000, // 1 minute
      metricsCollectionInterval: 300000, // 5 minutes
      enableLogging: true,
      logLevel: 'info',
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Initializing Page AI Agent Registry...');

    try {
      // Register all page agents
      await this.registerAgent('leads', new LeadsAgent(), {
        name: 'Leads AI Assistant',
        description: 'AI agent for lead management, qualification, and optimization',
        page: '/tenant-owner/leads',
        category: 'sales',
      });

      await this.registerAgent('deals', new DealsAgent(), {
        name: 'Deals AI Assistant',
        description: 'AI agent for deal pipeline optimization and forecasting',
        page: '/tenant-owner/deals',
        category: 'sales',
      });

      await this.registerAgent('inventory', new InventoryAgent(), {
        name: 'Inventory AI Assistant',
        description: 'AI agent for inventory optimization and pricing strategies',
        page: '/tenant-owner/inventory',
        category: 'management',
      });

      await this.registerAgent('calendar', new CalendarAgent(), {
        name: 'Calendar AI Assistant',
        description: 'AI agent for scheduling optimization and calendar management',
        page: '/tenant-owner/calendar',
        category: 'productivity',
      });

      await this.registerAgent('collaboration', new CollaborationAgent(), {
        name: 'Collaboration AI Assistant',
        description: 'AI agent for team productivity and communication optimization',
        page: '/tenant-owner/collaboration',
        category: 'productivity',
      });

      await this.registerAgent('workflow', new WorkflowAgent(), {
        name: 'Workflow AI Assistant',
        description: 'AI agent for automation suggestions and workflow optimization',
        page: '/tenant-owner/automation',
        category: 'automation',
      });

      // Start monitoring if auto-start is enabled
      if (this.registryConfig.autoStart) {
        await this.startAllAgents();
        this.startMonitoring();
      }

      this.initialized = true;
      console.log('Page AI Agent Registry initialized successfully');

    } catch (error: any) {
      console.error('Failed to initialize Page AI Agent Registry:', error);
      throw error;
    }
  }

  private async registerAgent(
    id: string, 
    agent: BaseAgent, 
    metadata: {
      name: string;
      description: string;
      page: string;
      category: 'sales' | 'management' | 'productivity' | 'automation';
    }
  ): Promise<void> {
    console.log(`Registering agent: ${id}`);

    try {
      const agentInfo: PageAgentInfo = {
        id,
        name: metadata.name,
        description: metadata.description,
        page: metadata.page,
        category: metadata.category,
        status: 'inactive',
        instance: agent,
        config: agent.getConfig ? agent.getConfig() : {} as AgentConfig,
        lastActivity: new Date(),
      };

      this.agents.set(id, agentInfo);

      // Initialize the agent
      await agent.initialize();
      agentInfo.status = 'inactive';

      console.log(`Agent ${id} registered successfully`);
    } catch (error: any) {
      console.error(`Failed to register agent ${id}:`, error);
      throw error;
    }
  }

  async startAgent(agentId: string): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`Starting agent: ${agentId}`);

    try {
      agentInfo.status = 'initializing';
      await agentInfo.instance.start();
      agentInfo.status = 'active';
      agentInfo.lastActivity = new Date();

      console.log(`Agent ${agentId} started successfully`);
    } catch (error: any) {
      console.error(`Failed to start agent ${agentId}:`, error);
      agentInfo.status = 'error';
      throw error;
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`Stopping agent: ${agentId}`);

    try {
      await agentInfo.instance.stop();
      agentInfo.status = 'inactive';
      agentInfo.lastActivity = new Date();

      console.log(`Agent ${agentId} stopped successfully`);
    } catch (error: any) {
      console.error(`Failed to stop agent ${agentId}:`, error);
      agentInfo.status = 'error';
      throw error;
    }
  }

  async startAllAgents(): Promise<void> {
    console.log('Starting all agents...');

    const startPromises = Array.from(this.agents.keys()).map(async (agentId) => {
      try {
        await this.startAgent(agentId);
      } catch (error) {
        console.error(`Failed to start agent ${agentId}:`, error);
      }
    });

    await Promise.all(startPromises);
    console.log('All agents start process completed');
  }

  async stopAllAgents(): Promise<void> {
    console.log('Stopping all agents...');

    const stopPromises = Array.from(this.agents.keys()).map(async (agentId) => {
      try {
        await this.stopAgent(agentId);
      } catch (error) {
        console.error(`Failed to stop agent ${agentId}:`, error);
      }
    });

    await Promise.all(stopPromises);
    console.log('All agents stopped');
  }

  getAgent(agentId: string): PageAgentInfo | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): PageAgentInfo[] {
    return Array.from(this.agents.values());
  }

  getAgentsByCategory(category: string): PageAgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => agent.category === category);
  }

  getAgentsByPage(page: string): PageAgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => agent.page === page);
  }

  getActiveAgents(): PageAgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'active');
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async updateAgentConfig(agentId: string, newConfig: Partial<AgentConfig>): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`Updating config for agent: ${agentId}`, newConfig);

    try {
      // Merge with existing configuration
      const fullConfig = { ...agentInfo.config, ...newConfig };
      
      // Update agent configuration
      if (agentInfo.instance.configure) {
        await agentInfo.instance.configure(fullConfig);
      }

      // Update registry record
      agentInfo.config = fullConfig;
      agentInfo.lastActivity = new Date();

      console.log(`Agent ${agentId} configuration updated successfully`);
    } catch (error: any) {
      console.error(`Failed to update agent ${agentId} config:`, error);
      throw error;
    }
  }

  async collectMetrics(): Promise<void> {
    console.log('Collecting metrics from all agents...');

    const metricsPromises = Array.from(this.agents.entries()).map(async ([agentId, agentInfo]) => {
      try {
        if (agentInfo.status === 'active' && agentInfo.instance.getMetrics) {
          agentInfo.metrics = await agentInfo.instance.getMetrics();
        }
      } catch (error) {
        console.error(`Failed to collect metrics for agent ${agentId}:`, error);
      }
    });

    await Promise.all(metricsPromises);
  }

  async performHealthChecks(): Promise<void> {
    console.log('Performing health checks on all agents...');

    const healthPromises = Array.from(this.agents.entries()).map(async ([agentId, agentInfo]) => {
      try {
        if (agentInfo.status === 'active' && agentInfo.instance.getHealth) {
          agentInfo.health = await agentInfo.instance.getHealth();
          
          // Update status based on health
          if (agentInfo.health.status === 'error') {
            agentInfo.status = 'error';
          }
        }
      } catch (error) {
        console.error(`Health check failed for agent ${agentId}:`, error);
        agentInfo.status = 'error';
      }
    });

    await Promise.all(healthPromises);
  }

  private startMonitoring(): void {
    console.log('Starting agent monitoring...');

    // Health check timer
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.registryConfig.healthCheckInterval);

    // Metrics collection timer
    this.metricsTimer = setInterval(async () => {
      await this.collectMetrics();
    }, this.registryConfig.metricsCollectionInterval);
  }

  private stopMonitoring(): void {
    console.log('Stopping agent monitoring...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }

  async getRegistryStatus(): Promise<{
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
    errorAgents: number;
    lastHealthCheck: Date;
    lastMetricsCollection: Date;
  }> {
    const agents = Array.from(this.agents.values());
    
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      inactiveAgents: agents.filter(a => a.status === 'inactive').length,
      errorAgents: agents.filter(a => a.status === 'error').length,
      lastHealthCheck: new Date(),
      lastMetricsCollection: new Date(),
    };
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Page AI Agent Registry...');

    try {
      this.stopMonitoring();
      await this.stopAllAgents();
      this.agents.clear();
      this.initialized = false;

      console.log('Page AI Agent Registry shutdown completed');
    } catch (error: any) {
      console.error('Error during registry shutdown:', error);
      throw error;
    }
  }

  updateRegistryConfig(newConfig: Partial<AgentRegistryConfig>): void {
    this.registryConfig = { ...this.registryConfig, ...newConfig };
    
    // Restart monitoring with new intervals if needed
    if (this.healthCheckTimer || this.metricsTimer) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  getRegistryConfig(): AgentRegistryConfig {
    return { ...this.registryConfig };
  }
}

// Global registry instance
let globalRegistry: PageAgentRegistry | null = null;

export const getPageAgentRegistry = (): PageAgentRegistry => {
  if (!globalRegistry) {
    globalRegistry = new PageAgentRegistry();
  }
  return globalRegistry;
};

export const initializePageAgentRegistry = async (): Promise<PageAgentRegistry> => {
  const registry = getPageAgentRegistry();
  await registry.initialize();
  return registry;
};