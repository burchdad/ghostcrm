import OpenAI from 'openai';

// Only initialize OpenAI if API key is available (server-side)
let openai: OpenAI | null = null;
if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface AIAnalysisRequest {
  type: 'lead_analysis' | 'deal_forecast' | 'inventory_optimization' | 'schedule_optimization' | 'team_productivity' | 'workflow_suggestions';
  data: any;
  context?: string;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

export class AIAnalysisService {
  
  async generateInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
    try {
      if (!openai) {
        console.warn('🤖 [AI_ANALYSIS] OpenAI not available, returning mock insights');
        return this.getMockInsights(request);
      }

      const prompt = this.buildPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert CRM AI assistant specialized in analyzing business data and providing actionable insights. Always respond with valid JSON containing an array of insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const insights = JSON.parse(response);
      
      // Validate and format insights
      return this.validateInsights(insights);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Fallback to rule-based insights
      return this.generateFallbackInsights(request);
    }
  }

  private buildPrompt(request: AIAnalysisRequest): string {
    const baseContext = `
      Analyze the following ${request.type.replace('_', ' ')} data and generate actionable insights.
      Return a JSON array of insights, each with the following structure:
      {
        "id": "unique_id",
        "type": "insight_category",
        "title": "Brief insight title",
        "description": "Detailed explanation",
        "recommendation": "Specific action to take",
        "confidence": 0.85,
        "impact": "high",
        "data": { additional_context }
      }
    `;

    switch (request.type) {
      case 'lead_analysis':
        return `${baseContext}
        
        Lead Data Analysis:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Lead quality and conversion potential
        2. Source performance optimization
        3. Follow-up timing recommendations
        4. Lead scoring improvements
        5. Pipeline bottlenecks
        
        Provide 3-5 insights with high business impact.`;

      case 'deal_forecast':
        return `${baseContext}
        
        Deal Pipeline Data:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Revenue forecasting accuracy
        2. Deal progression analysis
        3. Risk assessment for stalled deals
        4. Win/loss pattern insights
        5. Sales velocity optimization
        
        Provide 3-5 insights focused on pipeline optimization.`;

      case 'inventory_optimization':
        return `${baseContext}
        
        Inventory Data:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Pricing optimization opportunities
        2. Slow-moving inventory alerts
        3. Market demand analysis
        4. Profit margin improvements
        5. Turnover rate optimization
        
        Provide 3-5 insights for inventory management.`;

      case 'schedule_optimization':
        return `${baseContext}
        
        Calendar Data:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Meeting efficiency improvements
        2. Schedule conflict resolution
        3. Optimal meeting timing
        4. Calendar utilization analysis
        5. Time blocking recommendations
        
        Provide 3-5 insights for calendar optimization.`;

      case 'team_productivity':
        return `${baseContext}
        
        Team Performance Data:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Team collaboration efficiency
        2. Workload distribution analysis
        3. Communication pattern optimization
        4. Performance bottleneck identification
        5. Productivity improvement suggestions
        
        Provide 3-5 insights for team optimization.`;

      case 'workflow_suggestions':
        return `${baseContext}
        
        Workflow Data:
        ${JSON.stringify(request.data, null, 2)}
        
        Focus on:
        1. Automation opportunities
        2. Process optimization suggestions
        3. Workflow efficiency improvements
        4. Error reduction strategies
        5. Integration recommendations
        
        Provide 3-5 insights for workflow automation.`;

      default:
        return `${baseContext}\n\nData: ${JSON.stringify(request.data, null, 2)}`;
    }
  }

  private validateInsights(insights: any[]): AIInsight[] {
    if (!Array.isArray(insights)) {
      throw new Error('Invalid insights format - expected array');
    }

    return insights.map((insight, index) => ({
      id: insight.id || `insight_${Date.now()}_${index}`,
      type: insight.type || 'analysis',
      title: insight.title || 'AI Insight',
      description: insight.description || 'Analysis completed',
      recommendation: insight.recommendation || 'Review the data for opportunities',
      confidence: Math.max(0, Math.min(1, insight.confidence || 0.7)),
      impact: ['low', 'medium', 'high', 'critical'].includes(insight.impact) ? insight.impact : 'medium',
      data: insight.data || {}
    }));
  }

  private generateFallbackInsights(request: AIAnalysisRequest): AIInsight[] {
    // Rule-based fallback insights when AI is unavailable
    const timestamp = Date.now();
    
    switch (request.type) {
      case 'lead_analysis':
        return [
          {
            id: `lead_insight_${timestamp}`,
            type: 'lead_quality',
            title: 'Lead Quality Analysis',
            description: 'Analyzing lead quality metrics and conversion patterns',
            recommendation: 'Focus on high-scoring leads for immediate follow-up',
            confidence: 0.8,
            impact: 'high',
            data: { source: 'rule_based' }
          }
        ];

      case 'deal_forecast':
        return [
          {
            id: `deal_insight_${timestamp}`,
            type: 'pipeline_forecast',
            title: 'Pipeline Forecast',
            description: 'Revenue projection based on current pipeline data',
            recommendation: 'Review deals in negotiation stage for acceleration opportunities',
            confidence: 0.75,
            impact: 'high',
            data: { source: 'rule_based' }
          }
        ];

      case 'inventory_optimization':
        return [
          {
            id: `inventory_insight_${timestamp}`,
            type: 'pricing_optimization',
            title: 'Pricing Optimization',
            description: 'Inventory pricing analysis for market competitiveness',
            recommendation: 'Consider price adjustments for slow-moving inventory',
            confidence: 0.7,
            impact: 'medium',
            data: { source: 'rule_based' }
          }
        ];

      case 'schedule_optimization':
        return [
          {
            id: `schedule_insight_${timestamp}`,
            type: 'meeting_efficiency',
            title: 'Meeting Efficiency',
            description: 'Calendar utilization and meeting effectiveness analysis',
            recommendation: 'Optimize meeting durations and frequency',
            confidence: 0.6,
            impact: 'medium',
            data: { source: 'rule_based' }
          }
        ];

      case 'team_productivity':
        return [
          {
            id: `team_insight_${timestamp}`,
            type: 'collaboration',
            title: 'Team Collaboration',
            description: 'Team productivity and collaboration pattern analysis',
            recommendation: 'Improve communication channels and workflow coordination',
            confidence: 0.65,
            impact: 'medium',
            data: { source: 'rule_based' }
          }
        ];

      case 'workflow_suggestions':
        return [
          {
            id: `workflow_insight_${timestamp}`,
            type: 'automation',
            title: 'Automation Opportunities',
            description: 'Workflow automation and efficiency improvement analysis',
            recommendation: 'Identify repetitive tasks for automation implementation',
            confidence: 0.7,
            impact: 'high',
            data: { source: 'rule_based' }
          }
        ];

      default:
        return [
          {
            id: `general_insight_${timestamp}`,
            type: 'general',
            title: 'Data Analysis',
            description: 'General data analysis completed',
            recommendation: 'Review data patterns for optimization opportunities',
            confidence: 0.5,
            impact: 'low',
            data: { source: 'rule_based' }
          }
        ];
    }
  }

  async generateLeadScore(leadData: any): Promise<number> {
    try {
      if (!openai) {
        console.warn('🤖 [AI_ANALYSIS] OpenAI not available, using basic lead scoring');
        return this.calculateFallbackLeadScore(leadData);
      }

      const prompt = `
        Calculate a lead score (0-100) based on the following lead data:
        ${JSON.stringify(leadData, null, 2)}
        
        Consider factors like:
        - Contact information completeness
        - Engagement level
        - Company size/industry
        - Source quality
        - Behavioral indicators
        
        Return only a number between 0 and 100.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a lead scoring expert. Calculate accurate lead scores based on provided data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      });

      const response = completion.choices[0]?.message?.content;
      const score = parseInt(response?.trim() || '50');
      
      return Math.max(0, Math.min(100, isNaN(score) ? 50 : score));
      
    } catch (error) {
      console.error('Error generating lead score:', error);
      
      // Fallback scoring logic
      return this.calculateFallbackLeadScore(leadData);
    }
  }

  private calculateFallbackLeadScore(leadData: any): number {
    let score = 0;
    
    // Basic contact info (30 points max)
    if (leadData.email) score += 15;
    if (leadData.phone) score += 10;
    if (leadData.name) score += 5;
    
    // Source quality (20 points max)
    const sourceScores: Record<string, number> = {
      'referral': 20,
      'website': 15,
      'social_media': 10,
      'cold_call': 5,
      'other': 3
    };
    score += sourceScores[leadData.source] || 3;
    
    // Engagement (30 points max)
    if (leadData.last_contacted) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(leadData.last_contacted).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceContact <= 7) score += 15;
      else if (daysSinceContact <= 30) score += 10;
      else score += 5;
    }
    
    // Interest level (20 points max)
    if (leadData.estimated_value) {
      if (leadData.estimated_value > 50000) score += 20;
      else if (leadData.estimated_value > 20000) score += 15;
      else if (leadData.estimated_value > 5000) score += 10;
      else score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private getMockInsights(request: AIAnalysisRequest): AIInsight[] {
    const mockInsights: { [key: string]: AIInsight[] } = {
      'lead_analysis': [
        {
          id: 'mock-lead-1',
          type: 'qualification',
          title: 'High-Priority Leads Identified',
          description: 'Several leads show strong buying signals and should be prioritized for immediate follow-up.',
          recommendation: 'Configure OpenAI integration for detailed lead analysis and personalized insights.',
          confidence: 0.8,
          impact: 'high',
        }
      ],
      'deal_forecast': [
        {
          id: 'mock-deal-1',
          type: 'forecast',
          title: 'Pipeline Analysis Available',
          description: 'AI-powered deal forecasting can help predict closure probability and optimize pipeline.',
          recommendation: 'Enable OpenAI integration for advanced deal forecasting and pipeline insights.',
          confidence: 0.7,
          impact: 'medium',
        }
      ],
      'inventory_optimization': [
        {
          id: 'mock-inventory-1',
          type: 'optimization',
          title: 'Inventory Optimization Ready',
          description: 'AI can help optimize inventory levels and identify pricing opportunities.',
          recommendation: 'Configure OpenAI integration for intelligent inventory management insights.',
          confidence: 0.8,
          impact: 'medium',
        }
      ],
      'schedule_optimization': [
        {
          id: 'mock-schedule-1',
          type: 'scheduling',
          title: 'Schedule Optimization Available',
          description: 'AI can help optimize calendars and suggest better meeting scheduling.',
          recommendation: 'Enable OpenAI integration for smart calendar management and scheduling insights.',
          confidence: 0.7,
          impact: 'medium',
        }
      ],
      'team_productivity': [
        {
          id: 'mock-team-1',
          type: 'productivity',
          title: 'Team Performance Insights',
          description: 'AI analysis can provide insights into team productivity and collaboration patterns.',
          recommendation: 'Configure OpenAI integration for detailed team performance analytics.',
          confidence: 0.8,
          impact: 'high',
        }
      ],
      'workflow_suggestions': [
        {
          id: 'mock-workflow-1',
          type: 'automation',
          title: 'Automation Opportunities',
          description: 'AI can identify workflow automation opportunities to improve efficiency.',
          recommendation: 'Enable OpenAI integration for intelligent workflow optimization suggestions.',
          confidence: 0.7,
          impact: 'medium',
        }
      ]
    };

    return mockInsights[request.type] || [];
  }
}

// Singleton instance
export const aiAnalysisService = new AIAnalysisService();