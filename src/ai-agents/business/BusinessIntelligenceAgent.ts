import { BaseAgent } from '../core/BaseAgent';
import {
  AgentHealth,
  AgentMetrics,
  AgentConfig,
} from '../core/types';

/**
 * Business Intelligence Agent
 * 
 * Provides conversational business intelligence, data insights, and recommendations.
 * This agent analyzes CRM data to answer business questions and provide proactive insights.
 */

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  category: 'sales' | 'leads' | 'revenue' | 'performance' | 'customers';
  timestamp: Date;
}

interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  category: 'opportunity' | 'warning' | 'achievement' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  actionable: boolean;
  recommendations: string[];
  timestamp: Date;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  previousQuestions: string[];
  currentFocus: string;
  preferences: Record<string, any>;
  lastInteraction: Date;
}

interface BusinessIntelligenceMetrics extends AgentMetrics {
  totalQueries: number;
  avgResponseTime: number;
  insightsGenerated: number;
  conversationsActive: number;
  businessMetricsTracked: number;
  dataSourcesConnected: number;
  accuracyScore: number;
  userSatisfactionScore: number;
}

interface BusinessIntelligenceConfig extends AgentConfig {
  // Data analysis settings
  enableRealTimeAnalysis: boolean;
  dataRefreshInterval: number; // ms
  historicalDataPeriod: number; // days
  
  // Conversation settings
  enableConversationalMode: boolean;
  conversationTimeout: number; // ms
  maxConversationHistory: number;
  
  // Insight settings
  enableProactiveInsights: boolean;
  insightGenerationInterval: number; // ms
  minimumDataThreshold: number;
  
  // Business metrics
  trackSalesMetrics: boolean;
  trackRevenueMetrics: boolean;
  trackCustomerMetrics: boolean;
  trackPerformanceMetrics: boolean;
  
  // AI/ML settings
  enablePredictiveAnalytics: boolean;
  enableTrendAnalysis: boolean;
  enableAnomalyDetection: boolean;
}

export class BusinessIntelligenceAgent extends BaseAgent {
  private businessMetrics: Map<string, BusinessMetric> = new Map();
  private insights: BusinessInsight[] = [];
  private conversations: Map<string, ConversationContext> = new Map();
  private biConfig: BusinessIntelligenceConfig;
  private dataCache: Map<string, any> = new Map();
  
  constructor() {
    super(
      'business-intelligence-agent',
      'Business Intelligence Agent',
      'Provides business insights, analytics, and data-driven recommendations',
      '1.0.0'
    );
    this.biConfig = this.getDefaultConfig();
  }

  // Abstract method implementations required by BaseAgent
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Business Intelligence Agent...');
    await this.initializeBusinessMetrics();
    this.startDataAnalysis();
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Starting Business Intelligence Agent...');
    await this.initializeBusinessMetrics();
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping Business Intelligence Agent...');
  }

  protected async execute(): Promise<void> {
    await this.collectMetrics();
    await this.generateInsights();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    this.log('info', 'Business Intelligence configuration updated');
    this.biConfig = { ...this.biConfig, ...config };
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 200 + 100
    };
  }

  protected async doStart(): Promise<void> {
    this.log('info', 'Starting Business Intelligence Agent...');
    
    // Initialize data connections
    await this.initializeDataSources();
    
    // Start data analysis
    this.startDataAnalysis();
    
    // Start insight generation
    if (this.biConfig.enableProactiveInsights) {
      this.startInsightGeneration();
    }
    
    this.log('info', 'Business Intelligence Agent started successfully');
  }

  protected async doStop(): Promise<void> {
    this.log('info', 'Stopping Business Intelligence Agent...');
    this.clearIntervals();
    this.log('info', 'Business Intelligence Agent stopped');
  }

  protected async checkHealth(): Promise<AgentHealth> {
    try {
      const metrics = await this.collectMetrics() as BusinessIntelligenceMetrics;
      const healthPercentage = this.calculateHealthPercentage(metrics);
      
      const issues = [];
      
      // Check data connectivity
      if (metrics.dataSourcesConnected === 0) {
        issues.push({
          severity: 'critical' as const,
          message: 'No data sources connected',
          code: 'NO_DATA_SOURCES',
          timestamp: new Date(),
        });
      }
      
      // Check accuracy
      if (metrics.accuracyScore < 80) {
        issues.push({
          severity: 'warning' as const,
          message: `Low accuracy score: ${metrics.accuracyScore}%`,
          code: 'LOW_ACCURACY',
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

  protected async collectMetrics(): Promise<BusinessIntelligenceMetrics> {
    return {
      // Base AgentMetrics properties
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: this.getAverageResponseTime(),
      lastExecution: new Date(),
      customMetrics: {},
      // BusinessIntelligenceMetrics specific properties
      totalQueries: this.getTotalQueries(),
      avgResponseTime: this.getAverageResponseTime(),
      insightsGenerated: this.insights.length,
      conversationsActive: this.conversations.size,
      businessMetricsTracked: this.businessMetrics.size,
      dataSourcesConnected: this.getConnectedDataSources(),
      accuracyScore: this.calculateAccuracyScore(),
      userSatisfactionScore: this.calculateSatisfactionScore(),
    };
  }

  /**
   * Main conversational interface for business questions
   */
  public async askBusinessQuestion(
    question: string,
    userId: string,
    sessionId?: string
  ): Promise<{
    answer: string;
    insights: BusinessInsight[];
    recommendations: string[];
    followUpQuestions: string[];
    data?: any;
  }> {
    const startTime = Date.now();
    
    try {
      this.log('info', 'Processing business question', { question, userId });
      
      // Get or create conversation context
      const context = this.getConversationContext(userId, sessionId);
      
      // Update conversation history
      context.previousQuestions.push(question);
      if (context.previousQuestions.length > this.biConfig.maxConversationHistory) {
        context.previousQuestions.shift();
      }
      
      // Analyze the question and determine intent
      const intent = this.analyzeQuestionIntent(question);
      context.currentFocus = intent.category;
      
      // Generate response based on intent
      const response = await this.generateBusinessResponse(question, intent, context);
      
      // Update conversation context
      context.lastInteraction = new Date();
      this.conversations.set(`${userId}:${sessionId || 'default'}`, context);
      
      const responseTime = Date.now() - startTime;
      this.log('info', 'Business question processed', { 
        question, 
        responseTime,
        intent: intent.category 
      });
      
      return response;
      
    } catch (error) {
      this.log('error', 'Failed to process business question', { question, error });
      throw error;
    }
  }

  /**
   * Get proactive business insights
   */
  public async getProactiveInsights(userId: string): Promise<BusinessInsight[]> {
    try {
      // Filter insights relevant to user
      const relevantInsights = this.insights
        .filter(insight => insight.priority === 'high' || insight.priority === 'critical')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
      
      return relevantInsights;
    } catch (error) {
      this.log('error', 'Failed to get proactive insights', { error });
      return [];
    }
  }

  /**
   * Get business metrics summary
   */
  public async getBusinessMetricsSummary(): Promise<{
    sales: BusinessMetric[];
    revenue: BusinessMetric[];
    customers: BusinessMetric[];
    performance: BusinessMetric[];
  }> {
    const allMetrics = Array.from(this.businessMetrics.values());
    
    return {
      sales: allMetrics.filter(m => m.category === 'sales'),
      revenue: allMetrics.filter(m => m.category === 'revenue'),
      customers: allMetrics.filter(m => m.category === 'customers'),
      performance: allMetrics.filter(m => m.category === 'performance'),
    };
  }

  /**
   * Initialize data source connections
   */
  private async initializeDataSources(): Promise<void> {
    this.log('info', 'Initializing business data sources...');
    
    try {
      // In real implementation, connect to:
      // - Supabase for CRM data
      // - Analytics APIs
      // - External integrations
      // - Financial systems
      
      // Initialize business metrics
      await this.initializeBusinessMetrics();
      
      this.log('info', 'Business data sources initialized successfully');
    } catch (error) {
      this.log('error', 'Failed to initialize data sources', { error });
      throw error;
    }
  }

  /**
   * Initialize business metrics tracking
   */
  private async initializeBusinessMetrics(): Promise<void> {
    const sampleMetrics: BusinessMetric[] = [
      {
        id: 'monthly_revenue',
        name: 'Monthly Revenue',
        value: 45000,
        previousValue: 38000,
        changePercent: 18.4,
        trend: 'up',
        category: 'revenue',
        timestamp: new Date(),
      },
      {
        id: 'new_leads',
        name: 'New Leads This Month',
        value: 127,
        previousValue: 98,
        changePercent: 29.6,
        trend: 'up',
        category: 'leads',
        timestamp: new Date(),
      },
      {
        id: 'conversion_rate',
        name: 'Lead Conversion Rate',
        value: 23.5,
        previousValue: 19.2,
        changePercent: 22.4,
        trend: 'up',
        category: 'performance',
        timestamp: new Date(),
      },
      {
        id: 'active_customers',
        name: 'Active Customers',
        value: 342,
        previousValue: 318,
        changePercent: 7.5,
        trend: 'up',
        category: 'customers',
        timestamp: new Date(),
      },
      {
        id: 'avg_deal_size',
        name: 'Average Deal Size',
        value: 3240,
        previousValue: 2890,
        changePercent: 12.1,
        trend: 'up',
        category: 'sales',
        timestamp: new Date(),
      },
    ];
    
    for (const metric of sampleMetrics) {
      this.businessMetrics.set(metric.id, metric);
    }
  }

  /**
   * Start automated data analysis
   */
  private startDataAnalysis(): void {
    setInterval(async () => {
      await this.analyzeBusinessData();
    }, this.biConfig.dataRefreshInterval);
  }

  /**
   * Start automated insight generation
   */
  private startInsightGeneration(): void {
    setInterval(async () => {
      await this.generateInsights();
    }, this.biConfig.insightGenerationInterval);
  }

  /**
   * Analyze business data for patterns and trends
   */
  private async analyzeBusinessData(): Promise<void> {
    try {
      // Update business metrics with fresh data
      await this.refreshBusinessMetrics();
      
      // Perform trend analysis
      if (this.biConfig.enableTrendAnalysis) {
        await this.analyzeTrends();
      }
      
      // Detect anomalies
      if (this.biConfig.enableAnomalyDetection) {
        await this.detectAnomalies();
      }
      
    } catch (error) {
      this.log('error', 'Data analysis failed', { error });
    }
  }

  /**
   * Generate proactive business insights
   */
  private async generateInsights(): Promise<void> {
    try {
      const newInsights: BusinessInsight[] = [];
      
      // Revenue insights
      const revenueMetric = this.businessMetrics.get('monthly_revenue');
      if (revenueMetric && revenueMetric.changePercent > 15) {
        newInsights.push({
          id: `revenue_growth_${Date.now()}`,
          title: 'Strong Revenue Growth Detected',
          description: `Monthly revenue is up ${revenueMetric.changePercent.toFixed(1)}% to $${revenueMetric.value.toLocaleString()}`,
          category: 'achievement',
          priority: 'high',
          data: { metric: revenueMetric },
          actionable: true,
          recommendations: [
            'Consider scaling successful sales strategies',
            'Analyze which products/services are driving growth',
            'Increase marketing budget for high-performing channels'
          ],
          timestamp: new Date(),
        });
      }
      
      // Lead conversion insights
      const conversionRate = this.businessMetrics.get('conversion_rate');
      if (conversionRate && conversionRate.changePercent > 20) {
        newInsights.push({
          id: `conversion_improvement_${Date.now()}`,
          title: 'Lead Conversion Rate Improvement',
          description: `Conversion rate improved by ${conversionRate.changePercent.toFixed(1)}% to ${conversionRate.value}%`,
          category: 'achievement',
          priority: 'medium',
          data: { metric: conversionRate },
          actionable: true,
          recommendations: [
            'Document what changed in the sales process',
            'Train other sales team members on successful techniques',
            'Apply these improvements to other product lines'
          ],
          timestamp: new Date(),
        });
      }
      
      // Add new insights
      this.insights.push(...newInsights);
      
      // Limit insights history
      if (this.insights.length > 100) {
        this.insights = this.insights.slice(-100);
      }
      
    } catch (error) {
      this.log('error', 'Insight generation failed', { error });
    }
  }

  /**
   * Analyze question intent
   */
  private analyzeQuestionIntent(question: string): {
    category: string;
    type: string;
    entities: string[];
    timeframe?: string;
  } {
    const lowerQuestion = question.toLowerCase();
    
    // Determine category
    let category = 'general';
    if (lowerQuestion.includes('sales') || lowerQuestion.includes('revenue') || lowerQuestion.includes('deal')) {
      category = 'sales';
    } else if (lowerQuestion.includes('lead') || lowerQuestion.includes('prospect')) {
      category = 'leads';
    } else if (lowerQuestion.includes('customer') || lowerQuestion.includes('client')) {
      category = 'customers';
    } else if (lowerQuestion.includes('performance') || lowerQuestion.includes('metric')) {
      category = 'performance';
    }
    
    // Determine type
    let type = 'informational';
    if (lowerQuestion.includes('how') || lowerQuestion.includes('why')) {
      type = 'analytical';
    } else if (lowerQuestion.includes('what if') || lowerQuestion.includes('predict')) {
      type = 'predictive';
    } else if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest')) {
      type = 'advisory';
    }
    
    // Extract entities (simplified)
    const entities: string[] = [];
    const timeframeMatch = lowerQuestion.match(/(this month|last month|this quarter|this year|today|yesterday)/);
    const timeframe = timeframeMatch ? timeframeMatch[1] : undefined;
    
    return { category, type, entities, timeframe };
  }

  /**
   * Generate business response based on question and context
   */
  private async generateBusinessResponse(
    question: string,
    intent: any,
    context: ConversationContext
  ): Promise<{
    answer: string;
    insights: BusinessInsight[];
    recommendations: string[];
    followUpQuestions: string[];
    data?: any;
  }> {
    const relevantMetrics = Array.from(this.businessMetrics.values())
      .filter(m => m.category === intent.category || intent.category === 'general');
    
    const relevantInsights = this.insights
      .filter(i => i.category !== 'warning')
      .slice(-3);
    
    // Generate contextual answer
    let answer = '';
    let data: any = {};
    
    if (intent.category === 'sales') {
      const salesMetrics = relevantMetrics.filter(m => m.category === 'sales' || m.category === 'revenue');
      answer = this.generateSalesAnswer(salesMetrics);
      data = { salesMetrics };
    } else if (intent.category === 'leads') {
      const leadMetrics = relevantMetrics.filter(m => m.category === 'leads');
      answer = this.generateLeadsAnswer(leadMetrics);
      data = { leadMetrics };
    } else if (intent.category === 'customers') {
      const customerMetrics = relevantMetrics.filter(m => m.category === 'customers');
      answer = this.generateCustomerAnswer(customerMetrics);
      data = { customerMetrics };
    } else {
      answer = this.generateGeneralAnswer(relevantMetrics);
      data = { allMetrics: relevantMetrics };
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(intent, relevantMetrics);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(intent, context);
    
    return {
      answer,
      insights: relevantInsights,
      recommendations,
      followUpQuestions,
      data,
    };
  }

  /**
   * Generate sales-specific answer
   */
  private generateSalesAnswer(metrics: BusinessMetric[]): string {
    const revenueMetric = metrics.find(m => m.id === 'monthly_revenue');
    const dealSizeMetric = metrics.find(m => m.id === 'avg_deal_size');
    
    if (revenueMetric && dealSizeMetric) {
      return `Your sales performance is strong this month! Revenue is at $${revenueMetric.value.toLocaleString()}, which is ${revenueMetric.changePercent.toFixed(1)}% higher than last month. Your average deal size has also improved to $${dealSizeMetric.value.toLocaleString()}, up ${dealSizeMetric.changePercent.toFixed(1)}%. This indicates both more deals and higher-value transactions.`;
    }
    
    return 'Let me analyze your sales data to provide specific insights...';
  }

  /**
   * Generate leads-specific answer
   */
  private generateLeadsAnswer(metrics: BusinessMetric[]): string {
    const leadsMetric = metrics.find(m => m.id === 'new_leads');
    const conversionMetric = this.businessMetrics.get('conversion_rate');
    
    if (leadsMetric && conversionMetric) {
      return `Your lead generation is performing well with ${leadsMetric.value} new leads this month, up ${leadsMetric.changePercent.toFixed(1)}% from last month. More importantly, your conversion rate has improved to ${conversionMetric.value}%, which means you're not just getting more leads but converting them more effectively.`;
    }
    
    return 'Let me analyze your lead generation data...';
  }

  /**
   * Generate customer-specific answer
   */
  private generateCustomerAnswer(metrics: BusinessMetric[]): string {
    const customerMetric = metrics.find(m => m.id === 'active_customers');
    
    if (customerMetric) {
      return `You currently have ${customerMetric.value} active customers, representing a ${customerMetric.changePercent.toFixed(1)}% growth. This steady customer base growth indicates good retention and acquisition balance.`;
    }
    
    return 'Let me analyze your customer data...';
  }

  /**
   * Generate general business answer
   */
  private generateGeneralAnswer(metrics: BusinessMetric[]): string {
    const positiveMetrics = metrics.filter(m => m.changePercent > 0);
    const negativeMetrics = metrics.filter(m => m.changePercent < 0);
    
    return `Overall, your business is performing well with ${positiveMetrics.length} key metrics showing positive growth. Revenue, leads, and customer satisfaction are all trending upward. ${negativeMetrics.length > 0 ? `There are ${negativeMetrics.length} areas that need attention.` : 'All major indicators are positive.'}`;
  }

  /**
   * Generate contextual recommendations
   */
  private generateRecommendations(intent: any, metrics: BusinessMetric[]): string[] {
    const recommendations: string[] = [];
    
    const strongMetrics = metrics.filter(m => m.changePercent > 15);
    const weakMetrics = metrics.filter(m => m.changePercent < -5);
    
    if (strongMetrics.length > 0) {
      recommendations.push(`Double down on strategies driving ${strongMetrics[0].name} growth`);
    }
    
    if (weakMetrics.length > 0) {
      recommendations.push(`Investigate and address declining ${weakMetrics[0].name}`);
    }
    
    if (intent.category === 'sales') {
      recommendations.push('Consider implementing sales automation tools');
      recommendations.push('Analyze top-performing sales activities for replication');
    }
    
    return recommendations;
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(intent: any, context: ConversationContext): string[] {
    const questions: string[] = [];
    
    if (intent.category === 'sales') {
      questions.push('Which sales rep is performing best this month?');
      questions.push('What\'s driving the increase in average deal size?');
      questions.push('How do our sales compare to last quarter?');
    } else if (intent.category === 'leads') {
      questions.push('Which lead sources are most effective?');
      questions.push('What\'s our cost per lead this month?');
      questions.push('How can we improve lead quality?');
    }
    
    questions.push('Show me a detailed breakdown of these metrics');
    questions.push('What should I focus on this week?');
    
    return questions;
  }

  // Helper methods for metrics calculation
  private getTotalQueries(): number {
    return this.conversations.size * 5; // Simplified
  }

  private getAverageResponseTime(): number {
    return Math.random() * 1000 + 500; // Simulated
  }

  private getConnectedDataSources(): number {
    return 3; // Simulated: Supabase, Analytics, External APIs
  }

  private calculateAccuracyScore(): number {
    return Math.random() * 20 + 80; // 80-100%
  }

  private calculateSatisfactionScore(): number {
    return Math.random() * 15 + 85; // 85-100%
  }

  private calculateHealthPercentage(metrics: BusinessIntelligenceMetrics): number {
    let score = 100;
    
    if (metrics.dataSourcesConnected === 0) score -= 50;
    if (metrics.accuracyScore < 80) score -= 20;
    if (metrics.avgResponseTime > 5000) score -= 15;
    if (metrics.userSatisfactionScore < 80) score -= 15;
    
    return Math.max(0, score);
  }

  private getConversationContext(userId: string, sessionId?: string): ConversationContext {
    const key = `${userId}:${sessionId || 'default'}`;
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        userId,
        sessionId: sessionId || 'default',
        previousQuestions: [],
        currentFocus: 'general',
        preferences: {},
        lastInteraction: new Date(),
      });
    }
    
    return this.conversations.get(key)!;
  }

  private async refreshBusinessMetrics(): Promise<void> {
    // In real implementation, fetch fresh data from Supabase
    // Update metrics with new values
  }

  private async analyzeTrends(): Promise<void> {
    // Implement trend analysis logic
  }

  private async detectAnomalies(): Promise<void> {
    // Implement anomaly detection logic
  }

  private clearIntervals(): void {
    // Clear all intervals when stopping
  }

  private getDefaultConfig(): BusinessIntelligenceConfig {
    return {
      enabled: true,
      schedule: {
        interval: 300000 // 5 minutes
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
      
      // Data analysis settings
      enableRealTimeAnalysis: true,
      dataRefreshInterval: 300000, // 5 minutes
      historicalDataPeriod: 90, // 90 days
      
      // Conversation settings
      enableConversationalMode: true,
      conversationTimeout: 1800000, // 30 minutes
      maxConversationHistory: 10,
      
      // Insight settings
      enableProactiveInsights: true,
      insightGenerationInterval: 600000, // 10 minutes
      minimumDataThreshold: 100,
      
      // Business metrics
      trackSalesMetrics: true,
      trackRevenueMetrics: true,
      trackCustomerMetrics: true,
      trackPerformanceMetrics: true,
      
      // AI/ML settings
      enablePredictiveAnalytics: true,
      enableTrendAnalysis: true,
      enableAnomalyDetection: true
    };
  }
}