/**
 * Webhook Management System
 * 
 * Provides reliable webhook delivery with retry logic, health monitoring,
 * signature verification, dead letter queues, and comprehensive analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../utils/supabase/admin';
import crypto from 'crypto';

// Mock Redis implementation for development
class MockRedis {
  private store = new Map<string, string>();
  private expirations = new Map<string, number>();

  async get(key: string): Promise<string | null> {
    this.cleanExpired();
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.store.set(key, value);
    this.expirations.set(key, Date.now() + seconds * 1000);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.expirations.delete(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    this.expirations.set(key, Date.now() + seconds * 1000);
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    // Simplified sorted set implementation
    const setKey = `zset:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    members.push({ score, member });
    this.store.set(setKey, JSON.stringify(members));
  }

  async zrem(key: string, member: string): Promise<void> {
    const setKey = `zset:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    const filtered = members.filter((m: any) => m.member !== member);
    this.store.set(setKey, JSON.stringify(filtered));
  }

  async zrangebyscore(key: string, min: number, max: number, ...args: any[]): Promise<string[]> {
    const setKey = `zset:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    const filtered = members.filter((m: any) => m.score >= min && m.score <= max);
    const limit = args.includes('LIMIT') ? parseInt(args[args.indexOf('LIMIT') + 2]) : filtered.length;
    return filtered.slice(0, limit).map((m: any) => m.member);
  }

  async zcard(key: string): Promise<number> {
    const setKey = `zset:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    return members.length;
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<void> {
    const setKey = `zset:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    const filtered = members.filter((m: any) => !(m.score >= min && m.score <= max));
    this.store.set(setKey, JSON.stringify(filtered));
  }

  async sadd(key: string, member: string): Promise<void> {
    const setKey = `set:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    if (!members.includes(member)) {
      members.push(member);
      this.store.set(setKey, JSON.stringify(members));
    }
  }

  async srem(key: string, member: string): Promise<void> {
    const setKey = `set:${key}`;
    const members = this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
    const filtered = members.filter((m: string) => m !== member);
    this.store.set(setKey, JSON.stringify(filtered));
  }

  async smembers(key: string): Promise<string[]> {
    const setKey = `set:${key}`;
    return this.store.get(setKey) ? JSON.parse(this.store.get(setKey)!) : [];
  }

  async lpush(key: string, value: string): Promise<void> {
    const listKey = `list:${key}`;
    const list = this.store.get(listKey) ? JSON.parse(this.store.get(listKey)!) : [];
    list.unshift(value);
    this.store.set(listKey, JSON.stringify(list));
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, expiration] of this.expirations.entries()) {
      if (now > expiration) {
        this.store.delete(key);
        this.expirations.delete(key);
      }
    }
  }
}

// Webhook Configuration Types
export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  description?: string;
  headers?: Record<string, string>;
  retryPolicy: RetryPolicy;
  rateLimit?: {
    requestsPerSecond: number;
    burstSize: number;
  };
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  multiplier?: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed' | 'dead_letter';
  attempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  tenantId: string;
  eventType: string;
  entityId: string;
  entityType: string;
  payload: any;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface WebhookStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  deadLetterDeliveries: number;
  averageResponseTime: number;
  successRate: number;
  recentEvents: WebhookDelivery[];
}

export interface WebhookHealth {
  endpointId: string;
  url: string;
  isHealthy: boolean;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  consecutiveFailures: number;
  averageResponseTime: number;
  uptime: number;
  issues: string[];
}

export class WebhookManager {
  private redis: MockRedis;
  private supabase: any;
  private processingInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.redis = new MockRedis();
    this.supabase = supabaseAdmin;
    
    this.startProcessing();
    this.startHealthChecking();
  }

  /**
   * Register a new webhook endpoint
   */
  async registerWebhook(endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookEndpoint> {
    const webhookId = crypto.randomUUID();
    const now = new Date();

    const webhook: WebhookEndpoint = {
      id: webhookId,
      ...endpoint,
      secret: endpoint.secret || this.generateSecret(),
      createdAt: now,
      updatedAt: now
    };

    try {
      // Store in database
      await this.supabase
        .from('webhook_endpoints')
        .insert({
          id: webhook.id,
          tenant_id: webhook.tenantId,
          url: webhook.url,
          events: webhook.events,
          secret: webhook.secret,
          is_active: webhook.isActive,
          description: webhook.description,
          headers: webhook.headers,
          retry_policy: webhook.retryPolicy,
          rate_limit: webhook.rateLimit,
          timeout: webhook.timeout,
          created_at: webhook.createdAt.toISOString(),
          updated_at: webhook.updatedAt.toISOString()
        });

      // Cache webhook for quick access
      await this.redis.setex(
        `webhook:${webhookId}`,
        3600,
        JSON.stringify(webhook)
      );

      // Add to tenant webhook list
      await this.redis.sadd(`tenant:webhooks:${webhook.tenantId}`, webhookId);

      return webhook;

    } catch (error) {
      console.error('Failed to register webhook:', error);
      throw new Error('Failed to register webhook endpoint');
    }
  }

  /**
   * Update webhook endpoint
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    try {
      const existing = await this.getWebhook(webhookId);
      if (!existing) {
        throw new Error('Webhook not found');
      }

      const updated: WebhookEndpoint = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      await this.supabase
        .from('webhook_endpoints')
        .update({
          url: updated.url,
          events: updated.events,
          secret: updated.secret,
          is_active: updated.isActive,
          description: updated.description,
          headers: updated.headers,
          retry_policy: updated.retryPolicy,
          rate_limit: updated.rateLimit,
          timeout: updated.timeout,
          updated_at: updated.updatedAt.toISOString()
        })
        .eq('id', webhookId);

      // Update cache
      await this.redis.setex(
        `webhook:${webhookId}`,
        3600,
        JSON.stringify(updated)
      );

      return updated;

    } catch (error) {
      console.error('Failed to update webhook:', error);
      throw error;
    }
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const webhook = await this.getWebhook(webhookId);
      if (!webhook) {
        throw new Error('Webhook not found');
      }

      // Soft delete - mark as inactive
      await this.supabase
        .from('webhook_endpoints')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', webhookId);

      // Remove from cache
      await this.redis.del(`webhook:${webhookId}`);
      await this.redis.srem(`tenant:webhooks:${webhook.tenantId}`, webhookId);

    } catch (error) {
      console.error('Failed to delete webhook:', error);
      throw error;
    }
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): Promise<void> {
    const webhookEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    try {
      // Get webhooks for this tenant and event type
      const webhooks = await this.getWebhooksForEvent(event.tenantId, event.eventType);

      if (webhooks.length === 0) {
        console.log(`No webhooks configured for event: ${event.eventType}`);
        return;
      }

      // Create deliveries for each webhook
      const deliveries = await Promise.all(
        webhooks.map(webhook => this.createDelivery(webhook, webhookEvent))
      );

      // Queue deliveries for processing
      for (const delivery of deliveries) {
        await this.queueDelivery(delivery);
      }

      console.log(`Queued ${deliveries.length} webhook deliveries for event: ${event.eventType}`);

    } catch (error) {
      console.error('Failed to trigger webhook event:', error);
      throw error;
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(tenantId: string, webhookId?: string, days: number = 7): Promise<WebhookStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = this.supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString());

      if (webhookId) {
        query = query.eq('webhook_id', webhookId);
      }

      const { data: deliveries } = await query;

      if (!deliveries) {
        return this.getEmptyStats();
      }

      const totalDeliveries = deliveries.length;
      const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;
      const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
      const deadLetterDeliveries = deliveries.filter(d => d.status === 'dead_letter').length;

      const successfulResponseTimes = deliveries
        .filter(d => d.response_time)
        .map(d => d.response_time);
      
      const averageResponseTime = successfulResponseTimes.length > 0
        ? successfulResponseTimes.reduce((sum, time) => sum + time, 0) / successfulResponseTimes.length
        : 0;

      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      const recentEvents = deliveries
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(this.mapDeliveryFromDB);

      return {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        pendingDeliveries,
        deadLetterDeliveries,
        averageResponseTime,
        successRate,
        recentEvents
      };

    } catch (error) {
      console.error('Failed to get webhook stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get webhook health status
   */
  async getWebhookHealth(tenantId: string): Promise<WebhookHealth[]> {
    try {
      const webhookIds = await this.redis.smembers(`tenant:webhooks:${tenantId}`);
      const healthChecks = await Promise.all(
        webhookIds.map(id => this.checkWebhookHealth(id))
      );

      return healthChecks.filter(Boolean) as WebhookHealth[];

    } catch (error) {
      console.error('Failed to get webhook health:', error);
      return [];
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhookId: string): Promise<{
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    try {
      const webhook = await this.getWebhook(webhookId);
      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const testPayload = {
        event_type: 'webhook.test',
        data: {
          message: 'This is a test webhook delivery',
          timestamp: new Date().toISOString()
        }
      };

      const startTime = Date.now();
      const result = await this.deliverWebhook(webhook, testPayload);
      const responseTime = Date.now() - startTime;

      return {
        success: result.success,
        responseTime,
        statusCode: result.statusCode,
        error: result.error
      };

    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Private Methods
   */
  private async getWebhook(webhookId: string): Promise<WebhookEndpoint | null> {
    try {
      // Try cache first
      const cached = await this.redis.get(`webhook:${webhookId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from database
      const { data } = await this.supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (!data) {
        return null;
      }

      const webhook = this.mapWebhookFromDB(data);
      
      // Cache for future use
      await this.redis.setex(
        `webhook:${webhookId}`,
        3600,
        JSON.stringify(webhook)
      );

      return webhook;

    } catch (error) {
      console.error('Failed to get webhook:', error);
      return null;
    }
  }

  private async getWebhooksForEvent(tenantId: string, eventType: string): Promise<WebhookEndpoint[]> {
    try {
      const { data } = await this.supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .contains('events', [eventType]);

      if (!data) {
        return [];
      }

      return data.map(this.mapWebhookFromDB);

    } catch (error) {
      console.error('Failed to get webhooks for event:', error);
      return [];
    }
  }

  private async createDelivery(webhook: WebhookEndpoint, event: WebhookEvent): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      eventType: event.eventType,
      payload: {
        event_id: event.id,
        event_type: event.eventType,
        entity_id: event.entityId,
        entity_type: event.entityType,
        tenant_id: event.tenantId,
        timestamp: event.timestamp.toISOString(),
        data: event.payload,
        metadata: event.metadata
      },
      status: 'pending',
      attempts: 0,
      nextAttemptAt: new Date(),
      createdAt: new Date()
    };

    // Store in database
    await this.supabase
      .from('webhook_deliveries')
      .insert({
        id: delivery.id,
        webhook_id: delivery.webhookId,
        tenant_id: event.tenantId,
        event_type: delivery.eventType,
        payload: delivery.payload,
        status: delivery.status,
        attempts: delivery.attempts,
        next_attempt_at: delivery.nextAttemptAt?.toISOString(),
        created_at: delivery.createdAt.toISOString()
      });

    return delivery;
  }

  private async queueDelivery(delivery: WebhookDelivery): Promise<void> {
    const score = delivery.nextAttemptAt?.getTime() || Date.now();
    await this.redis.zadd('webhook_queue', score, delivery.id);
  }

  private async processQueue(): Promise<void> {
    try {
      const now = Date.now();
      const deliveryIds = await this.redis.zrangebyscore('webhook_queue', 0, now, 'LIMIT', 0, 10);

      if (deliveryIds.length === 0) {
        return;
      }

      // Process deliveries in parallel
      await Promise.all(
        deliveryIds.map(id => this.processDelivery(id))
      );

    } catch (error) {
      console.error('Queue processing error:', error);
    }
  }

  private async processDelivery(deliveryId: string): Promise<void> {
    try {
      // Get delivery details
      const { data: deliveryData } = await this.supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('id', deliveryId)
        .single();

      if (!deliveryData || deliveryData.status !== 'pending') {
        await this.redis.zrem('webhook_queue', deliveryId);
        return;
      }

      const delivery = this.mapDeliveryFromDB(deliveryData);
      const webhook = await this.getWebhook(delivery.webhookId);

      if (!webhook || !webhook.isActive) {
        await this.markDeliveryFailed(delivery, 'Webhook endpoint not found or inactive');
        await this.redis.zrem('webhook_queue', deliveryId);
        return;
      }

      // Check rate limiting
      if (webhook.rateLimit) {
        const allowed = await this.checkRateLimit(webhook);
        if (!allowed) {
          // Reschedule for later
          const nextAttempt = new Date(Date.now() + 60000); // 1 minute
          await this.rescheduleDelivery(delivery, nextAttempt);
          return;
        }
      }

      // Attempt delivery
      const result = await this.deliverWebhook(webhook, delivery.payload);
      
      // Update delivery status
      delivery.attempts++;
      delivery.lastAttemptAt = new Date();

      if (result.success) {
        await this.markDeliverySuccess(delivery, result);
        await this.redis.zrem('webhook_queue', deliveryId);
      } else {
        if (delivery.attempts >= webhook.retryPolicy.maxAttempts) {
          await this.markDeliveryDeadLetter(delivery, result.error || 'Max attempts exceeded');
          await this.redis.zrem('webhook_queue', deliveryId);
        } else {
          const nextAttempt = this.calculateNextAttempt(webhook.retryPolicy, delivery.attempts);
          await this.rescheduleDelivery(delivery, nextAttempt);
        }
      }

    } catch (error) {
      console.error('Delivery processing error:', error);
      await this.redis.zrem('webhook_queue', deliveryId);
    }
  }

  private async deliverWebhook(webhook: WebhookEndpoint, payload: any): Promise<{
    success: boolean;
    statusCode?: number;
    responseHeaders?: Record<string, string>;
    responseBody?: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      // Generate signature
      const signature = this.generateSignature(payload, webhook.secret);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'GhostCRM-Webhook/1.0',
        'X-Webhook-Signature': signature,
        'X-Webhook-Delivery': crypto.randomUUID(),
        'X-Webhook-Timestamp': Math.floor(Date.now() / 1000).toString(),
        ...webhook.headers
      };

      // Make HTTP request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseBody = await response.text();

      return {
        success: response.ok,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            responseTime
          };
        }
        return {
          success: false,
          error: error.message,
          responseTime
        };
      }

      return {
        success: false,
        error: 'Unknown error',
        responseTime
      };
    }
  }

  private generateSignature(payload: any, secret: string): string {
    const body = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async checkRateLimit(webhook: WebhookEndpoint): Promise<boolean> {
    if (!webhook.rateLimit) {
      return true;
    }

    const key = `webhook_rate_limit:${webhook.id}`;
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const currentCount = await this.redis.zcard(key);

    if (currentCount >= webhook.rateLimit.requestsPerSecond) {
      return false;
    }

    // Add current request
    await this.redis.zadd(key, now, crypto.randomUUID());
    await this.redis.expire(key, 2); // 2 seconds TTL

    return true;
  }

  private calculateNextAttempt(retryPolicy: RetryPolicy, attempt: number): Date {
    let delay = retryPolicy.initialDelay;

    switch (retryPolicy.backoffStrategy) {
      case 'exponential':
        delay = Math.min(
          retryPolicy.initialDelay * Math.pow(retryPolicy.multiplier || 2, attempt - 1),
          retryPolicy.maxDelay
        );
        break;
      case 'linear':
        delay = Math.min(
          retryPolicy.initialDelay * attempt,
          retryPolicy.maxDelay
        );
        break;
      case 'fixed':
      default:
        delay = retryPolicy.initialDelay;
        break;
    }

    return new Date(Date.now() + delay);
  }

  private async markDeliverySuccess(delivery: WebhookDelivery, result: any): Promise<void> {
    await this.supabase
      .from('webhook_deliveries')
      .update({
        status: 'delivered',
        attempts: delivery.attempts,
        last_attempt_at: delivery.lastAttemptAt?.toISOString(),
        delivered_at: new Date().toISOString(),
        response_status: result.statusCode,
        response_headers: result.responseHeaders,
        response_body: result.responseBody,
        response_time: result.responseTime
      })
      .eq('id', delivery.id);
  }

  private async markDeliveryFailed(delivery: WebhookDelivery, error: string): Promise<void> {
    await this.supabase
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        attempts: delivery.attempts,
        last_attempt_at: delivery.lastAttemptAt?.toISOString(),
        error_message: error
      })
      .eq('id', delivery.id);
  }

  private async markDeliveryDeadLetter(delivery: WebhookDelivery, error: string): Promise<void> {
    await this.supabase
      .from('webhook_deliveries')
      .update({
        status: 'dead_letter',
        attempts: delivery.attempts,
        last_attempt_at: delivery.lastAttemptAt?.toISOString(),
        error_message: error
      })
      .eq('id', delivery.id);

    // Add to dead letter queue for manual investigation
    await this.redis.lpush('webhook_dead_letter_queue', delivery.id);
  }

  private async rescheduleDelivery(delivery: WebhookDelivery, nextAttempt: Date): Promise<void> {
    delivery.nextAttemptAt = nextAttempt;

    await this.supabase
      .from('webhook_deliveries')
      .update({
        attempts: delivery.attempts,
        last_attempt_at: delivery.lastAttemptAt?.toISOString(),
        next_attempt_at: nextAttempt.toISOString()
      })
      .eq('id', delivery.id);

    // Update queue position
    await this.redis.zadd('webhook_queue', nextAttempt.getTime(), delivery.id);
  }

  private async checkWebhookHealth(webhookId: string): Promise<WebhookHealth | null> {
    try {
      const webhook = await this.getWebhook(webhookId);
      if (!webhook) {
        return null;
      }

      // Get recent delivery stats
      const { data: recentDeliveries } = await this.supabase
        .from('webhook_deliveries')
        .select('status, created_at, response_time')
        .eq('webhook_id', webhookId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (!recentDeliveries || recentDeliveries.length === 0) {
        return {
          endpointId: webhookId,
          url: webhook.url,
          isHealthy: true,
          consecutiveFailures: 0,
          averageResponseTime: 0,
          uptime: 100,
          issues: []
        };
      }

      const totalDeliveries = recentDeliveries.length;
      const successfulDeliveries = recentDeliveries.filter(d => d.status === 'delivered');
      const failedDeliveries = recentDeliveries.filter(d => d.status === 'failed' || d.status === 'dead_letter');

      const consecutiveFailures = this.getConsecutiveFailures(recentDeliveries);
      const averageResponseTime = successfulDeliveries.length > 0
        ? successfulDeliveries.reduce((sum, d) => sum + (d.response_time || 0), 0) / successfulDeliveries.length
        : 0;

      const uptime = totalDeliveries > 0 ? (successfulDeliveries.length / totalDeliveries) * 100 : 100;
      const isHealthy = consecutiveFailures < 5 && uptime > 80;

      const issues: string[] = [];
      if (consecutiveFailures >= 5) {
        issues.push(`${consecutiveFailures} consecutive failures`);
      }
      if (uptime < 80) {
        issues.push(`Low uptime: ${uptime.toFixed(1)}%`);
      }
      if (averageResponseTime > 5000) {
        issues.push(`Slow response time: ${averageResponseTime.toFixed(0)}ms`);
      }

      const lastSuccess = successfulDeliveries[0];
      const lastFailure = failedDeliveries[0];

      return {
        endpointId: webhookId,
        url: webhook.url,
        isHealthy,
        lastSuccessAt: lastSuccess ? new Date(lastSuccess.created_at) : undefined,
        lastFailureAt: lastFailure ? new Date(lastFailure.created_at) : undefined,
        consecutiveFailures,
        averageResponseTime,
        uptime,
        issues
      };

    } catch (error) {
      console.error('Health check error:', error);
      return null;
    }
  }

  private getConsecutiveFailures(deliveries: any[]): number {
    let failures = 0;
    for (const delivery of deliveries) {
      if (delivery.status === 'failed' || delivery.status === 'dead_letter') {
        failures++;
      } else {
        break;
      }
    }
    return failures;
  }

  private mapWebhookFromDB(data: any): WebhookEndpoint {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      url: data.url,
      events: data.events,
      secret: data.secret,
      isActive: data.is_active,
      description: data.description,
      headers: data.headers,
      retryPolicy: data.retry_policy,
      rateLimit: data.rate_limit,
      timeout: data.timeout,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapDeliveryFromDB(data: any): WebhookDelivery {
    return {
      id: data.id,
      webhookId: data.webhook_id,
      eventType: data.event_type,
      payload: data.payload,
      status: data.status,
      attempts: data.attempts,
      lastAttemptAt: data.last_attempt_at ? new Date(data.last_attempt_at) : undefined,
      nextAttemptAt: data.next_attempt_at ? new Date(data.next_attempt_at) : undefined,
      responseStatus: data.response_status,
      responseHeaders: data.response_headers,
      responseBody: data.response_body,
      errorMessage: data.error_message,
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  private getEmptyStats(): WebhookStats {
    return {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      pendingDeliveries: 0,
      deadLetterDeliveries: 0,
      averageResponseTime: 0,
      successRate: 0,
      recentEvents: []
    };
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(console.error);
    }, 5000); // Process every 5 seconds
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks().catch(console.error);
    }, 300000); // Health check every 5 minutes
  }

  private async performHealthChecks(): Promise<void> {
    try {
      // Get all active webhooks
      const { data: webhooks } = await this.supabase
        .from('webhook_endpoints')
        .select('id, tenant_id')
        .eq('is_active', true);

        if (webhooks && Array.isArray(webhooks)) {
          // Group by tenant to avoid overwhelming any single tenant
          const tenantGroups = webhooks.reduce((groups, webhook) => {
            if (!groups[webhook.tenant_id]) {
              groups[webhook.tenant_id] = [];
            }
            groups[webhook.tenant_id].push(webhook.id);
            return groups;
          }, {} as Record<string, string[]>);

          // Process tenant health checks sequentially
          for (const [tenantId, webhookIds] of Object.entries(tenantGroups)) {
            if (Array.isArray(webhookIds)) {
              const healthChecks = await Promise.all(
                webhookIds.map(id => this.checkWebhookHealth(id))
              );

              // Store health results
              for (const health of healthChecks) {
                if (health) {
                  await this.redis.setex(
                    `webhook_health:${health.endpointId}`,
                    3600,
                    JSON.stringify(health)
                  );
                }
              }
            }
          }
        }

    } catch (error) {
      console.error('Health check error:', error);
    }
  }

  /**
   * Cleanup and shutdown
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
export const webhookManager = new WebhookManager();

// Webhook trigger helpers for common events
export class WebhookTriggers {
  private manager: WebhookManager;

  constructor() {
    this.manager = webhookManager;
  }

  async leadCreated(tenantId: string, lead: any): Promise<void> {
    await this.manager.triggerEvent({
      tenantId,
      eventType: 'lead.created',
      entityId: lead.id,
      entityType: 'lead',
      payload: lead
    });
  }

  async leadUpdated(tenantId: string, lead: any, changes: any): Promise<void> {
    await this.manager.triggerEvent({
      tenantId,
      eventType: 'lead.updated',
      entityId: lead.id,
      entityType: 'lead',
      payload: lead,
      metadata: { changes }
    });
  }

  async dealClosed(tenantId: string, deal: any): Promise<void> {
    await this.manager.triggerEvent({
      tenantId,
      eventType: 'deal.closed',
      entityId: deal.id,
      entityType: 'deal',
      payload: deal
    });
  }

  async customerCreated(tenantId: string, customer: any): Promise<void> {
    await this.manager.triggerEvent({
      tenantId,
      eventType: 'customer.created',
      entityId: customer.id,
      entityType: 'customer',
      payload: customer
    });
  }

  async taskCompleted(tenantId: string, task: any): Promise<void> {
    await this.manager.triggerEvent({
      tenantId,
      eventType: 'task.completed',
      entityId: task.id,
      entityType: 'task',
      payload: task
    });
  }
}

export const webhookTriggers = new WebhookTriggers();