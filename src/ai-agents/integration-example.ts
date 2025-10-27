/**
 * Integration example for GhostCRM AI Agents System
 * 
 * This file shows how to integrate the AI Agents system into your Next.js application.
 * Add this to your main application startup or API routes.
 */

import { AgentSystem } from '@/ai-agents';

/**
 * Initialize the AI Agents system on application startup
 * Add this to your main layout.tsx or _app.tsx
 */
export async function initializeAIAgents() {
  try {
    console.log('🚀 Starting GhostCRM AI Agents System...');
    
    // Initialize the agent system
    await AgentSystem.initialize();
    
    // Get initial system status
    const status = await AgentSystem.getStatus();
    console.log('✅ AI Agents System initialized:', {
      totalAgents: status.systemHealth.totalAgents,
      runningAgents: status.systemHealth.runningAgents,
      overallStatus: status.systemHealth.overallStatus
    });
    
    // Perform initial health check
    const healthCheck = await AgentSystem.healthCheck();
    if (healthCheck.status !== 'healthy') {
      console.warn('⚠️ System health warning:', healthCheck.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize AI Agents System:', error);
    return false;
  }
}

/**
 * Message interface for conversation hook
 */
interface ChatMessage {
  content: string;
  type: 'user' | 'agent';
  timestamp: Date;
}

/**
 * Conversational agent hook interface
 */
export interface ConversationalAgentHook {
  messages: ChatMessage[];
  sendMessage: (message: string, userId: string) => Promise<any>;
  isLoading: boolean;
}

/**
 * Business metrics interface
 */
export interface BusinessMetricsHook {
  metrics: any;
  insights: any[];
  loading: boolean;
}

/**
 * Agent status interface
 */
export interface AgentStatus {
  systemHealth: {
    overallStatus: 'healthy' | 'warning' | 'critical';
    runningAgents: number;
    totalAgents: number;
  };
}

/**
 * Agent status hook interface
 */
export interface AgentStatusHook {
  status: AgentStatus | null;
}

/**
 * Hook factory for conversational agent
 * This would be implemented in a React component file
 */
export const createConversationalAgentHook = (): ConversationalAgentHook => {
  // This is a TypeScript interface - actual React implementation would go in a .tsx file
  return {
    messages: [],
    sendMessage: async (message: string, userId: string) => {
      try {
        const response = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, userId }),
        });
        
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Failed to send message:', error);
        return null;
      }
    },
    isLoading: false
  };
};

/**
 * Hook factory for business metrics
 * This would be implemented in a React component file
 */
export const createBusinessMetricsHook = (): BusinessMetricsHook => {
  // This is a TypeScript interface - actual React implementation would go in a .tsx file
  return {
    metrics: null,
    insights: [],
    loading: true
  };
};

/**
 * Hook factory for agent status
 * This would be implemented in a React component file
 */
export const createAgentStatusHook = (): AgentStatusHook => {
  // This is a TypeScript interface - actual React implementation would go in a .tsx file
  return {
    status: null
  };
};

/**
 * Navigation configuration
 */
export const agentNavigation = {
  title: 'AI Agents',
  href: '/agents',
  icon: 'Bot',
  description: 'Monitor and interact with AI agents'
};

/**
 * Environment variables to add to your .env.local
 */
export const requiredEnvVars = `
# Supabase Configuration (for Database Connectivity Agent)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Agent System Configuration
AGENT_SYSTEM_ENABLED=true
AGENT_SYSTEM_LOG_LEVEL=info
AGENT_DB_CHECK_INTERVAL=30000
AGENT_AUTO_RESTART=true
AGENT_ENABLE_BUSINESS_INTELLIGENCE=true
AGENT_ENABLE_CONVERSATIONAL_MODE=true
`;

/**
 * Startup integration for Next.js
 * Add to your layout.tsx or middleware.ts
 */
export const startupIntegrationExample = `
// In your root layout.tsx or _app.tsx
import { initializeAIAgents } from '@/ai-agents/integration-example';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    // Initialize AI agents on app startup
    initializeAIAgents();
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
`;

/**
 * API endpoint examples
 */
export const apiEndpoints = {
  agentStatus: '/api/agents/status',
  agentChat: '/api/agents/chat',
  businessMetrics: '/api/agents/business',
  tenantAgents: (tenantId: string) => `/api/tenant-agents/${tenantId}`,
  tenantMetrics: (tenantId: string) => `/api/tenant-agents/${tenantId}/metrics`,
  toggleAgent: (tenantId: string, agentId: string) => `/api/tenant-agents/${tenantId}/${agentId}/toggle`
};

/**
 * Default export with all integration utilities
 */
export default {
  initializeAIAgents,
  createConversationalAgentHook,
  createBusinessMetricsHook,
  createAgentStatusHook,
  agentNavigation,
  requiredEnvVars,
  startupIntegrationExample,
  apiEndpoints,
};