/**
 * PAYMENT WEBHOOK HANDLER
 * Processes payment webhooks for subscription events and triggers feature provisioning
 * Note: Stripe types removed for now - add when payment provider is chosen
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createSupabaseServer } from '@/utils/supabase/server';
import { provisionSubscription, updateSubscription, suspendSubscription } from '@/lib/features/provisioning';
import { PlanId } from '@/lib/features/pricing';
import { FeatureId } from '@/lib/features/definitions';

export const runtime = 'nodejs';

// Simplified webhook event type (replace with proper payment provider types when installed)
interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

interface SubscriptionObject {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
        recurring?: {
          interval: string;
        };
        metadata: Record<string, string>;
      };
    }>;
  };
  metadata: Record<string, string>;
  trial_end?: number;
}

interface InvoiceObject {
  id: string;
  subscription?: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  number: string;
  last_finalization_error?: {
    message: string;
  };
}

interface CheckoutSessionObject {
  id: string;
  mode: string;
  subscription?: string;
  payment_intent?: string;
}

/**
 * POST /api/webhooks/payment
 * Handle payment webhook events for subscription management
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headersList = await headers();
    const signature = headersList.get('webhook-signature');

    // TODO: Add proper webhook signature verification when payment provider is chosen
    if (!signature && process.env.NODE_ENV === 'production') {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Process the event
    const result = await processWebhookEvent(body as WebhookEvent);

    if (result.success) {
      return NextResponse.json({ received: true, processed: result.processed });
    } else {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Process different webhook event types
 */
async function processWebhookEvent(event: WebhookEvent): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    // Log the webhook event
    await logWebhookEvent(event);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'subscription.created':
        return await handleSubscriptionCreated(event.data.object as SubscriptionObject);
      
      case 'customer.subscription.updated':
      case 'subscription.updated':
        return await handleSubscriptionUpdated(event.data.object as SubscriptionObject);
      
      case 'customer.subscription.deleted':
      case 'subscription.cancelled':
        return await handleSubscriptionDeleted(event.data.object as SubscriptionObject);
      
      case 'invoice.payment_succeeded':
      case 'payment.succeeded':
        return await handlePaymentSucceeded(event.data.object as InvoiceObject);
      
      case 'invoice.payment_failed':
      case 'payment.failed':
        return await handlePaymentFailed(event.data.object as InvoiceObject);
      
      case 'customer.subscription.trial_will_end':
      case 'trial.ending':
        return await handleTrialWillEnd(event.data.object as SubscriptionObject);
      
      case 'checkout.session.completed':
      case 'purchase.completed':
        return await handleCheckoutCompleted(event.data.object as CheckoutSessionObject);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, processed: false };
    }

  } catch (error) {
    console.error('Event processing error:', error);
    return { 
      success: false, 
      processed: false, 
      error: (error as Error)?.message || 'Unknown error' 
    };
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: SubscriptionObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  try {
    const tenantId = subscription.metadata.tenant_id;
    const planId = subscription.metadata.plan_id as PlanId;

    if (!tenantId || !planId) {
      throw new Error('Missing tenant_id or plan_id in subscription metadata');
    }

    // Extract add-on features from subscription items
    const addOnFeatures = extractAddOnFeatures(subscription) as FeatureId[];

    // Determine billing cycle
    const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' 
      ? 'yearly' as const 
      : 'monthly' as const;

    // Provision the subscription
    const result = await provisionSubscription({
      tenantId,
      subscriptionId: subscription.id,
      planId,
      addOnFeatures,
      billingCycle,
      status: subscription.status === 'trialing' ? 'trial' : 'active',
      metadata: {
        subscription_id: subscription.id,
        customer_id: subscription.customer,
        trial_end: subscription.trial_end
      }
    });

    if (!result.success) {
      throw new Error(`Provisioning failed: ${result.errors.join(', ')}`);
    }

    console.log(`Subscription created and provisioned for tenant ${tenantId}`);
    return { success: true, processed: true };

  } catch (error) {
    console.error('Subscription creation handling error:', error);
    throw error;
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: SubscriptionObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  const supabase = await createSupabaseServer();

  try {
    const tenantId = subscription.metadata.tenant_id;
    const planId = subscription.metadata.plan_id as PlanId;

    if (!tenantId || !planId) {
      throw new Error('Missing tenant_id or plan_id in subscription metadata');
    }

    // Get current subscription to detect changes
    const { data: currentSub } = await supabase
      .from('tenant_subscriptions')
      .select('plan_id, add_on_features')
      .eq('tenant_id', tenantId)
      .single();

    const addOnFeatures = extractAddOnFeatures(subscription) as FeatureId[];
    const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' 
      ? 'yearly' as const 
      : 'monthly' as const;

    // Determine status
    let status: 'active' | 'trial' | 'cancelled' | 'past_due' | 'inactive';
    switch (subscription.status) {
      case 'active':
        status = 'active';
        break;
      case 'trialing':
        status = 'trial';
        break;
      case 'canceled':
      case 'cancelled':
        status = 'cancelled';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      default:
        status = 'inactive';
    }

    // Update the subscription
    const result = await updateSubscription({
      tenantId,
      subscriptionId: subscription.id,
      planId,
      previousPlanId: currentSub?.plan_id,
      addOnFeatures,
      billingCycle,
      status,
      metadata: {
        subscription_id: subscription.id,
        customer_id: subscription.customer,
        trial_end: subscription.trial_end
      }
    });

    if (!result.success) {
      throw new Error(`Subscription update failed: ${result.errors.join(', ')}`);
    }

    console.log(`Subscription updated for tenant ${tenantId}`);
    return { success: true, processed: true };

  } catch (error) {
    console.error('Subscription update handling error:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: SubscriptionObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  try {
    const tenantId = subscription.metadata.tenant_id;
    const planId = subscription.metadata.plan_id as PlanId;

    if (!tenantId || !planId) {
      throw new Error('Missing tenant_id or plan_id in subscription metadata');
    }

    // Suspend the subscription
    const result = await suspendSubscription({
      tenantId,
      subscriptionId: subscription.id,
      planId,
      addOnFeatures: [],
      billingCycle: 'monthly',
      status: 'cancelled'
    });

    if (!result.success) {
      throw new Error(`Subscription suspension failed: ${result.errors.join(', ')}`);
    }

    console.log(`Subscription cancelled for tenant ${tenantId}`);
    return { success: true, processed: true };

  } catch (error) {
    console.error('Subscription deletion handling error:', error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: InvoiceObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  const supabase = await createSupabaseServer();

  try {
    if (!invoice.subscription) {
      return { success: true, processed: false };
    }

    console.log(`Payment succeeded for subscription ${invoice.subscription}`);

    // Log billing event and update subscription status
    const { data: subscription } = await supabase
      .from('tenant_subscriptions')
      .select('id, tenant_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: subscription.id,
          event_type: 'payment_succeeded',
          amount: invoice.amount_paid,
          currency: invoice.currency,
          description: `Payment succeeded for invoice ${invoice.number}`,
          status: 'processed',
          processed_at: new Date().toISOString(),
          event_data: {
            invoice_id: invoice.id,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency
          }
        });

      // Update subscription to active if it was past_due
      await supabase
        .from('tenant_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .eq('status', 'past_due');
    }

    return { success: true, processed: true };

  } catch (error) {
    console.error('Payment success handling error:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: InvoiceObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  const supabase = await createSupabaseServer();

  try {
    if (!invoice.subscription) {
      return { success: true, processed: false };
    }

    console.log(`Payment failed for subscription ${invoice.subscription}`);

    // Log billing event and update status
    const { data: subscription } = await supabase
      .from('tenant_subscriptions')
      .select('id, tenant_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      // Update subscription to past_due
      await supabase
        .from('tenant_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      // Log billing event
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: subscription.id,
          event_type: 'payment_failed',
          amount: invoice.amount_due,
          currency: invoice.currency,
          description: `Payment failed for invoice ${invoice.number}`,
          status: 'processed',
          processed_at: new Date().toISOString(),
          event_data: {
            invoice_id: invoice.id,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            failure_reason: invoice.last_finalization_error?.message
          }
        });
    }

    return { success: true, processed: true };

  } catch (error) {
    console.error('Payment failure handling error:', error);
    throw error;
  }
}

/**
 * Handle trial will end event
 */
async function handleTrialWillEnd(subscription: SubscriptionObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  const supabase = await createSupabaseServer();

  try {
    const tenantId = subscription.metadata.tenant_id;

    if (!tenantId) {
      throw new Error('Missing tenant_id in subscription metadata');
    }

    // Log the event for follow-up actions (emails, notifications, etc.)
    const { data: sub } = await supabase
      .from('tenant_subscriptions')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();

    if (sub) {
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: sub.id,
          event_type: 'trial_ending',
          description: 'Trial will end soon',
          status: 'processed',
          processed_at: new Date().toISOString(),
          event_data: {
            trial_end: subscription.trial_end,
            days_remaining: subscription.trial_end 
              ? Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
              : 0
          }
        });
    }

    console.log(`Trial ending notification for tenant ${tenantId}`);
    return { success: true, processed: true };

  } catch (error) {
    console.error('Trial ending handling error:', error);
    throw error;
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: CheckoutSessionObject): Promise<{
  success: boolean;
  processed: boolean;
}> {
  try {
    if (session.mode === 'subscription' && session.subscription) {
      // Subscription created via checkout - will be handled by subscription.created event
      console.log(`Checkout completed for subscription ${session.subscription}`);
    } else if (session.mode === 'payment') {
      // One-time payment - handle add-on purchases, etc.
      console.log(`One-time payment completed: ${session.payment_intent}`);
    }

    return { success: true, processed: true };

  } catch (error) {
    console.error('Checkout completion handling error:', error);
    throw error;
  }
}

/**
 * Extract add-on features from subscription items
 */
function extractAddOnFeatures(subscription: SubscriptionObject): string[] {
  const addOns: string[] = [];
  
  for (const item of subscription.items.data) {
    const featureId = item.price.metadata.feature_id;
    if (featureId && item.price.metadata.is_add_on === 'true') {
      addOns.push(featureId);
    }
  }
  
  return addOns;
}

/**
 * Log webhook events for audit trail
 */
async function logWebhookEvent(event: WebhookEvent): Promise<void> {
  const supabase = await createSupabaseServer();
  
  try {
    await supabase
      .from('billing_events')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        description: `Webhook: ${event.type}`,
        status: 'pending',
        event_data: event.data
      });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}