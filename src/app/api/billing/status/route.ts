import { NextRequest, NextResponse } from 'next/server';
import { getSubscription, isTrialExpired } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// Define the Subscription type if not imported from elsewhere
type Subscription = {
  id: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  trial_end?: number;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get billing record from database
    const { data: billingData, error: dbError } = await supabase
      .from('user_billing')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database error fetching billing record:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch billing record' },
        { status: 500 }
      );
    }

    // If no billing record exists, user hasn't started trial
    if (!billingData) {
      return NextResponse.json({
        billing_status: 'no_trial',
        trial: null,
        subscription: null
      });
    }

    let subscriptionData = null;
    let trialStatus = null;

    // If there's a subscription, fetch from Stripe
    if (billingData.stripe_subscription_id) {
      try {
        const subscription: Subscription = await getSubscription(billingData.stripe_subscription_id);

        subscriptionData = {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start 
            ? new Date(subscription.current_period_start * 1000).toISOString() 
            : null,
          current_period_end: subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString() 
            : null,
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : null,
        };

        // Check trial status
        if (subscription.trial_end) {
          const trialExpired = isTrialExpired(subscription.trial_end);
          const daysRemaining = Math.max(0, Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
          
          trialStatus = {
            active: !trialExpired && subscription.status === 'trialing',
            expired: trialExpired,
            days_remaining: daysRemaining,
            end_date: new Date(subscription.trial_end * 1000).toISOString()
          };
        }
      } catch (stripeError) {
        console.error('Error fetching subscription from Stripe:', stripeError);
        // Continue with database data only
      }
    }

    // If no Stripe subscription but we have trial dates, calculate from database
    if (!trialStatus && billingData.trial_end_date) {
      const trialEndDate = new Date(billingData.trial_end_date);
      const now = new Date();
      const trialExpired = now > trialEndDate;
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      trialStatus = {
        active: !trialExpired && billingData.billing_status === 'trial_active',
        expired: trialExpired,
        days_remaining: daysRemaining,
        end_date: trialEndDate.toISOString()
      };
    }

    return NextResponse.json({
      billing_status: billingData.billing_status,
      trial: trialStatus,
      subscription: subscriptionData,
      customer: {
        id: billingData.stripe_customer_id,
        has_payment_method: !!billingData.payment_method_id
      }
    });

  } catch (error) {
    console.error('Error fetching billing status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing status' },
      { status: 500 }
    );
  }
}