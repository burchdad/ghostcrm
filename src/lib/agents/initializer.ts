/**
 * AI Agent System Initialization
 * 
 * Initializes and starts all AI agents when the application launches.
 * This runs on application startup to ensure agents are ready for use.
 */

import { agentScheduler } from './scheduler';

class AgentSystemInitializer {
  private initialized: boolean = false;
  private startupTime: Date | null = null;
  
  /**
   * Initialize the AI agent system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('AI agent system is already initialized');
      return;
    }
    
    console.log('🚀 Initializing AI Agent System...');
    this.startupTime = new Date();
    
    try {
      // Start the agent scheduler
      await agentScheduler.start();
      
      // Schedule initial analysis tasks for all agents
      await this.scheduleInitialTasks();
      
      // Mark as initialized
      this.initialized = true;
      
      const initTime = Date.now() - this.startupTime.getTime();
      console.log(`✅ AI Agent System initialized successfully in ${initTime}ms`);
      
    } catch (error: any) {
      console.error('❌ Failed to initialize AI Agent System:', error.message);
      throw error;
    }
  }
  
  /**
   * Schedule initial analysis tasks for all agents
   */
  private async scheduleInitialTasks(): Promise<void> {
    const agents = [
      'leads-agent',
      'deals-agent', 
      'inventory-agent',
      'calendar-agent',
      'collaboration-agent',
      'workflow-agent'
    ];
    
    console.log('📅 Scheduling initial analysis tasks...');
    
    for (const agentId of agents) {
      try {
        // Schedule immediate initial analysis
        await agentScheduler.scheduleJob(agentId, 'immediate');
        
        // Schedule first background task
        await agentScheduler.scheduleJob(agentId, 'background', 60000); // 1 minute delay
        
        console.log(`   ✓ Scheduled tasks for ${agentId}`);
      } catch (error: any) {
        console.error(`   ✗ Failed to schedule tasks for ${agentId}:`, error.message);
      }
    }
  }
  
  /**
   * Check if the system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get initialization status
   */
  getStatus(): {
    initialized: boolean;
    startupTime: Date | null;
    uptime: number | null;
    schedulerStatus: any;
  } {
    const uptime = this.startupTime ? Date.now() - this.startupTime.getTime() : null;
    
    return {
      initialized: this.initialized,
      startupTime: this.startupTime,
      uptime,
      schedulerStatus: this.initialized ? agentScheduler.getStatus() : null,
    };
  }
  
  /**
   * Restart the system
   */
  async restart(): Promise<void> {
    console.log('🔄 Restarting AI Agent System...');
    
    if (this.initialized) {
      await agentScheduler.stop();
      this.initialized = false;
    }
    
    await this.initialize();
  }
  
  /**
   * Shutdown the system gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    console.log('🛑 Shutting down AI Agent System...');
    
    try {
      await agentScheduler.stop();
      this.initialized = false;
      this.startupTime = null;
      
      console.log('✅ AI Agent System shut down gracefully');
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }
}

// Export singleton instance
export const agentSystemInitializer = new AgentSystemInitializer();

// Auto-initialize in non-test environments
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  // Client-side initialization (delayed to avoid blocking UI)
  setTimeout(() => {
    agentSystemInitializer.initialize().catch(console.error);
  }, 2000); // 2 second delay
} else if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Server-side initialization (immediate for API routes)
  agentSystemInitializer.initialize().catch(console.error);
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await agentSystemInitializer.shutdown();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    await agentSystemInitializer.shutdown();
    process.exit(0);
  });
}

export default agentSystemInitializer;