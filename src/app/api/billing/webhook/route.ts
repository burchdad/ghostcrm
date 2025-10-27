import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !STRIPE_CONFIG.WEBHOOK_SECRET) {
      console.error('Missing stripe signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleTrialWillEnd(subscription: any) {
  console.log('Trial will end for subscription:', subscription.id);
  
  // Update billing status to indicate trial ending soon
  const { error } = await supabase
    .from('user_billing')
    .update({
      billing_status: 'trial_ending',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating billing status for trial ending:', error);
  }

  // Here you could also send a reminder email to the user
  // await sendTrialEndingEmail(subscription.customer);
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

  let billingStatus = 'active';
  
  // Map Stripe subscription status to our billing status
  switch (subscription.status) {
    case 'trialing':
      billingStatus = 'trial_active';
      break;
    case 'active':
      billingStatus = 'active';
      break;
    case 'past_due':
      billingStatus = 'past_due';
      break;
    case 'canceled':
      billingStatus = 'canceled';
      break;
    case 'unpaid':
      billingStatus = 'unpaid';
      break;
    default:
      billingStatus = subscription.status;
  }

  const { error } = await supabase
    .from('user_billing')
    .update({
      billing_status: billingStatus,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded for invoice:', invoice.id);

  if (invoice.subscription) {
    const { error } = await supabase
      .from('user_billing')
      .update({
        billing_status: 'active',
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating billing after successful payment:', error);
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed for invoice:', invoice.id);

  if (invoice.subscription) {
    const { error } = await supabase
      .from('user_billing')
      .update({
        billing_status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating billing after failed payment:', error);
    }
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id);

  const { error } = await supabase
    .from('user_billing')
    .update({
      billing_status: 'canceled',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating billing after subscription deletion:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: any) {
  console.log('Setup intent succeeded:', setupIntent.id);

  const { error } = await supabase
    .from('user_billing')
    .update({
      payment_method_id: setupIntent.payment_method,
      setup_intent_status: 'succeeded',
      updated_at: new Date().toISOString()
    })
    .eq('setup_intent_id', setupIntent.id);

  if (error) {
    console.error('Error updating billing after setup intent success:', error);
  }
}