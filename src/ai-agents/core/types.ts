/**
 * Base Agent Interface
 * All AI agents must implement this interface
 */
export interface AgentInterface {
  id: string;
  name: string;
  description: string;
  version: string;
  status: AgentStatus;
  
  // Core lifecycle methods
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  
  // Health and monitoring
  getStatus(): AgentStatus;
  getHealth(): Promise<AgentHealth>;
  getMetrics(): Promise<AgentMetrics>;
  
  // Configuration
  configure(config: AgentConfig): Promise<void>;
  getConfig(): AgentConfig;
}

/**
 * Agent Status Types
 */
export type AgentStatus = 
  | 'initializing'
  | 'running'
  | 'stopped'
  | 'error'
  | 'maintenance'
  | 'paused';

/**
 * Agent Health Information
 */
export interface AgentHealth {
  status: AgentStatus;
  uptime: number;
  lastCheck: Date;
  issues: HealthIssue[];
  performance: {
    cpu: number;
    memory: number;
    responseTime: number;
  };
}

/**
 * Health Issue Definition
 */
export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  autoFixAttempted: boolean;
}

/**
 * Agent Metrics
 */
export interface AgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecution: Date;
  customMetrics: Record<string, any>;
}

/**
 * Agent Configuration
 */
export interface AgentConfig {
  enabled: boolean;
  schedule?: {
    interval: number; // milliseconds
    cron?: string;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    persistent: boolean;
  };
  notifications: {
    onError: boolean;
    onSuccess: boolean;
    channels: NotificationChannel[];
  };
  customSettings: Record<string, any>;
}

/**
 * Notification Channel
 */
export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'database';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * Agent Event Types
 */
export interface AgentEvent {
  id: string;
  agentId: string;
  type: AgentEventType;
  timestamp: Date;
  data: Record<string, any>;
  severity: 'info' | 'warn' | 'error' | 'critical';
}

export type AgentEventType =
  | 'started'
  | 'stopped'
  | 'error'
  | 'task_completed'
  | 'health_check'
  | 'config_changed'
  | 'notification_sent';

/**
 * Agent Log Entry
 */
export interface AgentLogEntry {
  id: string;
  agentId: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  stackTrace?: string;
}

/**
 * Database Connection Status for Database Agents
 */
export interface DatabaseConnectionStatus {
  connectionId: string;
  name: string;
  type: 'supabase' | 'mysql' | 'postgresql' | 'mongodb' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}