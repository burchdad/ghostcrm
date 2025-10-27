import { BaseAgent } from '../core/BaseAgent';
import {
  AgentHealth,
  AgentMetrics,
  AgentConfig,
  AgentStatus,
} from '../core/types';

/**
 * API Performance Agent
 * 
 * Monitors all API endpoints for performance, availability, and optimization opportunities.
 * Tracks response times, error rates, throughput, and provides recommendations.
 */

interface APIEndpoint {
  route: string;
  method: string;
  handler: string;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastChecked: Date;
  status: 'healthy' | 'slow' | 'errors' | 'down';
}

interface APIPerformanceMetrics extends AgentMetrics {
  totalEndpoints: number;
  healthyEndpoints: number;
  slowEndpoints: number;
  errorEndpoints: number;
  downEndpoints: number;
  avgResponseTime: number;
  totalRequests: number;
  totalErrors: number;
  requestsPerSecond: number;
  errorRate: number;
  topSlowEndpoints: APIEndpoint[];
  topErrorEndpoints: APIEndpoint[];
}

interface APIPerformanceConfig extends AgentConfig {
  // Performance thresholds
  slowResponseThreshold: number; // ms
  errorRateThreshold: number; // percentage
  healthCheckInterval: number; // ms
  
  // Monitoring settings
  enableRealTimeMonitoring: boolean;
  trackUserAgents: boolean;
  trackGeoLocation: boolean;
  enableCaching: boolean;
  
  // Alert settings
  alertOnSlowResponse: boolean;
  alertOnHighErrorRate: boolean;
  alertOnEndpointDown: boolean;
  
  // Optimization settings
  suggestOptimizations: boolean;
  enableAutoOptimization: boolean;
  cacheTTL: number;
}

export class APIPerformanceAgent extends BaseAgent {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private activeRequests: Map<string, Date> = new Map();
  private apiConfig: APIPerformanceConfig;
  
  constructor() {
    super(
      'api-performance-monitor',
      'API Performance Monitor', 
      'Monitors API performance, tracks response times, and provides optimization recommendations',
      '1.0.0'
    );
    this.apiConfig = this.getDefaultConfig();
  }

  // Abstract method implementations required by BaseAgent
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing API Performance monitoring...');
    await this.discoverAPIEndpoints();
    this.startPerformanceMonitoring();
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Starting API Performance monitoring...');
    await this.discoverAPIEndpoints();
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping API Performance monitoring...');
    // No explicit stop method needed - intervals handled by BaseAgent
  }

  protected async execute(): Promise<void> {
    await this.performHealthChecks();
    await this.collectMetrics();
  }

  protected async onConfigurationChanged(config: any): Promise<void> {
    this.log('info', 'API Performance configuration updated');
    this.apiConfig = { ...this.apiConfig, ...config };
  }

  protected async getPerformanceMetrics(): Promise<{ cpu: number; memory: number; responseTime: number }> {
    const avgResponseTime = this.getAverageResponseTime();
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: avgResponseTime || Math.random() * 200 + 100
    };
  }

  private getAverageResponseTime(): number {
    const allTimes: number[] = [];
    for (const times of this.performanceHistory.values()) {
      allTimes.push(...times);
    }
    return allTimes.length > 0 ? allTimes.reduce((a, b) => a + b) / allTimes.length : 0;
  }

  protected async doStart(): Promise<void> {
    this.log('info', 'Starting API Performance monitoring...');
    
    // Initialize endpoint discovery
    await this.discoverAPIEndpoints();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Start health checks
    this.startHealthChecks();
    
    this.log('info', 'API Performance monitoring started successfully');
  }

  protected async doStop(): Promise<void> {
    this.log('info', 'Stopping API Performance monitoring...');
    // Cleanup monitoring intervals
    this.log('info', 'API Performance monitoring stopped');
  }

  protected async checkHealth(): Promise<AgentHealth> {
    try {
      const metrics = await this.collectMetrics() as APIPerformanceMetrics;
      const healthPercentage = this.calculateHealthPercentage(metrics);
      
      const issues = [];
      
      // Check for slow endpoints
      if (metrics.slowEndpoints > 0) {
        issues.push({
          severity: 'warning' as const,
          message: `${metrics.slowEndpoints} endpoints are responding slowly`,
          code: 'SLOW_ENDPOINTS',
          timestamp: new Date(),
        });
      }
      
      // Check for error endpoints
      if (metrics.errorEndpoints > 0) {
        issues.push({
          severity: 'error' as const,
          message: `${metrics.errorEndpoints} endpoints have high error rates`,
          code: 'HIGH_ERROR_RATE',
          timestamp: new Date(),
        });
      }
      
      // Check for down endpoints
      if (metrics.downEndpoints > 0) {
        issues.push({
          severity: 'critical' as const,
          message: `${metrics.downEndpoints} endpoints are down`,
          code: 'ENDPOINTS_DOWN',
          timestamp: new Date(),
        });
      }

      return {
        status: this.status,
        uptime: Date.now() - this.startTime.getTime(),
        lastCheck: new Date(),
        issues,
        performance: {
          cpu: 0, // Will be populated by monitoring
          memory: 0,
          responseTime: metrics.avgResponseTime,
        }
      };
    } catch (error) {
      this.log('error', 'Health check failed', { error });
      throw error;
    }
  }

  protected async collectMetrics(): Promise<APIPerformanceMetrics> {
    const totalEndpoints = this.endpoints.size;
    let healthyEndpoints = 0;
    let slowEndpoints = 0;
    let errorEndpoints = 0;
    let downEndpoints = 0;
    
    let totalResponseTime = 0;
    let totalRequests = 0;
    let totalErrors = 0;
    
    const topSlowEndpoints: APIEndpoint[] = [];
    const topErrorEndpoints: APIEndpoint[] = [];
    
    // Analyze each endpoint
    for (const endpoint of this.endpoints.values()) {
      totalRequests += endpoint.requestCount;
      totalResponseTime += endpoint.avgResponseTime * endpoint.requestCount;
      
      // Categorize endpoint status
      switch (endpoint.status) {
        case 'healthy':
          healthyEndpoints++;
          break;
        case 'slow':
          slowEndpoints++;
          topSlowEndpoints.push(endpoint);
          break;
        case 'errors':
          errorEndpoints++;
          topErrorEndpoints.push(endpoint);
          totalErrors += Math.round(endpoint.requestCount * endpoint.errorRate / 100);
          break;
        case 'down':
          downEndpoints++;
          break;
      }
    }
    
    // Sort and limit top problematic endpoints
    topSlowEndpoints.sort((a, b) => b.avgResponseTime - a.avgResponseTime);
    topErrorEndpoints.sort((a, b) => b.errorRate - a.errorRate);
    
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    return {
      // Base AgentMetrics properties
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: avgResponseTime,
      lastExecution: new Date(),
      customMetrics: {},
      // APIPerformanceMetrics specific properties
      totalEndpoints,
      healthyEndpoints,
      slowEndpoints,
      errorEndpoints,
      downEndpoints,
      avgResponseTime,
      totalRequests,
      totalErrors,
      requestsPerSecond: this.calculateRequestsPerSecond(),
      errorRate,
      topSlowEndpoints: topSlowEndpoints.slice(0, 5),
      topErrorEndpoints: topErrorEndpoints.slice(0, 5),
    };
  }

  /**
   * Discover all API endpoints in the application
   */
  private async discoverAPIEndpoints(): Promise<void> {
    this.log('info', 'Discovering API endpoints...');
    
    try {
      // In a real implementation, this would scan the /api directory
      // and register all endpoints dynamically
      const commonEndpoints = [
        { route: '/api/auth/login', method: 'POST', handler: 'auth' },
        { route: '/api/auth/logout', method: 'POST', handler: 'auth' },
        { route: '/api/auth/register', method: 'POST', handler: 'auth' },
        { route: '/api/users', method: 'GET', handler: 'users' },
        { route: '/api/users', method: 'POST', handler: 'users' },
        { route: '/api/deals', method: 'GET', handler: 'deals' },
        { route: '/api/deals', method: 'POST', handler: 'deals' },
        { route: '/api/leads', method: 'GET', handler: 'leads' },
        { route: '/api/contacts', method: 'GET', handler: 'contacts' },
        { route: '/api/reports', method: 'GET', handler: 'reports' },
        { route: '/api/integrations', method: 'GET', handler: 'integrations' },
        { route: '/api/billing', method: 'GET', handler: 'billing' },
        { route: '/api/analytics', method: 'GET', handler: 'analytics' },
      ];
      
      for (const endpoint of commonEndpoints) {
        const key = `${endpoint.method}:${endpoint.route}`;
        this.endpoints.set(key, {
          route: endpoint.route,
          method: endpoint.method,
          handler: endpoint.handler,
          avgResponseTime: 0,
          errorRate: 0,
          requestCount: 0,
          lastChecked: new Date(),
          status: 'healthy',
        });
      }
      
      this.log('info', `Discovered ${this.endpoints.size} API endpoints`);
    } catch (error) {
      this.log('error', 'Failed to discover API endpoints', { error });
      throw error;
    }
  }

  /**
   * Start real-time performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // In a real implementation, this would hook into the Next.js middleware
    // to track actual request performance
    this.log('info', 'Starting real-time performance monitoring');
    
    // Simulate performance data collection
    setInterval(() => {
      this.simulatePerformanceData();
    }, this.apiConfig.healthCheckInterval);
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.apiConfig.healthCheckInterval * 2);
  }

  /**
   * Perform health checks on all endpoints
   */
  private async performHealthChecks(): Promise<void> {
    for (const [key, endpoint] of this.endpoints.entries()) {
      try {
        // In a real implementation, this would make actual HTTP requests
        // to test endpoint availability and response time
        const responseTime = await this.testEndpoint(endpoint);
        
        // Update endpoint data
        this.updateEndpointPerformance(key, responseTime, false);
        
      } catch (error) {
        this.log('warn', `Health check failed for ${endpoint.route}`, { error });
        this.updateEndpointPerformance(key, 0, true);
      }
    }
  }

  /**
   * Test a specific endpoint
   */
  private async testEndpoint(endpoint: APIEndpoint): Promise<number> {
    const startTime = Date.now();
    
    // Simulate endpoint testing
    // In real implementation, would make actual HTTP request
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    return Date.now() - startTime;
  }

  /**
   * Update endpoint performance data
   */
  private updateEndpointPerformance(key: string, responseTime: number, isError: boolean): void {
    const endpoint = this.endpoints.get(key);
    if (!endpoint) return;
    
    // Update metrics
    endpoint.requestCount++;
    endpoint.lastChecked = new Date();
    
    if (isError) {
      endpoint.errorRate = ((endpoint.errorRate * (endpoint.requestCount - 1)) + 100) / endpoint.requestCount;
    } else {
      endpoint.avgResponseTime = ((endpoint.avgResponseTime * (endpoint.requestCount - 1)) + responseTime) / endpoint.requestCount;
      endpoint.errorRate = (endpoint.errorRate * (endpoint.requestCount - 1)) / endpoint.requestCount;
    }
    
    // Update status based on performance
    endpoint.status = this.determineEndpointStatus(endpoint);
    
    // Store in history
    const history = this.performanceHistory.get(key) || [];
    history.push(responseTime);
    if (history.length > 100) history.shift(); // Keep last 100 measurements
    this.performanceHistory.set(key, history);
    
    this.endpoints.set(key, endpoint);
  }

  /**
   * Determine endpoint status based on performance metrics
   */
  private determineEndpointStatus(endpoint: APIEndpoint): 'healthy' | 'slow' | 'errors' | 'down' {
    if (endpoint.errorRate > this.apiConfig.errorRateThreshold) {
      return endpoint.errorRate > 50 ? 'down' : 'errors';
    }
    
    if (endpoint.avgResponseTime > this.apiConfig.slowResponseThreshold) {
      return 'slow';
    }
    
    return 'healthy';
  }

  /**
   * Calculate overall health percentage
   */
  private calculateHealthPercentage(metrics: APIPerformanceMetrics): number {
    if (metrics.totalEndpoints === 0) return 100;
    
    const healthyWeight = 1.0;
    const slowWeight = 0.7;
    const errorWeight = 0.3;
    const downWeight = 0.0;
    
    const totalWeight = 
      (metrics.healthyEndpoints * healthyWeight) +
      (metrics.slowEndpoints * slowWeight) +
      (metrics.errorEndpoints * errorWeight) +
      (metrics.downEndpoints * downWeight);
    
    return Math.round((totalWeight / metrics.totalEndpoints) * 100);
  }

  /**
   * Calculate requests per second
   */
  private calculateRequestsPerSecond(): number {
    const totalRequests = Array.from(this.endpoints.values())
      .reduce((sum, endpoint) => sum + endpoint.requestCount, 0);
    
    const uptimeSeconds = (Date.now() - this.startTime.getTime()) / 1000;
    return uptimeSeconds > 0 ? totalRequests / uptimeSeconds : 0;
  }

  /**
   * Simulate performance data for testing
   */
  private simulatePerformanceData(): void {
    for (const [key, endpoint] of this.endpoints.entries()) {
      // Simulate some requests with varying performance
      const shouldSimulate = Math.random() > 0.7; // 30% chance per interval
      if (shouldSimulate) {
        const responseTime = Math.random() * 500 + 50; // 50-550ms
        const isError = Math.random() > 0.95; // 5% error rate
        
        this.updateEndpointPerformance(key, responseTime, isError);
      }
    }
  }

  /**
   * Get performance recommendations
   */
  public async getRecommendations(): Promise<string[]> {
    const metrics = await this.collectMetrics() as APIPerformanceMetrics;
    const recommendations: string[] = [];
    
    // Slow endpoint recommendations
    for (const endpoint of metrics.topSlowEndpoints) {
      if (endpoint.avgResponseTime > this.apiConfig.slowResponseThreshold * 2) {
        recommendations.push(
          `Consider optimizing ${endpoint.route} - average response time is ${Math.round(endpoint.avgResponseTime)}ms`
        );
      }
    }
    
    // Error rate recommendations
    for (const endpoint of metrics.topErrorEndpoints) {
      if (endpoint.errorRate > this.apiConfig.errorRateThreshold) {
        recommendations.push(
          `Investigate errors in ${endpoint.route} - error rate is ${endpoint.errorRate.toFixed(1)}%`
        );
      }
    }
    
    // General recommendations
    if (metrics.avgResponseTime > this.apiConfig.slowResponseThreshold) {
      recommendations.push('Consider implementing response caching to improve overall API performance');
    }
    
    if (metrics.errorRate > this.apiConfig.errorRateThreshold) {
      recommendations.push('Review error handling and add better validation to reduce API errors');
    }
    
    return recommendations;
  }

  /**
   * Get endpoint details
   */
  public getEndpointDetails(route?: string): APIEndpoint[] {
    if (route) {
      const endpoint = Array.from(this.endpoints.values())
        .find(ep => ep.route === route);
      return endpoint ? [endpoint] : [];
    }
    
    return Array.from(this.endpoints.values());
  }

  private getDefaultConfig(): APIPerformanceConfig {
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
      
      // APIPerformanceConfig specific properties
      slowResponseThreshold: 1000, // 1 second
      errorRateThreshold: 5, // 5%
      healthCheckInterval: 30000, // 30 seconds
      
      // Monitoring settings
      enableRealTimeMonitoring: true,
      trackUserAgents: true,
      trackGeoLocation: false,
      enableCaching: true,
      
      // Alert settings
      alertOnSlowResponse: true,
      alertOnHighErrorRate: true,
      alertOnEndpointDown: true,
      
      // Optimization settings
      suggestOptimizations: true,
      enableAutoOptimization: false,
      cacheTTL: 300, // 5 minutes
    };
  }
}