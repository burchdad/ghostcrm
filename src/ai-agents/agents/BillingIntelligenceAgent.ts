import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth } from '../core/types';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { stripe } from '@/lib/stripe';
import OpenAI from 'openai';

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  customerCount: number;
  averageRevenuePerUser: number;
  churnRate: number;
  customerLifetimeValue: number;
  conversionRate: number;
}

interface PaymentEvent {
  id: string;
  type: 'payment_success' | 'payment_failed' | 'subscription_created' | 'subscription_cancelled' | 'trial_ending';
  customerId: string;
  amount: number;
  currency: string;
  timestamp: string;
  metadata: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface ChurnPrediction {
  customerId: string;
  customerEmail: string;
  riskScore: number; // 0-100
  churnProbability: number; // 0-1
  factors: string[];
  recommendations: string[];
  retentionActions: string[];
  nextBillingDate: string;
}

interface RevenueAnomaly {
  type: 'revenue_drop' | 'payment_spike' | 'unusual_refunds' | 'subscription_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  timestamp: string;
  recommendations: string[];
}

export class BillingIntelligenceAgent extends BaseAgent {
  id = 'billing-intelligence';
  name = 'Billing Intelligence Agent';
  description = 'Monitors billing metrics, predicts churn, detects payment anomalies, and optimizes revenue operations';
  version = '1.0.0';
  
  private openai: OpenAI;
  private lastBillingCheck: Date = new Date();
  private billingMetrics: BillingMetrics | null = null;
  private paymentEvents: PaymentEvent[] = [];
  private churnPredictions: ChurnPrediction[] = [];
  private revenueAnomalies: RevenueAnomaly[] = [];
  
  constructor() {
    super(
      'billing-intelligence', // id
      'Billing Intelligence Agent', // name
      'Monitors billing metrics, predicts churn, detects payment anomalies, and optimizes revenue operations', // description
      '1.0.0' // version
    );
    
    // Only initialize OpenAI if API key is available (server-side)
    if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
    }
  }

  // Implement abstract methods from BaseAgent
  protected async onInitialize(): Promise<void> {
    await this.initialize();
  }

  protected async onStart(): Promise<void> {
    // Optionally start monitoring or other startup logic
    await this.startBillingMonitoring();
  }

  protected async onStop(): Promise<void> {
    // Optionally cleanup resources or stop intervals
    // For now, do nothing
  }

  protected async execute(): Promise<void> {
    await this.calculateBillingMetrics();
    await this.performChurnAnalysis();
    await this.detectRevenueAnomalies();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    console.log('💰 [BILLING_AGENT] Configuration updated');
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 200 + 100
    };
  }

  // Public method to get billing intelligence status
  async getBillingIntelligenceStatus() {
    return await this.getBillingStatus();
  }

  async initialize(): Promise<void> {
    console.log(`💰 [BILLING_AGENT] Initializing Billing Intelligence Agent v${this.version}`);
    
    // Start billing monitoring
    await this.startBillingMonitoring();
    await this.calculateBillingMetrics();
    await this.analyzePaymentPatterns();
    
    console.log('💰 [BILLING_AGENT] Billing intelligence monitoring initialized');
  }

  async getBillingStatus() {
    const recentEvents = this.paymentEvents.filter(
      event => new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const failedPayments = recentEvents.filter(event => event.type === 'payment_failed');
    const highRiskCustomers = this.churnPredictions.filter(pred => pred.riskScore > 70);
    const criticalAnomalies = this.revenueAnomalies.filter(
      anomaly => anomaly.severity === 'critical' && 
      new Date(anomaly.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      status: criticalAnomalies.length > 0 ? 'critical' : 
              failedPayments.length > 10 ? 'warning' : 'healthy',
      lastCheck: this.lastBillingCheck.toISOString(),
      metrics: this.billingMetrics,
      recentActivity: {
        paymentsLast24h: recentEvents.length,
        failedPayments: failedPayments.length,
        successfulPayments: recentEvents.filter(e => e.type === 'payment_success').length,
        newSubscriptions: recentEvents.filter(e => e.type === 'subscription_created').length,
        cancellations: recentEvents.filter(e => e.type === 'subscription_cancelled').length
      },
      riskMetrics: {
        highRiskCustomers: highRiskCustomers.length,
        averageChurnRisk: this.calculateAverageChurnRisk(),
        predictedMonthlyChurn: this.predictMonthlyChurn(),
        revenueAtRisk: this.calculateRevenueAtRisk()
      },
      anomalies: this.revenueAnomalies.slice(0, 5),
      recommendations: await this.getBillingRecommendations()
    };
  }

  async performAction(action: string, params?: any) {
    console.log(`💰 [BILLING_AGENT] Performing action: ${action}`);

    switch (action) {
      case 'analyze_revenue':
        return await this.analyzeRevenueTrends(params?.timeRange || '30d');
      
      case 'predict_churn':
        return await this.predictCustomerChurn(params?.customerId);
      
      case 'payment_analysis':
        return await this.analyzePaymentFailures(params?.timeRange || '7d');
      
      case 'revenue_forecast':
        return await this.forecastRevenue(params?.months || 3);
      
      case 'billing_health_check':
        return await this.performBillingHealthCheck();
      
      case 'retention_campaign':
        return await this.suggestRetentionCampaign(params?.riskThreshold || 70);
      
      case 'pricing_optimization':
        return await this.analyzePricingOptimization();
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async startBillingMonitoring(): Promise<void> {
    // Monitor payment events every 5 minutes
    setInterval(async () => {
      await this.monitorPaymentEvents();
    }, 300000);

    // Update billing metrics every 15 minutes
    setInterval(async () => {
      await this.calculateBillingMetrics();
    }, 900000);

    // Churn prediction analysis every hour
    setInterval(async () => {
      await this.performChurnAnalysis();
    }, 3600000);

    // Revenue anomaly detection every 30 minutes
    setInterval(async () => {
      await this.detectRevenueAnomalies();
    }, 1800000);
  }

  private async monitorPaymentEvents(): Promise<void> {
    try {
      // Simulate monitoring Stripe webhook events
      const recentEvents = await this.fetchRecentPaymentEvents();
      
      for (const event of recentEvents) {
        await this.processPaymentEvent(event);
      }

    } catch (error) {
      console.error('💰 [BILLING_AGENT] Error monitoring payment events:', error);
    }
  }

  private async fetchRecentPaymentEvents(): Promise<any[]> {
    // In production, this would fetch from Stripe and database
    // For now, simulate some events
    const events: any[] = [];
    const eventTypes = ['payment_success', 'payment_failed', 'subscription_created', 'subscription_cancelled'];
    
    for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
      events.push({
        id: `evt_${Date.now()}_${i}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        customerId: `cus_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.floor(Math.random() * 10000) + 1000,
        currency: 'usd',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        metadata: {}
      });
    }
    
    return events;
  }

  private async processPaymentEvent(event: any): Promise<void> {
    const paymentEvent: PaymentEvent = {
      id: event.id,
      type: event.type,
      customerId: event.customerId,
      amount: event.amount,
      currency: event.currency,
      timestamp: event.timestamp,
      metadata: event.metadata,
      severity: this.determineSeverity(event)
    };

    this.paymentEvents.unshift(paymentEvent);
    
    // Keep only last 1000 events
    if (this.paymentEvents.length > 1000) {
      this.paymentEvents = this.paymentEvents.slice(0, 1000);
    }

    // Analyze for immediate issues
    if (paymentEvent.type === 'payment_failed') {
      await this.handlePaymentFailure(paymentEvent);
    }

    if (paymentEvent.type === 'subscription_cancelled') {
      await this.handleSubscriptionCancellation(paymentEvent);
    }
  }

  private async calculateBillingMetrics(): Promise<void> {
    try {
      // In production, calculate from actual data
      // For now, simulate metrics
      this.billingMetrics = {
        totalRevenue: Math.floor(Math.random() * 100000) + 50000,
        monthlyRecurringRevenue: Math.floor(Math.random() * 20000) + 10000,
        annualRecurringRevenue: Math.floor(Math.random() * 240000) + 120000,
        customerCount: Math.floor(Math.random() * 500) + 200,
        averageRevenuePerUser: Math.floor(Math.random() * 200) + 50,
        churnRate: Math.random() * 0.1, // 0-10%
        customerLifetimeValue: Math.floor(Math.random() * 5000) + 1000,
        conversionRate: 0.05 + Math.random() * 0.15 // 5-20%
      };

      this.lastBillingCheck = new Date();

    } catch (error) {
      console.error('💰 [BILLING_AGENT] Error calculating billing metrics:', error);
    }
  }

  private async analyzePaymentPatterns(): Promise<void> {
    try {
      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Analyze payment patterns for insights. Look for trends, seasonality,
            payment method preferences, failure patterns. Return JSON with:
            patterns (array), insights (array), concerns (array), opportunities (array).`
          },
          {
            role: "user",
            content: `Recent payment events: ${JSON.stringify(this.paymentEvents.slice(0, 50))}`
          }
        ],
        max_tokens: 600,
        temperature: 0.1
      });

      const result = JSON.parse(analysis.choices[0]?.message?.content || '{}');
      
      // Store insights for reporting
      console.log('💰 [BILLING_AGENT] Payment pattern analysis:', result);

    } catch (error) {
      console.error('💰 [BILLING_AGENT] Error analyzing payment patterns:', error);
    }
  }

  private async performChurnAnalysis(): Promise<void> {
    try {
      // Get customer data for churn prediction
      const customers = await this.getCustomersForChurnAnalysis();
      
      for (const customer of customers) {
        const prediction = await this.predictChurnForCustomer(customer);
        
        if (prediction.riskScore > 50) {
          this.churnPredictions.push(prediction);
        }
      }

      // Keep only recent predictions
      this.churnPredictions = this.churnPredictions.filter(
        pred => new Date(pred.nextBillingDate) > new Date()
      );

    } catch (error) {
      console.error('💰 [BILLING_AGENT] Error performing churn analysis:', error);
    }
  }

  private async getCustomersForChurnAnalysis(): Promise<any[]> {
    // In production, fetch from database
    // For now, simulate customer data
    const customers: any[] = [];
    
    for (let i = 0; i < 20; i++) {
      customers.push({
        id: `cus_${Math.random().toString(36).substr(2, 9)}`,
        email: `customer${i}@example.com`,
        subscriptionStart: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastPayment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        monthlyValue: Math.floor(Math.random() * 500) + 50,
        paymentFailures: Math.floor(Math.random() * 3),
        supportTickets: Math.floor(Math.random() * 5),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        usageMetrics: {
          loginsPerMonth: Math.floor(Math.random() * 30) + 1,
          featuresUsed: Math.floor(Math.random() * 10) + 1,
          dataVolume: Math.floor(Math.random() * 1000) + 100
        }
      });
    }
    
    return customers;
  }

  private async predictChurnForCustomer(customer: any): Promise<ChurnPrediction> {
    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze customer data to predict churn risk. Consider payment history,
          usage patterns, support interactions, engagement metrics. Return JSON with:
          riskScore (0-100), churnProbability (0-1), factors (array), 
          recommendations (array), retentionActions (array).`
        },
        {
          role: "user",
          content: `Customer data: ${JSON.stringify(customer)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const result = JSON.parse(analysis.choices[0]?.message?.content || '{}');

    return {
      customerId: customer.id,
      customerEmail: customer.email,
      riskScore: result.riskScore || 0,
      churnProbability: result.churnProbability || 0,
      factors: result.factors || [],
      recommendations: result.recommendations || [],
      retentionActions: result.retentionActions || [],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private async detectRevenueAnomalies(): Promise<void> {
    try {
      if (!this.billingMetrics) return;

      const recentRevenue = this.calculateRecentRevenue();
      const expectedRevenue = this.billingMetrics.monthlyRecurringRevenue;
      
      const variance = Math.abs(recentRevenue - expectedRevenue) / expectedRevenue;
      
      if (variance > 0.2) { // 20% variance threshold
        const anomaly: RevenueAnomaly = {
          type: recentRevenue < expectedRevenue ? 'revenue_drop' : 'payment_spike',
          severity: variance > 0.5 ? 'critical' : variance > 0.3 ? 'high' : 'medium',
          description: `Revenue variance of ${(variance * 100).toFixed(1)}% detected`,
          impact: Math.abs(recentRevenue - expectedRevenue),
          timestamp: new Date().toISOString(),
          recommendations: await this.getAnomalyRecommendations(variance, recentRevenue < expectedRevenue)
        };

        this.revenueAnomalies.unshift(anomaly);
        
        if (this.revenueAnomalies.length > 50) {
          this.revenueAnomalies = this.revenueAnomalies.slice(0, 50);
        }
      }

    } catch (error) {
      console.error('💰 [BILLING_AGENT] Error detecting revenue anomalies:', error);
    }
  }

  private async analyzeRevenueTrends(timeRange: string): Promise<any> {
    const events = this.getEventsInTimeRange(timeRange);
    const revenue = events
      .filter(e => e.type === 'payment_success')
      .reduce((sum, e) => sum + e.amount, 0);

    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze revenue trends and provide insights. Return JSON with:
          trendDirection (up/down/stable), growthRate (number), insights (array),
          recommendations (array), forecast (object).`
        },
        {
          role: "user",
          content: `Revenue data for ${timeRange}: 
          Total Revenue: $${revenue}
          Payment Events: ${JSON.stringify(events)}`
        }
      ],
      max_tokens: 600,
      temperature: 0.1
    });

    return JSON.parse(analysis.choices[0]?.message?.content || '{}');
  }

  private async predictCustomerChurn(customerId?: string): Promise<any> {
    if (customerId) {
      const prediction = this.churnPredictions.find(p => p.customerId === customerId);
      return prediction || { error: 'Customer not found' };
    }

    return {
      highRiskCustomers: this.churnPredictions.filter(p => p.riskScore > 70),
      mediumRiskCustomers: this.churnPredictions.filter(p => p.riskScore > 40 && p.riskScore <= 70),
      totalAtRisk: this.churnPredictions.length,
      predictedChurnValue: this.calculateRevenueAtRisk()
    };
  }

  private async analyzePaymentFailures(timeRange: string): Promise<any> {
    const failures = this.getEventsInTimeRange(timeRange)
      .filter(e => e.type === 'payment_failed');

    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze payment failures for patterns and solutions. Return JSON with:
          patterns (array), rootCauses (array), preventionStrategies (array),
          recoveryActions (array).`
        },
        {
          role: "user",
          content: `Payment failures in ${timeRange}: ${JSON.stringify(failures)}`
        }
      ],
      max_tokens: 600,
      temperature: 0.1
    });

    return {
      ...JSON.parse(analysis.choices[0]?.message?.content || '{}'),
      totalFailures: failures.length,
      failureRate: failures.length / this.getEventsInTimeRange(timeRange).length,
      impactAmount: failures.reduce((sum, f) => sum + f.amount, 0)
    };
  }

  private async forecastRevenue(months: number): Promise<any> {
    const forecast = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Create revenue forecast based on current metrics and trends. 
          Return JSON with monthly projections, growth assumptions, confidence intervals.`
        },
        {
          role: "user",
          content: `Current metrics: ${JSON.stringify(this.billingMetrics)}
          Forecast months: ${months}
          Recent trends: ${JSON.stringify(this.paymentEvents.slice(0, 100))}`
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    return JSON.parse(forecast.choices[0]?.message?.content || '{}');
  }

  private async performBillingHealthCheck(): Promise<any> {
    const healthScore = this.calculateBillingHealthScore();
    
    return {
      healthScore,
      status: healthScore >= 8 ? 'excellent' : 
              healthScore >= 6 ? 'good' : 
              healthScore >= 4 ? 'needs_attention' : 'critical',
      metrics: this.billingMetrics,
      issues: await this.identifyBillingIssues(),
      recommendations: await this.getBillingHealthRecommendations(healthScore)
    };
  }

  private async suggestRetentionCampaign(riskThreshold: number): Promise<any> {
    const highRiskCustomers = this.churnPredictions.filter(
      pred => pred.riskScore >= riskThreshold
    );

    const campaign = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Design retention campaign for high-risk customers. Return JSON with:
          campaign strategy, target segments, messaging, incentives, timeline.`
        },
        {
          role: "user",
          content: `High-risk customers: ${JSON.stringify(highRiskCustomers)}`
        }
      ],
      max_tokens: 700,
      temperature: 0.2
    });

    return JSON.parse(campaign.choices[0]?.message?.content || '{}');
  }

  private async analyzePricingOptimization(): Promise<any> {
    const optimization = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze pricing strategy for optimization opportunities. Return JSON with:
          currentPricingAnalysis, optimizationOpportunities, competitiveInsights,
          revenueImpact, recommendations.`
        },
        {
          role: "user",
          content: `Current metrics: ${JSON.stringify(this.billingMetrics)}
          Customer behavior: ${JSON.stringify(this.churnPredictions.slice(0, 20))}`
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    return JSON.parse(optimization.choices[0]?.message?.content || '{}');
  }

  // Helper methods
  private determineSeverity(event: any): PaymentEvent['severity'] {
    switch (event.type) {
      case 'payment_failed':
        return 'error';
      case 'subscription_cancelled':
        return 'warning';
      case 'payment_success':
        return 'info';
      default:
        return 'info';
    }
  }

  private async handlePaymentFailure(event: PaymentEvent): Promise<void> {
    console.log(`⚠️ [BILLING_AGENT] Payment failure detected:`, event);
    
    // In production, trigger automated recovery flows:
    // - Retry payment with different method
    // - Send customer notification
    // - Update dunning management
    // - Flag for manual review if needed
  }

  private async handleSubscriptionCancellation(event: PaymentEvent): Promise<void> {
    console.log(`📉 [BILLING_AGENT] Subscription cancellation detected:`, event);
    
    // In production, trigger retention flows:
    // - Send win-back email
    // - Offer discounts or downgrades
    // - Collect cancellation feedback
    // - Update churn analytics
  }

  private calculateAverageChurnRisk(): number {
    if (this.churnPredictions.length === 0) return 0;
    const totalRisk = this.churnPredictions.reduce((sum, pred) => sum + pred.riskScore, 0);
    return totalRisk / this.churnPredictions.length;
  }

  private predictMonthlyChurn(): number {
    return this.churnPredictions.filter(pred => pred.riskScore > 70).length;
  }

  private calculateRevenueAtRisk(): number {
    // Estimate revenue at risk from high-risk customers
    return this.churnPredictions
      .filter(pred => pred.riskScore > 70)
      .length * (this.billingMetrics?.averageRevenuePerUser || 0);
  }

  private calculateRecentRevenue(): number {
    const recentEvents = this.paymentEvents.filter(
      event => event.type === 'payment_success' &&
      new Date(event.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return recentEvents.reduce((sum, event) => sum + event.amount, 0);
  }

  private async getAnomalyRecommendations(variance: number, isRevenueDrop: boolean): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (isRevenueDrop) {
      recommendations.push('Investigate payment failure increases');
      recommendations.push('Review customer cancellation patterns');
      recommendations.push('Analyze conversion rate changes');
    } else {
      recommendations.push('Verify payment processing accuracy');
      recommendations.push('Check for duplicate transactions');
      recommendations.push('Review pricing changes impact');
    }
    
    return recommendations;
  }

  private calculateBillingHealthScore(): number {
    if (!this.billingMetrics) return 0;
    
    const metrics = this.billingMetrics;
    let score = 0;
    
    // Revenue growth (0-3 points)
    if (metrics.monthlyRecurringRevenue > 0) score += 3;
    
    // Churn rate (0-3 points)
    if (metrics.churnRate < 0.05) score += 3;
    else if (metrics.churnRate < 0.1) score += 2;
    else if (metrics.churnRate < 0.15) score += 1;
    
    // Payment success rate (0-2 points)
    const recentFailures = this.paymentEvents.filter(e => e.type === 'payment_failed').length;
    const recentTotal = this.paymentEvents.length;
    const successRate = recentTotal > 0 ? 1 - (recentFailures / recentTotal) : 1;
    
    if (successRate > 0.95) score += 2;
    else if (successRate > 0.9) score += 1;
    
    // Customer lifetime value (0-2 points)
    if (metrics.customerLifetimeValue > 1000) score += 2;
    else if (metrics.customerLifetimeValue > 500) score += 1;
    
    return score;
  }

  private async identifyBillingIssues(): Promise<string[]> {
    const issues: string[] = [];
    
    if (!this.billingMetrics) return ['Unable to calculate billing metrics'];
    
    if (this.billingMetrics.churnRate > 0.1) {
      issues.push('High churn rate detected');
    }
    
    const failureRate = this.calculatePaymentFailureRate();
    if (failureRate > 0.05) {
      issues.push('High payment failure rate');
    }
    
    if (this.churnPredictions.filter(p => p.riskScore > 70).length > 10) {
      issues.push('Many customers at high churn risk');
    }
    
    return issues;
  }

  private async getBillingHealthRecommendations(healthScore: number): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (healthScore < 6) {
      recommendations.push('Immediate attention required for billing health');
      recommendations.push('Review payment processing and failure patterns');
      recommendations.push('Implement aggressive retention campaigns');
    } else if (healthScore < 8) {
      recommendations.push('Monitor churn patterns closely');
      recommendations.push('Optimize payment retry logic');
      recommendations.push('Enhance customer success programs');
    } else {
      recommendations.push('Maintain current billing performance');
      recommendations.push('Focus on growth optimization');
    }
    
    return recommendations;
  }

  private calculatePaymentFailureRate(): number {
    const recentEvents = this.paymentEvents.filter(
      event => new Date(event.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentEvents.length === 0) return 0;
    
    const failures = recentEvents.filter(event => event.type === 'payment_failed');
    return failures.length / recentEvents.length;
  }

  private async getBillingRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    const failureRate = this.calculatePaymentFailureRate();
    if (failureRate > 0.05) {
      recommendations.push('High payment failure rate - review payment processing');
    }
    
    const highRiskCustomers = this.churnPredictions.filter(p => p.riskScore > 70);
    if (highRiskCustomers.length > 5) {
      recommendations.push(`${highRiskCustomers.length} customers at high churn risk`);
    }
    
    if (this.revenueAnomalies.length > 0) {
      recommendations.push('Revenue anomalies detected - investigate patterns');
    }
    
    return recommendations;
  }

  private getEventsInTimeRange(timeRange: string): PaymentEvent[] {
    const now = Date.now();
    let startTime: number;

    switch (timeRange) {
      case '1h':
        startTime = now - (60 * 60 * 1000);
        break;
      case '24h':
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = now - (24 * 60 * 60 * 1000);
    }

    return this.paymentEvents.filter(
      event => new Date(event.timestamp).getTime() >= startTime
    );
  }
}