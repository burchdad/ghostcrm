/**
 * Agent Scheduler System
 * 
 * Handles scheduled execution and background processing for all AI agents.
 * Provides centralized scheduling, monitoring, and error handling.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { LeadsAgent } from '../../ai-agents/pages/LeadsAgent';
import { DealsAgent } from '../../ai-agents/pages/DealsAgent';
import { InventoryAgent } from '../../ai-agents/pages/InventoryAgent';
import { CalendarAgent } from '../../ai-agents/pages/CalendarAgent';
import { CollaborationAgent } from '../../ai-agents/pages/CollaborationAgent';
import { WorkflowAgent } from '../../ai-agents/pages/WorkflowAgent';
import { BaseAgent } from '../../ai-agents/core/BaseAgent';

// System agent IDs that are protected from external modification
const SYSTEM_AGENT_IDS = [
  'leads-agent',
  'deals-agent',
  'inventory-agent',
  'calendar-agent', 
  'collaboration-agent',
  'workflow-agent'
];

/**
 * Check if an agent is a protected system agent
 */
function isSystemAgent(agentId: string): boolean {
  return SYSTEM_AGENT_IDS.includes(agentId);
}

/**
 * Validate that an operation is allowed for the given agent
 */
function validateAgentOperation(agentId: string, operation: string, source: 'system' | 'tenant' = 'tenant'): { allowed: boolean; reason?: string } {
  if (isSystemAgent(agentId) && source === 'tenant') {
    return {
      allowed: false,
      reason: `System agent '${agentId}' cannot be modified by tenants. Operation '${operation}' is restricted.`
    };
  }
  return { allowed: true };
}

interface AgentJob {
  id: string;
  agentId: string;
  type: 'scheduled' | 'immediate' | 'background';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  retryCount: number;
  maxRetries: number;
}

interface ScheduleConfig {
  enabled: boolean;
  interval: number; // milliseconds
  timezone: string;
  maxConcurrent: number;
  retryDelay: number;
}

class AgentScheduler {
  private agents: Map<string, BaseAgent> = new Map();
  private jobs: Map<string, AgentJob> = new Map();
  private runningJobs: Set<string> = new Set();
  private scheduleIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  
  private config: ScheduleConfig = {
    enabled: true,
    interval: 30000, // 30 seconds
    timezone: 'UTC',
    maxConcurrent: 3,
    retryDelay: 5000, // 5 seconds
  };
  
  constructor() {
    this.initializeAgents();
  }
  
  /**
   * Initialize all AI agents
   */
  private initializeAgents(): void {
    const agents = [
      new LeadsAgent(),
      new DealsAgent(),
      new InventoryAgent(),
      new CalendarAgent(),
      new CollaborationAgent(),
      new WorkflowAgent(),
    ];
    
    agents.forEach(agent => {
      this.agents.set(agent.getId(), agent);
    });
    
    console.log(`Initialized ${agents.length} AI agents`);
  }
  
  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Agent scheduler is already running');
      return;
    }
    
    console.log('Starting AI agent scheduler...');
    this.isRunning = true;
    
    try {
      // Initialize all agents
      for (const [agentId, agent] of this.agents) {
        try {
          await agent.initialize();
          await agent.start();
          console.log(`Started agent: ${agentId}`);
        } catch (error: any) {
          console.error(`Failed to start agent ${agentId}:`, error.message);
        }
      }
      
      // Start background job processor
      this.startJobProcessor();
      
      // Schedule recurring tasks
      this.scheduleRecurringTasks();
      
      console.log('AI agent scheduler started successfully');
    } catch (error: any) {
      console.error('Failed to start agent scheduler:', error.message);
      this.isRunning = false;
      throw error;
    }
  }
  
  /**
   * Stop the scheduler
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    console.log('Stopping AI agent scheduler...');
    this.isRunning = false;
    
    // Clear all intervals
    for (const interval of this.scheduleIntervals.values()) {
      clearInterval(interval);
    }
    this.scheduleIntervals.clear();
    
    // Stop all agents
    for (const [agentId, agent] of this.agents) {
      try {
        await agent.stop();
        console.log(`Stopped agent: ${agentId}`);
      } catch (error: any) {
        console.error(`Failed to stop agent ${agentId}:`, error.message);
      }
    }
    
    console.log('AI agent scheduler stopped');
  }
  
  /**
   * Schedule a job for execution
   */
  async scheduleJob(
    agentId: string,
    type: 'scheduled' | 'immediate' | 'background' = 'scheduled',
    delay: number = 0,
    source: 'system' | 'tenant' = 'system' // Default to system for internal calls
  ): Promise<string> {
    
    // Validate the operation
    const validation = validateAgentOperation(agentId, 'schedule', source);
    if (!validation.allowed) {
      throw new Error(validation.reason || 'Operation not allowed');
    }
    
    const jobId = `${agentId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const scheduledAt = new Date(Date.now() + delay);
    
    const job: AgentJob = {
      id: jobId,
      agentId,
      type,
      status: 'pending',
      scheduledAt,
      retryCount: 0,
      maxRetries: 3,
    };
    
    this.jobs.set(jobId, job);
    
    console.log(`Scheduled job ${jobId} for agent ${agentId} at ${scheduledAt.toISOString()} (source: ${source})`);
    
    if (type === 'immediate') {
      // Execute immediately
      await this.executeJob(jobId);
    }
    
    return jobId;
  }
  
  /**
   * Execute a specific job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }
    
    if (this.runningJobs.has(jobId)) {
      console.log(`Job ${jobId} is already running`);
      return;
    }
    
    if (this.runningJobs.size >= this.config.maxConcurrent) {
      console.log(`Max concurrent jobs reached (${this.config.maxConcurrent}), skipping ${jobId}`);
      return;
    }
    
    const agent = this.agents.get(job.agentId);
    if (!agent) {
      job.status = 'failed';
      job.error = `Agent ${job.agentId} not found`;
      console.error(job.error);
      return;
    }
    
    this.runningJobs.add(jobId);
    job.status = 'running';
    job.startedAt = new Date();
    
    console.log(`Executing job ${jobId} for agent ${job.agentId}`);
    
    try {
      // Execute the agent's main task
      const result = await this.executeAgentTask(agent);
      
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      
      console.log(`Job ${jobId} completed successfully`);
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
      
      console.error(`Job ${jobId} failed:`, error.message);
      
      // Retry logic
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        job.status = 'pending';
        
        setTimeout(() => {
          this.executeJob(jobId);
        }, this.config.retryDelay * job.retryCount);
        
        console.log(`Scheduling retry ${job.retryCount}/${job.maxRetries} for job ${jobId}`);
      }
    } finally {
      this.runningJobs.delete(jobId);
    }
  }
  
  /**
   * Execute agent-specific task
   */
  private async executeAgentTask(agent: BaseAgent): Promise<any> {
    const agentId = agent.getId();
    
    switch (agentId) {
      case 'leads-agent':
        const leadsAgent = agent as LeadsAgent;
        return await leadsAgent.generateLeadInsights();
        
      case 'deals-agent':
        // Add deals-specific execution
        return { message: 'Deals analysis completed' };
        
      case 'inventory-agent':
        // Add inventory-specific execution
        return { message: 'Inventory analysis completed' };
        
      case 'calendar-agent':
        // Add calendar-specific execution
        return { message: 'Calendar optimization completed' };
        
      case 'collaboration-agent':
        // Add collaboration-specific execution
        return { message: 'Team collaboration analysis completed' };
        
      case 'workflow-agent':
        // Add workflow-specific execution
        return { message: 'Workflow optimization completed' };
        
      default:
        throw new Error(`Unknown agent type: ${agentId}`);
    }
  }
  
  /**
   * Start background job processor
   */
  private startJobProcessor(): void {
    const processorInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(processorInterval);
        return;
      }
      
      this.processScheduledJobs();
    }, 5000); // Check every 5 seconds
  }
  
  /**
   * Process scheduled jobs that are ready to run
   */
  private processScheduledJobs(): void {
    const now = new Date();
    
    for (const [jobId, job] of this.jobs) {
      if (
        job.status === 'pending' &&
        job.scheduledAt <= now &&
        !this.runningJobs.has(jobId)
      ) {
        this.executeJob(jobId);
      }
    }
  }
  
  /**
   * Schedule recurring tasks for all agents
   */
  private scheduleRecurringTasks(): void {
    for (const agentId of this.agents.keys()) {
      const interval = setInterval(() => {
        if (this.isRunning) {
          this.scheduleJob(agentId, 'background');
        }
      }, this.config.interval);
      
      this.scheduleIntervals.set(agentId, interval);
    }
  }
  
  /**
   * Get job status
   */
  getJobStatus(jobId: string): AgentJob | null {
    return this.jobs.get(jobId) || null;
  }
  
  /**
   * Get all jobs for an agent
   */
  getAgentJobs(agentId: string): AgentJob[] {
    return Array.from(this.jobs.values()).filter(job => job.agentId === agentId);
  }
  
  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    activeAgents: number;
    runningJobs: number;
    totalJobs: number;
    config: ScheduleConfig;
  } {
    return {
      isRunning: this.isRunning,
      activeAgents: this.agents.size,
      runningJobs: this.runningJobs.size,
      totalJobs: this.jobs.size,
      config: this.config,
    };
  }
  
  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Scheduler configuration updated:', this.config);
  }
  
  /**
   * Check if an agent is a system agent
   */
  isSystemAgent(agentId: string): boolean {
    return isSystemAgent(agentId);
  }
  
  /**
   * Get list of system agent IDs
   */
  getSystemAgentIds(): string[] {
    return [...SYSTEM_AGENT_IDS];
  }
  
  /**
   * Validate agent operation with source tracking
   */
  validateOperation(agentId: string, operation: string, source: 'system' | 'tenant' = 'tenant'): { allowed: boolean; reason?: string } {
    return validateAgentOperation(agentId, operation, source);
  }
  
  /**
   * Clean up completed jobs older than specified time
   */
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    
    for (const [jobId, job] of this.jobs) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt < cutoff
      ) {
        this.jobs.delete(jobId);
      }
    }
  }
}

// Export singleton instance
export const agentScheduler = new AgentScheduler();

// Next.js API handler for manual agent control
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  try {
    switch (method) {
      case 'GET':
        // Get scheduler status
        const status = agentScheduler.getStatus();
        res.status(200).json({
          ...status,
          systemAgents: agentScheduler.getSystemAgentIds(),
          securityInfo: {
            protectedAgents: agentScheduler.getSystemAgentIds().length,
            protectionActive: true
          }
        });
        break;
        
      case 'POST':
        const { action, agentId, config } = req.body;
        
        switch (action) {
          case 'start':
            await agentScheduler.start();
            res.status(200).json({ message: 'Scheduler started' });
            break;
            
          case 'stop':
            await agentScheduler.stop();
            res.status(200).json({ message: 'Scheduler stopped' });
            break;
            
          case 'schedule':
            if (!agentId) {
              return res.status(400).json({ error: 'Agent ID required' });
            }
            
            // Validate operation (defaults to 'tenant' source for API calls)
            const validation = agentScheduler.validateOperation(agentId, 'schedule', 'tenant');
            if (!validation.allowed) {
              return res.status(403).json({ 
                error: validation.reason,
                agentId,
                protectionLevel: 'system'
              });
            }
            
            const jobId = await agentScheduler.scheduleJob(agentId, 'immediate', 0, 'tenant');
            res.status(200).json({ jobId, message: 'Job scheduled' });
            break;
            
          case 'configure':
            if (!agentId || !config) {
              return res.status(400).json({ error: 'Agent ID and configuration required' });
            }
            
            // Validate configuration change
            const configValidation = agentScheduler.validateOperation(agentId, 'configure', 'tenant');
            if (!configValidation.allowed) {
              return res.status(403).json({ 
                error: configValidation.reason,
                agentId,
                protectionLevel: 'system'
              });
            }
            
            agentScheduler.updateConfig(config);
            res.status(200).json({ message: 'Configuration updated' });
            break;
            
          default:
            res.status(400).json({ error: 'Invalid action' });
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Agent scheduler API error:', error.message);
    if (error.message.includes('System agent')) {
      // Security violation
      res.status(403).json({ 
        error: 'Access denied: ' + error.message,
        securityViolation: true
      });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}