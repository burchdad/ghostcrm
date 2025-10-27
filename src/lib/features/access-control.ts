/**
 * FEATURE ACCESS CONTROL SYSTEM
 * Middleware and utilities for checking feature permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { FeatureId } from './definitions';
import { PlanId, isPlanFeatureIncluded } from './pricing';

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: PlanId;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trial';
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  enabled_features: FeatureId[];
  add_on_features: FeatureId[];
  usage_limits: {
    users: number;
    contacts: number;
    deals: number;
    storage_gb: number;
    api_calls_monthly: number;
    email_campaigns_monthly: number;
    workflow_runs_monthly: number;
  };
  current_usage: {
    users: number;
    contacts: number;
    deals: number;
    storage_gb: number;
    api_calls_this_month: number;
    email_campaigns_this_month: number;
    workflow_runs_this_month: number;
  };
  created_at: string;
  updated_at: string;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: 'included' | 'add_on' | 'trial' | 'not_subscribed' | 'plan_required' | 'enterprise_only' | 'limit_exceeded';
  requiredPlan?: PlanId;
  currentUsage?: number;
  limit?: number;
  upgradeUrl?: string;
}

/**
 * Core feature access checker
 */
export class FeatureAccessControl {
  private subscription: TenantSubscription | null = null;

  constructor(subscription: TenantSubscription | null) {
    this.subscription = subscription;
  }

  /**
   * Check if tenant has access to a specific feature
   */
  hasFeatureAccess(featureId: FeatureId): FeatureAccessResult {
    if (!this.subscription) {
      return {
        hasAccess: false,
        reason: 'not_subscribed',
        upgradeUrl: '/pricing'
      };
    }

    // Check if subscription is active or in trial
    if (!this.isSubscriptionActive()) {
      return {
        hasAccess: false,
        reason: 'not_subscribed',
        upgradeUrl: '/billing'
      };
    }

    // Check if feature is included in plan
    if (isPlanFeatureIncluded(this.subscription.plan_id, featureId)) {
      return { hasAccess: true, reason: 'included' };
    }

    // Check if feature is enabled as add-on
    if (this.subscription.add_on_features.includes(featureId)) {
      return { hasAccess: true, reason: 'add_on' };
    }

    // Check if feature is explicitly enabled (manual override)
    if (this.subscription.enabled_features.includes(featureId)) {
      return { hasAccess: true, reason: 'trial' };
    }

    // Feature not available
    return {
      hasAccess: false,
      reason: 'plan_required',
      upgradeUrl: '/pricing'
    };
  }

  /**
   * Check usage limits for features that have limits
   */
  checkUsageLimit(limitType: keyof TenantSubscription['usage_limits']): FeatureAccessResult {
    if (!this.subscription) {
      return {
        hasAccess: false,
        reason: 'not_subscribed'
      };
    }

    const limit = this.subscription.usage_limits[limitType];
    const usage = this.subscription.current_usage[limitType as keyof TenantSubscription['current_usage']];

    // -1 means unlimited
    if (limit === -1) {
      return { hasAccess: true };
    }

    if (usage >= limit) {
      return {
        hasAccess: false,
        reason: 'limit_exceeded',
        currentUsage: usage,
        limit: limit,
        upgradeUrl: '/pricing'
      };
    }

    return {
      hasAccess: true,
      currentUsage: usage,
      limit: limit
    };
  }

  /**
   * Get current subscription status
   */
  getSubscriptionStatus(): {
    isActive: boolean;
    plan: PlanId | null;
    status: string;
    trialEndsAt?: string;
    planName?: string;
  } {
    if (!this.subscription) {
      return { isActive: false, plan: null, status: 'none' };
    }

    return {
      isActive: this.isSubscriptionActive(),
      plan: this.subscription.plan_id,
      status: this.subscription.status,
      trialEndsAt: this.subscription.trial_ends_at,
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    users: { current: number; limit: number };
    contacts: { current: number; limit: number };
    deals: { current: number; limit: number };
    storage: { current: number; limit: number };
    apiCalls: { current: number; limit: number };
  } | null {
    if (!this.subscription) return null;

    const { current_usage, usage_limits } = this.subscription;

    return {
      users: { current: current_usage.users, limit: usage_limits.users },
      contacts: { current: current_usage.contacts, limit: usage_limits.contacts },
      deals: { current: current_usage.deals, limit: usage_limits.deals },
      storage: { current: current_usage.storage_gb, limit: usage_limits.storage_gb },
      apiCalls: { current: current_usage.api_calls_this_month, limit: usage_limits.api_calls_monthly }
    };
  }

  private isSubscriptionActive(): boolean {
    if (!this.subscription) return false;

    const now = new Date();
    const status = this.subscription.status;

    // Active subscription
    if (status === 'active') return true;

    // Trial period
    if (status === 'trial' && this.subscription.trial_ends_at) {
      const trialEnd = new Date(this.subscription.trial_ends_at);
      return now < trialEnd;
    }

    return false;
  }
}

/**
 * Get subscription for current tenant
 */
export async function getTenantSubscription(tenantId?: string): Promise<TenantSubscription | null> {
  try {
    const supabase = await createSupabaseServer();

    // If no tenantId provided, get from current user context
    if (!tenantId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's tenant
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return null;
      tenantId = profile.tenant_id;
    }

    const { data: subscription, error } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !subscription) return null;

    return subscription as TenantSubscription;
  } catch (error) {
    console.error('Error fetching tenant subscription:', error);
    return null;
  }
}

/**
 * Middleware for protecting API routes with feature access
 */
export function requireFeature(featureId: FeatureId) {
  return async function featureMiddleware(
    req: NextRequest,
    context: { params: any },
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const subscription = await getTenantSubscription();
      const accessControl = new FeatureAccessControl(subscription);
      const access = accessControl.hasFeatureAccess(featureId);

      if (!access.hasAccess) {
        return NextResponse.json(
          {
            error: 'Feature not available',
            reason: access.reason,
            requiredPlan: access.requiredPlan,
            upgradeUrl: access.upgradeUrl
          },
          { status: 403 }
        );
      }

      // Add subscription context to request
      (req as any).subscription = subscription;
      (req as any).accessControl = accessControl;

      return next();
    } catch (error) {
      console.error('Feature access middleware error:', error);
      return NextResponse.json(
        { error: 'Failed to verify feature access' },
        { status: 500 }
      );
    }
  };
}

/**
 * Check usage limits middleware
 */
export function requireUsageLimit(limitType: keyof TenantSubscription['usage_limits']) {
  return async function usageLimitMiddleware(
    req: NextRequest,
    context: { params: any },
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const subscription = await getTenantSubscription();
      const accessControl = new FeatureAccessControl(subscription);
      const access = accessControl.checkUsageLimit(limitType);

      if (!access.hasAccess) {
        return NextResponse.json(
          {
            error: 'Usage limit exceeded',
            reason: access.reason,
            currentUsage: access.currentUsage,
            limit: access.limit,
            upgradeUrl: access.upgradeUrl
          },
          { status: 429 }
        );
      }

      return next();
    } catch (error) {
      console.error('Usage limit middleware error:', error);
      return NextResponse.json(
        { error: 'Failed to verify usage limits' },
        { status: 500 }
      );
    }
  };
}

/**
 * Utility functions for common feature checks
 */
export async function checkFeatureAccess(featureId: FeatureId, tenantId?: string): Promise<FeatureAccessResult> {
  const subscription = await getTenantSubscription(tenantId);
  const accessControl = new FeatureAccessControl(subscription);
  return accessControl.hasFeatureAccess(featureId);
}

export async function checkUsageLimit(
  limitType: keyof TenantSubscription['usage_limits'],
  tenantId?: string
): Promise<FeatureAccessResult> {
  const subscription = await getTenantSubscription(tenantId);
  const accessControl = new FeatureAccessControl(subscription);
  return accessControl.checkUsageLimit(limitType);
}

/**
 * Increment usage counters
 */
export async function incrementUsage(
  limitType: keyof TenantSubscription['current_usage'],
  amount: number = 1,
  tenantId?: string
): Promise<boolean> {
  try {
    const supabase = await createSupabaseServer();

    if (!tenantId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return false;
      tenantId = profile.tenant_id;
    }

    const { error } = await supabase.rpc('increment_usage', {
      p_tenant_id: tenantId,
      p_usage_type: limitType,
      p_amount: amount
    });

    return !error;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

/**
 * Reset monthly usage counters (called by cron job)
 */
export async function resetMonthlyUsage(): Promise<void> {
  try {
    const supabase = await createSupabaseServer();

    await supabase.rpc('reset_monthly_usage');
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
  }
}

/**
 * Get feature access summary for tenant
 */
export async function getFeatureAccessSummary(tenantId?: string): Promise<{
  subscription: TenantSubscription | null;
  features: Record<FeatureId, FeatureAccessResult>;
  usage: ReturnType<FeatureAccessControl['getUsageStats']>;
}> {
  const subscription = await getTenantSubscription(tenantId);
  const accessControl = new FeatureAccessControl(subscription);

  // Check access for all features
  const features: Record<string, FeatureAccessResult> = {};
  const allFeatureIds = Object.keys(require('./definitions').FEATURE_DEFINITIONS) as FeatureId[];
  
  for (const featureId of allFeatureIds) {
    features[featureId] = accessControl.hasFeatureAccess(featureId);
  }

  return {
    subscription,
    features: features as Record<FeatureId, FeatureAccessResult>,
    usage: accessControl.getUsageStats()
  };
}