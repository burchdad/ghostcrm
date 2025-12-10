import { 
  AgentInterface, 
  AgentStatus, 
  AgentHealth, 
  AgentMetrics, 
  AgentConfig,
  AgentEvent,
  AgentLogEntry,
  HealthIssue 
} from './types';

/**
 * Abstract Base Agent Class
 * All AI agents should extend this class
 */
export abstract class BaseAgent implements AgentInterface {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;
  
  public status: AgentStatus = 'initializing';
  protected config: AgentConfig;
  protected health: AgentHealth;
  protected metrics: AgentMetrics;
  protected events: AgentEvent[] = [];
  protected logs: AgentLogEntry[] = [];
  protected lastError: Error | null = null;
  
  private intervalId?: NodeJS.Timeout;
  protected startTime: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    version: string,
    defaultConfig: Partial<AgentConfig> = {}
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.startTime = new Date();
    
    // Initialize default configuration
    this.config = {
      enabled: true,
      schedule: {
        interval: 60000, // 1 minute default
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
      ...defaultConfig,
    };
    
    // Initialize health
    this.health = {
      status: this.status,
      uptime: 0,
      lastCheck: new Date(),
      issues: [],
      performance: {
        cpu: 0,
        memory: 0,
        responseTime: 0,
      },
    };
    
    // Initialize metrics
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecution: new Date(),
      customMetrics: {},
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    this.log('info', 'Initializing agent');
    this.status = 'initializing';
    
    try {
      await this.onInitialize();
      this.log('info', 'Agent initialized successfully');
      this.emitEvent('started', { message: 'Agent initialized' });
    } catch (error) {
      this.log('error', 'Failed to initialize agent', { error });
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      this.log('warn', 'Agent is disabled, not starting');
      return;
    }

    this.log('info', 'Starting agent');
    this.status = 'running';
    this.startTime = new Date();
    
    try {
      await this.onStart();
      
      // Set up scheduled execution if configured
      if (this.config.schedule?.interval) {
        this.intervalId = setInterval(
          () => this.executeWithRetry(),
          this.config.schedule.interval
        );
      }
      
      this.log('info', 'Agent started successfully');
      this.emitEvent('started', { message: 'Agent started' });
    } catch (error) {
      this.log('error', 'Failed to start agent', { error });
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.log('info', 'Stopping agent');
    this.status = 'stopped';
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    try {
      await this.onStop();
      this.log('info', 'Agent stopped successfully');
      this.emitEvent('stopped', { message: 'Agent stopped' });
    } catch (error) {
      this.log('error', 'Error during agent stop', { error });
      throw error;
    }
  }

  /**
   * Restart the agent
   */
  async restart(): Promise<void> {
    this.log('info', 'Restarting agent');
    await this.stop();
    await this.start();
  }

  /**
   * Get current status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get health information
   */
  async getHealth(): Promise<AgentHealth> {
    this.health.uptime = Date.now() - this.startTime.getTime();
    this.health.lastCheck = new Date();
    this.health.status = this.status;
    
    // Get performance metrics
    try {
      this.health.performance = await this.getPerformanceMetrics();
    } catch (error) {
      this.log('warn', 'Failed to get performance metrics', { error });
    }
    
    return { ...this.health };
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<AgentMetrics> {
    return { ...this.metrics };
  }

  /**
   * Configure the agent
   */
  async configure(config: AgentConfig): Promise<void> {
    this.log('info', 'Updating agent configuration');
    
    const wasRunning = this.status === 'running';
    
    if (wasRunning) {
      await this.stop();
    }
    
    this.config = { ...this.config, ...config };
    
    await this.onConfigurationChanged(config);
    
    if (wasRunning && this.config.enabled) {
      await this.start();
    }
    
    this.emitEvent('config_changed', { config });
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Execute agent task with retry logic
   */
  private async executeWithRetry(): Promise<void> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryPolicy.maxAttempts; attempt++) {
      try {
        this.metrics.totalExecutions++;
        await this.execute();
        
        // Success
        this.metrics.successfulExecutions++;
        this.metrics.lastExecution = new Date();
        
        const executionTime = Date.now() - startTime;
        this.updateAverageExecutionTime(executionTime);
        
        this.emitEvent('task_completed', { 
          attempt, 
          executionTime,
          success: true 
        });
        
        return; // Success, exit retry loop
        
      } catch (error) {
        lastError = error as Error;
        this.log('warn', `Execution attempt ${attempt} failed`, { error, attempt });
        
        if (attempt < this.config.retryPolicy.maxAttempts) {
          const delay = Math.min(
            1000 * Math.pow(this.config.retryPolicy.backoffMultiplier, attempt - 1),
            this.config.retryPolicy.maxDelay
          );
          
          this.log('info', `Retrying in ${delay}ms`, { attempt, delay });
          await this.sleep(delay);
        }
      }
    }
    
    // All attempts failed
    this.metrics.failedExecutions++;
    this.addHealthIssue({
      id: `execution-failed-${Date.now()}`,
      severity: 'high',
      message: `Agent execution failed after ${this.config.retryPolicy.maxAttempts} attempts: ${lastError?.message}`,
      timestamp: new Date(),
      resolved: false,
      autoFixAttempted: false,
    });
    
    this.emitEvent('error', { 
      message: 'All execution attempts failed',
      error: lastError?.message,
      attempts: this.config.retryPolicy.maxAttempts
    });
  }

  /**
   * Log a message
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      const logEntry: AgentLogEntry = {
        id: `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId: this.id,
        timestamp: new Date(),
        level,
        message: `[${this.name}] ${message}`,
        context,
      };
      
      // Add to internal logs
      this.logs.push(logEntry);
      
      // Keep only last 1000 log entries
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
      
      // Console output
      console[level === 'debug' ? 'log' : level](logEntry.message, context || '');
      
      // TODO: Send to external logging service if configured
    }
  }

  /**
   * Emit an event
   */
  protected emitEvent(type: string, data: Record<string, any> = {}): void {
    const event: AgentEvent = {
      id: `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.id,
      type: type as any,
      timestamp: new Date(),
      data,
      severity: type === 'error' ? 'error' : 'info',
    };
    
    this.events.push(event);
    
    // Keep only last 500 events
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }
    
    // TODO: Send to event handlers/webhooks if configured
  }

  /**
   * Add a health issue
   */
  protected addHealthIssue(issue: HealthIssue): void {
    this.health.issues.push(issue);
    
    // Keep only last 100 issues
    if (this.health.issues.length > 100) {
      this.health.issues = this.health.issues.slice(-100);
    }
  }

  /**
   * Resolve a health issue
   */
  protected resolveHealthIssue(issueId: string): void {
    const issue = this.health.issues.find(i => i.id === issueId);
    if (issue) {
      issue.resolved = true;
    }
  }

  /**
   * Handle errors with logging and status updates
   */
  protected handleError(message: string, error: any): void {
    this.lastError = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, { error: error.message || error });
    
    // Add health issue
    this.addHealthIssue({
      id: `error_${Date.now()}`,
      severity: 'high',
      message: message,
      timestamp: new Date(),
      resolved: false,
      autoFixAttempted: false
    });
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract execute(): Promise<void>;
  protected abstract onConfigurationChanged(config: AgentConfig): Promise<void>;
  protected abstract getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }>;

  // Utility methods
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.logging.level);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }

  private updateAverageExecutionTime(executionTime: number): void {
    const totalExecutions = this.metrics.successfulExecutions;
    this.metrics.averageExecutionTime = 
      ((this.metrics.averageExecutionTime * (totalExecutions - 1)) + executionTime) / totalExecutions;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}