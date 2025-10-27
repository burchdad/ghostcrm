/**
 * GhostCRM AI Agents System
 * 
 * This module provides intelligent agents that monitor, maintain, and optimize
 * various aspects of the GhostCRM system automatically.
 */

// Import utility functions
import {
  initializeAgentSystem,
  getSystemStatus,
  performHealthCheck,
  getAgentLogs,
  restartAgentSystem,
} from './utils/AgentSystem';

// Import core functions
import { getAgentManager } from './core/AgentManager';
import { getConfigManager } from './core/AgentConfigManager';

// Core agent system exports
export { BaseAgent } from './core/BaseAgent';
export { getAgentManager } from './core/AgentManager';
export { getConfigManager } from './core/AgentConfigManager';

// Agent types and interfaces
export type {
  AgentInterface,
  AgentStatus,
  AgentHealth,
  AgentMetrics,
  AgentConfig,
  DatabaseConnectionStatus,
  NotificationChannel,
} from './core/types';

// Database monitoring agents
export { DatabaseConnectivityAgent } from './database/DatabaseConnectivityAgent';

// API monitoring agents
export { APIPerformanceAgent } from './api/APIPerformanceAgent';

// Business intelligence agents
export { BusinessIntelligenceAgent } from './business/BusinessIntelligenceAgent';
export { ConversationalAgentManager } from './business/ConversationalAgentManager';

// Security and compliance agents
export { SecurityComplianceAgent } from './agents/SecurityComplianceAgent';

// Integration monitoring agents
export { IntegrationHealthAgent } from './agents/IntegrationHealthAgent';

// Billing and subscription agents
export { BillingIntelligenceAgent } from './agents/BillingIntelligenceAgent';

// Tenant management agents
export { TenantManagementAgent } from './agents/TenantManagementAgent';

// Code intelligence and development agents
export { CodeIntelligenceAgent } from './agents/CodeIntelligenceAgent';

// Utility functions exports
export {
  initializeAgentSystem,
  getSystemStatus,
  performHealthCheck,
  getAgentLogs,
  restartAgentSystem,
};

// Re-export commonly used functions for convenience
export const AgentSystem = {
  initialize: initializeAgentSystem,
  getStatus: getSystemStatus,
  healthCheck: performHealthCheck,
  getLogs: getAgentLogs,
  restart: restartAgentSystem,
  getManager: getAgentManager,
  getConfigManager: getConfigManager,
};

/**
 * Quick start function to initialize the entire agent system
 * 
 * @example
 * ```typescript
 * import { AgentSystem } from '@/ai-agents';
 * 
 * // Initialize the agent system
 * await AgentSystem.initialize();
 * 
 * // Get system status
 * const status = await AgentSystem.getStatus();
 * console.log('Agent System Status:', status);
 * ```
 */
export const quickStart = async () => {
  try {
    await initializeAgentSystem();
    return await getSystemStatus();
  } catch (error) {
    console.error('Failed to start agent system:', error);
    throw error;
  }
};