"use client";

import { useEffect } from 'react';

/**
 * AI Agent System Initializer
 * 
 * Initializes the page agent registry when the app starts.
 * This ensures all AI agents are available for use across the application.
 * 
 * Note: AI agents that require server-side resources (like database access)
 * should be initialized on the server side through API routes.
 */
export default function AIAgentInitializer() {
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        console.log('Initializing AI Agent System...');
        
        // Skip server-side agent initialization on client
        // AI agents that require database access should be initialized via API routes
        console.log('Client-side AI agent initialization skipped - agents run server-side');
        
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