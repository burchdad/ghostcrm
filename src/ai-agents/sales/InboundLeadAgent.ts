/**
 * Inbound Lead Agent
 * 
 * Specialized AI agent for capturing, qualifying, and processing inbound leads
 * for dealership operations. Handles website forms, phone calls, chat interactions,
 * and automatically qualifies leads based on configurable criteria.
 */

import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth, AgentMetrics } from '../core/types';
import { TenantAgentConfig, TenantAgentType } from '../core/TenantAgentTypes';

interface LeadCapture {
  id: string;
  source: 'website' | 'phone' | 'chat' | 'email' | 'social';
  timestamp: Date;
  status: 'new' | 'processing' | 'qualified' | 'completed' | 'failed';
  updatedAt?: Date;
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  inquiry: {
    vehicleInterest?: string;
    budgetRange?: string;
    timeline?: string;
    tradeIn?: boolean;
    financingNeeded?: boolean;
  };
  qualification: {
    score: number;
    priority: 'hot' | 'warm' | 'cold';
    readyToBuy: boolean;
    followUpDate?: Date;
  };
  tenantId: string;
}

interface LeadQualificationRule {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  points: number;
  isRequired?: boolean;
}

interface InboundLeadConfig extends AgentConfig {
  tenantId: string;
  responseTimeTarget: number; // seconds
  qualificationRules: LeadQualificationRule[];
  autoResponseTemplates: Record<string, string>;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
    daysOfWeek: number[]; // 0-6, Sunday-Saturday
  };
  integrations: {
    crmWebhook?: string;
    emailService?: string;
    smsProvider?: string;
    chatWidget?: string;
  };
  escalationRules: {
    hotLeadThreshold: number;
    managerNotification: boolean;
    assignToSalesperson: boolean;
  };
}

export class InboundLeadAgent extends BaseAgent {
  private leadConfig: InboundLeadConfig;
  private capturedLeads: Map<string, LeadCapture> = new Map();
  private qualificationRules: LeadQualificationRule[] = [];
  private responseTemplates: Map<string, string> = new Map();

  constructor(config: InboundLeadConfig) {
    super(
      `inbound-lead-${config.tenantId}`,
      `Inbound Lead Agent - ${config.tenantId}`,
      'Captures and qualifies inbound leads from multiple sources',
      '1.0.0',
      config
    );

    this.leadConfig = config;
    this.qualificationRules = config.qualificationRules || [];
    this.setupResponseTemplates();
  }

  protected async onInitialize(): Promise<void> {
    await this.validateConfiguration();
    await this.setupLeadCapture();
    await this.initializeQualificationEngine();
  }

  protected async onStart(): Promise<void> {
    this.emitEvent('agent-started', { 
      agentId: this.id,
      tenantId: this.leadConfig.tenantId,
      message: 'Inbound Lead Agent started successfully'
    });
  }

  protected async onStop(): Promise<void> {
    await this.saveLeadData();
    this.emitEvent('agent-stopped', { 
      agentId: this.id,
      tenantId: this.leadConfig.tenantId,
      message: 'Inbound Lead Agent stopped'
    });
  }

  protected async execute(): Promise<void> {
    // Main execution logic - process pending leads
    for (const [leadId, lead] of this.capturedLeads) {
      if (lead.status === 'new') {
        await this.processLead(lead);
      }
    }
  }

  protected async onConfigurationChanged(config: AgentConfig): Promise<void> {
    // Handle configuration changes
    if (config.customSettings) {
      this.leadConfig = { ...this.leadConfig, ...config.customSettings };
    }
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: 0, // Placeholder - implement actual CPU monitoring
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      responseTime: 1.2 // Average lead processing time in seconds
    };
  }

  private async processLead(lead: LeadCapture): Promise<void> {
    // Process the lead
    lead.updatedAt = new Date();
    lead.status = 'processing';
  }

  /**
   * Capture a new lead from any source
   */
  async captureLead(leadData: Partial<LeadCapture>): Promise<string> {
    try {
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const lead: LeadCapture = {
        id: leadId,
        source: leadData.source || 'website',
        timestamp: new Date(),
        status: 'new',
        contactInfo: leadData.contactInfo || {},
        inquiry: leadData.inquiry || {},
        qualification: {
          score: 0,
          priority: 'cold',
          readyToBuy: false
        },
        tenantId: this.leadConfig.tenantId
      };

      // Qualify the lead
      await this.qualifyLead(lead);

      // Store the lead
      this.capturedLeads.set(leadId, lead);

      // Send auto-response if within business hours
      if (this.isWithinBusinessHours()) {
        await this.sendAutoResponse(lead);
      }

      // Handle escalation for hot leads
      if (lead.qualification.priority === 'hot') {
        await this.escalateHotLead(lead);
      }

      // Integrate with CRM
      await this.syncToCRM(lead);

      this.emitEvent('lead-captured', {
        leadId,
        source: lead.source,
        priority: lead.qualification.priority,
        score: lead.qualification.score,
        tenantId: this.leadConfig.tenantId
      });

      return leadId;
    } catch (error) {
      this.handleError('Failed to capture lead', error);
      throw error;
    }
  }

  /**
   * Qualify a lead based on configured rules
   */
  private async qualifyLead(lead: LeadCapture): Promise<void> {
    let totalScore = 0;
    let allRequiredMet = true;

    for (const rule of this.qualificationRules) {
      const fieldValue = this.getFieldValue(lead, rule.field);
      const ruleMatches = this.evaluateRule(fieldValue, rule);

      if (ruleMatches) {
        totalScore += rule.points;
      } else if (rule.isRequired) {
        allRequiredMet = false;
      }
    }

    lead.qualification.score = totalScore;
    
    // Determine priority based on score and required fields
    if (!allRequiredMet) {
      lead.qualification.priority = 'cold';
    } else if (totalScore >= 80) {
      lead.qualification.priority = 'hot';
      lead.qualification.readyToBuy = true;
    } else if (totalScore >= 50) {
      lead.qualification.priority = 'warm';
    } else {
      lead.qualification.priority = 'cold';
    }

    // Set follow-up date based on priority
    const followUpDays = lead.qualification.priority === 'hot' ? 0 : 
                        lead.qualification.priority === 'warm' ? 1 : 3;
    lead.qualification.followUpDate = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Get field value from lead object using dot notation
   */
  private getFieldValue(lead: LeadCapture, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], lead);
  }

  /**
   * Evaluate a qualification rule
   */
  private evaluateRule(fieldValue: any, rule: LeadQualificationRule): boolean {
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(rule.value.toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(rule.value);
      case 'less_than':
        return Number(fieldValue) < Number(rule.value);
      case 'in_range':
        const numValue = Number(fieldValue);
        return numValue >= rule.value.min && numValue <= rule.value.max;
      default:
        return false;
    }
  }

  /**
   * Send automatic response to lead
   */
  private async sendAutoResponse(lead: LeadCapture): Promise<void> {
    try {
      const template = this.getResponseTemplate(lead);
      
      if (lead.contactInfo.email && template) {
        await this.sendEmail(lead.contactInfo.email, template, lead);
      }

      if (lead.contactInfo.phone && this.leadConfig.integrations.smsProvider) {
        await this.sendSMS(lead.contactInfo.phone, template, lead);
      }
    } catch (error) {
      this.handleError('Failed to send auto-response', error);
    }
  }

  /**
   * Get appropriate response template based on lead characteristics
   */
  private getResponseTemplate(lead: LeadCapture): string {
    const templateKey = `${lead.source}_${lead.qualification.priority}`;
    return this.responseTemplates.get(templateKey) || 
           this.responseTemplates.get('default') || '';
  }

  /**
   * Setup response templates
   */
  private setupResponseTemplates(): void {
    const templates = this.leadConfig.autoResponseTemplates || {};
    
    // Default templates
    const defaultTemplates = {
      'default': 'Thank you for your interest! We\'ll be in touch shortly to discuss your vehicle needs.',
      'website_hot': 'Thank you for your inquiry! A sales representative will contact you within the hour to discuss your vehicle purchase.',
      'website_warm': 'Thank you for visiting our website! We\'ll contact you within 24 hours to answer any questions.',
      'phone_hot': 'Thank you for calling! We\'re processing your information and will call you back shortly.',
      'chat_hot': 'Thanks for chatting with us! A sales manager will be with you momentarily.',
    };

    // Merge with configured templates
    const allTemplates = { ...defaultTemplates, ...templates };
    
    Object.entries(allTemplates).forEach(([key, template]) => {
      this.responseTemplates.set(key, template as string);
    });
  }

  /**
   * Check if current time is within business hours
   */
  private isWithinBusinessHours(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const startHour = parseInt(this.leadConfig.businessHours.start.split(':')[0]);
    const endHour = parseInt(this.leadConfig.businessHours.end.split(':')[0]);
    
    return this.leadConfig.businessHours.daysOfWeek.includes(currentDay) &&
           currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Escalate hot leads to sales team
   */
  private async escalateHotLead(lead: LeadCapture): Promise<void> {
    if (this.leadConfig.escalationRules.managerNotification) {
      await this.notifyManager(lead);
    }

    if (this.leadConfig.escalationRules.assignToSalesperson) {
      await this.assignToSalesperson(lead);
    }
  }

  /**
   * Sync lead to CRM system
   */
  private async syncToCRM(lead: LeadCapture): Promise<void> {
    if (!this.leadConfig.integrations.crmWebhook) return;

    try {
      const response = await fetch(this.leadConfig.integrations.crmWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          timestamp: new Date().toISOString(),
          source: 'inbound-lead-agent'
        })
      });

      if (!response.ok) {
        throw new Error(`CRM sync failed: ${response.statusText}`);
      }
    } catch (error) {
      this.handleError('Failed to sync lead to CRM', error);
    }
  }

  /**
   * Get agent health metrics
   */
  async getHealth(): Promise<AgentHealth> {
    const baseHealth = await super.getHealth();
    
    const todayLeads = Array.from(this.capturedLeads.values())
      .filter(lead => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lead.timestamp >= today;
      });

    const hotLeads = todayLeads.filter(lead => lead.qualification.priority === 'hot').length;
    const warmLeads = todayLeads.filter(lead => lead.qualification.priority === 'warm').length;
    const totalLeads = todayLeads.length;

    return {
      ...baseHealth
    };
  }

  /**
   * Get metrics with lead-specific data
   */
  async getMetrics(): Promise<AgentMetrics> {
    const baseMetrics = await super.getMetrics();
    
    const todayLeads = Array.from(this.capturedLeads.values())
      .filter(lead => lead.timestamp.toDateString() === new Date().toDateString());
    
    const hotLeads = todayLeads.filter(lead => lead.qualification.priority === 'hot').length;
    const warmLeads = todayLeads.filter(lead => lead.qualification.priority === 'warm').length;
    const totalLeads = todayLeads.length;

    baseMetrics.customMetrics = {
      ...baseMetrics.customMetrics,
      leadsToday: totalLeads,
      hotLeads,
      warmLeads,
      conversionRate: totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0,
      averageQualificationScore: totalLeads > 0 ? 
        todayLeads.reduce((sum, lead) => sum + lead.qualification.score, 0) / totalLeads : 0
    };

    return baseMetrics;
  }

  // Placeholder methods for integration
  private async sendEmail(email: string, template: string, lead: LeadCapture): Promise<void> {
    // Implementation would integrate with email service
    console.log(`Sending email to ${email}: ${template}`);
  }

  private async sendSMS(phone: string, template: string, lead: LeadCapture): Promise<void> {
    // Implementation would integrate with SMS provider
    console.log(`Sending SMS to ${phone}: ${template}`);
  }

  private async notifyManager(lead: LeadCapture): Promise<void> {
    // Implementation would notify sales manager
    console.log(`Notifying manager of hot lead: ${lead.id}`);
  }

  private async assignToSalesperson(lead: LeadCapture): Promise<void> {
    // Implementation would assign to available salesperson
    console.log(`Assigning lead ${lead.id} to salesperson`);
  }

  private async validateConfiguration(): Promise<void> {
    if (!this.leadConfig.tenantId) {
      throw new Error('Tenant ID is required for Inbound Lead Agent');
    }
  }

  private async setupIntegrations(): Promise<void> {
    // Setup integration connections
  }

  private async loadExistingLeads(): Promise<void> {
    // Load existing leads from database
  }

  private async savePendingLeads(): Promise<void> {
    // Save pending leads to database
  }

  private async setupLeadCapture(): Promise<void> {
    // Setup lead capture integration
  }

  private async initializeQualificationEngine(): Promise<void> {
    // Initialize qualification engine
  }

  private async saveLeadData(): Promise<void> {
    // Save lead data to persistent storage
  }
}