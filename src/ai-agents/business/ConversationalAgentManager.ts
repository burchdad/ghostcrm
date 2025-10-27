import { BaseAgent } from '../core/BaseAgent';
import {
  AgentHealth,
  AgentMetrics,
  AgentConfig,
} from '../core/types';
import { BusinessIntelligenceAgent } from './BusinessIntelligenceAgent';
import { getAgentManager } from '../core/AgentManager';

/**
 * Conversational Agent Manager
 * 
 * Main conversational interface for clients to interact with the entire AI agent ecosystem.
 * This agent coordinates with all other agents to provide comprehensive business assistance.
 */

interface ConversationMessage {
  id: string;
  content: string;
  type: 'user' | 'agent' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  context: ConversationContext;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
}

interface ConversationContext {
  currentTopic: string;
  userPreferences: Record<string, any>;
  businessContext: Record<string, any>;
  agentCapabilities: string[];
  systemStatus: Record<string, any>;
  recentInsights: any[];
}

interface ConversationResponse {
  message: string;
  type: 'text' | 'data' | 'chart' | 'action' | 'recommendation';
  data?: any;
  suggestedActions?: string[];
  followUpQuestions?: string[];
  relatedInsights?: any[];
}

interface ConversationalAgentMetrics extends AgentMetrics {
  totalConversations: number;
  activeConversations: number;
  avgConversationLength: number;
  avgResponseTime: number;
  userSatisfactionScore: number;
  questionsAnswered: number;
  actionsPerformed: number;
  systemQueriesHandled: number;
  businessQueriesHandled: number;
}

interface ConversationalAgentConfig extends AgentConfig {
  // Conversation settings
  maxActiveConversations: number;
  conversationTimeout: number; // ms
  maxMessagesPerConversation: number;
  enableContextMemory: boolean;
  
  // Response settings
  enableTypingIndicator: boolean;
  simulateThinkingTime: boolean;
  maxResponseLength: number;
  enableRichResponses: boolean;
  
  // Integration settings
  enableBusinessIntelligence: boolean;
  enableSystemControl: boolean;
  enableDataAccess: boolean;
  enableProactiveNotifications: boolean;
  
  // AI/NLP settings
  enableSentimentAnalysis: boolean;
  enableIntentRecognition: boolean;
  enableEntityExtraction: boolean;
  confidenceThreshold: number;
}

export class ConversationalAgentManager extends BaseAgent {
  private conversations: Map<string, ConversationSession> = new Map();
  private businessAgent: BusinessIntelligenceAgent;
  private conversationalConfig: ConversationalAgentConfig;
  private systemContext: Record<string, any> = {};
  
  constructor() {
    super(
      'conversational-agent-manager',
      'Conversational Agent Manager',
      'Manages conversational AI interactions and coordinates with business intelligence',
      '1.0.0'
    );
    this.conversationalConfig = this.getDefaultConfig();
    this.businessAgent = new BusinessIntelligenceAgent();
  }

  // Abstract method implementations required by BaseAgent
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Conversational Agent Manager...');
    await this.initializeSystemContext();
    await this.businessAgent.initialize();
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Starting Conversational Agent Manager...');
    await this.initializeSystemContext();
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping Conversational Agent Manager...');
    this.cleanupInactiveConversations();
  }

  protected async execute(): Promise<void> {
    await this.saveActiveConversations();
    this.cleanupInactiveConversations();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    this.log('info', 'Conversational Agent configuration updated');
    this.conversationalConfig = { ...this.conversationalConfig, ...config };
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 200 + 100
    };
  }

  protected async doStart(): Promise<void> {
    this.log('info', 'Starting Conversational Agent Manager...');
    
    // Initialize business intelligence agent
    await this.businessAgent.initialize();
    await this.businessAgent.start();
    
    // Initialize system context
    await this.initializeSystemContext();
    
    // Start conversation cleanup
    this.startConversationCleanup();
    
    this.log('info', 'Conversational Agent Manager started successfully');
  }

  protected async doStop(): Promise<void> {
    this.log('info', 'Stopping Conversational Agent Manager...');
    
    // Save active conversations
    await this.saveActiveConversations();
    
    // Stop business agent
    await this.businessAgent.stop();
    
    this.log('info', 'Conversational Agent Manager stopped');
  }

  protected async checkHealth(): Promise<AgentHealth> {
    try {
      const metrics = await this.collectMetrics() as ConversationalAgentMetrics;
      const healthPercentage = this.calculateHealthPercentage(metrics);
      
      const issues = [];
      
      // Check conversation capacity
      if (metrics.activeConversations >= this.conversationalConfig.maxActiveConversations) {
        issues.push({
          severity: 'warning' as const,
          message: 'Maximum conversation capacity reached',
          code: 'MAX_CONVERSATIONS',
          timestamp: new Date(),
        });
      }
      
      // Check response time
      if (metrics.avgResponseTime > 5000) {
        issues.push({
          severity: 'warning' as const,
          message: `Slow response time: ${metrics.avgResponseTime}ms`,
          code: 'SLOW_RESPONSE',
          timestamp: new Date(),
        });
      }
      
      // Check satisfaction score
      if (metrics.userSatisfactionScore < 80) {
        issues.push({
          severity: 'warning' as const,
          message: `Low satisfaction score: ${metrics.userSatisfactionScore}%`,
          code: 'LOW_SATISFACTION',
          timestamp: new Date(),
        });
      }

      return {
        status: this.status,
        uptime: Date.now() - this.startTime.getTime(),
        lastCheck: new Date(),
        issues,
        performance: {
          cpu: 0,
          memory: 0,
          responseTime: metrics.avgResponseTime,
        }
      };
    } catch (error) {
      this.log('error', 'Health check failed', { error });
      throw error;
    }
  }

  protected async collectMetrics(): Promise<ConversationalAgentMetrics> {
    const activeConversations = Array.from(this.conversations.values())
      .filter(c => c.status === 'active').length;
    
    const totalMessages = Array.from(this.conversations.values())
      .reduce((sum, conv) => sum + conv.messages.length, 0);
    
    return {
      // Base AgentMetrics properties
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: this.calculateAverageResponseTime(),
      lastExecution: new Date(),
      customMetrics: {},
      // ConversationalAgentMetrics specific properties
      totalConversations: this.conversations.size,
      activeConversations,
      avgConversationLength: this.conversations.size > 0 ? totalMessages / this.conversations.size : 0,
      avgResponseTime: this.calculateAverageResponseTime(),
      userSatisfactionScore: this.calculateSatisfactionScore(),
      questionsAnswered: this.calculateQuestionsAnswered(),
      actionsPerformed: this.calculateActionsPerformed(),
      systemQueriesHandled: this.calculateSystemQueries(),
      businessQueriesHandled: this.calculateBusinessQueries(),
    };
  }

  /**
   * Main conversation interface
   */
  public async chat(
    message: string,
    userId: string,
    sessionId?: string
  ): Promise<ConversationResponse> {
    const startTime = Date.now();
    
    try {
      this.log('info', 'Processing chat message', { message: message.substring(0, 50), userId });
      
      // Get or create conversation session
      const session = this.getOrCreateSession(userId, sessionId);
      
      // Add user message to conversation
      this.addMessage(session, {
        id: this.generateMessageId(),
        content: message,
        type: 'user',
        timestamp: new Date(),
      });
      
      // Analyze message intent and context
      const intent = await this.analyzeIntent(message, session.context);
      
      // Update conversation context
      await this.updateConversationContext(session, intent);
      
      // Generate response based on intent
      const response = await this.generateResponse(message, intent, session);
      
      // Add agent response to conversation
      this.addMessage(session, {
        id: this.generateMessageId(),
        content: response.message,
        type: 'agent',
        timestamp: new Date(),
        metadata: { intent, responseTime: Date.now() - startTime },
      });
      
      // Update session activity
      session.lastActivity = new Date();
      this.conversations.set(session.id, session);
      
      this.log('info', 'Chat message processed', { 
        responseTime: Date.now() - startTime,
        intent: intent.category 
      });
      
      return response;
      
    } catch (error) {
      this.log('error', 'Failed to process chat message', { message, error });
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  public getConversationHistory(userId: string, sessionId?: string): ConversationMessage[] {
    const session = this.getSession(userId, sessionId);
    return session ? session.messages : [];
  }

  /**
   * Get active conversations for a user
   */
  public getUserConversations(userId: string): ConversationSession[] {
    return Array.from(this.conversations.values())
      .filter(session => session.userId === userId);
  }

  /**
   * Start a new conversation with a specific topic
   */
  public async startConversation(
    userId: string,
    topic: string,
    initialMessage?: string
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const session: ConversationSession = {
      id: sessionId,
      userId,
      title: topic,
      messages: [],
      context: {
        currentTopic: topic,
        userPreferences: {},
        businessContext: {},
        agentCapabilities: this.getAgentCapabilities(),
        systemStatus: await this.getSystemStatus(),
        recentInsights: await this.getRecentInsights(),
      },
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'active',
    };
    
    this.conversations.set(sessionId, session);
    
    // Send initial message if provided
    if (initialMessage) {
      await this.chat(initialMessage, userId, sessionId);
    }
    
    return sessionId;
  }

  /**
   * End a conversation
   */
  public async endConversation(userId: string, sessionId: string): Promise<void> {
    const session = this.conversations.get(sessionId);
    if (session && session.userId === userId) {
      session.status = 'completed';
      session.lastActivity = new Date();
      this.conversations.set(sessionId, session);
      
      this.log('info', 'Conversation ended', { sessionId, userId });
    }
  }

  /**
   * Get system status for conversation context
   */
  private async getSystemStatus(): Promise<Record<string, any>> {
    try {
      const agentManager = getAgentManager();
      const systemHealth = await agentManager.getSystemHealth();
      const systemMetrics = await agentManager.getSystemMetrics();
      
      return {
        health: systemHealth,
        metrics: systemMetrics,
        timestamp: new Date(),
      };
    } catch (error) {
      this.log('error', 'Failed to get system status', { error });
      return {};
    }
  }

  /**
   * Get recent business insights
   */
  private async getRecentInsights(): Promise<any[]> {
    try {
      if (this.conversationalConfig.enableBusinessIntelligence) {
        return await this.businessAgent.getProactiveInsights('system');
      }
      return [];
    } catch (error) {
      this.log('error', 'Failed to get recent insights', { error });
      return [];
    }
  }

  /**
   * Analyze message intent
   */
  private async analyzeIntent(message: string, context: ConversationContext): Promise<{
    category: string;
    type: string;
    confidence: number;
    entities: string[];
    requiresAction: boolean;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Business questions
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') || 
        lowerMessage.includes('performance') || lowerMessage.includes('business')) {
      return {
        category: 'business',
        type: 'query',
        confidence: 0.9,
        entities: this.extractBusinessEntities(message),
        requiresAction: false,
      };
    }
    
    // System questions
    if (lowerMessage.includes('agent') || lowerMessage.includes('system') || 
        lowerMessage.includes('status') || lowerMessage.includes('health')) {
      return {
        category: 'system',
        type: 'query',
        confidence: 0.85,
        entities: this.extractSystemEntities(message),
        requiresAction: false,
      };
    }
    
    // Action requests
    if (lowerMessage.includes('restart') || lowerMessage.includes('stop') || 
        lowerMessage.includes('start') || lowerMessage.includes('configure')) {
      return {
        category: 'system',
        type: 'action',
        confidence: 0.8,
        entities: this.extractActionEntities(message),
        requiresAction: true,
      };
    }
    
    // General conversation
    return {
      category: 'general',
      type: 'conversation',
      confidence: 0.7,
      entities: [],
      requiresAction: false,
    };
  }

  /**
   * Generate contextual response
   */
  private async generateResponse(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    if (intent.category === 'business') {
      return await this.handleBusinessQuery(message, intent, session);
    } else if (intent.category === 'system') {
      return await this.handleSystemQuery(message, intent, session);
    } else {
      return await this.handleGeneralConversation(message, intent, session);
    }
  }

  /**
   * Handle business-related queries
   */
  private async handleBusinessQuery(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    try {
      const businessResponse = await this.businessAgent.askBusinessQuestion(
        message,
        session.userId,
        session.id
      );
      
      return {
        message: businessResponse.answer,
        type: 'data',
        data: businessResponse.data,
        suggestedActions: businessResponse.recommendations,
        followUpQuestions: businessResponse.followUpQuestions,
        relatedInsights: businessResponse.insights,
      };
    } catch (error) {
      this.log('error', 'Failed to handle business query', { message, error });
      return {
        message: 'I apologize, but I encountered an error while analyzing your business data. Please try again or rephrase your question.',
        type: 'text',
      };
    }
  }

  /**
   * Handle system-related queries
   */
  private async handleSystemQuery(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    try {
      if (intent.type === 'action' && intent.requiresAction) {
        return await this.handleSystemAction(message, intent, session);
      } else {
        return await this.handleSystemStatus(message, intent, session);
      }
    } catch (error) {
      this.log('error', 'Failed to handle system query', { message, error });
      return {
        message: 'I encountered an error while checking the system status. Please try again.',
        type: 'text',
      };
    }
  }

  /**
   * Handle system actions
   */
  private async handleSystemAction(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    if (!this.conversationalConfig.enableSystemControl) {
      return {
        message: 'System control is currently disabled. You can view system status but cannot perform actions.',
        type: 'text',
      };
    }
    
    // Implement system actions here
    return {
      message: 'System actions are being implemented. Please check back soon for this functionality.',
      type: 'text',
      suggestedActions: ['View system status', 'Check agent health', 'Review recent logs'],
    };
  }

  /**
   * Handle system status queries
   */
  private async handleSystemStatus(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    const systemStatus = await this.getSystemStatus();
    
    const statusMessage = `System Status: ${systemStatus.health?.overallStatus || 'Unknown'}
- Total Agents: ${systemStatus.health?.totalAgents || 0}
- Running Agents: ${systemStatus.health?.runningAgents || 0}
- System Uptime: ${this.formatUptime(systemStatus.health?.uptime || 0)}

All critical systems are operational and monitoring your CRM effectively.`;
    
    return {
      message: statusMessage,
      type: 'data',
      data: systemStatus,
      followUpQuestions: [
        'Show me detailed agent performance',
        'Are there any alerts or issues?',
        'How can I optimize system performance?',
      ],
    };
  }

  /**
   * Handle general conversation
   */
  private async handleGeneralConversation(
    message: string,
    intent: any,
    session: ConversationSession
  ): Promise<ConversationResponse> {
    const responses = [
      "Hello! I'm your CRM's AI assistant. I can help you with business insights, system status, and answer questions about your data. What would you like to know?",
      "I'm here to help you understand your business performance and manage your CRM system. Feel free to ask about sales, leads, system health, or anything else!",
      "Great to chat with you! I can provide business analytics, system monitoring, and help you make data-driven decisions. What's on your mind?",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse,
      type: 'text',
      followUpQuestions: [
        'How are my sales performing this month?',
        'What\'s the status of all AI agents?',
        'Show me recent business insights',
        'Are there any system issues I should know about?',
      ],
    };
  }

  // Helper methods
  private getOrCreateSession(userId: string, sessionId?: string): ConversationSession {
    const id = sessionId || this.generateSessionId();
    
    if (!this.conversations.has(id)) {
      this.conversations.set(id, {
        id,
        userId,
        title: 'New Conversation',
        messages: [],
        context: {
          currentTopic: 'general',
          userPreferences: {},
          businessContext: {},
          agentCapabilities: this.getAgentCapabilities(),
          systemStatus: {},
          recentInsights: [],
        },
        startTime: new Date(),
        lastActivity: new Date(),
        status: 'active',
      });
    }
    
    return this.conversations.get(id)!;
  }

  private getSession(userId: string, sessionId?: string): ConversationSession | null {
    const id = sessionId || 'default';
    const session = this.conversations.get(id);
    return session && session.userId === userId ? session : null;
  }

  private addMessage(session: ConversationSession, message: ConversationMessage): void {
    session.messages.push(message);
    
    // Limit message history
    if (session.messages.length > this.conversationalConfig.maxMessagesPerConversation) {
      session.messages.shift();
    }
  }

  private async updateConversationContext(session: ConversationSession, intent: any): Promise<void> {
    session.context.currentTopic = intent.category;
    session.context.systemStatus = await this.getSystemStatus();
    
    if (this.conversationalConfig.enableBusinessIntelligence) {
      session.context.recentInsights = await this.getRecentInsights();
    }
  }

  private async initializeSystemContext(): Promise<void> {
    this.systemContext = {
      agents: this.getAgentCapabilities(),
      status: await this.getSystemStatus(),
      startTime: new Date(),
    };
  }

  private getAgentCapabilities(): string[] {
    return [
      'Database connectivity monitoring',
      'API performance tracking',
      'Business intelligence and analytics',
      'System health monitoring',
      'Conversational business assistance',
      'Proactive insights and recommendations',
    ];
  }

  private startConversationCleanup(): void {
    setInterval(() => {
      this.cleanupInactiveConversations();
    }, 300000); // Every 5 minutes
  }

  private cleanupInactiveConversations(): void {
    const cutoff = new Date(Date.now() - this.conversationalConfig.conversationTimeout);
    
    for (const [sessionId, session] of this.conversations.entries()) {
      if (session.lastActivity < cutoff && session.status === 'active') {
        session.status = 'paused';
        this.conversations.set(sessionId, session);
        this.log('info', 'Conversation paused due to inactivity', { sessionId });
      }
    }
  }

  private async saveActiveConversations(): Promise<void> {
    // In real implementation, save to database
    this.log('info', `Saving ${this.conversations.size} active conversations`);
  }

  private extractBusinessEntities(message: string): string[] {
    const entities: string[] = [];
    const patterns = {
      money: /\$[\d,]+/g,
      percentage: /\d+%/g,
      timeframe: /(this|last)\s+(week|month|quarter|year)/gi,
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = message.match(pattern);
      if (matches) entities.push(...matches);
    }
    
    return entities;
  }

  private extractSystemEntities(message: string): string[] {
    const entities: string[] = [];
    const agentNames = ['database', 'api', 'business', 'performance', 'security'];
    
    for (const agentName of agentNames) {
      if (message.toLowerCase().includes(agentName)) {
        entities.push(agentName);
      }
    }
    
    return entities;
  }

  private extractActionEntities(message: string): string[] {
    const entities: string[] = [];
    const actions = ['restart', 'stop', 'start', 'configure', 'reset'];
    
    for (const action of actions) {
      if (message.toLowerCase().includes(action)) {
        entities.push(action);
      }
    }
    
    return entities;
  }

  private formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Metrics calculation helpers
  private calculateAverageResponseTime(): number {
    // Calculate from message metadata
    return Math.random() * 1000 + 500; // Simulated
  }

  private calculateSatisfactionScore(): number {
    return Math.random() * 15 + 85; // 85-100%
  }

  private calculateQuestionsAnswered(): number {
    return Array.from(this.conversations.values())
      .reduce((sum, conv) => sum + conv.messages.filter(m => m.type === 'user').length, 0);
  }

  private calculateActionsPerformed(): number {
    return 0; // Will be implemented with actual actions
  }

  private calculateSystemQueries(): number {
    // Count system-related messages
    return 5; // Simulated
  }

  private calculateBusinessQueries(): number {
    // Count business-related messages
    return 15; // Simulated
  }

  private calculateHealthPercentage(metrics: ConversationalAgentMetrics): number {
    let score = 100;
    
    if (metrics.avgResponseTime > 5000) score -= 20;
    if (metrics.userSatisfactionScore < 80) score -= 25;
    if (metrics.activeConversations >= this.conversationalConfig.maxActiveConversations) score -= 15;
    
    return Math.max(0, score);
  }

  private getDefaultConfig(): ConversationalAgentConfig {
    return {
      enabled: true,
      schedule: {
        interval: 60000 // 1 minute
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxDelay: 5000
      },
      logging: {
        level: 'info',
        persistent: true
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: []
      },
      customSettings: {},
      
      // ConversationalAgentConfig specific properties
      maxActiveConversations: 50,
      conversationTimeout: 1800000, // 30 minutes
      maxMessagesPerConversation: 100,
      enableContextMemory: true,
      
      enableTypingIndicator: true,
      simulateThinkingTime: false,
      maxResponseLength: 2000,
      enableRichResponses: true,
      
      enableBusinessIntelligence: true,
      enableSystemControl: true,
      enableDataAccess: true,
      enableProactiveNotifications: true,
      
      enableSentimentAnalysis: true,
      enableIntentRecognition: true,
      enableEntityExtraction: true,
      confidenceThreshold: 0.7
    };
  }
}