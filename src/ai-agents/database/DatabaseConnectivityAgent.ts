import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, DatabaseConnectionStatus, HealthIssue } from '../core/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Database Connection Configuration
 */
export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'supabase' | 'mysql' | 'postgresql' | 'mongodb' | 'custom';
  config: {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    connectionString?: string;
    customConfig?: Record<string, any>;
  };
  healthCheck: {
    query?: string;
    timeout: number;
    expectedResponse?: any;
  };
  enabled: boolean;
  criticalLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Auto-Fix Strategy Configuration
 */
export interface AutoFixStrategy {
  id: string;
  name: string;
  description: string;
  connectionTypes: string[];
  issueTypes: string[];
  enabled: boolean;
  maxAttempts: number;
  cooldownPeriod: number; // milliseconds
  action: (connection: DatabaseConnection, issue: HealthIssue) => Promise<boolean>;
}

/**
 * Database Connectivity Monitor Agent
 * 
 * Monitors all database connections and automatically attempts to fix issues
 */
export class DatabaseConnectivityAgent extends BaseAgent {
  private connections: Map<string, DatabaseConnection> = new Map();
  private connectionStatuses: Map<string, DatabaseConnectionStatus> = new Map();
  private autoFixStrategies: Map<string, AutoFixStrategy> = new Map();
  private supabaseClients: Map<string, SupabaseClient> = new Map();
  private lastFixAttempts: Map<string, Date> = new Map();

  constructor() {
    super(
      'db-connectivity-monitor',
      'Database Connectivity Monitor',
      'Monitors and maintains database connections, automatically fixing issues when possible',
      '1.0.0',
      {
        schedule: {
          interval: 30000, // Check every 30 seconds
        },
        logging: {
          level: 'info',
          persistent: true,
        },
        customSettings: {
          autoFix: true,
          alertThreshold: 3, // Alert after 3 consecutive failures
          connectionTimeout: 10000, // 10 seconds
          parallelChecks: true,
        },
      }
    );

    this.initializeAutoFixStrategies();
  }

  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Database Connectivity Agent');
    
    // Load database connections from configuration
    await this.loadDatabaseConnections();
    
    // Initialize Supabase clients
    await this.initializeSupabaseClients();
    
    this.log('info', `Loaded ${this.connections.size} database connections`);
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Starting database connectivity monitoring');
    
    // Perform initial health check
    await this.checkAllConnections();
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping database connectivity monitoring');
    
    // Close all Supabase clients
    this.supabaseClients.clear();
  }

  protected async execute(): Promise<void> {
    await this.checkAllConnections();
    await this.performAutoFixes();
    await this.cleanupOldStatuses();
  }

  protected async onConfigurationChanged(config: AgentConfig): Promise<void> {
    this.log('info', 'Database connectivity agent configuration updated');
    
    // Reload connections if custom settings changed
    if (config.customSettings) {
      await this.loadDatabaseConnections();
    }
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    // Simple performance metrics
    const used = process.memoryUsage();
    return {
      cpu: 0, // Would need external library for CPU usage
      memory: Math.round((used.heapUsed / used.heapTotal) * 100),
      responseTime: this.getAverageResponseTime(),
    };
  }

  /**
   * Add a database connection to monitor
   */
  public addConnection(connection: DatabaseConnection): void {
    this.connections.set(connection.id, connection);
    
    if (connection.type === 'supabase') {
      this.initializeSupabaseClient(connection);
    }
    
    this.log('info', `Added database connection: ${connection.name}`, { 
      connectionId: connection.id,
      type: connection.type 
    });
  }

  /**
   * Remove a database connection
   */
  public removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.connectionStatuses.delete(connectionId);
      this.supabaseClients.delete(connectionId);
      
      this.log('info', `Removed database connection: ${connection.name}`, { 
        connectionId 
      });
    }
  }

  /**
   * Get all connection statuses
   */
  public getConnectionStatuses(): DatabaseConnectionStatus[] {
    return Array.from(this.connectionStatuses.values());
  }

  /**
   * Get specific connection status
   */
  public getConnectionStatus(connectionId: string): DatabaseConnectionStatus | null {
    return this.connectionStatuses.get(connectionId) || null;
  }

  /**
   * Manually trigger connection check
   */
  public async checkConnection(connectionId: string): Promise<DatabaseConnectionStatus> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    return await this.performConnectionCheck(connection);
  }

  /**
   * Load database connections from configuration
   */
  private async loadDatabaseConnections(): Promise<void> {
    // Default Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabaseConnection: DatabaseConnection = {
        id: 'primary-supabase',
        name: 'Primary Supabase Database',
        type: 'supabase',
        config: {
          url: supabaseUrl,
          apiKey: supabaseKey,
        },
        healthCheck: {
          query: 'SELECT 1',
          timeout: 5000,
        },
        enabled: true,
        criticalLevel: 'critical',
      };
      
      this.addConnection(supabaseConnection);
    }

    // TODO: Load additional connections from database or configuration file
    // This could include integrated databases, external APIs, etc.
  }

  /**
   * Initialize Supabase clients
   */
  private async initializeSupabaseClients(): Promise<void> {
    for (const [id, connection] of this.connections) {
      if (connection.type === 'supabase') {
        this.initializeSupabaseClient(connection);
      }
    }
  }

  /**
   * Initialize a single Supabase client
   */
  private initializeSupabaseClient(connection: DatabaseConnection): void {
    if (connection.type === 'supabase' && connection.config.url && connection.config.apiKey) {
      try {
        const client = createClient(
          connection.config.url,
          connection.config.apiKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
        
        this.supabaseClients.set(connection.id, client);
        this.log('debug', `Initialized Supabase client for ${connection.name}`);
      } catch (error) {
        this.log('error', `Failed to initialize Supabase client for ${connection.name}`, { error });
      }
    }
  }

  /**
   * Check all database connections
   */
  private async checkAllConnections(): Promise<void> {
    const checkPromises = Array.from(this.connections.values())
      .filter(conn => conn.enabled)
      .map(connection => this.performConnectionCheck(connection));

    if (this.config.customSettings.parallelChecks) {
      // Run checks in parallel
      await Promise.allSettled(checkPromises);
    } else {
      // Run checks sequentially
      for (const checkPromise of checkPromises) {
        try {
          await checkPromise;
        } catch (error) {
          this.log('warn', 'Connection check failed', { error });
        }
      }
    }
  }

  /**
   * Perform connection check for a specific database
   */
  private async performConnectionCheck(connection: DatabaseConnection): Promise<DatabaseConnectionStatus> {
    const startTime = Date.now();
    let status: DatabaseConnectionStatus;

    try {
      this.log('debug', `Checking connection: ${connection.name}`);

      switch (connection.type) {
        case 'supabase':
          status = await this.checkSupabaseConnection(connection);
          break;
        case 'mysql':
        case 'postgresql':
          status = await this.checkSQLConnection(connection);
          break;
        case 'mongodb':
          status = await this.checkMongoConnection(connection);
          break;
        default:
          status = await this.checkCustomConnection(connection);
      }

      status.responseTime = Date.now() - startTime;
      status.lastCheck = new Date();

      // Update status
      this.connectionStatuses.set(connection.id, status);

      // Check for issues and create health issues if needed
      await this.evaluateConnectionHealth(connection, status);

      this.log('debug', `Connection check completed: ${connection.name}`, {
        status: status.status,
        responseTime: status.responseTime,
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      status = {
        connectionId: connection.id,
        name: connection.name,
        type: connection.type,
        status: 'error',
        lastCheck: new Date(),
        responseTime,
        errorMessage: (error as Error).message,
        metadata: {},
      };

      this.connectionStatuses.set(connection.id, status);
      
      this.log('error', `Connection check failed: ${connection.name}`, { 
        error: (error as Error).message,
        responseTime 
      });

      // Create health issue
      await this.evaluateConnectionHealth(connection, status);
    }

    return status;
  }

  /**
   * Check Supabase connection
   */
  private async checkSupabaseConnection(connection: DatabaseConnection): Promise<DatabaseConnectionStatus> {
    const client = this.supabaseClients.get(connection.id);
    if (!client) {
      throw new Error('Supabase client not initialized');
    }

    // Perform health check query
    const { data, error } = await client
      .from('organizations')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return {
      connectionId: connection.id,
      name: connection.name,
      type: connection.type,
      status: 'connected',
      lastCheck: new Date(),
      responseTime: 0, // Will be set by caller
      metadata: {
        tablesAccessible: true,
        rowLevelSecurity: true,
      },
    };
  }

  /**
   * Check SQL connection (MySQL/PostgreSQL)
   */
  private async checkSQLConnection(connection: DatabaseConnection): Promise<DatabaseConnectionStatus> {
    // TODO: Implement SQL connection checking
    // This would require additional database drivers
    throw new Error('SQL connection checking not implemented yet');
  }

  /**
   * Check MongoDB connection
   */
  private async checkMongoConnection(connection: DatabaseConnection): Promise<DatabaseConnectionStatus> {
    // TODO: Implement MongoDB connection checking
    throw new Error('MongoDB connection checking not implemented yet');
  }

  /**
   * Check custom connection
   */
  private async checkCustomConnection(connection: DatabaseConnection): Promise<DatabaseConnectionStatus> {
    // TODO: Implement custom connection checking
    // This could involve HTTP requests, custom protocols, etc.
    throw new Error('Custom connection checking not implemented yet');
  }

  /**
   * Evaluate connection health and create issues if needed
   */
  private async evaluateConnectionHealth(
    connection: DatabaseConnection, 
    status: DatabaseConnectionStatus
  ): Promise<void> {
    const issueId = `connection-${connection.id}-${Date.now()}`;
    
    if (status.status === 'error' || status.status === 'disconnected') {
      const severity = this.getSeverityFromCriticalLevel(connection.criticalLevel);
      
      this.addHealthIssue({
        id: issueId,
        severity,
        message: `Database connection '${connection.name}' is ${status.status}: ${status.errorMessage || 'Unknown error'}`,
        timestamp: new Date(),
        resolved: false,
        autoFixAttempted: false,
      });

      this.emitEvent('error', {
        connectionId: connection.id,
        connectionName: connection.name,
        status: status.status,
        error: status.errorMessage,
        criticalLevel: connection.criticalLevel,
      });
    }

    // Check for slow response times
    if (status.responseTime > 5000) { // 5 seconds
      this.addHealthIssue({
        id: `slow-response-${connection.id}-${Date.now()}`,
        severity: 'medium',
        message: `Database connection '${connection.name}' has slow response time: ${status.responseTime}ms`,
        timestamp: new Date(),
        resolved: false,
        autoFixAttempted: false,
      });
    }
  }

  /**
   * Perform automatic fixes for connection issues
   */
  private async performAutoFixes(): Promise<void> {
    if (!this.config.customSettings.autoFix) {
      return;
    }

    const unresolvedIssues = this.health.issues.filter(issue => 
      !issue.resolved && !issue.autoFixAttempted
    );

    for (const issue of unresolvedIssues) {
      await this.attemptAutoFix(issue);
    }
  }

  /**
   * Attempt to automatically fix a specific issue
   */
  private async attemptAutoFix(issue: HealthIssue): Promise<void> {
    // Find applicable auto-fix strategies
    const applicableStrategies = Array.from(this.autoFixStrategies.values())
      .filter(strategy => strategy.enabled && this.isStrategyApplicable(strategy, issue));

    for (const strategy of applicableStrategies) {
      // Check cooldown period
      const lastAttempt = this.lastFixAttempts.get(`${issue.id}-${strategy.id}`);
      if (lastAttempt && Date.now() - lastAttempt.getTime() < strategy.cooldownPeriod) {
        continue;
      }

      this.log('info', `Attempting auto-fix: ${strategy.name}`, { 
        issueId: issue.id,
        strategyId: strategy.id 
      });

      try {
        const connection = this.findConnectionFromIssue(issue);
        if (!connection) {
          this.log('warn', 'Could not find connection for issue', { issueId: issue.id });
          continue;
        }

        const success = await strategy.action(connection, issue);
        
        this.lastFixAttempts.set(`${issue.id}-${strategy.id}`, new Date());
        issue.autoFixAttempted = true;

        if (success) {
          issue.resolved = true;
          this.log('info', `Auto-fix successful: ${strategy.name}`, { 
            issueId: issue.id,
            strategyId: strategy.id 
          });
          
          this.emitEvent('task_completed', {
            action: 'auto_fix',
            strategy: strategy.name,
            issueId: issue.id,
            success: true,
          });
          
          break; // Issue resolved, no need to try other strategies
        } else {
          this.log('warn', `Auto-fix failed: ${strategy.name}`, { 
            issueId: issue.id,
            strategyId: strategy.id 
          });
        }

      } catch (error) {
        this.log('error', `Auto-fix error: ${strategy.name}`, { 
          issueId: issue.id,
          strategyId: strategy.id,
          error: (error as Error).message 
        });
      }
    }
  }

  /**
   * Initialize auto-fix strategies
   */
  private initializeAutoFixStrategies(): void {
    // Strategy 1: Recreate Supabase client
    this.autoFixStrategies.set('recreate-supabase-client', {
      id: 'recreate-supabase-client',
      name: 'Recreate Supabase Client',
      description: 'Recreates the Supabase client connection',
      connectionTypes: ['supabase'],
      issueTypes: ['connection'],
      enabled: true,
      maxAttempts: 3,
      cooldownPeriod: 60000, // 1 minute
      action: async (connection, issue) => {
        try {
          // Remove old client
          this.supabaseClients.delete(connection.id);
          
          // Recreate client
          this.initializeSupabaseClient(connection);
          
          // Test connection
          const status = await this.performConnectionCheck(connection);
          return status.status === 'connected';
        } catch (error) {
          return false;
        }
      },
    });

    // Strategy 2: Clear connection cache
    this.autoFixStrategies.set('clear-cache', {
      id: 'clear-cache',
      name: 'Clear Connection Cache',
      description: 'Clears cached connection status and retries',
      connectionTypes: ['supabase', 'mysql', 'postgresql', 'mongodb', 'custom'],
      issueTypes: ['connection', 'timeout'],
      enabled: true,
      maxAttempts: 1,
      cooldownPeriod: 30000, // 30 seconds
      action: async (connection, issue) => {
        try {
          // Clear cached status
          this.connectionStatuses.delete(connection.id);
          
          // Retry connection
          const status = await this.performConnectionCheck(connection);
          return status.status === 'connected';
        } catch (error) {
          return false;
        }
      },
    });

    // TODO: Add more auto-fix strategies as needed
  }

  /**
   * Check if a strategy is applicable to an issue
   */
  private isStrategyApplicable(strategy: AutoFixStrategy, issue: HealthIssue): boolean {
    // Simple pattern matching for now
    // In a more sophisticated implementation, this could use AI/ML to classify issues
    const issueText = issue.message.toLowerCase();
    
    const hasConnectionIssue = issueText.includes('connection') || 
                              issueText.includes('disconnect') || 
                              issueText.includes('error');
    
    return hasConnectionIssue && strategy.issueTypes.some(type => 
      issueText.includes(type.toLowerCase())
    );
  }

  /**
   * Find connection from issue
   */
  private findConnectionFromIssue(issue: HealthIssue): DatabaseConnection | null {
    // Extract connection ID from issue message
    const match = issue.message.match(/connection[s]?\s+['"]([^'"]+)['"]/);
    if (match) {
      const connectionName = match[1];
      for (const connection of this.connections.values()) {
        if (connection.name === connectionName) {
          return connection;
        }
      }
    }
    
    return null;
  }

  /**
   * Get severity from critical level
   */
  private getSeverityFromCriticalLevel(level: string): 'low' | 'medium' | 'high' | 'critical' {
    return level as 'low' | 'medium' | 'high' | 'critical';
  }

  /**
   * Calculate average response time
   */
  private getAverageResponseTime(): number {
    const statuses = Array.from(this.connectionStatuses.values());
    if (statuses.length === 0) return 0;
    
    const totalTime = statuses.reduce((sum, status) => sum + status.responseTime, 0);
    return Math.round(totalTime / statuses.length);
  }

  /**
   * Clean up old connection statuses
   */
  private async cleanupOldStatuses(): Promise<void> {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    
    for (const [id, status] of this.connectionStatuses) {
      if (status.lastCheck < cutoff) {
        this.connectionStatuses.delete(id);
      }
    }
  }
}