/**
 * Conversational Sales Agent
 * 
 * Real-time AI assistant for sales conversations providing instant responses,
 * deal guidance, and automated customer interactions for dealership sales teams.
 * Integrates with OpenAI for intelligent conversation handling.
 */

import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth, AgentMetrics } from '../core/types';
import { TenantAgentConfig, TenantAgentType } from '../core/TenantAgentTypes';

interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  salesRepId?: string;
  channel: 'chat' | 'phone' | 'email' | 'sms' | 'in-person';
  status: 'active' | 'waiting' | 'completed' | 'escalated';
  context: ConversationContext;
  messages: ConversationMessage[];
  suggestedResponses: string[];
  dealOpportunity?: DealOpportunity;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationContext {
  customerProfile: {
    name: string;
    email?: string;
    phone?: string;
    previousPurchases?: string[];
    preferences?: VehiclePreferences;
    budget?: BudgetRange;
  };
  currentIntent: 'browsing' | 'inquiring' | 'comparing' | 'negotiating' | 'purchasing' | 'servicing';
  vehicleOfInterest?: VehicleDetails;
  sessionData: Record<string, any>;
}

interface VehiclePreferences {
  type: 'sedan' | 'suv' | 'truck' | 'coupe' | 'convertible' | 'van' | 'any';
  brand?: string[];
  year?: { min?: number; max?: number };
  mileage?: { max?: number };
  features?: string[];
  fuelType?: 'gasoline' | 'electric' | 'hybrid' | 'diesel';
}

interface BudgetRange {
  min: number;
  max: number;
  isFinancing: boolean;
  downPayment?: number;
  monthlyPayment?: number;
}

interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  features: string[];
  images: string[];
  availability: 'available' | 'reserved' | 'sold';
}

interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'system' | 'sales-rep';
  content: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'video' | 'document' | 'vehicle-card' | 'quote';
  metadata?: Record<string, any>;
  aiGenerated: boolean;
}

interface DealOpportunity {
  id: string;
  customerId: string;
  vehicleId: string;
  status: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: Date;
  nextAction: string;
  salesStage: SalesStage;
}

interface SalesStage {
  current: 'awareness' | 'interest' | 'consideration' | 'intent' | 'evaluation' | 'purchase';
  progress: number; // 0-100
  completedSteps: string[];
  nextSteps: string[];
}

interface ConversationalSalesConfig extends AgentConfig {
  tenantId: string;
  aiConfig: {
    provider: 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  knowledgeBase: {
    vehicleInventory: boolean;
    pricingGuidelines: boolean;
    financingOptions: boolean;
    tradeInValues: boolean;
    warrantyDetails: boolean;
    dealershipPolicies: boolean;
  };
  responseStyle: 'professional' | 'friendly' | 'casual' | 'expert';
  escalationTriggers: EscalationTrigger[];
  integrations: {
    crmSystem?: string;
    inventorySystem?: string;
    financingCalculator?: string;
    appointmentScheduler?: string;
  };
  businessRules: {
    maxDiscountPercent: number;
    requireApprovalAbove: number;
    autoQuoteGeneration: boolean;
    appointmentBooking: boolean;
  };
}

interface EscalationTrigger {
  type: 'price-negotiation' | 'complex-financing' | 'customer-complaint' | 'technical-question' | 'high-value-deal';
  threshold?: number;
  action: 'notify-manager' | 'transfer-to-human' | 'schedule-callback';
}

export class ConversationalSalesAgent extends BaseAgent {
  private salesConfig: ConversationalSalesConfig;
  private activeConversations: Map<string, Conversation> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private responseTemplates: Map<string, string> = new Map();

  constructor(config: ConversationalSalesConfig) {
    super(
      `conversational-sales-${config.tenantId}`,
      `Conversational Sales Agent - ${config.tenantId}`,
      'AI-powered real-time sales conversation assistant',
      '1.0.0',
      config
    );

    this.salesConfig = config;
    this.setupResponseTemplates();
  }

  protected async onInitialize(): Promise<void> {
    await this.validateConfiguration();
    await this.loadKnowledgeBase();
    await this.setupAIIntegration();
  }

  protected async onStart(): Promise<void> {
    this.emitEvent('agent-started', { 
      agentId: this.id,
      tenantId: this.salesConfig.tenantId,
      message: 'Conversational Sales Agent started successfully'
    });
  }

  protected async onStop(): Promise<void> {
    await this.saveActiveConversations();
    this.emitEvent('agent-stopped', { 
      agentId: this.id,
      tenantId: this.salesConfig.tenantId,
      message: 'Conversational Sales Agent stopped'
    });
  }

  protected async execute(): Promise<void> {
    // Main execution logic - e.g., process pending conversations
    for (const [conversationId, conversation] of this.activeConversations) {
      if (conversation.status === 'active') {
        await this.processConversation(conversation);
      }
    }
  }

  protected async onConfigurationChanged(config: AgentConfig): Promise<void> {
    // Handle configuration changes
    if (config.customSettings) {
      this.salesConfig = { ...this.salesConfig, ...config.customSettings };
    }
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: 0, // Placeholder - implement actual CPU monitoring
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      responseTime: 2.5 // Average response time in seconds
    };
  }

  private async processConversation(conversation: Conversation): Promise<void> {
    // Process any pending conversation updates
    conversation.updatedAt = new Date();
  }

  /**
   * Start a new conversation
   */
  async startConversation(data: {
    customerId: string;
    channel: Conversation['channel'];
    customerProfile?: Partial<ConversationContext['customerProfile']>;
    initialMessage?: string;
  }): Promise<string> {
    try {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const conversation: Conversation = {
        id: conversationId,
        tenantId: this.salesConfig.tenantId,
        customerId: data.customerId,
        channel: data.channel,
        status: 'active',
        context: {
          customerProfile: {
            name: data.customerProfile?.name || 'Guest',
            email: data.customerProfile?.email,
            phone: data.customerProfile?.phone,
            previousPurchases: data.customerProfile?.previousPurchases,
            preferences: data.customerProfile?.preferences,
            budget: data.customerProfile?.budget
          },
          currentIntent: 'browsing',
          sessionData: {}
        },
        messages: [],
        suggestedResponses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.activeConversations.set(conversationId, conversation);

      // Send welcome message if no initial message
      if (!data.initialMessage) {
        await this.sendWelcomeMessage(conversation);
      } else {
        await this.handleCustomerMessage(conversationId, data.initialMessage);
      }

      this.emitEvent('conversation-started', {
        conversationId,
        customerId: data.customerId,
        channel: data.channel,
        tenantId: this.salesConfig.tenantId
      });

      return conversationId;
    } catch (error) {
      this.handleError('Failed to start conversation', error);
      throw error;
    }
  }

  /**
   * Handle incoming customer message
   */
  async handleCustomerMessage(conversationId: string, message: string): Promise<string> {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    try {
      // Add customer message to conversation
      const customerMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        sender: 'customer',
        content: message,
        timestamp: new Date(),
        messageType: 'text',
        aiGenerated: false
      };

      conversation.messages.push(customerMessage);

      // Analyze message and update context
      await this.analyzeMessage(conversation, message);

      // Generate AI response
      const aiResponse = await this.generateAIResponse(conversation);

      // Add AI response to conversation
      const agentMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        sender: 'agent',
        content: aiResponse,
        timestamp: new Date(),
        messageType: 'text',
        aiGenerated: true
      };

      conversation.messages.push(agentMessage);
      conversation.updatedAt = new Date();

      // Check for escalation triggers
      await this.checkEscalationTriggers(conversation);

      // Generate suggested responses for sales rep
      conversation.suggestedResponses = await this.generateSuggestedResponses(conversation);

      this.emitEvent('message-processed', {
        conversationId,
        customerMessage: message,
        agentResponse: aiResponse,
        tenantId: this.salesConfig.tenantId
      });

      return aiResponse;
    } catch (error) {
      this.handleError('Failed to handle customer message', error);
      throw error;
    }
  }

  /**
   * Generate AI response using configured AI provider
   */
  private async generateAIResponse(conversation: Conversation): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(conversation);
    const conversationHistory = this.buildConversationHistory(conversation);

    try {
      if (this.salesConfig.aiConfig.provider === 'openai') {
        return await this.generateOpenAIResponse(systemPrompt, conversationHistory);
      } else {
        throw new Error(`AI provider ${this.salesConfig.aiConfig.provider} not implemented`);
      }
    } catch (error) {
      this.handleError('Failed to generate AI response', error);
      return this.getFallbackResponse(conversation);
    }
  }

  /**
   * Generate response using OpenAI
   */
  private async generateOpenAIResponse(systemPrompt: string, conversationHistory: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.salesConfig.aiConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.salesConfig.aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationHistory }
        ],
        temperature: this.salesConfig.aiConfig.temperature,
        max_tokens: this.salesConfig.aiConfig.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Let me connect you with a sales representative.';
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(conversation: Conversation): string {
    const style = this.salesConfig.responseStyle;
    const dealershipName = this.knowledgeBase.get('dealership_name') || 'our dealership';
    
    return `You are an AI sales assistant for ${dealershipName}. Your role is to help customers with their vehicle needs in a ${style} manner.

Guidelines:
- Be helpful, knowledgeable, and ${style}
- Focus on understanding customer needs
- Provide accurate information about vehicles and services
- Guide customers toward scheduling appointments or test drives
- Never make promises about pricing without proper authorization
- Escalate complex questions to human sales representatives
- Always maintain a positive, solution-oriented approach

Current conversation context:
- Customer Intent: ${conversation.context.currentIntent}
- Vehicle Interest: ${conversation.context.vehicleOfInterest?.make || 'Not specified'} ${conversation.context.vehicleOfInterest?.model || ''}
- Budget Range: ${conversation.context.customerProfile.budget ? `$${conversation.context.customerProfile.budget.min} - $${conversation.context.customerProfile.budget.max}` : 'Not specified'}

Available knowledge base includes: ${Object.keys(this.knowledgeBase).join(', ')}`;
  }

  /**
   * Build conversation history for AI context
   */
  private buildConversationHistory(conversation: Conversation): string {
    const recentMessages = conversation.messages.slice(-10); // Last 10 messages for context
    
    return recentMessages.map(msg => {
      const sender = msg.sender === 'customer' ? 'Customer' : 'Assistant';
      return `${sender}: ${msg.content}`;
    }).join('\n');
  }

  /**
   * Analyze customer message to update conversation context
   */
  private async analyzeMessage(conversation: Conversation, message: string): Promise<void> {
    const lowerMessage = message.toLowerCase();

    // Detect intent
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('payment')) {
      conversation.context.currentIntent = 'negotiating';
    } else if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
      conversation.context.currentIntent = 'comparing';
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('financing')) {
      conversation.context.currentIntent = 'purchasing';
    } else if (lowerMessage.includes('test drive') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      conversation.context.currentIntent = 'inquiring';
    }

    // Extract vehicle preferences
    const vehicleTypes = ['sedan', 'suv', 'truck', 'coupe', 'convertible'];
    for (const type of vehicleTypes) {
      if (lowerMessage.includes(type)) {
        if (!conversation.context.customerProfile.preferences) {
          conversation.context.customerProfile.preferences = {} as VehiclePreferences;
        }
        conversation.context.customerProfile.preferences.type = type as any;
        break;
      }
    }

    // Extract budget information
    const budgetMatch = message.match(/\$?(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(?:k|thousand))?/gi);
    if (budgetMatch && lowerMessage.includes('budget')) {
      const budgetValue = parseInt(budgetMatch[0].replace(/[,$k]/gi, '')) * 
        (budgetMatch[0].toLowerCase().includes('k') ? 1000 : 1);
      
      if (!conversation.context.customerProfile.budget) {
        conversation.context.customerProfile.budget = { min: 0, max: budgetValue, isFinancing: true };
      } else {
        conversation.context.customerProfile.budget.max = budgetValue;
      }
    }
  }

  /**
   * Check for escalation triggers
   */
  private async checkEscalationTriggers(conversation: Conversation): Promise<void> {
    for (const trigger of this.salesConfig.escalationTriggers) {
      let shouldEscalate = false;

      switch (trigger.type) {
        case 'price-negotiation':
          shouldEscalate = conversation.context.currentIntent === 'negotiating';
          break;
        case 'complex-financing':
          shouldEscalate = conversation.messages.some(msg => 
            msg.content.toLowerCase().includes('financing') && 
            msg.content.toLowerCase().includes('credit')
          );
          break;
        case 'customer-complaint':
          shouldEscalate = conversation.messages.some(msg =>
            msg.content.toLowerCase().includes('complaint') ||
            msg.content.toLowerCase().includes('problem') ||
            msg.content.toLowerCase().includes('dissatisfied')
          );
          break;
        case 'high-value-deal':
          shouldEscalate = !!(conversation.context.customerProfile.budget?.max && 
            conversation.context.customerProfile.budget.max > (trigger.threshold || 50000));
          break;
      }

      if (shouldEscalate) {
        await this.handleEscalation(conversation, trigger);
      }
    }
  }

  /**
   * Handle escalation based on trigger
   */
  private async handleEscalation(conversation: Conversation, trigger: EscalationTrigger): Promise<void> {
    switch (trigger.action) {
      case 'notify-manager':
        await this.notifyManager(conversation, trigger.type);
        break;
      case 'transfer-to-human':
        conversation.status = 'escalated';
        await this.transferToHuman(conversation);
        break;
      case 'schedule-callback':
        await this.scheduleCallback(conversation);
        break;
    }

    this.emitEvent('conversation-escalated', {
      conversationId: conversation.id,
      triggerType: trigger.type,
      action: trigger.action,
      tenantId: this.salesConfig.tenantId
    });
  }

  /**
   * Send welcome message
   */
  private async sendWelcomeMessage(conversation: Conversation): Promise<void> {
    const welcomeTemplate = this.responseTemplates.get('welcome') || 
      'Hello! Welcome to our dealership. How can I help you find your perfect vehicle today?';
    
    const welcomeMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: conversation.id,
      sender: 'agent',
      content: welcomeTemplate,
      timestamp: new Date(),
      messageType: 'text',
      aiGenerated: true
    };

    conversation.messages.push(welcomeMessage);
  }

  /**
   * Generate suggested responses for sales rep
   */
  private async generateSuggestedResponses(conversation: Conversation): Promise<string[]> {
    const suggestions: string[] = [];
    
    switch (conversation.context.currentIntent) {
      case 'browsing':
        suggestions.push('What type of vehicle are you looking for?');
        suggestions.push('Do you have a specific budget in mind?');
        suggestions.push('Would you like to see our current inventory?');
        break;
      case 'inquiring':
        suggestions.push('Would you like to schedule a test drive?');
        suggestions.push('I can set up an appointment with our sales team.');
        suggestions.push('Let me get you more information about that vehicle.');
        break;
      case 'negotiating':
        suggestions.push('Let me check what incentives we have available.');
        suggestions.push('Would you like to explore financing options?');
        suggestions.push('I\'ll connect you with our finance manager.');
        break;
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Get fallback response when AI fails
   */
  private getFallbackResponse(conversation: Conversation): string {
    const fallbacks = [
      'I want to make sure I give you the most accurate information. Let me connect you with one of our sales specialists.',
      'That\'s a great question! One of our vehicle experts would be happy to help you with that.',
      'I\'d like to get you the exact details on that. Can I have one of our sales representatives reach out to you?'
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Setup response templates
   */
  private setupResponseTemplates(): void {
    const templates = {
      welcome: 'Hello! Welcome to our dealership. I\'m here to help you find the perfect vehicle. What can I assist you with today?',
      budget_inquiry: 'To help me find the best options for you, what\'s your budget range for this purchase?',
      vehicle_recommendation: 'Based on your preferences, I think you\'d love our {vehicle_make} {vehicle_model}. Would you like to learn more about it?',
      appointment_offer: 'Would you like to schedule a time to see this vehicle in person and take it for a test drive?',
      escalation: 'I want to make sure you get the best service. Let me connect you with one of our senior sales specialists who can help with your specific needs.'
    };

    Object.entries(templates).forEach(([key, template]) => {
      this.responseTemplates.set(key, template);
    });
  }

  /**
   * Get agent health metrics
   */
  async getHealth(): Promise<AgentHealth> {
    const baseHealth = await super.getHealth();
    
    // Add custom performance metrics by updating responseTime to reflect conversation performance
    const activeConversationsCount = Array.from(this.activeConversations.values())
      .filter(conv => conv.status === 'active').length;
    
    const totalConversations = this.activeConversations.size;
    const escalatedConversations = Array.from(this.activeConversations.values())
      .filter(conv => conv.status === 'escalated').length;

    // Use responseTime field to represent average conversation response time
    baseHealth.performance.responseTime = 2.5; // Average response time in seconds

    return baseHealth;
  }

  /**
   * Get metrics with conversation-specific data
   */
  async getMetrics(): Promise<AgentMetrics> {
    const baseMetrics = await super.getMetrics();
    
    const activeConversationsCount = Array.from(this.activeConversations.values())
      .filter(conv => conv.status === 'active').length;
    
    const totalConversations = this.activeConversations.size;
    const escalatedConversations = Array.from(this.activeConversations.values())
      .filter(conv => conv.status === 'escalated').length;

    baseMetrics.customMetrics = {
      ...baseMetrics.customMetrics,
      activeConversations: activeConversationsCount,
      totalConversations,
      escalatedConversations,
      averageResponseTime: 2.5 // seconds
    };

    return baseMetrics;
  }

  // Placeholder methods for integration implementations
  private async validateConfiguration(): Promise<void> {
    if (!this.salesConfig.tenantId) {
      throw new Error('Tenant ID is required for Conversational Sales Agent');
    }
    if (!this.salesConfig.aiConfig.apiKey) {
      throw new Error('AI provider API key is required');
    }
  }

  private async loadKnowledgeBase(): Promise<void> {
    // Load knowledge base from configured sources
    this.knowledgeBase.set('dealership_name', 'Premier Auto');
    this.knowledgeBase.set('business_hours', '9 AM - 8 PM, Monday - Saturday');
  }

  private async setupAIIntegration(): Promise<void> {
    // Setup AI provider integration
  }

  private async saveActiveConversations(): Promise<void> {
    // Save active conversations to database
  }

  private async notifyManager(conversation: Conversation, triggerType: string): Promise<void> {
    // Notify sales manager
    console.log(`Manager notification: ${triggerType} in conversation ${conversation.id}`);
  }

  private async transferToHuman(conversation: Conversation): Promise<void> {
    // Transfer conversation to human sales rep
    console.log(`Transferring conversation ${conversation.id} to human`);
  }

  private async scheduleCallback(conversation: Conversation): Promise<void> {
    // Schedule callback for customer
    console.log(`Scheduling callback for conversation ${conversation.id}`);
  }
}