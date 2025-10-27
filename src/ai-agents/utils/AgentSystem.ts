import { getAgentManager } from '../core/AgentManager';
import { getConfigManager } from '../core/AgentConfigManager';
import { DatabaseConnectivityAgent } from '../database/DatabaseConnectivityAgent';
import { APIPerformanceAgent } from '../api/APIPerformanceAgent';
import { BusinessIntelligenceAgent } from '../business/BusinessIntelligenceAgent';
import { ConversationalAgentManager } from '../business/ConversationalAgentManager';

/**
 * Initialize the entire agent system
 */
export async function initializeAgentSystem(): Promise<void> {
  console.log('🤖 Initializing GhostCRM AI Agent System...');
  
  try {
    // Initialize configuration manager
    const configManager = getConfigManager();
    await configManager.loadConfigurations();
    
    // Initialize agent manager
    const agentManager = getAgentManager();
    
    // Register core agents
    await registerCoreAgents(agentManager, configManager);
    
    // Start all enabled agents
    await agentManager.startAll();
    
    console.log('✅ AI Agent System initialized successfully');
    
    // Set up graceful shutdown
    setupGracefulShutdown(agentManager);
    
  } catch (error) {
    console.error('❌ Failed to initialize AI Agent System:', error);
    throw error;
  }
}

/**
 * Register all core agents
 */
async function registerCoreAgents(agentManager: any, configManager: any): Promise<void> {
  console.log('📝 Registering core agents...');
  
  // Database Connectivity Agent
  const dbConnectivityAgent = new DatabaseConnectivityAgent();
  const dbConfig = configManager.getConfig('db-connectivity-monitor');
  
  if (dbConfig) {
    await dbConnectivityAgent.configure(dbConfig);
  }
  
  agentManager.registerAgent(dbConnectivityAgent);
  console.log('✅ Registered Database Connectivity Agent');
  
  // API Performance Agent
  const apiPerformanceAgent = new APIPerformanceAgent();
  const apiConfig = configManager.getConfig('api-performance-monitor');
  
  if (apiConfig) {
    await apiPerformanceAgent.configure(apiConfig);
  }
  
  agentManager.registerAgent(apiPerformanceAgent);
  console.log('✅ Registered API Performance Agent');
  
  // Business Intelligence Agent
  const businessAgent = new BusinessIntelligenceAgent();
  const businessConfig = configManager.getConfig('business-intelligence-agent');
  
  if (businessConfig) {
    await businessAgent.configure(businessConfig);
  }
  
  agentManager.registerAgent(businessAgent);
  console.log('✅ Registered Business Intelligence Agent');
  
  // Conversational Agent Manager
  const conversationalAgent = new ConversationalAgentManager();
  const conversationalConfig = configManager.getConfig('conversational-agent-manager');
  
  if (conversationalConfig) {
    await conversationalAgent.configure(conversationalConfig);
  }
  
  agentManager.registerAgent(conversationalAgent);
  console.log('✅ Registered Conversational Agent Manager');
  
  // TODO: Register additional agents as they are implemented
  // - Performance Monitor Agent
  // - Security Monitor Agent
  // - Integration Health Agent
  // - Customer Experience Agent
}

/**
 * Get system status
 */
export async function getSystemStatus(): Promise<{
  systemHealth: any;
  systemMetrics: any;
  agentStatuses: any;
}> {
  const agentManager = getAgentManager();
  
  const [systemHealth, systemMetrics] = await Promise.all([
    agentManager.getSystemHealth(),
    agentManager.getSystemMetrics(),
  ]);
  
  const agentStatuses = agentManager.getStatusSummary();
  
  return {
    systemHealth,
    systemMetrics,
    agentStatuses,
  };
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(agentManager: any): void {
  const shutdownHandler = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down AI Agent System...`);
    
    try {
      await agentManager.stopAll();
      console.log('✅ All agents stopped successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle different shutdown signals
  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.on('SIGQUIT', () => shutdownHandler('SIGQUIT'));
}

/**
 * Health check for the agent system
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  details: any;
}> {
  try {
    const systemStatus = await getSystemStatus();
    const { systemHealth } = systemStatus;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let message = 'All agents are functioning normally';
    
    if (systemHealth.overallStatus === 'critical') {
      status = 'critical';
      message = `${systemHealth.errorAgents} agents are in error state`;
    } else if (systemHealth.overallStatus === 'warning') {
      status = 'warning';
      message = `${systemHealth.totalAgents - systemHealth.runningAgents} agents are not running`;
    }
    
    return {
      status,
      message,
      timestamp: new Date(),
      details: systemStatus,
    };
  } catch (error) {
    return {
      status: 'critical',
      message: `Health check failed: ${(error as Error).message}`,
      timestamp: new Date(),
      details: { error: (error as Error).message },
    };
  }
}

/**
 * Get agent logs
 */
export async function getAgentLogs(agentId?: string, limit = 100): Promise<any[]> {
  const agentManager = getAgentManager();
  
  if (agentId) {
    const agent = agentManager.getAgent(agentId);
    // TODO: Implement log retrieval from agent
    return [];
  } else {
    // Get logs from all agents
    const agents = agentManager.getAllAgents();
    const allLogs: any[] = [];
    
    // TODO: Implement log retrieval from all agents
    
    return allLogs.slice(-limit);
  }
}

/**
 * Restart agent system
 */
export async function restartAgentSystem(): Promise<void> {
  console.log('🔄 Restarting AI Agent System...');
  
  const agentManager = getAgentManager();
  await agentManager.stopAll();
  await agentManager.startAll();
  
  console.log('✅ AI Agent System restarted successfully');
}