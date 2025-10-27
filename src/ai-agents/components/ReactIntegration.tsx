/**
 * React Components for AI Agents Integration
 * 
 * This file contains the React components that were moved from integration-example.ts
 * to resolve TypeScript compilation issues. Import these in your React components.
 */

'use client';

import React from 'react';
import { initializeAIAgents } from '../integration-example';
import { AIAgentsDashboard } from '../dashboard/AIAgentsDashboard';

/**
 * Add this to your main layout.tsx to auto-start the agents
 */
export const AgentSystemProvider = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    initializeAIAgents();
  }, []);
  
  return <>{children}</>;
};

/**
 * Example React hook for using the conversational agent
 */
export const useConversationalAgent = () => {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const sendMessage = async (message: string, userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId }),
      });
      
      const result = await response.json();
      if (result.success) {
        setMessages(prev => [...prev, 
          { content: message, type: 'user', timestamp: new Date() },
          { content: result.data.message, type: 'agent', timestamp: new Date() }
        ]);
        return result.data;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { messages, sendMessage, isLoading };
};

/**
 * Example React hook for business metrics
 */
export const useBusinessMetrics = () => {
  const [metrics, setMetrics] = React.useState(null);
  const [insights, setInsights] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/agents/business');
        const result = await response.json();
        if (result.success) {
          setMetrics(result.data.metrics);
          setInsights(result.data.insights);
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);
  
  return { metrics, insights, loading };
};

/**
 * Example React component for quick agent status
 */
export const QuickAgentStatus = () => {
  const [status, setStatus] = React.useState<any>(null);
  
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/agents/status');
        const result = await response.json();
        if (result.success) {
          setStatus(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  if (!status) return <div>Loading agent status...</div>;
  
  return (
    <div className="agent-status-widget">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          status.systemHealth.overallStatus === 'healthy' ? 'bg-green-500' : 
          status.systemHealth.overallStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          AI Agents: {status.systemHealth.runningAgents}/{status.systemHealth.totalAgents} Running
        </span>
      </div>
    </div>
  );
};

/**
 * Complete dashboard page component
 * Create this as /src/app/agents/page.tsx
 */
export const AgentsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Agents Dashboard</h1>
      <AIAgentsDashboard />
    </div>
  );
};