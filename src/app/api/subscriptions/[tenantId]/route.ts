/**
 * SUBSCRIPTION MANAGEMENT API
 * Handles subscription creation, updates, and feature provisioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { PlanId, getPlan, calculatePlanCost } from '@/lib/features/pricing';
import { FeatureId } from '@/lib/features/definitions';

export const runtime = 'nodejs';

type CreateSubscriptionRequest = {
  tenantId: string;
  planId: PlanId;
  billingCycle: 'monthly' | 'yearly';
  addOnFeatures?: FeatureId[];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialDays?: number;
};

type UpdateSubscriptionRequest = {
  planId?: PlanId;
  billingCycle?: 'monthly' | 'yearly';
  addOnFeatures?: FeatureId[];
  status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
};

type SubscriptionResponse = {
  id: string;
  tenantId: string;
  planId: PlanId;
  planName: string;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  enabledFeatures: FeatureId[];
  addOnFeatures: FeatureId[];
  usageLimits: Record<string, number>;
  currentUsage: Record<string, number>;
  pricing: {
    planCost: number;
    addOnCost: number;
    total: number;
  };
};

/**
 * GET /api/subscriptions/[tenantId]
 * Get subscription details for a tenant
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const supabase = await createSupabaseServer();

    // Verify access (user must be admin or belong to tenant)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has access to this tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile || (userProfile.tenant_id !== tenantId && userProfile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get subscription
    const { data: subscription, error } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get add-ons
    const { data: addOns } = await supabase
      .from('subscription_add_ons')
      .select('*')
      .eq('subscription_id', subscription.id)
      .eq('status', 'active');

    // Format response
    const plan = getPlan(subscription.plan_id);
    const pricing = calculatePlanCost(
      subscription.plan_id,
      subscription.billing_cycle,
      (addOns || []).map(a => a.add_on_id)
    );

    const response: SubscriptionResponse = {
      id: subscription.id,
      tenantId: subscription.tenant_id,
      planId: subscription.plan_id,
      planName: plan.name,
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      trialEndsAt: subscription.trial_ends_at,
      enabledFeatures: subscription.enabled_features || [],
      addOnFeatures: subscription.add_on_features || [],
      usageLimits: subscription.usage_limits || {},
      currentUsage: subscription.current_usage || {},
      pricing
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions/[tenantId]
 * Create or update subscription for a tenant
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await req.json() as CreateSubscriptionRequest;
    const supabase = await createSupabaseServer();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Validate plan
    const plan = getPlan(body.planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Calculate trial end date
    const trialEndsAt = body.trialDays 
      ? new Date(Date.now() + body.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Calculate period end based on billing cycle
    const periodStart = new Date();
    const periodEnd = new Date();
    if (body.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Use stored procedure to activate subscription
    const { data: subscriptionId, error: activateError } = await supabase.rpc(
      'activate_subscription',
      {
        p_tenant_id: tenantId,
        p_plan_id: body.planId,
        p_billing_cycle: body.billingCycle,
        p_stripe_subscription_id: body.stripeSubscriptionId,
        p_stripe_customer_id: body.stripeCustomerId,
        p_add_on_features: body.addOnFeatures || []
      }
    );

    if (activateError) {
      console.error('Subscription activation error:', activateError);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Update trial end date if specified
    if (trialEndsAt) {
      await supabase
        .from('tenant_subscriptions')
        .update({ 
          trial_ends_at: trialEndsAt,
          status: 'trial',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
        .eq('id', subscriptionId);
    }

    // Create add-on records if any
    if (body.addOnFeatures && body.addOnFeatures.length > 0) {
      const addOnRecords = body.addOnFeatures.map(featureId => ({
        subscription_id: subscriptionId,
        add_on_id: featureId,
        add_on_type: 'feature',
        add_on_name: featureId,
        monthly_price: 0 // TODO: Calculate from feature definitions
      }));

      await supabase
        .from('subscription_add_ons')
        .insert(addOnRecords);
    }

    // Log billing event
    await supabase
      .from('billing_events')
      .insert({
        subscription_id: subscriptionId,
        event_type: 'subscription_created',
        description: `Subscription created for plan ${body.planId}`,
        event_data: {
          plan_id: body.planId,
          billing_cycle: body.billingCycle,
          trial_days: body.trialDays,
          add_on_features: body.addOnFeatures
        }
      });

    // Get the created subscription
    const { data: newSubscription } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    return NextResponse.json({ 
      success: true, 
      subscription: newSubscription 
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/subscriptions/[tenantId]
 * Update existing subscription
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await req.json() as UpdateSubscriptionRequest;
    const supabase = await createSupabaseServer();

    // Verify access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile || (userProfile.tenant_id !== tenantId && userProfile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get existing subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };

    if (body.planId && body.planId !== existingSubscription.plan_id) {
      // Plan change - need to update features and limits
      const { error: planChangeError } = await supabase.rpc(
        'activate_subscription',
        {
          p_tenant_id: tenantId,
          p_plan_id: body.planId,
          p_billing_cycle: body.billingCycle || existingSubscription.billing_cycle,
          p_stripe_subscription_id: existingSubscription.stripe_subscription_id,
          p_stripe_customer_id: existingSubscription.stripe_customer_id,
          p_add_on_features: body.addOnFeatures || existingSubscription.add_on_features
        }
      );

      if (planChangeError) {
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }

      // Log billing event
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: existingSubscription.id,
          event_type: 'plan_changed',
          description: `Plan changed from ${existingSubscription.plan_id} to ${body.planId}`,
          event_data: {
            old_plan: existingSubscription.plan_id,
            new_plan: body.planId
          }
        });
    } else {
      // Simple updates
      if (body.billingCycle) updates.billing_cycle = body.billingCycle;
      if (body.status) updates.status = body.status;
      if (body.addOnFeatures) updates.add_on_features = body.addOnFeatures;

      const { error: updateError } = await supabase
        .from('tenant_subscriptions')
        .update(updates)
        .eq('tenant_id', tenantId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }
    }

    // Get updated subscription
    const { data: updatedSubscription } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/subscriptions/[tenantId]
 * Cancel subscription
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const supabase = await createSupabaseServer();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Cancel subscription
    const { error } = await supabase
      .from('tenant_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId);

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    // Cancel all add-ons
    await supabase
      .from('subscription_add_ons')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', (
        await supabase
          .from('tenant_subscriptions')
          .select('id')
          .eq('tenant_id', tenantId)
          .single()
      ).data?.id);

    // Log billing event
    const { data: subscription } = await supabase
      .from('tenant_subscriptions')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();

    if (subscription) {
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: subscription.id,
          event_type: 'subscription_cancelled',
          description: 'Subscription cancelled',
          event_data: { cancelled_at: new Date().toISOString() }
        });
    }

    return NextResponse.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}