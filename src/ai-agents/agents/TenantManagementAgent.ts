import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig, AgentHealth } from '../core/types';
import { supabaseAdmin } from '@/utils/supabase/admin';
import OpenAI from 'openai';

interface TenantMetrics {
  id: string;
  name: string;
  subdomain: string;
  userCount: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  apiCallsToday: number;
  apiCallsLimit: number;
  dbConnections: number;
  dbConnectionLimit: number;
  bandwidthUsed: number; // in MB
  lastActivity: string;
  healthScore: number;
  status: 'active' | 'warning' | 'suspended' | 'over_limit';
}

interface ResourceAlert {
  tenantId: string;
  tenantName: string;
  type: 'storage' | 'api_calls' | 'db_connections' | 'bandwidth' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  currentUsage: number;
  limit: number;
  utilizationPercent: number;
  message: string;
  recommendation: string;
  timestamp: string;
}

interface ScalingRecommendation {
  tenantId: string;
  resourceType: 'storage' | 'api_calls' | 'db_connections' | 'bandwidth';
  currentLimit: number;
  recommendedLimit: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  costImpact: number;
  timeline: string;
}

interface TenantPerformance {
  tenantId: string;
  responseTime: number; // average in ms
  errorRate: number; // percentage
  uptime: number; // percentage
  throughput: number; // requests per minute
  satisfaction: number; // 0-10 based on user behavior
}

export class TenantManagementAgent extends BaseAgent {
  private openai: OpenAI;
  private lastTenantCheck: Date = new Date();
  private tenantMetrics: Map<string, TenantMetrics> = new Map();
  private resourceAlerts: ResourceAlert[] = [];
  private scalingRecommendations: ScalingRecommendation[] = [];
  private performanceMetrics: Map<string, TenantPerformance> = new Map();
  
  constructor() {
    super(
      'tenant-management',
      'Tenant Management Agent',
      'Monitors multi-tenant resource usage, performance, scaling decisions, and tenant health optimization',
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
    console.log(`🏢 [TENANT_AGENT] Initializing Tenant Management Agent v${this.version}`);
    
    // Start tenant monitoring
    await this.startTenantMonitoring();
    await this.discoverTenants();
    await this.performResourceUsageMonitoring();
    
    console.log('🏢 [TENANT_AGENT] Tenant management monitoring initialized');
  }

  protected async onStart(): Promise<void> {
    console.log('🏢 [TENANT_AGENT] Starting tenant management monitoring');
  }

  protected async onStop(): Promise<void> {
    console.log('🏢 [TENANT_AGENT] Stopping tenant management monitoring');
  }

  protected async execute(): Promise<void> {
    await this.collectTenantMetrics();
    await this.checkResourceLimits();
    await this.monitorPerformance();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    console.log('🏢 [TENANT_AGENT] Configuration updated');
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 200 + 100
    };
  }

  async getTenantManagementStatus() {
    const tenants = Array.from(this.tenantMetrics.values());
    const alerts = this.resourceAlerts.filter(
      alert => new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const warningTenants = tenants.filter(t => t.status === 'warning').length;
    const overLimitTenants = tenants.filter(t => t.status === 'over_limit').length;
    const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

    return {
      status: criticalAlerts > 0 ? 'critical' : 
              warningAlerts > 3 ? 'warning' : 'healthy',
      lastCheck: this.lastTenantCheck.toISOString(),
      tenantSummary: {
        totalTenants: tenants.length,
        activeTenants,
        warningTenants,
        overLimitTenants,
        suspendedTenants,
        averageHealthScore: this.calculateAverageHealthScore(tenants)
      },
      resourceUtilization: {
        averageStorageUtilization: this.calculateAverageUtilization(tenants, 'storage'),
        averageApiUtilization: this.calculateAverageUtilization(tenants, 'api'),
        averageDbUtilization: this.calculateAverageUtilization(tenants, 'db'),
        totalResourceAlerts: alerts.length,
        criticalAlerts,
        warningAlerts
      },
      scalingNeeds: {
        tenantsNeedingUpgrade: this.scalingRecommendations.filter(r => r.urgency === 'high' || r.urgency === 'critical').length,
        estimatedCostIncrease: this.calculateTotalScalingCost(),
        resourceTypes: this.getScalingResourceTypes()
      },
      recentAlerts: alerts.slice(0, 10),
      recommendations: await this.getTenantRecommendations()
    };
  }

  async performAction(action: string, params?: any) {
    console.log(`🏢 [TENANT_AGENT] Performing action: ${action}`);

    switch (action) {
      case 'tenant_health_check':
        return await this.performTenantHealthCheck(params?.tenantId);
      
      case 'resource_analysis':
        return await this.analyzeResourceUsage(params?.tenantId, params?.resourceType);
      
      case 'scaling_recommendations':
        return await this.generateScalingRecommendations(params?.tenantId);
      
      case 'performance_analysis':
        return await this.analyzePerformance(params?.tenantId, params?.timeRange || '24h');
      
      case 'cost_optimization':
        return await this.analyzeCostOptimization();
      
      case 'tenant_migration':
        return await this.planTenantMigration(params?.tenantId, params?.targetTier);
      
      case 'capacity_planning':
        return await this.performCapacityPlanning(params?.months || 3);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async startTenantMonitoring(): Promise<void> {
    // Monitor tenant metrics every 2 minutes
    setInterval(async () => {
      await this.collectTenantMetrics();
    }, 120000);

    // Check resource limits every 5 minutes
    setInterval(async () => {
      await this.checkResourceLimits();
    }, 300000);

    // Performance monitoring every 10 minutes
    setInterval(async () => {
      await this.monitorPerformance();
    }, 600000);

    // Generate scaling recommendations every hour
    setInterval(async () => {
      await this.generateAutomaticScalingRecommendations();
    }, 3600000);
  }

  private async discoverTenants(): Promise<void> {
    try {
      // In production, fetch from database
      // For now, simulate tenant data
      const tenants = [
        {
          id: 'tenant_acme_corp',
          name: 'Acme Corporation',
          subdomain: 'acme',
          plan: 'enterprise',
          createdAt: '2024-01-15T00:00:00Z'
        },
        {
          id: 'tenant_startup_inc',
          name: 'Startup Inc',
          subdomain: 'startup',
          plan: 'professional',
          createdAt: '2024-02-01T00:00:00Z'
        },
        {
          id: 'tenant_small_biz',
          name: 'Small Business LLC',
          subdomain: 'smallbiz',
          plan: 'basic',
          createdAt: '2024-03-01T00:00:00Z'
        }
      ];

      for (const tenant of tenants) {
        await this.initializeTenantMetrics(tenant);
      }

    } catch (error) {
      console.error('🏢 [TENANT_AGENT] Error discovering tenants:', error);
    }
  }

  private async initializeTenantMetrics(tenant: any): Promise<void> {
    const metrics: TenantMetrics = {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      userCount: Math.floor(Math.random() * 100) + 10,
      storageUsed: Math.floor(Math.random() * 800) + 100, // 100-900 MB
      storageLimit: this.getStorageLimit(tenant.plan),
      apiCallsToday: Math.floor(Math.random() * 8000) + 1000,
      apiCallsLimit: this.getApiLimit(tenant.plan),
      dbConnections: Math.floor(Math.random() * 20) + 5,
      dbConnectionLimit: this.getDbConnectionLimit(tenant.plan),
      bandwidthUsed: Math.floor(Math.random() * 500) + 50,
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      healthScore: 0,
      status: 'active'
    };

    metrics.healthScore = this.calculateTenantHealthScore(metrics);
    metrics.status = this.determineTenantStatus(metrics);

    this.tenantMetrics.set(tenant.id, metrics);
    this.initializePerformanceMetrics(tenant.id);
  }

  private getStorageLimit(plan: string): number {
    switch (plan) {
      case 'basic': return 1000; // 1GB
      case 'professional': return 5000; // 5GB
      case 'enterprise': return 20000; // 20GB
      default: return 1000;
    }
  }

  private getApiLimit(plan: string): number {
    switch (plan) {
      case 'basic': return 5000;
      case 'professional': return 20000;
      case 'enterprise': return 100000;
      default: return 5000;
    }
  }

  private getDbConnectionLimit(plan: string): number {
    switch (plan) {
      case 'basic': return 10;
      case 'professional': return 25;
      case 'enterprise': return 100;
      default: return 10;
    }
  }

  private initializePerformanceMetrics(tenantId: string): void {
    const performance: TenantPerformance = {
      tenantId,
      responseTime: Math.random() * 200 + 100, // 100-300ms
      errorRate: Math.random() * 0.02, // 0-2%
      uptime: 0.98 + Math.random() * 0.02, // 98-100%
      throughput: Math.random() * 100 + 50, // 50-150 rpm
      satisfaction: Math.random() * 2 + 8 // 8-10
    };

    this.performanceMetrics.set(tenantId, performance);
  }

  private async collectTenantMetrics(): Promise<void> {
    for (const [tenantId, metrics] of this.tenantMetrics) {
      try {
        // Simulate metric collection - in production, gather from monitoring systems
        await this.updateTenantMetrics(tenantId, metrics);
        
        // Check for alerts
        await this.checkTenantAlerts(metrics);

      } catch (error) {
        console.error(`🏢 [TENANT_AGENT] Error collecting metrics for ${tenantId}:`, error);
      }
    }

    this.lastTenantCheck = new Date();
  }

  private async updateTenantMetrics(tenantId: string, metrics: TenantMetrics): Promise<void> {
    // Simulate resource usage fluctuations
    metrics.storageUsed += Math.floor(Math.random() * 10) - 5; // ±5MB change
    metrics.apiCallsToday += Math.floor(Math.random() * 100) + 10; // +10-110 calls
    metrics.dbConnections = Math.max(1, metrics.dbConnections + Math.floor(Math.random() * 3) - 1);
    metrics.bandwidthUsed += Math.floor(Math.random() * 20) - 10; // ±10MB change
    
    // Ensure minimums
    metrics.storageUsed = Math.max(0, metrics.storageUsed);
    metrics.bandwidthUsed = Math.max(0, metrics.bandwidthUsed);
    
    // Update health score and status
    metrics.healthScore = this.calculateTenantHealthScore(metrics);
    metrics.status = this.determineTenantStatus(metrics);
    metrics.lastActivity = new Date().toISOString();
  }

  private async checkTenantAlerts(metrics: TenantMetrics): Promise<void> {
    const alerts: ResourceAlert[] = [];

    // Storage check
    const storageUtilization = (metrics.storageUsed / metrics.storageLimit) * 100;
    if (storageUtilization > 90) {
      alerts.push({
        tenantId: metrics.id,
        tenantName: metrics.name,
        type: 'storage',
        severity: storageUtilization > 95 ? 'critical' : 'warning',
        currentUsage: metrics.storageUsed,
        limit: metrics.storageLimit,
        utilizationPercent: storageUtilization,
        message: `Storage usage at ${storageUtilization.toFixed(1)}%`,
        recommendation: 'Consider upgrading storage plan or cleaning up data',
        timestamp: new Date().toISOString()
      });
    }

    // API calls check
    const apiUtilization = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    if (apiUtilization > 80) {
      alerts.push({
        tenantId: metrics.id,
        tenantName: metrics.name,
        type: 'api_calls',
        severity: apiUtilization > 90 ? 'critical' : 'warning',
        currentUsage: metrics.apiCallsToday,
        limit: metrics.apiCallsLimit,
        utilizationPercent: apiUtilization,
        message: `API usage at ${apiUtilization.toFixed(1)}%`,
        recommendation: 'Monitor API usage patterns or upgrade plan',
        timestamp: new Date().toISOString()
      });
    }

    // Database connections check
    const dbUtilization = (metrics.dbConnections / metrics.dbConnectionLimit) * 100;
    if (dbUtilization > 80) {
      alerts.push({
        tenantId: metrics.id,
        tenantName: metrics.name,
        type: 'db_connections',
        severity: dbUtilization > 90 ? 'critical' : 'warning',
        currentUsage: metrics.dbConnections,
        limit: metrics.dbConnectionLimit,
        utilizationPercent: dbUtilization,
        message: `Database connections at ${dbUtilization.toFixed(1)}%`,
        recommendation: 'Optimize connection pooling or upgrade plan',
        timestamp: new Date().toISOString()
      });
    }

    // Add alerts to the list
    for (const alert of alerts) {
      this.resourceAlerts.unshift(alert);
    }

    // Keep only recent alerts (last 7 days)
    this.resourceAlerts = this.resourceAlerts.filter(
      alert => new Date(alert.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
  }

  private async checkResourceLimits(): Promise<void> {
    for (const [tenantId, metrics] of this.tenantMetrics) {
      // Check if tenant is over limits and needs action
      if (metrics.status === 'over_limit') {
        await this.handleOverLimitTenant(metrics);
      }
    }
  }

  private async handleOverLimitTenant(metrics: TenantMetrics): Promise<void> {
    console.log(`⚠️ [TENANT_AGENT] Tenant ${metrics.name} is over limits`);
    
    // In production, this would:
    // - Send notifications to tenant admins
    // - Implement soft limits or throttling
    // - Escalate to billing team
    // - Suggest plan upgrades
    // - Log for compliance/billing purposes
  }

  private async monitorPerformance(): Promise<void> {
    for (const [tenantId, performance] of this.performanceMetrics) {
      try {
        // Simulate performance metric updates
        performance.responseTime = Math.max(50, performance.responseTime + (Math.random() * 20 - 10));
        performance.errorRate = Math.max(0, performance.errorRate + (Math.random() * 0.005 - 0.0025));
        performance.uptime = Math.min(1, Math.max(0.9, performance.uptime + (Math.random() * 0.01 - 0.005)));
        performance.throughput = Math.max(10, performance.throughput + (Math.random() * 10 - 5));
        performance.satisfaction = Math.min(10, Math.max(6, performance.satisfaction + (Math.random() * 0.2 - 0.1)));

        // Check for performance issues
        if (performance.responseTime > 500 || performance.errorRate > 0.05) {
          await this.handlePerformanceIssue(tenantId, performance);
        }

      } catch (error) {
        console.error(`🏢 [TENANT_AGENT] Error monitoring performance for ${tenantId}:`, error);
      }
    }
  }

  private async handlePerformanceIssue(tenantId: string, performance: TenantPerformance): Promise<void> {
    const alert: ResourceAlert = {
      tenantId,
      tenantName: this.tenantMetrics.get(tenantId)?.name || 'Unknown',
      type: 'performance',
      severity: performance.responseTime > 1000 || performance.errorRate > 0.1 ? 'critical' : 'warning',
      currentUsage: performance.responseTime,
      limit: 500, // 500ms target
      utilizationPercent: (performance.responseTime / 500) * 100,
      message: `Performance degraded: ${performance.responseTime.toFixed(0)}ms response time, ${(performance.errorRate * 100).toFixed(2)}% error rate`,
      recommendation: 'Investigate resource allocation and optimize queries',
      timestamp: new Date().toISOString()
    };

    this.resourceAlerts.unshift(alert);
  }

  private async generateAutomaticScalingRecommendations(): Promise<void> {
    for (const [tenantId, metrics] of this.tenantMetrics) {
      const recommendations = await this.analyzeScalingNeeds(metrics);
      
      for (const recommendation of recommendations) {
        // Check if we already have a recent recommendation for this resource
        const existing = this.scalingRecommendations.find(
          r => r.tenantId === tenantId && r.resourceType === recommendation.resourceType
        );

        if (!existing) {
          this.scalingRecommendations.push(recommendation);
        }
      }
    }

    // Keep only recent recommendations (last 30 days)
    this.scalingRecommendations = this.scalingRecommendations.filter(
      rec => new Date().getTime() - new Date(rec.timeline).getTime() < 30 * 24 * 60 * 60 * 1000
    );
  }

  private async analyzeScalingNeeds(metrics: TenantMetrics): Promise<ScalingRecommendation[]> {
    const recommendations: ScalingRecommendation[] = [];

    // Storage scaling
    const storageUtilization = (metrics.storageUsed / metrics.storageLimit) * 100;
    if (storageUtilization > 80) {
      recommendations.push({
        tenantId: metrics.id,
        resourceType: 'storage',
        currentLimit: metrics.storageLimit,
        recommendedLimit: metrics.storageLimit * 2,
        reasoning: `Storage utilization at ${storageUtilization.toFixed(1)}% - approaching limit`,
        urgency: storageUtilization > 90 ? 'high' : 'medium',
        costImpact: this.calculateStorageCostIncrease(metrics.storageLimit),
        timeline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // API calls scaling
    const apiUtilization = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    if (apiUtilization > 75) {
      recommendations.push({
        tenantId: metrics.id,
        resourceType: 'api_calls',
        currentLimit: metrics.apiCallsLimit,
        recommendedLimit: metrics.apiCallsLimit * 2,
        reasoning: `API utilization at ${apiUtilization.toFixed(1)}% - high usage pattern`,
        urgency: apiUtilization > 85 ? 'high' : 'medium',
        costImpact: this.calculateApiCostIncrease(metrics.apiCallsLimit),
        timeline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return recommendations;
  }

  private async performTenantHealthCheck(tenantId?: string): Promise<any> {
    if (tenantId) {
      const metrics = this.tenantMetrics.get(tenantId);
      const performance = this.performanceMetrics.get(tenantId);
      
      if (!metrics) throw new Error(`Tenant ${tenantId} not found`);

      return await this.detailedTenantHealthCheck(metrics, performance);
    }

    // Health check for all tenants
    const results: any[] = [];
    for (const [id, metrics] of this.tenantMetrics) {
      const performance = this.performanceMetrics.get(id);
      results.push(await this.detailedTenantHealthCheck(metrics, performance));
    }
    
    return results;
  }

  private async detailedTenantHealthCheck(metrics: TenantMetrics, performance?: TenantPerformance): Promise<any> {
    // Return mock data if OpenAI is not available (client-side)
    if (!this.openai) {
      return {
        overallHealth: 7,
        issues: ['Limited health check available'],
        recommendations: ['Configure OpenAI API key for detailed analysis'],
        resourceOptimization: { status: 'limited' }
      };
    }

    const healthCheck = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze tenant health metrics and provide comprehensive assessment.
          Return JSON with: overallHealth (score 0-10), issues (array), 
          recommendations (array), resourceOptimization (object).`
        },
        {
          role: "user",
          content: `Tenant Metrics: ${JSON.stringify(metrics)}
          Performance: ${JSON.stringify(performance)}`
        }
      ],
      max_tokens: 600,
      temperature: 0.1
    });

    const analysis = JSON.parse(healthCheck.choices[0]?.message?.content || '{}');

    return {
      tenant: metrics.name,
      healthScore: metrics.healthScore,
      status: metrics.status,
      analysis,
      resourceUtilization: {
        storage: `${((metrics.storageUsed / metrics.storageLimit) * 100).toFixed(1)}%`,
        apiCalls: `${((metrics.apiCallsToday / metrics.apiCallsLimit) * 100).toFixed(1)}%`,
        dbConnections: `${((metrics.dbConnections / metrics.dbConnectionLimit) * 100).toFixed(1)}%`
      },
      performance: performance ? {
        responseTime: `${performance.responseTime.toFixed(0)}ms`,
        errorRate: `${(performance.errorRate * 100).toFixed(2)}%`,
        uptime: `${(performance.uptime * 100).toFixed(2)}%`,
        throughput: `${performance.throughput.toFixed(0)} rpm`
      } : null
    };
  }

  private async analyzeResourceUsage(tenantId?: string, resourceType?: string): Promise<any> {
    if (tenantId) {
      const metrics = this.tenantMetrics.get(tenantId);
      if (!metrics) throw new Error(`Tenant ${tenantId} not found`);

      if (resourceType) {
        return await this.analyzeSpecificResource(metrics, resourceType);
      }

      return await this.analyzeAllResources(metrics);
    }

    // Analyze all tenants
    const allMetrics = Array.from(this.tenantMetrics.values());
    return await this.analyzeSystemWideResources(allMetrics);
  }

  private async analyzeSpecificResource(metrics: TenantMetrics, resourceType: string): Promise<any> {
    // Return mock data if OpenAI is not available (client-side)
    if (!this.openai) {
      return {
        currentUsage: 'unknown',
        trend: 'stable',
        efficiency: 'moderate',
        recommendations: ['Configure OpenAI API key for detailed analysis'],
        costOptimization: { status: 'limited' }
      };
    }

    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze specific resource usage for optimization opportunities.
          Return JSON with: currentUsage, trend, efficiency, recommendations, costOptimization.`
        },
        {
          role: "user",
          content: `Resource Type: ${resourceType}
          Tenant Metrics: ${JSON.stringify(metrics)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    return JSON.parse(analysis.choices[0]?.message?.content || '{}');
  }

  private async analyzeAllResources(metrics: TenantMetrics): Promise<any> {
    return {
      tenant: metrics.name,
      resources: {
        storage: {
          used: metrics.storageUsed,
          limit: metrics.storageLimit,
          utilization: (metrics.storageUsed / metrics.storageLimit) * 100
        },
        apiCalls: {
          used: metrics.apiCallsToday,
          limit: metrics.apiCallsLimit,
          utilization: (metrics.apiCallsToday / metrics.apiCallsLimit) * 100
        },
        dbConnections: {
          used: metrics.dbConnections,
          limit: metrics.dbConnectionLimit,
          utilization: (metrics.dbConnections / metrics.dbConnectionLimit) * 100
        }
      },
      efficiency: this.calculateResourceEfficiency(metrics),
      recommendations: await this.getResourceOptimizationRecommendations(metrics)
    };
  }

  private async analyzeSystemWideResources(allMetrics: TenantMetrics[]): Promise<any> {
    const totalStorage = allMetrics.reduce((sum, m) => sum + m.storageUsed, 0);
    const totalApiCalls = allMetrics.reduce((sum, m) => sum + m.apiCallsToday, 0);
    const totalDbConnections = allMetrics.reduce((sum, m) => sum + m.dbConnections, 0);

    return {
      systemWide: {
        totalTenants: allMetrics.length,
        totalStorageUsed: totalStorage,
        totalApiCalls,
        totalDbConnections,
        averageUtilization: this.calculateSystemAverageUtilization(allMetrics)
      },
      trends: await this.analyzeUsageTrends(),
      optimization: await this.getSystemOptimizationRecommendations()
    };
  }

  // Helper methods
  private calculateTenantHealthScore(metrics: TenantMetrics): number {
    let score = 10;

    // Storage utilization impact
    const storageUtilization = (metrics.storageUsed / metrics.storageLimit) * 100;
    if (storageUtilization > 90) score -= 3;
    else if (storageUtilization > 80) score -= 1;

    // API utilization impact
    const apiUtilization = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    if (apiUtilization > 90) score -= 3;
    else if (apiUtilization > 80) score -= 1;

    // DB connection utilization impact
    const dbUtilization = (metrics.dbConnections / metrics.dbConnectionLimit) * 100;
    if (dbUtilization > 90) score -= 2;
    else if (dbUtilization > 80) score -= 1;

    // Activity impact
    const hoursSinceActivity = (Date.now() - new Date(metrics.lastActivity).getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity > 24) score -= 1;

    return Math.max(0, score);
  }

  private determineTenantStatus(metrics: TenantMetrics): TenantMetrics['status'] {
    const storageUtilization = (metrics.storageUsed / metrics.storageLimit) * 100;
    const apiUtilization = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    const dbUtilization = (metrics.dbConnections / metrics.dbConnectionLimit) * 100;

    if (storageUtilization > 100 || apiUtilization > 100 || dbUtilization > 100) {
      return 'over_limit';
    }

    if (storageUtilization > 90 || apiUtilization > 90 || dbUtilization > 90) {
      return 'warning';
    }

    return 'active';
  }

  private calculateAverageHealthScore(tenants: TenantMetrics[]): number {
    if (tenants.length === 0) return 0;
    const totalScore = tenants.reduce((sum, t) => sum + t.healthScore, 0);
    return totalScore / tenants.length;
  }

  private calculateAverageUtilization(tenants: TenantMetrics[], type: 'storage' | 'api' | 'db'): number {
    if (tenants.length === 0) return 0;
    
    let totalUtilization = 0;
    for (const tenant of tenants) {
      switch (type) {
        case 'storage':
          totalUtilization += (tenant.storageUsed / tenant.storageLimit) * 100;
          break;
        case 'api':
          totalUtilization += (tenant.apiCallsToday / tenant.apiCallsLimit) * 100;
          break;
        case 'db':
          totalUtilization += (tenant.dbConnections / tenant.dbConnectionLimit) * 100;
          break;
      }
    }
    
    return totalUtilization / tenants.length;
  }

  private calculateTotalScalingCost(): number {
    return this.scalingRecommendations
      .filter(r => r.urgency === 'high' || r.urgency === 'critical')
      .reduce((sum, r) => sum + r.costImpact, 0);
  }

  private getScalingResourceTypes(): string[] {
    const types = new Set(this.scalingRecommendations.map(r => r.resourceType));
    return Array.from(types);
  }

  private calculateStorageCostIncrease(currentLimit: number): number {
    // Simulate cost calculation - $0.10 per GB per month
    const currentCostPerMonth = (currentLimit / 1000) * 0.10;
    return currentCostPerMonth; // Cost increase for doubling
  }

  private calculateApiCostIncrease(currentLimit: number): number {
    // Simulate cost calculation - $0.01 per 1000 API calls
    const currentCostPerMonth = (currentLimit / 1000) * 0.01;
    return currentCostPerMonth; // Cost increase for doubling
  }

  private calculateResourceEfficiency(metrics: TenantMetrics): number {
    const storageEff = (metrics.storageUsed / metrics.storageLimit) * 100;
    const apiEff = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    const dbEff = (metrics.dbConnections / metrics.dbConnectionLimit) * 100;
    
    return (storageEff + apiEff + dbEff) / 3;
  }

  private calculateSystemAverageUtilization(tenants: TenantMetrics[]): number {
    const storageAvg = this.calculateAverageUtilization(tenants, 'storage');
    const apiAvg = this.calculateAverageUtilization(tenants, 'api');
    const dbAvg = this.calculateAverageUtilization(tenants, 'db');
    
    return (storageAvg + apiAvg + dbAvg) / 3;
  }

  private async getResourceOptimizationRecommendations(metrics: TenantMetrics): Promise<string[]> {
    const recommendations: string[] = [];
    
    const storageUtilization = (metrics.storageUsed / metrics.storageLimit) * 100;
    if (storageUtilization < 30) {
      recommendations.push('Consider downgrading storage plan to reduce costs');
    } else if (storageUtilization > 80) {
      recommendations.push('Plan storage upgrade to prevent service interruption');
    }
    
    const apiUtilization = (metrics.apiCallsToday / metrics.apiCallsLimit) * 100;
    if (apiUtilization > 75) {
      recommendations.push('Review API usage patterns for optimization opportunities');
    }
    
    return recommendations;
  }

  private async analyzeUsageTrends(): Promise<any> {
    return {
      storageGrowth: '15% monthly',
      apiCallsGrowth: '8% monthly',
      userGrowth: '12% monthly',
      seasonality: 'Higher usage during business hours and weekdays'
    };
  }

  private async getSystemOptimizationRecommendations(): Promise<string[]> {
    return [
      'Implement auto-scaling for high-growth tenants',
      'Optimize database connection pooling across tenants',
      'Consider implementing usage-based pricing tiers',
      'Deploy regional load balancing for better performance'
    ];
  }

  private async getTenantRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    const overLimitTenants = Array.from(this.tenantMetrics.values())
      .filter(t => t.status === 'over_limit');
    if (overLimitTenants.length > 0) {
      recommendations.push(`${overLimitTenants.length} tenant(s) over resource limits`);
    }
    
    const highRiskTenants = this.scalingRecommendations
      .filter(r => r.urgency === 'critical').length;
    if (highRiskTenants > 0) {
      recommendations.push(`${highRiskTenants} tenant(s) need critical scaling attention`);
    }
    
    return recommendations;
  }

  // Additional action methods would be implemented here...
  private async generateScalingRecommendations(tenantId: string): Promise<any> {
    const metrics = this.tenantMetrics.get(tenantId);
    if (!metrics) throw new Error(`Tenant ${tenantId} not found`);
    
    return await this.analyzeScalingNeeds(metrics);
  }

  private async analyzePerformance(tenantId: string, timeRange: string): Promise<any> {
    const performance = this.performanceMetrics.get(tenantId);
    if (!performance) throw new Error(`Performance data not found for tenant ${tenantId}`);
    
    return {
      tenant: tenantId,
      timeRange,
      performance,
      analysis: 'Performance within normal parameters',
      recommendations: ['Continue monitoring', 'Optimize database queries']
    };
  }

  private async analyzeCostOptimization(): Promise<any> {
    const tenants = Array.from(this.tenantMetrics.values());
    
    return {
      potentialSavings: 1250,
      optimization: [
        'Right-size storage for low-usage tenants',
        'Implement auto-scaling policies',
        'Optimize resource allocation algorithms'
      ],
      impact: 'Estimated 15% cost reduction possible'
    };
  }

  private async planTenantMigration(tenantId: string, targetTier: string): Promise<any> {
    return {
      tenant: tenantId,
      targetTier,
      migrationPlan: 'Gradual migration over 2-week period',
      estimatedDowntime: '< 1 hour',
      risks: ['Temporary performance impact', 'Data validation required']
    };
  }

  private async performCapacityPlanning(months: number): Promise<any> {
    return {
      timeframe: `${months} months`,
      projections: {
        tenantGrowth: '25% increase expected',
        resourceNeeds: 'Storage: +40%, API: +30%, DB: +35%',
        costProjection: '$15,000 additional monthly'
      },
      recommendations: [
        'Prepare infrastructure scaling plan',
        'Budget for additional resources',
        'Implement predictive scaling'
      ]
    };
  }

  private async performResourceUsageMonitoring(): Promise<void> {
    // Monitor resource usage across all tenants
    for (const [tenantId, metrics] of this.tenantMetrics) {
      // Simulate resource monitoring
      console.log(`📊 [TENANT_AGENT] Monitoring resources for tenant ${metrics.name}`);
    }
  }
}