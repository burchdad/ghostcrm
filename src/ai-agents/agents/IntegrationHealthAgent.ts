import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth } from '../core/types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import OpenAI from 'openai';

interface IntegrationHealth {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  lastSync: string;
  syncCount: number;
  errorCount: number;
  errorRate: number;
  latency: number;
  uptime: number;
  health_score: number;
}

interface WebhookStatus {
  id: string;
  endpoint: string;
  provider: string;
  status: 'active' | 'failing' | 'paused';
  successRate: number;
  avgResponseTime: number;
  lastSuccess: string;
  lastFailure?: string;
  recentErrors: string[];
}

interface SyncIssue {
  integration: string;
  type: 'data_mismatch' | 'timeout' | 'auth_error' | 'rate_limit' | 'format_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolution: string;
  timestamp: string;
}

export class IntegrationHealthAgent extends BaseAgent {
  private openai: OpenAI;
  private lastHealthCheck: Date = new Date();
  private integrationHealth: Map<string, IntegrationHealth> = new Map();
  private webhookStatus: Map<string, WebhookStatus> = new Map();
  private syncIssues: SyncIssue[] = [];
  
  constructor() {
    super(
      'integration-health',
      'Integration Health Agent', 
      'Monitors integration health, webhook deliveries, API sync status, and provides automated troubleshooting',
      '1.0.0'
    );
    
    // Only initialize OpenAI if API key is available (server-side)
    if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
    }
  }

  // Abstract method implementations required by BaseAgent
  protected async onInitialize(): Promise<void> {
    console.log(`🔗 [INTEGRATION_AGENT] Initializing Integration Health Agent v${this.version}`);
    
    // Start health monitoring
    await this.startHealthMonitoring();
    await this.discoverIntegrations();
    await this.monitorWebhooks();
    
    console.log('🔗 [INTEGRATION_AGENT] Integration health monitoring initialized');
  }

  protected async onStart(): Promise<void> {
    console.log('🔗 [INTEGRATION_AGENT] Starting integration health monitoring');
  }

  protected async onStop(): Promise<void> {
    console.log('🔗 [INTEGRATION_AGENT] Stopping integration health monitoring');
  }

  protected async execute(): Promise<void> {
    await this.checkIntegrationHealth();
    await this.checkWebhookHealth();
    await this.detectSyncIssues();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    console.log('🔗 [INTEGRATION_AGENT] Configuration updated');
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    const avgLatency = this.calculateAverageLatency(Array.from(this.integrationHealth.values()));
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: avgLatency || Math.random() * 200 + 100
    };
  }

  // Public method to get integration health status
  async getIntegrationHealthStatus() {
    return await this.getIntegrationStatus();
  }

  async getIntegrationStatus() {
    const integrations = Array.from(this.integrationHealth.values());
    const webhooks = Array.from(this.webhookStatus.values());
    
    const healthyIntegrations = integrations.filter(i => i.status === 'healthy').length;
    const failingIntegrations = integrations.filter(i => i.status === 'error').length;
    const warningIntegrations = integrations.filter(i => i.status === 'warning').length;
    
    const activeWebhooks = webhooks.filter(w => w.status === 'active').length;
    const failingWebhooks = webhooks.filter(w => w.status === 'failing').length;
    
    const overallHealth = this.calculateOverallHealth(integrations);
    
    return {
      status: overallHealth >= 8 ? 'healthy' : 
              overallHealth >= 6 ? 'warning' : 'critical',
      lastCheck: this.lastHealthCheck.toISOString(),
      metrics: {
        totalIntegrations: integrations.length,
        healthyIntegrations,
        warningIntegrations,
        failingIntegrations,
        totalWebhooks: webhooks.length,
        activeWebhooks,
        failingWebhooks,
        overallHealth,
        avgErrorRate: this.calculateAverageErrorRate(integrations),
        avgLatency: this.calculateAverageLatency(integrations)
      },
      recentIssues: this.syncIssues.slice(0, 10),
      integrationSummary: integrations.map(i => ({
        name: i.name,
        status: i.status,
        health_score: i.health_score,
        errorRate: i.errorRate
      })),
      recommendations: await this.getHealthRecommendations()
    };
  }

  async performAction(action: string, params?: any) {
    console.log(`🔗 [INTEGRATION_AGENT] Performing action: ${action}`);

    switch (action) {
      case 'health_check':
        return await this.performHealthCheck(params?.integrationId);
      
      case 'sync_status':
        return await this.getSyncStatus(params?.integrationId);
      
      case 'webhook_test':
        return await this.testWebhook(params?.webhookId);
      
      case 'troubleshoot':
        return await this.troubleshootIntegration(params?.integrationId);
      
      case 'sync_repair':
        return await this.repairSync(params?.integrationId);
      
      case 'integration_report':
        return await this.generateIntegrationReport(params?.timeRange || '7d');
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async startHealthMonitoring(): Promise<void> {
    // Monitor integration health every 2 minutes
    setInterval(async () => {
      await this.checkIntegrationHealth();
    }, 120000);

    // Monitor webhook health every 5 minutes
    setInterval(async () => {
      await this.checkWebhookHealth();
    }, 300000);

    // Sync issue detection every 1 minute
    setInterval(async () => {
      await this.detectSyncIssues();
    }, 60000);

    // Deep health analysis every 15 minutes
    setInterval(async () => {
      await this.performDeepHealthAnalysis();
    }, 900000);
  }

  private async discoverIntegrations(): Promise<void> {
    try {
      // Get all configured integrations
      const integrations = [
        {
          id: 'slack-1',
          name: 'Slack Workspace',
          type: 'communication',
          endpoint: 'https://hooks.slack.com/services/...',
          provider: 'slack'
        },
        {
          id: 'openai-1',
          name: 'OpenAI GPT-4',
          type: 'ai',
          endpoint: 'https://api.openai.com/v1/',
          provider: 'openai'
        },
        {
          id: 'stripe-1',
          name: 'Stripe Payments',
          type: 'billing',
          endpoint: 'https://api.stripe.com/v1/',
          provider: 'stripe'
        },
        {
          id: 'sendgrid-1',
          name: 'SendGrid Email',
          type: 'email',
          endpoint: 'https://api.sendgrid.com/v3/',
          provider: 'sendgrid'
        }
      ];

      for (const integration of integrations) {
        await this.initializeIntegrationHealth(integration);
      }

    } catch (error) {
      console.error('🔗 [INTEGRATION_AGENT] Error discovering integrations:', error);
    }
  }

  private async initializeIntegrationHealth(integration: any): Promise<void> {
    const health: IntegrationHealth = {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      status: 'healthy',
      lastSync: new Date().toISOString(),
      syncCount: Math.floor(Math.random() * 1000) + 100,
      errorCount: Math.floor(Math.random() * 10),
      errorRate: Math.random() * 0.05, // 0-5% error rate
      latency: Math.random() * 500 + 100, // 100-600ms
      uptime: 0.99 + Math.random() * 0.01, // 99-100% uptime
      health_score: 0
    };

    health.health_score = this.calculateHealthScore(health);
    health.status = this.determineStatus(health);

    this.integrationHealth.set(integration.id, health);
  }

  private async monitorWebhooks(): Promise<void> {
    try {
      const webhooks = [
        {
          id: 'stripe-webhook',
          endpoint: '/api/webhooks/stripe',
          provider: 'stripe'
        },
        {
          id: 'sendgrid-webhook',
          endpoint: '/api/webhooks/sendgrid',
          provider: 'sendgrid'
        },
        {
          id: 'payment-webhook',
          endpoint: '/api/webhooks/payment',
          provider: 'payment'
        }
      ];

      for (const webhook of webhooks) {
        await this.initializeWebhookStatus(webhook);
      }

    } catch (error) {
      console.error('🔗 [INTEGRATION_AGENT] Error monitoring webhooks:', error);
    }
  }

  private async initializeWebhookStatus(webhook: any): Promise<void> {
    const status: WebhookStatus = {
      id: webhook.id,
      endpoint: webhook.endpoint,
      provider: webhook.provider,
      status: 'active',
      successRate: 0.95 + Math.random() * 0.05, // 95-100% success rate
      avgResponseTime: Math.random() * 200 + 50, // 50-250ms
      lastSuccess: new Date().toISOString(),
      recentErrors: []
    };

    this.webhookStatus.set(webhook.id, status);
  }

  private async checkIntegrationHealth(): Promise<void> {
    for (const [id, health] of this.integrationHealth) {
      try {
        // Simulate health check
        const isHealthy = Math.random() > 0.1; // 90% chance of being healthy
        
        if (!isHealthy) {
          health.errorCount += 1;
          health.errorRate = health.errorCount / (health.syncCount + health.errorCount);
          
          // Add sync issue
          const issue: SyncIssue = {
            integration: health.name,
            type: this.randomSyncIssueType(),
            severity: this.determineSeverity(health.errorRate),
            description: await this.generateIssueDescription(health),
            resolution: await this.generateResolution(health),
            timestamp: new Date().toISOString()
          };
          
          this.syncIssues.unshift(issue);
          if (this.syncIssues.length > 100) {
            this.syncIssues = this.syncIssues.slice(0, 100);
          }
        } else {
          health.syncCount += 1;
          health.lastSync = new Date().toISOString();
        }

        health.health_score = this.calculateHealthScore(health);
        health.status = this.determineStatus(health);

      } catch (error) {
        console.error(`🔗 [INTEGRATION_AGENT] Error checking health for ${id}:`, error);
      }
    }

    this.lastHealthCheck = new Date();
  }

  private async checkWebhookHealth(): Promise<void> {
    for (const [id, webhook] of this.webhookStatus) {
      try {
        // Simulate webhook health check
        const isWorking = Math.random() > 0.05; // 95% success rate
        
        if (isWorking) {
          webhook.lastSuccess = new Date().toISOString();
          webhook.status = 'active';
        } else {
          webhook.lastFailure = new Date().toISOString();
          webhook.recentErrors.unshift(`Connection timeout at ${new Date().toISOString()}`);
          
          if (webhook.recentErrors.length > 5) {
            webhook.recentErrors = webhook.recentErrors.slice(0, 5);
          }
          
          webhook.successRate *= 0.95; // Decrease success rate
          
          if (webhook.successRate < 0.8) {
            webhook.status = 'failing';
          }
        }

      } catch (error) {
        console.error(`🔗 [INTEGRATION_AGENT] Error checking webhook health for ${id}:`, error);
      }
    }
  }

  private async detectSyncIssues(): Promise<void> {
    // Detect patterns in sync failures
    const recentIssues = this.syncIssues.filter(
      issue => new Date(issue.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
    );

    if (recentIssues.length > 5) {
      if (!this.openai) {
        console.warn('🔗 [INTEGRATION_AGENT] OpenAI not available for analysis');
        return;
      }

      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Analyze integration sync issues for patterns. Return JSON with:
            patterns (array), rootCause (string), urgency (low/medium/high/critical),
            recommendations (array).`
          },
          {
            role: "user",
            content: `Recent sync issues: ${JSON.stringify(recentIssues)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const result = JSON.parse(analysis.choices[0]?.message?.content || '{}');
      
      if (result.urgency === 'critical' || result.urgency === 'high') {
        console.log(`🚨 [INTEGRATION_AGENT] Critical sync pattern detected:`, result);
      }
    }
  }

  private async performDeepHealthAnalysis(): Promise<void> {
    const integrations = Array.from(this.integrationHealth.values());
    const webhooks = Array.from(this.webhookStatus.values());

    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Perform deep analysis of integration health metrics. Identify trends,
          predict potential failures, suggest optimizations. Return JSON with:
          healthTrends (array), predictedIssues (array), optimizations (array),
          criticalActions (array).`
        },
        {
          role: "user",
          content: `Integration Health: ${JSON.stringify(integrations)}
          Webhook Status: ${JSON.stringify(webhooks)}
          Recent Issues: ${JSON.stringify(this.syncIssues.slice(0, 20))}`
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    const result = JSON.parse(analysis.choices[0]?.message?.content || '{}');
    
    // Act on critical actions
    if (result.criticalActions?.length > 0) {
      for (const action of result.criticalActions) {
        await this.executeCriticalAction(action);
      }
    }
  }

  private async performHealthCheck(integrationId?: string): Promise<any> {
    if (integrationId) {
      const health = this.integrationHealth.get(integrationId);
      if (!health) throw new Error(`Integration ${integrationId} not found`);
      
      // Perform specific health check
      return await this.detailedHealthCheck(health);
    }

    // Perform health check on all integrations
    const results: any[] = [];
    for (const [id, health] of this.integrationHealth) {
      results.push(await this.detailedHealthCheck(health));
    }
    
    return results;
  }

  private async detailedHealthCheck(health: IntegrationHealth): Promise<any> {
    return {
      integration: health.name,
      status: health.status,
      metrics: {
        health_score: health.health_score,
        uptime: health.uptime,
        errorRate: health.errorRate,
        latency: health.latency,
        syncCount: health.syncCount,
        errorCount: health.errorCount
      },
      lastSync: health.lastSync,
      recommendations: await this.getIntegrationRecommendations(health)
    };
  }

  private async getSyncStatus(integrationId: string): Promise<any> {
    const health = this.integrationHealth.get(integrationId);
    if (!health) throw new Error(`Integration ${integrationId} not found`);

    const relatedIssues = this.syncIssues.filter(
      issue => issue.integration === health.name
    );

    return {
      integration: health.name,
      lastSync: health.lastSync,
      syncCount: health.syncCount,
      errorCount: health.errorCount,
      recentIssues: relatedIssues.slice(0, 5),
      syncHealth: health.health_score,
      nextSyncEstimate: this.estimateNextSync(health)
    };
  }

  private async testWebhook(webhookId: string): Promise<any> {
    const webhook = this.webhookStatus.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);

    // Simulate webhook test
    const testResult = {
      webhook: webhook.endpoint,
      status: Math.random() > 0.1 ? 'success' : 'failed',
      responseTime: Math.random() * 200 + 50,
      timestamp: new Date().toISOString()
    };

    if (testResult.status === 'success') {
      webhook.lastSuccess = testResult.timestamp;
      webhook.status = 'active';
    } else {
      webhook.lastFailure = testResult.timestamp;
      webhook.recentErrors.unshift(`Test failed: ${testResult.timestamp}`);
    }

    return testResult;
  }

  private async troubleshootIntegration(integrationId: string): Promise<any> {
    const health = this.integrationHealth.get(integrationId);
    if (!health) throw new Error(`Integration ${integrationId} not found`);

    const relatedIssues = this.syncIssues.filter(
      issue => issue.integration === health.name
    );

    const troubleshooting = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an integration troubleshooting expert. Analyze the integration
          health and issues to provide step-by-step troubleshooting guidance.
          Return JSON with: diagnosis (string), steps (array), estimatedTime (string),
          success_probability (number).`
        },
        {
          role: "user",
          content: `Integration: ${JSON.stringify(health)}
          Recent Issues: ${JSON.stringify(relatedIssues)}`
        }
      ],
      max_tokens: 600,
      temperature: 0.1
    });

    return JSON.parse(troubleshooting.choices[0]?.message?.content || '{}');
  }

  private async repairSync(integrationId: string): Promise<any> {
    const health = this.integrationHealth.get(integrationId);
    if (!health) throw new Error(`Integration ${integrationId} not found`);

    // Simulate sync repair
    const repairActions = [
      'Clearing sync cache',
      'Refreshing authentication tokens',
      'Resetting connection parameters',
      'Validating data mappings',
      'Testing connectivity'
    ];

    const results: any[] = [];
    for (const action of repairActions) {
      results.push({
        action,
        status: Math.random() > 0.2 ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      });
    }

    // Update health if repair was successful
    if (results.every(r => r.status === 'success')) {
      health.errorCount = 0;
      health.errorRate = 0;
      health.status = 'healthy';
      health.health_score = this.calculateHealthScore(health);
      health.lastSync = new Date().toISOString();
    }

    return {
      integration: health.name,
      repairActions: results,
      newStatus: health.status,
      newHealthScore: health.health_score
    };
  }

  private async generateIntegrationReport(timeRange: string): Promise<any> {
    const integrations = Array.from(this.integrationHealth.values());
    const webhooks = Array.from(this.webhookStatus.values());
    const issues = this.getIssuesInTimeRange(timeRange);

    const report = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate a comprehensive integration health report. Include:
          executive summary, health metrics, trend analysis, issues summary,
          recommendations. Format as structured JSON.`
        },
        {
          role: "user",
          content: `Time Range: ${timeRange}
          Integrations: ${JSON.stringify(integrations)}
          Webhooks: ${JSON.stringify(webhooks)}
          Issues: ${JSON.stringify(issues)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    return JSON.parse(report.choices[0]?.message?.content || '{}');
  }

  // Helper methods
  private calculateHealthScore(health: IntegrationHealth): number {
    const uptimeScore = health.uptime * 40;
    const errorScore = Math.max(0, 30 - (health.errorRate * 1000));
    const latencyScore = Math.max(0, 20 - (health.latency / 50));
    const syncScore = Math.min(10, health.syncCount / 100);

    return Math.round(uptimeScore + errorScore + latencyScore + syncScore);
  }

  private determineStatus(health: IntegrationHealth): 'healthy' | 'warning' | 'error' | 'disconnected' {
    if (health.health_score >= 8) return 'healthy';
    if (health.health_score >= 6) return 'warning';
    if (health.health_score >= 3) return 'error';
    return 'disconnected';
  }

  private calculateOverallHealth(integrations: IntegrationHealth[]): number {
    if (integrations.length === 0) return 0;
    const totalHealth = integrations.reduce((sum, i) => sum + i.health_score, 0);
    return totalHealth / integrations.length;
  }

  private calculateAverageErrorRate(integrations: IntegrationHealth[]): number {
    if (integrations.length === 0) return 0;
    const totalErrorRate = integrations.reduce((sum, i) => sum + i.errorRate, 0);
    return totalErrorRate / integrations.length;
  }

  private calculateAverageLatency(integrations: IntegrationHealth[]): number {
    if (integrations.length === 0) return 0;
    const totalLatency = integrations.reduce((sum, i) => sum + i.latency, 0);
    return totalLatency / integrations.length;
  }

  private randomSyncIssueType(): SyncIssue['type'] {
    const types: SyncIssue['type'][] = ['data_mismatch', 'timeout', 'auth_error', 'rate_limit', 'format_error'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private determineSeverity(errorRate: number): SyncIssue['severity'] {
    if (errorRate > 0.1) return 'critical';
    if (errorRate > 0.05) return 'high';
    if (errorRate > 0.02) return 'medium';
    return 'low';
  }

  private async generateIssueDescription(health: IntegrationHealth): Promise<string> {
    const descriptions = [
      `Sync timeout occurred for ${health.name}`,
      `Authentication error in ${health.name} integration`,
      `Data format mismatch detected in ${health.name}`,
      `Rate limiting triggered for ${health.name}`,
      `Connection failure in ${health.name} integration`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private async generateResolution(health: IntegrationHealth): Promise<string> {
    const resolutions = [
      'Retry with exponential backoff',
      'Refresh authentication tokens',
      'Validate data format mappings',
      'Implement rate limiting strategy',
      'Check network connectivity'
    ];
    return resolutions[Math.floor(Math.random() * resolutions.length)];
  }

  private estimateNextSync(health: IntegrationHealth): string {
    const avgSyncInterval = 300000; // 5 minutes
    const nextSync = new Date(Date.now() + avgSyncInterval);
    return nextSync.toISOString();
  }

  private async getHealthRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    const failingIntegrations = Array.from(this.integrationHealth.values())
      .filter(i => i.status === 'error' || i.status === 'disconnected');

    if (failingIntegrations.length > 0) {
      recommendations.push(`${failingIntegrations.length} integration(s) require immediate attention`);
    }

    const highErrorRateIntegrations = Array.from(this.integrationHealth.values())
      .filter(i => i.errorRate > 0.05);

    if (highErrorRateIntegrations.length > 0) {
      recommendations.push('Review integrations with high error rates');
    }

    const failingWebhooks = Array.from(this.webhookStatus.values())
      .filter(w => w.status === 'failing');

    if (failingWebhooks.length > 0) {
      recommendations.push('Investigate failing webhook endpoints');
    }

    return recommendations;
  }

  private async getIntegrationRecommendations(health: IntegrationHealth): Promise<string[]> {
    const recommendations: string[] = [];

    if (health.errorRate > 0.05) {
      recommendations.push('High error rate detected - consider troubleshooting');
    }

    if (health.latency > 1000) {
      recommendations.push('High latency detected - check network connectivity');
    }

    if (health.uptime < 0.95) {
      recommendations.push('Low uptime - review integration stability');
    }

    return recommendations;
  }

  private getIssuesInTimeRange(timeRange: string): SyncIssue[] {
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

    return this.syncIssues.filter(
      issue => new Date(issue.timestamp).getTime() >= startTime
    );
  }

  private async executeCriticalAction(action: any): Promise<void> {
    console.log(`🚨 [INTEGRATION_AGENT] Executing critical action:`, action);
    
    // In production, this would execute automated remediation actions:
    // - Restart failing integrations
    // - Clear sync caches
    // - Refresh authentication tokens
    // - Notify administrators
  }
}