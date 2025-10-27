import { NextRequest, NextResponse } from 'next/server';
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';

// Define Subscription type based on expected properties
type Subscription = {
  id: string;
  status: string;
  trial_end?: number;
  current_period_start?: number;
  current_period_end?: number;
};

export async function POST(request: NextRequest) {
  try {
    const stripe = createSafeStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Billing system not configured' },
        { status: 503 }
      );
    }

    const supabase = createSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { customerId, paymentMethodId, userId, priceId } = await request.json();

    if (!customerId || !userId) {
      return NextResponse.json(
        { error: 'Customer ID and User ID are required' },
        { status: 400 }
      );
    }

    // Create trial subscription using safe Stripe client
    const subscription = await withStripe(async (stripe) => {
      return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: 14, // Default trial period
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
    }, null);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Update user billing record with subscription info
    const { error: dbError } = await supabase
      .from('user_billing')
      .update({
        stripe_subscription_id: subscription.id,
        billing_status: 'trial_active',
        payment_method_id: paymentMethodId,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);

    if (dbError) {
      console.error('Database error updating billing record:', dbError);
      return NextResponse.json(
        { error: 'Failed to update billing record' },
        { status: 500 }
      );
    }

    // Calculate trial end timestamp
    const trialEnd = subscription.trial_end 
      ? new Date(subscription.trial_end * 1000) 
      : new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)); // 14 day trial

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: trialEnd.toISOString(),
        current_period_start: (subscription as any).current_period_start 
          ? new Date((subscription as any).current_period_start * 1000).toISOString() 
          : null,
        current_period_end: (subscription as any).current_period_end 
          ? new Date((subscription as any).current_period_end * 1000).toISOString() 
          : null,
      },
      trial: {
        active: true,
        days_remaining: Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        end_date: trialEnd.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}