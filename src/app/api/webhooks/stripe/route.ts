/**
 * STRIPE WEBHOOK HANDLER
 * Processes Stripe webhooks for subscription events and triggers feature provisioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSafeStripeClient } from '@/lib/stripe-safe';
import { createSupabaseServer } from '@/utils/supabase/server';
import { provisionSubscription, updateSubscription, suspendSubscription } from '@/lib/features/provisioning';
import { PlanId } from '@/lib/features/pricing';
import { FeatureId } from '@/lib/features/definitions';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for subscription management
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = createSafeStripeClient();
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process the event
    const result = await processWebhookEvent(event);

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
 * Process different Stripe webhook event types
 */
async function processWebhookEvent(event: Stripe.Event): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      
      case 'customer.subscription.deleted':
        return await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
      
      case 'invoice.payment_succeeded':
        return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      
      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, processed: false };
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing checkout session completed:', session.id);

    if (session.mode === 'subscription' && session.subscription) {
      // For subscription checkouts, the subscription.created event will handle provisioning
      console.log('Subscription checkout completed, subscription events will handle provisioning');
      return { success: true, processed: true };
    }

    if (session.mode === 'payment') {
      // Handle one-time payments if needed
      console.log('One-time payment completed');
      return { success: true, processed: true };
    }

    return { success: true, processed: false };
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle subscription changes (created/updated)
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing subscription change:', subscription.id);

    const planId = subscription.metadata.planId as PlanId;
    const tenantId = subscription.metadata.tenantId;

    if (!planId) {
      console.error('Missing planId in subscription metadata');
      return { success: false, processed: false, error: 'Missing planId' };
    }

    const supabase = await createSupabaseServer();

    // Update or create subscription record
    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
      ...(tenantId && { tenant_id: tenantId }),
    };

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, processed: false, error: dbError.message };
    }

    // Provision or update features based on subscription status
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      if (tenantId) {
        const context = {
          tenantId,
          subscriptionId: subscription.id,
          planId,
          addOnFeatures: [] as FeatureId[],
          billingCycle: 'monthly' as const,
          status: subscription.status as 'active' | 'trial',
        };
        await provisionSubscription(context);
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling subscription change:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing subscription cancellation:', subscription.id);

    const tenantId = subscription.metadata.tenantId;
    const supabase = await createSupabaseServer();

    // Update subscription status
    const { error: dbError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, processed: false, error: dbError.message };
    }

    // Suspend features
    if (tenantId) {
      const context = {
        tenantId,
        subscriptionId: subscription.id,
        planId: subscription.metadata.planId as PlanId || 'starter',
        addOnFeatures: [] as FeatureId[],
        billingCycle: 'monthly' as const,
        status: 'cancelled' as const,
      };
      await suspendSubscription(context);
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing successful payment:', invoice.id);

    if ((invoice as any).subscription) {
      const supabase = await createSupabaseServer();

      // Update last payment info
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({
          last_payment_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, processed: false, error: dbError.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing failed payment:', invoice.id);

    if ((invoice as any).subscription) {
      const supabase = await createSupabaseServer();

      // Update subscription status
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, processed: false, error: dbError.message };
      }

      // Optionally suspend features or send notifications
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling failed payment:', error);
    return { success: false, processed: false, error: String(error) };
  }
}