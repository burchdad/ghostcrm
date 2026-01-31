import { AgentInterface, AgentStatus, AgentHealth, AgentEvent } from './types';

/**
 * Agent Manager
 * Manages all AI agents in the system
 */
export class AgentManager {
  private agents: Map<string, AgentInterface> = new Map();
  private eventHandlers: ((event: AgentEvent) => void)[] = [];
  private isRunning = false;

  constructor() {
    this.log('Agent Manager initialized');
  }

  /**
   * Register an agent
   */
  public registerAgent(agent: AgentInterface): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered`);
    }

    this.agents.set(agent.id, agent);
    this.log(`Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Unregister an agent
   */
  public async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    // Stop the agent if it's running
    if (agent.getStatus() === 'running') {
      await agent.stop();
    }

    this.agents.delete(agentId);
    this.log(`Unregistered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Start all agents
   */
  public async startAll(): Promise<void> {
    this.log('Starting all agents...');
    this.isRunning = true;

    const startPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.initialize();
        await agent.start();
        this.log(`Started agent: ${agent.name}`);
      } catch (error) {
        this.log(`Failed to start agent ${agent.name}: ${(error as Error).message}`);
      }
    });

    await Promise.allSettled(startPromises);
    this.log('All agents startup completed');
  }

  /**
   * Stop all agents
   */
  public async stopAll(): Promise<void> {
    this.log('Stopping all agents...');
    this.isRunning = false;

    const stopPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.stop();
        this.log(`Stopped agent: ${agent.name}`);
      } catch (error) {
        this.log(`Failed to stop agent ${agent.name}: ${(error as Error).message}`);
      }
    });

    await Promise.allSettled(stopPromises);
    this.log('All agents stopped');
  }

  /**
   * Start a specific agent
   */
  public async startAgent(agentId: string): Promise<void> {
    const agent = this.getAgent(agentId);
    
    if (agent.getStatus() === 'running') {
      throw new Error(`Agent ${agentId} is already running`);
    }

    await agent.initialize();
    await agent.start();
    this.log(`Started agent: ${agent.name}`);
  }

  /**
   * Stop a specific agent
   */
  public async stopAgent(agentId: string): Promise<void> {
    const agent = this.getAgent(agentId);
    
    if (agent.getStatus() === 'stopped') {
      throw new Error(`Agent ${agentId} is already stopped`);
    }

    await agent.stop();
    this.log(`Stopped agent: ${agent.name}`);
  }

  /**
   * Restart a specific agent
   */
  public async restartAgent(agentId: string): Promise<void> {
    const agent = this.getAgent(agentId);
    await agent.restart();
    this.log(`Restarted agent: ${agent.name}`);
  }

  /**
   * Get an agent by ID
   */
  public getAgent(agentId: string): AgentInterface {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    return agent;
  }

  /**
   * Get all agents
   */
  public getAllAgents(): AgentInterface[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by status
   */
  public getAgentsByStatus(status: AgentStatus): AgentInterface[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.getStatus() === status
    );
  }

  /**
   * Get system health summary
   */
  public async getSystemHealth(): Promise<{
    totalAgents: number;
    runningAgents: number;
    errorAgents: number;
    overallStatus: 'healthy' | 'warning' | 'critical';
    agents: Array<{
      id: string;
      name: string;
      status: AgentStatus;
      health: AgentHealth;
    }>;
  }> {
    const agents = Array.from(this.agents.values());
    const healthPromises = agents.map(async (agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.getStatus(),
      health: await agent.getHealth(),
    }));

    const agentHealths = await Promise.all(healthPromises);
    
    const runningAgents = agentHealths.filter(a => a.status === 'running').length;
    const errorAgents = agentHealths.filter(a => a.status === 'error').length;
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (errorAgents > 0) {
      overallStatus = 'critical';
    } else if (runningAgents < agents.length) {
      overallStatus = 'warning';
    }

    return {
      totalAgents: agents.length,
      runningAgents,
      errorAgents,
      overallStatus,
      agents: agentHealths,
    };
  }

  /**
   * Get system metrics summary
   */
  public async getSystemMetrics(): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    agents: Array<{
      id: string;
      name: string;
      metrics: any;
    }>;
  }> {
    const agents = Array.from(this.agents.values());
    const metricsPromises = agents.map(async (agent) => ({
      id: agent.id,
      name: agent.name,
      metrics: await agent.getMetrics(),
    }));

    const agentMetrics = await Promise.all(metricsPromises);
    
    const totalExecutions = agentMetrics.reduce((sum, a) => 
      sum + a.metrics.totalExecutions, 0
    );
    const successfulExecutions = agentMetrics.reduce((sum, a) => 
      sum + a.metrics.successfulExecutions, 0
    );
    const failedExecutions = agentMetrics.reduce((sum, a) => 
      sum + a.metrics.failedExecutions, 0
    );
    const averageExecutionTime = agentMetrics.reduce((sum, a) => 
      sum + a.metrics.averageExecutionTime, 0
    ) / agentMetrics.length;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime: Math.round(averageExecutionTime),
      agents: agentMetrics,
    };
  }

  /**
   * Add event handler
   */
  public onEvent(handler: (event: AgentEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  public removeEventHandler(handler: (event: AgentEvent) => void): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Check if manager is running
   */
  public isManagerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get agent status summary
   */
  public getStatusSummary(): Record<AgentStatus, number> {
    const summary: Record<AgentStatus, number> = {
      initializing: 0,
      running: 0,
      stopped: 0,
      error: 0,
      maintenance: 0,
      paused: 0,
    };

    for (const agent of this.agents.values()) {
      const status = agent.getStatus();
      summary[status]++;
    }

    return summary;
  }

  /**
   * Export agent configurations
   */
  public exportConfigurations(): Record<string, any> {
    const configs: Record<string, any> = {};
    
    for (const [id, agent] of this.agents) {
      configs[id] = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        version: agent.version,
        config: agent.getConfig(),
      };
    }

    return configs;
  }

  /**
   * Import agent configurations
   */
  public async importConfigurations(configs: Record<string, any>): Promise<void> {
    for (const [id, config] of Object.entries(configs)) {
      const agent = this.agents.get(id);
      if (agent && config.config) {
        try {
          await agent.configure(config.config);
          this.log(`Updated configuration for agent: ${agent.name}`);
        } catch (error) {
          this.log(`Failed to update configuration for agent ${agent.name}: ${(error as Error).message}`);
        }
      }
    }
  }

  private log(message: string): void {
    console.log(`[AgentManager] ${message}`);
  }
}

// Singleton instance
let agentManagerInstance: AgentManager | null = null;

/**
 * Get the singleton AgentManager instance
 */
export function getAgentManager(): AgentManager {
  if (!agentManagerInstance) {
    agentManagerInstance = new AgentManager();
  }
  return agentManagerInstance;
}