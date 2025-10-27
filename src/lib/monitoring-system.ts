/**
 * Comprehensive Monitoring & Performance Tracking System
 * 
 * Provides Prometheus metrics collection, performance monitoring,
 * alerting system, and comprehensive analytics for enterprise operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Metrics Types and Interfaces
export interface Metric {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: AlertCondition[];
  actions: AlertAction[];
  isActive: boolean;
  tenantId?: string;
  createdAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration: number; // minutes
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'sms';
  target: string;
  template?: string;
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    percentage: number;
    count: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  databaseMetrics: {
    connectionCount: number;
    queryTime: number;
    slowQueries: number;
  };
  cacheMetrics: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };
}

export interface MonitoringConfig {
  collection: {
    interval: number; // seconds
    retention: number; // days
    enabledMetrics: string[];
  };
  alerting: {
    enabled: boolean;
    checkInterval: number; // seconds
    defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  };
  performance: {
    enableAPM: boolean;
    enableProfiling: boolean;
    sampleRate: number; // 0-1
  };
  export: {
    prometheus: {
      enabled: boolean;
      port: number;
      path: string;
    };
    grafana: {
      enabled: boolean;
      dashboardPath: string;
    };
  };
}

// Mock Prometheus client for development
class MockPrometheusMetrics {
  private metrics = new Map<string, Metric[]>();

  counter(name: string, help: string, labelNames: string[] = []): MockCounter {
    return new MockCounter(name, this);
  }

  gauge(name: string, help: string, labelNames: string[] = []): MockGauge {
    return new MockGauge(name, this);
  }

  histogram(name: string, help: string, buckets: number[] = [], labelNames: string[] = []): MockHistogram {
    return new MockHistogram(name, buckets, this);
  }

  summary(name: string, help: string, percentiles: number[] = [], labelNames: string[] = []): MockSummary {
    return new MockSummary(name, percentiles, this);
  }

  addMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    this.metrics.get(metric.name)!.push(metric);

    // Keep only recent metrics (last 1000 per metric)
    const metricArray = this.metrics.get(metric.name)!;
    if (metricArray.length > 1000) {
      metricArray.splice(0, metricArray.length - 1000);
    }
  }

  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  exportPrometheusFormat(): string {
    const lines: string[] = [];
    
    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;
      
      const latest = metrics[metrics.length - 1];
      const labelStr = Object.entries(latest.labels)
        .map(([key, value]) => `${key}="${value}"`)
        .join(',');
      
      lines.push(`# TYPE ${name} ${latest.type}`);
      lines.push(`${name}${labelStr ? `{${labelStr}}` : ''} ${latest.value} ${latest.timestamp.getTime()}`);
    }
    
    return lines.join('\n');
  }
}

class MockCounter {
  constructor(private name: string, private registry: MockPrometheusMetrics) {}

  inc(labels: Record<string, string> = {}, value: number = 1): void {
    this.registry.addMetric({
      name: this.name,
      value,
      labels,
      timestamp: new Date(),
      type: 'counter'
    });
  }
}

class MockGauge {
  constructor(private name: string, private registry: MockPrometheusMetrics) {}

  set(value: number, labels: Record<string, string> = {}): void {
    this.registry.addMetric({
      name: this.name,
      value,
      labels,
      timestamp: new Date(),
      type: 'gauge'
    });
  }

  inc(labels: Record<string, string> = {}, value: number = 1): void {
    this.registry.addMetric({
      name: this.name,
      value,
      labels,
      timestamp: new Date(),
      type: 'gauge'
    });
  }

  dec(labels: Record<string, string> = {}, value: number = 1): void {
    this.inc(labels, -value);
  }
}

class MockHistogram {
  constructor(
    private name: string,
    private buckets: number[],
    private registry: MockPrometheusMetrics
  ) {}

  observe(value: number, labels: Record<string, string> = {}): void {
    this.registry.addMetric({
      name: this.name,
      value,
      labels,
      timestamp: new Date(),
      type: 'histogram'
    });
  }
}

class MockSummary {
  constructor(
    private name: string,
    private percentiles: number[],
    private registry: MockPrometheusMetrics
  ) {}

  observe(value: number, labels: Record<string, string> = {}): void {
    this.registry.addMetric({
      name: this.name,
      value,
      labels,
      timestamp: new Date(),
      type: 'summary'
    });
  }
}

export class MonitoringSystem {
  private config: MonitoringConfig;
  private metrics: MockPrometheusMetrics;
  private supabase: any;
  private alerts: Map<string, Alert> = new Map();
  private activeAlerts: Map<string, any> = new Map();
  private collectionInterval?: NodeJS.Timeout;
  private alertingInterval?: NodeJS.Timeout;

  // Prometheus-style metrics
  private httpRequestsTotal: MockCounter;
  private httpRequestDuration: MockHistogram;
  private systemCpuUsage: MockGauge;
  private systemMemoryUsage: MockGauge;
  private databaseConnections: MockGauge;
  private cacheHitRate: MockGauge;
  private activeUsers: MockGauge;
  private errorRate: MockCounter;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      collection: {
        interval: 30,
        retention: 30,
        enabledMetrics: ['http', 'system', 'database', 'cache', 'custom'],
        ...config.collection
      },
      alerting: {
        enabled: true,
        checkInterval: 60,
        defaultSeverity: 'medium',
        ...config.alerting
      },
      performance: {
        enableAPM: true,
        enableProfiling: false,
        sampleRate: 0.1,
        ...config.performance
      },
      export: {
        prometheus: {
          enabled: true,
          port: 9090,
          path: '/metrics'
        },
        grafana: {
          enabled: true,
          dashboardPath: '/grafana'
        },
        ...config.export
      }
    };

    this.metrics = new MockPrometheusMetrics();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.initializeMetrics();
    this.loadAlerts();
    this.startCollection();
    this.startAlerting();
  }

  /**
   * Initialize all metrics
   */
  private initializeMetrics(): void {
    this.httpRequestsTotal = this.metrics.counter(
      'http_requests_total',
      'Total number of HTTP requests',
      ['method', 'route', 'status_code', 'tenant_id']
    );

    this.httpRequestDuration = this.metrics.histogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      ['method', 'route', 'tenant_id']
    );

    this.systemCpuUsage = this.metrics.gauge(
      'system_cpu_usage_percent',
      'System CPU usage percentage'
    );

    this.systemMemoryUsage = this.metrics.gauge(
      'system_memory_usage_bytes',
      'System memory usage in bytes'
    );

    this.databaseConnections = this.metrics.gauge(
      'database_connections_active',
      'Number of active database connections',
      ['tenant_id']
    );

    this.cacheHitRate = this.metrics.gauge(
      'cache_hit_rate_percent',
      'Cache hit rate percentage',
      ['cache_type', 'tenant_id']
    );

    this.activeUsers = this.metrics.gauge(
      'active_users_total',
      'Number of active users',
      ['tenant_id']
    );

    this.errorRate = this.metrics.counter(
      'errors_total',
      'Total number of errors',
      ['type', 'severity', 'tenant_id']
    );
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    tenantId?: string
  ): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      tenant_id: tenantId || 'unknown'
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(duration / 1000, {
      method,
      route,
      tenant_id: tenantId || 'unknown'
    });

    // Record errors
    if (statusCode >= 400) {
      const severity = statusCode >= 500 ? 'high' : 'medium';
      this.errorRate.inc({
        type: 'http_error',
        severity,
        tenant_id: tenantId || 'unknown'
      });
    }
  }

  /**
   * Record system metrics
   */
  async recordSystemMetrics(): Promise<void> {
    try {
      // Get system metrics (mock implementation)
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.systemMemoryUsage.set(memoryUsage.heapUsed);
      this.systemCpuUsage.set(Math.random() * 100); // Mock CPU usage

      // Database metrics
      const { data: dbStats } = await this.supabase
        .rpc('get_database_stats');
      
      if (dbStats) {
        this.databaseConnections.set(dbStats.active_connections || 0);
      }

    } catch (error) {
      console.error('System metrics collection error:', error);
    }
  }

  /**
   * Record custom business metrics
   */
  recordCustomMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric: Metric = {
      name: `custom_${name}`,
      value,
      labels,
      timestamp: new Date(),
      type: 'gauge'
    };

    this.metrics.addMetric(metric);
  }

  /**
   * Get performance metrics summary
   */
  async getPerformanceMetrics(tenantId?: string, hours: number = 24): Promise<PerformanceMetrics> {
    try {
      const httpMetrics = this.metrics.getMetrics('http_requests_total');
      const durationMetrics = this.metrics.getMetrics('http_request_duration_seconds');
      
      // Filter by tenant if specified
      const filteredHttpMetrics = tenantId 
        ? httpMetrics.filter(m => m.labels.tenant_id === tenantId)
        : httpMetrics;

      const filteredDurationMetrics = tenantId
        ? durationMetrics.filter(m => m.labels.tenant_id === tenantId)
        : durationMetrics;

      // Calculate response time percentiles
      const durations = filteredDurationMetrics
        .map(m => m.value * 1000) // Convert to ms
        .sort((a, b) => a - b);

      const responseTime = {
        avg: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
        p50: this.percentile(durations, 50),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99)
      };

      // Calculate throughput
      const recentRequests = filteredHttpMetrics.filter(
        m => m.timestamp.getTime() > Date.now() - hours * 60 * 60 * 1000
      );

      const throughput = {
        requestsPerSecond: recentRequests.length / (hours * 3600),
        requestsPerMinute: recentRequests.length / (hours * 60)
      };

      // Calculate error rate
      const errorRequests = filteredHttpMetrics.filter(
        m => parseInt(m.labels.status_code) >= 400
      );

      const errorRate = {
        percentage: filteredHttpMetrics.length > 0 
          ? (errorRequests.length / filteredHttpMetrics.length) * 100 
          : 0,
        count: errorRequests.length
      };

      // Get system health (latest values)
      const latestCpu = this.metrics.getMetrics('system_cpu_usage_percent').slice(-1)[0];
      const latestMemory = this.metrics.getMetrics('system_memory_usage_bytes').slice(-1)[0];

      const systemHealth = {
        cpuUsage: latestCpu?.value || 0,
        memoryUsage: latestMemory?.value || 0,
        diskUsage: 0, // Would implement actual disk monitoring
        uptime: process.uptime()
      };

      // Database metrics
      const dbConnections = this.metrics.getMetrics('database_connections_active').slice(-1)[0];
      const databaseMetrics = {
        connectionCount: dbConnections?.value || 0,
        queryTime: 0, // Would implement query time monitoring
        slowQueries: 0 // Would implement slow query monitoring
      };

      // Cache metrics
      const cacheHit = this.metrics.getMetrics('cache_hit_rate_percent').slice(-1)[0];
      const cacheMetrics = {
        hitRate: cacheHit?.value || 0,
        missRate: cacheHit ? 100 - cacheHit.value : 0,
        evictionRate: 0 // Would implement cache eviction monitoring
      };

      return {
        responseTime,
        throughput,
        errorRate,
        systemHealth,
        databaseMetrics,
        cacheMetrics
      };

    } catch (error) {
      console.error('Performance metrics calculation error:', error);
      return this.getEmptyPerformanceMetrics();
    }
  }

  /**
   * Alert Management
   */
  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...alert
    };

    try {
      // Store in database
      await this.supabase
        .from('monitoring_alerts')
        .insert({
          id: newAlert.id,
          name: newAlert.name,
          description: newAlert.description,
          severity: newAlert.severity,
          conditions: newAlert.conditions,
          actions: newAlert.actions,
          is_active: newAlert.isActive,
          tenant_id: newAlert.tenantId,
          created_at: newAlert.createdAt.toISOString()
        });

      this.alerts.set(newAlert.id, newAlert);
      return newAlert;

    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  async updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert> {
    const existing = this.alerts.get(alertId);
    if (!existing) {
      throw new Error('Alert not found');
    }

    const updated = { ...existing, ...updates };

    try {
      await this.supabase
        .from('monitoring_alerts')
        .update({
          name: updated.name,
          description: updated.description,
          severity: updated.severity,
          conditions: updated.conditions,
          actions: updated.actions,
          is_active: updated.isActive
        })
        .eq('id', alertId);

      this.alerts.set(alertId, updated);
      return updated;

    } catch (error) {
      console.error('Failed to update alert:', error);
      throw error;
    }
  }

  async deleteAlert(alertId: string): Promise<void> {
    try {
      await this.supabase
        .from('monitoring_alerts')
        .delete()
        .eq('id', alertId);

      this.alerts.delete(alertId);
      this.activeAlerts.delete(alertId);

    } catch (error) {
      console.error('Failed to delete alert:', error);
      throw error;
    }
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    return this.metrics.exportPrometheusFormat();
  }

  /**
   * Create Grafana dashboard configuration
   */
  getGrafanaDashboard(): any {
    return {
      dashboard: {
        title: 'GhostCRM Monitoring Dashboard',
        tags: ['ghostcrm', 'monitoring'],
        timezone: 'browser',
        panels: [
          {
            title: 'HTTP Requests per Second',
            type: 'graph',
            targets: [
              {
                expr: 'rate(http_requests_total[5m])',
                legendFormat: '{{method}} {{route}}'
              }
            ]
          },
          {
            title: 'Response Time Percentiles',
            type: 'graph',
            targets: [
              {
                expr: 'histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))',
                legendFormat: 'p50'
              },
              {
                expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
                legendFormat: 'p95'
              },
              {
                expr: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))',
                legendFormat: 'p99'
              }
            ]
          },
          {
            title: 'Error Rate',
            type: 'graph',
            targets: [
              {
                expr: 'rate(errors_total[5m])',
                legendFormat: '{{type}} {{severity}}'
              }
            ]
          },
          {
            title: 'System Resources',
            type: 'graph',
            targets: [
              {
                expr: 'system_cpu_usage_percent',
                legendFormat: 'CPU Usage %'
              },
              {
                expr: 'system_memory_usage_bytes / 1024 / 1024',
                legendFormat: 'Memory Usage MB'
              }
            ]
          },
          {
            title: 'Database Connections',
            type: 'graph',
            targets: [
              {
                expr: 'database_connections_active',
                legendFormat: 'Active Connections'
              }
            ]
          },
          {
            title: 'Cache Hit Rate',
            type: 'graph',
            targets: [
              {
                expr: 'cache_hit_rate_percent',
                legendFormat: '{{cache_type}} Hit Rate %'
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Private methods
   */
  private async loadAlerts(): Promise<void> {
    try {
      const { data: alerts } = await this.supabase
        .from('monitoring_alerts')
        .select('*')
        .eq('is_active', true);

      if (alerts) {
        alerts.forEach((alert: any) => {
          this.alerts.set(alert.id, {
            id: alert.id,
            name: alert.name,
            description: alert.description,
            severity: alert.severity,
            conditions: alert.conditions,
            actions: alert.actions,
            isActive: alert.is_active,
            tenantId: alert.tenant_id,
            createdAt: new Date(alert.created_at)
          });
        });
      }

    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }

  private startCollection(): void {
    this.collectionInterval = setInterval(async () => {
      await this.recordSystemMetrics();
    }, this.config.collection.interval * 1000);
  }

  private startAlerting(): void {
    if (!this.config.alerting.enabled) return;

    this.alertingInterval = setInterval(async () => {
      await this.checkAlerts();
    }, this.config.alerting.checkInterval * 1000);
  }

  private async checkAlerts(): Promise<void> {
    for (const [alertId, alert] of this.alerts.entries()) {
      if (!alert.isActive) continue;

      try {
        const shouldTrigger = await this.evaluateAlertConditions(alert);
        
        if (shouldTrigger && !this.activeAlerts.has(alertId)) {
          await this.triggerAlert(alert);
          this.activeAlerts.set(alertId, {
            triggeredAt: new Date(),
            alert
          });
        } else if (!shouldTrigger && this.activeAlerts.has(alertId)) {
          await this.resolveAlert(alert);
          this.activeAlerts.delete(alertId);
        }

      } catch (error) {
        console.error(`Alert evaluation error for ${alertId}:`, error);
      }
    }
  }

  private async evaluateAlertConditions(alert: Alert): Promise<boolean> {
    for (const condition of alert.conditions) {
      const metricValues = this.metrics.getMetrics(condition.metric);
      if (metricValues.length === 0) continue;

      // Get recent values within duration window
      const windowStart = Date.now() - condition.duration * 60 * 1000;
      const recentValues = metricValues.filter(
        m => m.timestamp.getTime() > windowStart
      );

      if (recentValues.length === 0) continue;

      // Calculate average for the duration
      const average = recentValues.reduce((sum, m) => sum + m.value, 0) / recentValues.length;

      // Check condition
      const conditionMet = this.evaluateCondition(average, condition.operator, condition.threshold);
      if (conditionMet) {
        return true;
      }
    }

    return false;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private async triggerAlert(alert: Alert): Promise<void> {
    console.warn(`ALERT TRIGGERED: ${alert.name} (${alert.severity})`);
    
    for (const action of alert.actions) {
      try {
        await this.executeAlertAction(alert, action);
      } catch (error) {
        console.error(`Failed to execute alert action:`, error);
      }
    }

    // Log alert trigger
    await this.supabase
      .from('alert_history')
      .insert({
        alert_id: alert.id,
        action: 'triggered',
        severity: alert.severity,
        message: `Alert ${alert.name} was triggered`,
        triggered_at: new Date().toISOString()
      });
  }

  private async resolveAlert(alert: Alert): Promise<void> {
    console.info(`ALERT RESOLVED: ${alert.name}`);

    // Log alert resolution
    await this.supabase
      .from('alert_history')
      .insert({
        alert_id: alert.id,
        action: 'resolved',
        severity: alert.severity,
        message: `Alert ${alert.name} was resolved`,
        triggered_at: new Date().toISOString()
      });
  }

  private async executeAlertAction(alert: Alert, action: AlertAction): Promise<void> {
    switch (action.type) {
      case 'email':
        // Would implement email notification
        console.log(`Email alert sent to: ${action.target}`);
        break;
      case 'webhook':
        // Would implement webhook notification
        console.log(`Webhook alert sent to: ${action.target}`);
        break;
      case 'slack':
        // Would implement Slack notification
        console.log(`Slack alert sent to: ${action.target}`);
        break;
      case 'sms':
        // Would implement SMS notification
        console.log(`SMS alert sent to: ${action.target}`);
        break;
    }
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const index = Math.ceil(arr.length * p / 100) - 1;
    return arr[Math.max(0, Math.min(index, arr.length - 1))];
  }

  private getEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
      throughput: { requestsPerSecond: 0, requestsPerMinute: 0 },
      errorRate: { percentage: 0, count: 0 },
      systemHealth: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, uptime: 0 },
      databaseMetrics: { connectionCount: 0, queryTime: 0, slowQueries: 0 },
      cacheMetrics: { hitRate: 0, missRate: 0, evictionRate: 0 }
    };
  }

  /**
   * Cleanup and shutdown
   */
  stop(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
    if (this.alertingInterval) {
      clearInterval(this.alertingInterval);
    }
  }
}

// Middleware for automatic HTTP monitoring
export function createMonitoringMiddleware(monitoring: MonitoringSystem) {
  return function monitoringMiddleware(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const method = request.method;
    const route = new URL(request.url).pathname;

    return new Promise((resolve) => {
      // Continue with request processing
      const response = NextResponse.next();
      
      // Record metrics after response
      const duration = Date.now() - startTime;
      const tenantId = request.headers.get('x-tenant-id') || undefined;
      
      monitoring.recordHttpRequest(
        method,
        route,
        response.status,
        duration,
        tenantId
      );

      resolve(response);
    });
  };
}

// Singleton instance
export const monitoringSystem = new MonitoringSystem();

// Express-style metrics endpoint
export async function metricsHandler(request: NextRequest): Promise<NextResponse> {
  const metrics = monitoringSystem.getPrometheusMetrics();
  
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4'
    }
  });
}

// Health check endpoint
export async function healthHandler(request: NextRequest): Promise<NextResponse> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  return NextResponse.json(health);
}

// Performance metrics API endpoint
export async function performanceHandler(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenantId') || undefined;
  const hours = parseInt(url.searchParams.get('hours') || '24');

  try {
    const metrics = await monitoringSystem.getPerformanceMetrics(tenantId, hours);
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}