"use client";

import { useEffect } from 'react';

/**
 * AI Agent System Initializer
 * 
 * Initializes the page agent registry when the app starts.
 * This ensures all AI agents are available for use across the application.
 */
export default function AIAgentInitializer() {
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        console.log('Initializing AI Agent System...');
        
        // Import the registry dynamically to avoid SSR issues
        const { getPageAgentRegistry } = await import('@/ai-agents/registry/PageAgentRegistry');
        
        // Initialize the registry
        const registry = getPageAgentRegistry();
        await registry.initialize();
        
        console.log('AI Agent System initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI Agent System:', error);
      }
    };

    initializeAgents();
  }, []);

  // This component doesn't render anything
  return null;
}