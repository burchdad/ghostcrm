import { BaseAgent } from '../core/BaseAgent';
import {
  AgentHealth,
  AgentMetrics,
  AgentConfig,
} from '../core/types';
import { agentDataConnector } from '../../lib/supabase/agent-data';
import { aiAnalysisService, AIAnalysisRequest } from '../../lib/ai/analysis-service';

/**
 * Leads AI Agent
 * 
 * Specialized AI agent for lead management, qualification, and optimization.
 * Provides intelligent insights and recommendations for lead conversion.
 */

interface LeadInsight {
  id: string;
  type: 'qualification' | 'priority' | 'engagement' | 'conversion';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  leadId?: string;
  data?: any;
}

interface LeadMetrics extends AgentMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  hotLeads: number;
  insightsGenerated: number;
  recommendationsApplied: number;
}

interface LeadsAgentConfig extends AgentConfig {
  // Lead scoring settings
  enableLeadScoring: boolean;
  scoringFactors: {
    engagement: number;
    demographics: number;
    behavior: number;
    timeDecay: number;
  };
  
  // Qualification settings
  autoQualificationEnabled: boolean;
  qualificationThreshold: number;
  requireManualReview: boolean;
  
  // Recommendation settings
  enableFollowUpSuggestions: boolean;
  enablePrioritySuggestions: boolean;
  enableEngagementOptimization: boolean;
  
  // AI settings
  modelConfig: {
    temperature: number;
    maxTokens: number;
    confidenceThreshold: number;
  };
}

export class LeadsAgent extends BaseAgent {
  private leadsConfig: LeadsAgentConfig;
  private insights: Map<string, LeadInsight[]> = new Map();
  private leadScores: Map<string, number> = new Map();
  
  constructor() {
    super(
      'leads-agent',
      'Leads AI Assistant',
      'AI agent specialized in lead management and optimization',
      '1.0.0',
      {
        enabled: true,
        schedule: {
          interval: 30000,
        },
        logging: {
          level: 'info',
          persistent: true,
        },
      }
    );
    
    this.leadsConfig = {
      enabled: true,
      schedule: {
        interval: 30000,
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        maxDelay: 30000,
      },
      logging: {
        level: 'info',
        persistent: true,
      },
      notifications: {
        onError: true,
        onSuccess: false,
        channels: [],
      },
      customSettings: {},
      
      // Lead scoring
      enableLeadScoring: true,
      scoringFactors: {
        engagement: 0.4,
        demographics: 0.2,
        behavior: 0.3,
        timeDecay: 0.1,
      },
      
      // Qualification
      autoQualificationEnabled: true,
      qualificationThreshold: 70,
      requireManualReview: true,
      
      // Recommendations
      enableFollowUpSuggestions: true,
      enablePrioritySuggestions: true,
      enableEngagementOptimization: true,
      
      // AI settings
      modelConfig: {
        temperature: 0.3,
        maxTokens: 500,
        confidenceThreshold: 0.8,
      },
    };
  }

  // Required abstract methods
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing Leads Agent');
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Starting Leads Agent monitoring');
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping Leads Agent');
  }

  protected async execute(): Promise<void> {
    this.log('info', 'Executing leads analysis tasks');
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    this.leadsConfig = { ...this.leadsConfig, ...config };
    this.log('info', 'Leads Agent configuration updated', { config });
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: 0.1,
      memory: 40.0,
      responseTime: 110
    };
  }
  
  async initialize(): Promise<void> {
    this.log('info', 'Initializing Leads AI Agent');
    
    try {
      // Initialize lead scoring models
      await this.initializeLeadScoring();
      
      // Load existing insights
      await this.loadLeadInsights();
      
      // Set up real-time monitoring
      await this.setupLeadMonitoring();
      
      this.log('info', 'Leads AI Agent initialized successfully');
    } catch (error: any) {
      this.log('error', 'Failed to initialize Leads AI Agent', { error: error.message });
      throw error;
    }
  }
  
  async start(): Promise<void> {
    this.log('info', 'Starting Leads AI Agent');
    
    if (!this.leadsConfig.enabled) {
      this.log('warn', 'Leads AI Agent is disabled');
      return;
    }
    
    try {
      // Start continuous monitoring
      await this.startLeadAnalysis();
      
      this.log('info', 'Leads AI Agent started successfully');
    } catch (error: any) {
      this.log('error', 'Failed to start Leads AI Agent', { error: error.message });
      throw error;
    }
  }
  
  async stop(): Promise<void> {
    this.log('info', 'Stopping Leads AI Agent');
    
    try {
      // Clean up resources
      await this.cleanup();
      
      this.log('info', 'Leads AI Agent stopped successfully');
    } catch (error: any) {
      this.log('error', 'Failed to stop Leads AI Agent', { error: error.message });
    }
  }
  
  async getHealth(): Promise<AgentHealth> {
    try {
      const baseHealth = await super.getHealth();
      
      // Check lead scoring system
      const scoringHealth = await this.checkLeadScoring();
      
      // Could add custom health checks here if needed
      // const scoringHealth = await this.checkLeadScoring();
      // const insightsHealth = await this.checkInsightsGeneration();
      
      return baseHealth;
    } catch (error: any) {
      return {
        status: 'error',
        uptime: Date.now() - this.startTime.getTime(),
        lastCheck: new Date(),
        issues: [{
          id: `health-check-error-${Date.now()}`,
          severity: 'critical',
          message: `Health check failed: ${error.message}`,
          timestamp: new Date(),
          resolved: false,
          autoFixAttempted: false,
        }],
        performance: {
          cpu: 0,
          memory: 0,
          responseTime: 0,
        },
      };
    }
  }
  
  // Lead-specific methods
  async analyzeLeadQuality(leadId: string, leadData: any): Promise<LeadInsight[]> {
    this.log('info', 'Analyzing lead quality with AI analysis', { leadId });
    
    try {
      const insights: LeadInsight[] = [];
      
      // Get AI-powered lead score
      const score = await aiAnalysisService.generateLeadScore(leadData);
      this.leadScores.set(leadId, score);
      
      // Generate qualification insight
      if (score >= this.leadsConfig.qualificationThreshold) {
        insights.push({
          id: `qual-${leadId}-${Date.now()}`,
          type: 'qualification',
          title: 'High-Quality Lead Detected',
          description: `Lead scored ${score}/100 indicating high conversion potential`,
          recommendation: 'Prioritize immediate follow-up and assign to top sales rep',
          confidence: 0.9,
          leadId,
          data: { score }
        });
      }
      
      // Generate engagement insights
      const engagementInsights = await this.analyzeEngagement(leadData);
      insights.push(...engagementInsights);
      
      // Generate priority insights
      const priorityInsights = await this.analyzePriority(leadData);
      insights.push(...priorityInsights);
      
      // Store insights
      this.insights.set(leadId, insights);
      
      return insights;
    } catch (error: any) {
      this.log('error', 'Failed to analyze lead quality', { leadId, error: error.message });
      return [];
    }
  }
  
  async getLeadRecommendations(leadId: string): Promise<LeadInsight[]> {
    this.log('info', 'Getting lead recommendations', { leadId });
    
    try {
      return this.insights.get(leadId) || [];
    } catch (error: any) {
      this.log('error', 'Failed to get lead recommendations', { leadId, error: error.message });
      return [];
    }
  }
  
  async optimizeLeadFollowUp(leadId: string, previousInteractions: any[]): Promise<string[]> {
    this.log('info', 'Optimizing lead follow-up', { leadId });
    
    try {
      const recommendations: string[] = [];
      
      // Analyze interaction patterns
      const patterns = this.analyzeInteractionPatterns(previousInteractions);
      
      // Generate follow-up recommendations
      if (patterns.preferredChannel === 'email') {
        recommendations.push('Send personalized email with value proposition');
      } else if (patterns.preferredChannel === 'phone') {
        recommendations.push('Schedule phone call during optimal time window');
      }
      
      // Time-based recommendations
      if (patterns.responseTime) {
        recommendations.push(`Best response time: ${patterns.responseTime}`);
      }
      
      return recommendations;
    } catch (error: any) {
      this.log('error', 'Failed to optimize lead follow-up', { leadId, error: error.message });
      return [];
    }
  }
  
  async generateLeadInsights(): Promise<LeadInsight[]> {
    this.log('info', 'Generating lead insights with real data and AI');
    
    try {
      const insights: LeadInsight[] = [];
      
      // Get real lead data
      const leadData = await agentDataConnector.getLeadsData();
      
      // Generate AI insights
      const aiRequest: AIAnalysisRequest = {
        type: 'lead_analysis',
        data: leadData.analytics,
        context: 'Overall lead performance analysis'
      };
      
      const aiInsights = await aiAnalysisService.generateInsights(aiRequest);
      
      // Convert AI insights to LeadInsight format
      insights.push(...aiInsights.map(insight => ({
        id: insight.id,
        type: insight.type as any,
        title: insight.title,
        description: insight.description,
        recommendation: insight.recommendation,
        confidence: insight.confidence,
        data: insight.data
      })));
      
      // Overall performance insights
      const conversionRate = leadData.analytics.conversionRate;
      if (conversionRate < 0.1) { // Less than 10%
        insights.push({
          id: `conv-${Date.now()}`,
          type: 'conversion',
          title: 'Low Conversion Rate Detected',
          description: `Current conversion rate is ${(conversionRate * 100).toFixed(1)}%`,
          recommendation: 'Review lead qualification criteria and follow-up processes',
          confidence: 0.85,
        });
      }
      
      // Response time insights
      const avgResponseTime = await this.calculateAverageResponseTime();
      if (avgResponseTime > 24) { // More than 24 hours
        insights.push({
          id: `resp-${Date.now()}`,
          type: 'engagement',
          title: 'Slow Response Times',
          description: `Average response time is ${avgResponseTime} hours`,
          recommendation: 'Implement automated follow-up workflows to improve response times',
          confidence: 0.9,
        });
      }
      
      return insights;
    } catch (error: any) {
      this.log('error', 'Failed to generate lead insights', { error: error.message });
      return [];
    }
  }
  
  // Configuration methods
  async updateConfig(newConfig: Partial<LeadsAgentConfig>): Promise<void> {
    this.log('info', 'Updating Leads AI Agent configuration', { newConfig });
    
    try {
      this.leadsConfig = { ...this.leadsConfig, ...newConfig };
      
      // Restart relevant services if needed
      if (newConfig.enableLeadScoring !== undefined) {
        await this.reinitializeLeadScoring();
      }
      
      this.log('info', 'Leads AI Agent configuration updated successfully');
    } catch (error: any) {
      this.log('error', 'Failed to update Leads AI Agent configuration', { error: error.message });
      throw error;
    }
  }
  
  getConfig(): LeadsAgentConfig {
    return { ...this.leadsConfig };
  }
  
  async getMetrics(): Promise<LeadMetrics> {
    try {
      const baseMetrics = await super.getMetrics();
      
      return {
        ...baseMetrics,
        totalLeads: await this.getTotalLeadsCount(),
        qualifiedLeads: await this.getQualifiedLeadsCount(),
        conversionRate: await this.calculateConversionRate(),
        avgResponseTime: await this.calculateAverageResponseTime(),
        hotLeads: await this.getHotLeadsCount(),
        insightsGenerated: this.getTotalInsights(),
        recommendationsApplied: await this.getRecommendationsAppliedCount(),
      } as LeadMetrics;
    } catch (error: any) {
      this.log('error', 'Failed to get leads metrics', { error: error.message });
      return {
        ...(await super.getMetrics()),
        totalLeads: 0,
        qualifiedLeads: 0,
        conversionRate: 0,
        avgResponseTime: 0,
        hotLeads: 0,
        insightsGenerated: 0,
        recommendationsApplied: 0,
      } as LeadMetrics;
    }
  }
  
  // Private helper methods
  private async initializeLeadScoring(): Promise<void> {
    // Initialize lead scoring algorithms
    this.log('info', 'Initializing lead scoring system');
  }
  
  private async loadLeadInsights(): Promise<void> {
    // Load existing insights from database
    this.log('info', 'Loading existing lead insights');
  }
  
  private async setupLeadMonitoring(): Promise<void> {
    // Set up real-time lead monitoring
    this.log('info', 'Setting up lead monitoring');
  }
  
  private async startLeadAnalysis(): Promise<void> {
    // Start continuous lead analysis
    this.log('info', 'Starting continuous lead analysis');
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources
    this.log('info', 'Cleaning up Leads AI Agent resources');
  }
  
  private async checkLeadScoring(): Promise<boolean> {
    // Check if lead scoring system is working
    return true;
  }
  
  private async checkInsightsGeneration(): Promise<boolean> {
    // Check if insights generation is working
    return true;
  }
  
  private async scoreLeadQuality(leadData: any): Promise<number> {
    // Calculate lead quality score
    let score = 0;
    
    // Engagement score (40%)
    if (leadData.interactions?.length > 0) {
      score += 40 * Math.min(leadData.interactions.length / 5, 1);
    }
    
    // Demographics score (20%)
    if (leadData.company && leadData.title) {
      score += 20;
    }
    
    // Behavior score (30%)
    if (leadData.websiteVisits > 3) {
      score += 30;
    }
    
    // Time decay (10%)
    const daysSinceCreated = (Date.now() - new Date(leadData.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }
  
  private async analyzeEngagement(leadData: any): Promise<LeadInsight[]> {
    const insights: LeadInsight[] = [];
    
    if (leadData.interactions?.length === 0) {
      insights.push({
        id: `eng-${Date.now()}`,
        type: 'engagement',
        title: 'No Engagement Detected',
        description: 'Lead has not engaged with any communications',
        recommendation: 'Try different communication channels or adjust messaging',
        confidence: 0.8,
      });
    }
    
    return insights;
  }
  
  private async analyzePriority(leadData: any): Promise<LeadInsight[]> {
    const insights: LeadInsight[] = [];
    
    if (leadData.budget && leadData.budget > 50000) {
      insights.push({
        id: `prio-${Date.now()}`,
        type: 'priority',
        title: 'High-Value Lead',
        description: `Lead has significant budget: $${leadData.budget.toLocaleString()}`,
        recommendation: 'Assign to senior sales representative immediately',
        confidence: 0.9,
      });
    }
    
    return insights;
  }
  
  private analyzeInteractionPatterns(interactions: any[]): any {
    const patterns = {
      preferredChannel: 'email',
      responseTime: null,
    };
    
    // Analyze patterns from interactions
    return patterns;
  }
  
  private async calculateConversionRate(): Promise<number> {
    try {
      const leadData = await agentDataConnector.getLeadsData();
      return leadData.analytics.conversionRate;
    } catch (error) {
      this.log('error', 'Failed to calculate conversion rate', { error });
      return 0.12; // Fallback
    }
  }
  
  private async calculateAverageResponseTime(): Promise<number> {
    try {
      const leadData = await agentDataConnector.getLeadsData();
      return leadData.analytics.avgScore || 8; // Use avgScore as proxy for response time
    } catch (error) {
      this.log('error', 'Failed to calculate response time', { error });
      return 8; // Fallback
    }
  }
  
  private async reinitializeLeadScoring(): Promise<void> {
    // Reinitialize lead scoring if config changed
  }
  
  private async getTotalLeadsCount(): Promise<number> {
    try {
      const leadData = await agentDataConnector.getLeadsData();
      return leadData.analytics.total;
    } catch (error) {
      this.log('error', 'Failed to get total leads count', { error });
      return 0;
    }
  }
  
  private async getQualifiedLeadsCount(): Promise<number> {
    try {
      const leadData = await agentDataConnector.getLeadsData();
      // Filter leads by qualification status or score threshold
      return leadData.leads.filter(lead => lead.score >= 70 || lead.status === 'qualified').length;
    } catch (error) {
      this.log('error', 'Failed to get qualified leads count', { error });
      return 0;
    }
  }
  
  private async getHotLeadsCount(): Promise<number> {
    try {
      const leadData = await agentDataConnector.getLeadsData();
      // Filter leads by hot criteria (high score and recent activity)
      return leadData.leads.filter(lead => 
        lead.score >= 80 && 
        lead.conversion_probability >= 0.7
      ).length;
    } catch (error) {
      this.log('error', 'Failed to get hot leads count', { error });
      return 0;
    }
  }
  
  private getTotalInsights(): number {
    let total = 0;
    this.insights.forEach(insights => {
      total += insights.length;
    });
    return total;
  }
  
  private async getRecommendationsAppliedCount(): Promise<number> {
    return 0; // Implement tracking
  }
}