/**
 * Enterprise API Gateway System
 * 
 * Provides advanced rate limiting, API analytics, monitoring, and anomaly detection
 * for enterprise-grade API management with tenant isolation and security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from './cache/redis-manager';
import { createClient } from '@supabase/supabase-js';

// Mock RedisManager for development until full Redis implementation is available
class MockRedisManager {
  private cache = new Map<string, { value: string; expiry?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string): Promise<void> {
    this.cache.set(key, { value });
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.cache.set(key, { 
      value, 
      expiry: Date.now() + (seconds * 1000) 
    });
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (current ? parseInt(current) : 0) + 1;
    await this.set(key, newValue.toString());
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      this.cache.set(key, {
        ...item,
        expiry: Date.now() + (seconds * 1000)
      });
    }
  }

  async smembers(key: string): Promise<string[]> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : [];
  }

  async sadd(key: string, member: string): Promise<void> {
    const members = await this.smembers(key);
    if (!members.includes(member)) {
      members.push(member);
      await this.set(key, JSON.stringify(members));
    }
  }
}

// API Gateway Configuration
interface GatewayConfig {
  rateLimit: {
    window: number;        // Time window in seconds
    requests: number;      // Max requests per window
    burst: number;         // Burst capacity
  };
  quotas: {
    daily: number;
    monthly: number;
  };
  security: {
    enableAnomalyDetection: boolean;
    enableSignatureValidation: boolean;
    enableIPWhitelist: boolean;
  };
  monitoring: {
    enableAnalytics: boolean;
    enableMetrics: boolean;
    enableAlerting: boolean;
  };
}

// Request Context for Analytics
interface RequestContext {
  tenantId: string;
  userId?: string;
  endpoint: string;
  method: string;
  userAgent?: string;
  ipAddress: string;
  timestamp: Date;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
  requestSize: number;
  responseSize?: number;
}

// Rate Limiting Result
interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// API Analytics Data
interface ApiAnalytics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: { endpoint: string; count: number }[];
  hourlyMetrics: { hour: string; requests: number }[];
  statusCodes: { [code: string]: number };
  responseTimeDistribution: { [range: string]: number };
}

// Anomaly Detection Result
interface AnomalyResult {
  isAnomaly: boolean;
  riskScore: number;
  factors: string[];
  action: 'allow' | 'throttle' | 'block';
}

class EnterpriseAPIGateway {
  private redis: MockRedisManager;
  private supabase: any;
  private defaultConfig: GatewayConfig;

  constructor() {
    this.redis = new MockRedisManager();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.defaultConfig = {
      rateLimit: {
        window: 3600,      // 1 hour
        requests: 1000,    // 1000 requests per hour
        burst: 50          // 50 burst capacity
      },
      quotas: {
        daily: 10000,
        monthly: 300000
      },
      security: {
        enableAnomalyDetection: true,
        enableSignatureValidation: true,
        enableIPWhitelist: false
      },
      monitoring: {
        enableAnalytics: true,
        enableMetrics: true,
        enableAlerting: true
      }
    };
  }

  /**
   * Main Gateway Handler - Process API Request
   */
  async processRequest(
    request: NextRequest,
    tenantId: string,
    endpoint: string
  ): Promise<{ response?: NextResponse; context: RequestContext }> {
    const startTime = Date.now();
    const context: RequestContext = {
      tenantId,
      endpoint,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: this.getClientIP(request),
      timestamp: new Date(),
      requestSize: this.getRequestSize(request)
    };

    try {
      // Get tenant configuration
      const config = await this.getTenantConfig(tenantId);

      // 1. Rate Limiting Check
      const rateLimitResult = await this.checkRateLimit(tenantId, context, config);
      if (!rateLimitResult.allowed) {
        return {
          response: this.createRateLimitResponse(rateLimitResult),
          context: { ...context, statusCode: 429 }
        };
      }

      // 2. Quota Check
      const quotaValid = await this.checkQuotas(tenantId, config);
      if (!quotaValid) {
        return {
          response: NextResponse.json(
            { error: 'API quota exceeded' },
            { status: 429 }
          ),
          context: { ...context, statusCode: 429 }
        };
      }

      // 3. Security Checks
      if (config.security.enableAnomalyDetection) {
        const anomalyResult = await this.detectAnomalies(context, config);
        if (anomalyResult.action === 'block') {
          await this.logSecurityEvent(context, anomalyResult);
          return {
            response: NextResponse.json(
              { error: 'Request blocked by security policy' },
              { status: 403 }
            ),
            context: { ...context, statusCode: 403 }
          };
        }
      }

      // 4. IP Whitelist Check
      if (config.security.enableIPWhitelist) {
        const ipAllowed = await this.checkIPWhitelist(tenantId, context.ipAddress);
        if (!ipAllowed) {
          return {
            response: NextResponse.json(
              { error: 'IP address not whitelisted' },
              { status: 403 }
            ),
            context: { ...context, statusCode: 403 }
          };
        }
      }

      // Request approved - update analytics
      await this.recordRequest(context, config);
      return { context };

    } catch (error) {
      console.error('API Gateway processing error:', error);
      return {
        response: NextResponse.json(
          { error: 'Gateway processing failed' },
          { status: 500 }
        ),
        context: { ...context, statusCode: 500, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Record Response - Complete Request Analytics
   */
  async recordResponse(
    context: RequestContext,
    response: NextResponse
  ): Promise<void> {
    try {
      const responseTime = Date.now() - context.timestamp.getTime();
      const statusCode = response.status;

      const updatedContext = {
        ...context,
        responseTime,
        statusCode,
        responseSize: this.getResponseSize(response)
      };

      await this.updateAnalytics(updatedContext);
      await this.updateMetrics(updatedContext);

      // Check for alerting conditions
      if (statusCode >= 500) {
        await this.checkAlertConditions(updatedContext);
      }

    } catch (error) {
      console.error('Response recording error:', error);
    }
  }

  /**
   * Rate Limiting Implementation
   */
  private async checkRateLimit(
    tenantId: string,
    context: RequestContext,
    config: GatewayConfig
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${tenantId}:${context.endpoint}:${Math.floor(Date.now() / (config.rateLimit.window * 1000))}`;
    
    try {
      const current = await this.redis.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= config.rateLimit.requests) {
        return {
          allowed: false,
          limit: config.rateLimit.requests,
          remaining: 0,
          resetTime: Math.ceil(Date.now() / (config.rateLimit.window * 1000)) * config.rateLimit.window,
          retryAfter: config.rateLimit.window
        };
      }

      // Increment counter
      await this.redis.setex(key, config.rateLimit.window, (count + 1).toString());

      return {
        allowed: true,
        limit: config.rateLimit.requests,
        remaining: config.rateLimit.requests - count - 1,
        resetTime: Math.ceil(Date.now() / (config.rateLimit.window * 1000)) * config.rateLimit.window
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open in case of Redis issues
      return {
        allowed: true,
        limit: config.rateLimit.requests,
        remaining: config.rateLimit.requests,
        resetTime: Date.now() + config.rateLimit.window * 1000
      };
    }
  }

  /**
   * Quota Management
   */
  private async checkQuotas(tenantId: string, config: GatewayConfig): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const month = new Date().toISOString().substring(0, 7);

      const [dailyCount, monthlyCount] = await Promise.all([
        this.redis.get(`quota:daily:${tenantId}:${today}`),
        this.redis.get(`quota:monthly:${tenantId}:${month}`)
      ]);

      const dailyUsage = dailyCount ? parseInt(dailyCount) : 0;
      const monthlyUsage = monthlyCount ? parseInt(monthlyCount) : 0;

      return dailyUsage < config.quotas.daily && monthlyUsage < config.quotas.monthly;

    } catch (error) {
      console.error('Quota check error:', error);
      return true; // Fail open
    }
  }

  /**
   * Anomaly Detection System
   */
  private async detectAnomalies(
    context: RequestContext,
    config: GatewayConfig
  ): Promise<AnomalyResult> {
    let riskScore = 0;
    const factors: string[] = [];

    try {
      // 1. Request frequency anomaly
      const recentRequests = await this.getRecentRequestCount(context.tenantId, context.ipAddress);
      const frequencyThreshold = config.rateLimit.requests / 60; // Requests per minute based on rate limit
      if (recentRequests > frequencyThreshold) {
        riskScore += 30;
        factors.push('High request frequency');
      }

      // 2. Geographic anomaly
      const isNewLocation = await this.checkGeographicAnomaly(context.tenantId, context.ipAddress);
      if (isNewLocation) {
        riskScore += 20;
        factors.push('New geographic location');
      }

      // 3. User agent anomaly
      if (!context.userAgent || context.userAgent.length < 10) {
        riskScore += 15;
        factors.push('Suspicious user agent');
      }

      // 4. Endpoint access pattern
      const unusualEndpoint = await this.checkEndpointAnomaly(context.tenantId, context.endpoint);
      if (unusualEndpoint) {
        riskScore += 25;
        factors.push('Unusual endpoint access');
      }

      // 5. Time-based anomaly (configurable business hours)
      const hour = new Date().getHours();
      const isBusinessHours = hour >= 6 && hour <= 22; // Configurable in real implementation
      if (!isBusinessHours) {
        riskScore += 10;
        factors.push('Off-hours access');
      }

      // Determine action based on risk score (configurable thresholds)
      let action: 'allow' | 'throttle' | 'block' = 'allow';
      if (riskScore >= 70) {
        action = 'block';
      } else if (riskScore >= 40) {
        action = 'throttle';
      }

      return {
        isAnomaly: riskScore > 25,
        riskScore,
        factors,
        action
      };

    } catch (error) {
      console.error('Anomaly detection error:', error);
      return {
        isAnomaly: false,
        riskScore: 0,
        factors: [],
        action: 'allow'
      };
    }
  }

  /**
   * Analytics and Metrics Collection
   */
  private async recordRequest(context: RequestContext, config: GatewayConfig): Promise<void> {
    if (!config.monitoring.enableAnalytics) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const hour = new Date().toISOString().substring(0, 13);

      // Update request counters
      await Promise.all([
        this.redis.incr(`analytics:requests:${context.tenantId}:${today}`),
        this.redis.incr(`analytics:requests:hourly:${context.tenantId}:${hour}`),
        this.redis.incr(`analytics:endpoints:${context.tenantId}:${context.endpoint}:${today}`),
        this.redis.incr(`quota:daily:${context.tenantId}:${today}`),
        this.redis.incr(`quota:monthly:${context.tenantId}:${new Date().toISOString().substring(0, 7)}`)
      ]);

      // Set expiration for counters
      await Promise.all([
        this.redis.expire(`analytics:requests:${context.tenantId}:${today}`, 86400 * 7), // 7 days
        this.redis.expire(`analytics:requests:hourly:${context.tenantId}:${hour}`, 86400), // 24 hours
        this.redis.expire(`analytics:endpoints:${context.tenantId}:${context.endpoint}:${today}`, 86400 * 7)
      ]);

    } catch (error) {
      console.error('Request recording error:', error);
    }
  }

  /**
   * Get API Analytics for Dashboard
   */
  async getAnalytics(tenantId: string, days: number = 7): Promise<ApiAnalytics> {
    try {
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      // Get request counts
      const requestCounts = await Promise.all(
        dates.map(date => this.redis.get(`analytics:requests:${tenantId}:${date}`))
      );

      const totalRequests = requestCounts
        .map(count => count ? parseInt(count) : 0)
        .reduce((sum, count) => sum + count, 0);

      // Get error counts
      const errorCounts = await Promise.all(
        dates.map(date => this.redis.get(`analytics:errors:${tenantId}:${date}`))
      );

      const totalErrors = errorCounts
        .map(count => count ? parseInt(count) : 0)
        .reduce((sum, count) => sum + count, 0);

      // Get hourly metrics for today
      const today = new Date().toISOString().split('T')[0];
      const hours = Array.from({ length: 24 }, (_, i) => 
        `${today}T${i.toString().padStart(2, '0')}`
      );

      const hourlyData = await Promise.all(
        hours.map(async hour => {
          const count = await this.redis.get(`analytics:requests:hourly:${tenantId}:${hour}`);
          return {
            hour: hour.split('T')[1],
            requests: count ? parseInt(count) : 0
          };
        })
      );

      // Calculate real metrics from actual data
      const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 0;
      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      // Get endpoint statistics
      const topEndpoints: { endpoint: string; count: number }[] = [];
      // Would implement: fetch and aggregate endpoint-specific counters

      // Get status code distribution from stored data
      const statusCodes: { [code: string]: number } = {};
      // Would implement: fetch actual status code distributions

      // Get response time distribution from stored data
      const responseTimeDistribution: { [range: string]: number } = {};
      // Would implement: fetch actual response time data

      return {
        totalRequests,
        successRate,
        averageResponseTime: 0, // Calculate from stored response times when available
        errorRate,
        topEndpoints,
        hourlyMetrics: hourlyData,
        statusCodes,
        responseTimeDistribution
      };

    } catch (error) {
      console.error('Analytics retrieval error:', error);
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        errorRate: 0,
        topEndpoints: [],
        hourlyMetrics: [],
        statusCodes: {},
        responseTimeDistribution: {}
      };
    }
  }

  /**
   * Helper Methods
   */
  private async getTenantConfig(tenantId: string): Promise<GatewayConfig> {
    try {
      const cached = await this.redis.get(`gateway_config:${tenantId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from database or use default
      const config = this.defaultConfig;
      await this.redis.setex(`gateway_config:${tenantId}`, 3600, JSON.stringify(config));
      return config;

    } catch (error) {
      console.error('Config retrieval error:', error);
      return this.defaultConfig;
    }
  }

  private getClientIP(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
  }

  private getRequestSize(request: NextRequest): number {
    const contentLength = request.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  }

  private getResponseSize(response: NextResponse): number {
    // Get actual response size from headers if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength);
    }
    
    // Try to estimate from response body if available
    try {
      const body = response.body;
      if (body) {
        // Would implement actual size calculation based on response type
        return 0; // Return 0 if size cannot be determined
      }
    } catch (error) {
      console.warn('Could not determine response size:', error);
    }
    
    return 0; // Return 0 for unknown size instead of placeholder
  }

  private createRateLimitResponse(result: RateLimitResult): NextResponse {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        retryAfter: result.retryAfter
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': result.retryAfter?.toString() || '3600'
        }
      }
    );
  }

  private async getRecentRequestCount(tenantId: string, ipAddress: string): Promise<number> {
    const key = `recent_requests:${tenantId}:${ipAddress}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count) : 0;
  }

  private async checkGeographicAnomaly(tenantId: string, ipAddress: string): Promise<boolean> {
    try {
      // Check against known IPs for this tenant
      const knownIPs = await this.redis.smembers(`known_ips:${tenantId}`);
      
      if (knownIPs.includes(ipAddress)) {
        return false; // Known IP, not anomalous
      }
      
      // If this is a new IP, check if we should add it to known IPs
      // In production, would implement GeoIP lookup and distance calculation
      
      // For now, consider any new IP as potentially anomalous
      // but add it to known IPs for future requests
      await this.redis.sadd(`known_ips:${tenantId}`, ipAddress);
      
      // Return true for first-time IPs (could be legitimate or suspicious)
      return knownIPs.length > 0; // Only anomalous if we have established baseline
      
    } catch (error) {
      console.error('Geographic anomaly check error:', error);
      return false; // Fail safe
    }
  }

  private async checkEndpointAnomaly(tenantId: string, endpoint: string): Promise<boolean> {
    // Check if endpoint is frequently accessed by this tenant
    const today = new Date().toISOString().split('T')[0];
    const count = await this.redis.get(`analytics:endpoints:${tenantId}:${endpoint}:${today}`);
    
    if (!count) {
      // New endpoint - could be considered anomalous depending on security policy
      return true;
    }
    
    const accessCount = parseInt(count);
    
    // Get tenant's average endpoint usage to determine if this is unusual
    const avgUsageKey = `analytics:avg_endpoint_usage:${tenantId}:${today}`;
    const avgUsageStr = await this.redis.get(avgUsageKey);
    const avgUsage = avgUsageStr ? parseInt(avgUsageStr) : 10; // Default threshold
    
    // Consider unusual if significantly below average usage
    return accessCount < (avgUsage * 0.1); // Less than 10% of average usage
  }

  private async checkIPWhitelist(tenantId: string, ipAddress: string): Promise<boolean> {
    const whitelist = await this.redis.smembers(`ip_whitelist:${tenantId}`);
    return whitelist.length === 0 || whitelist.includes(ipAddress);
  }

  private async logSecurityEvent(context: RequestContext, anomaly: AnomalyResult): Promise<void> {
    try {
      await this.supabase
        .from('security_events')
        .insert({
          tenant_id: context.tenantId,
          event_type: 'anomaly_detected',
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
          endpoint: context.endpoint,
          risk_score: anomaly.riskScore,
          factors: anomaly.factors,
          action_taken: anomaly.action,
          created_at: context.timestamp.toISOString()
        });
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  private async updateAnalytics(context: RequestContext): Promise<void> {
    // Would implement detailed analytics updates
  }

  private async updateMetrics(context: RequestContext): Promise<void> {
    // Would implement metrics updates for monitoring
  }

  private async checkAlertConditions(context: RequestContext): Promise<void> {
    // Would implement alerting logic for critical conditions
  }
}

// Middleware Integration Helper
export class APIGatewayMiddleware {
  private gateway: EnterpriseAPIGateway;

  constructor() {
    this.gateway = new EnterpriseAPIGateway();
  }

  async middleware(request: NextRequest): Promise<NextResponse | undefined> {
    // Extract tenant info from request
    const tenantId = this.extractTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }

    const endpoint = new URL(request.url).pathname;
    
    // Process request through gateway
    const { response, context } = await this.gateway.processRequest(request, tenantId, endpoint);
    
    if (response) {
      return response;
    }

    // Continue with request processing...
    return undefined;
  }

  private extractTenantId(request: NextRequest): string | null {
    // Extract from subdomain, header, or token
    const host = request.headers.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }
    
    return request.headers.get('x-tenant-id') || null;
  }
}

export { EnterpriseAPIGateway, type GatewayConfig, type ApiAnalytics };