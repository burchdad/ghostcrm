import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe';


export const dynamic = 'force-dynamic';
// This endpoint should be called by a cron job or background service
// to process expired trials and convert them to paid subscriptions
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (you might want to add API key authentication)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting trial expiry processing...');

    // Get expired trials that need to be converted to paid subscriptions
    const { data: expiredTrials, error: fetchError } = await supabase
      .rpc('get_expired_trials');

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expired trials' }, { status: 500 });
    }

    if (!expiredTrials || expiredTrials.length === 0) {
      console.log('No expired trials to process');
      return NextResponse.json({ 
        message: 'No expired trials to process',
        processed: 0
      });
    }

    console.log(`Found ${expiredTrials.length} expired trials to process`);

    let processedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const trial of expiredTrials) {
      try {
        console.log(`Processing expired trial for user ${trial.user_id}`);

        if (!trial.stripe_subscription_id) {
          console.log(`No subscription ID for user ${trial.user_id}, skipping`);
          continue;
        }

        // Get the current subscription from Stripe
        const subscription = await withStripe(async (stripe) => {
          return await stripe.subscriptions.retrieve(trial.stripe_subscription_id);
        }, null);

        if (!subscription) {
          console.log(`Subscription not found in Stripe for user ${trial.user_id}`);
          continue;
        }

        // Check if subscription is still in trial status
        if (subscription.status !== 'trialing') {
          console.log(`Subscription ${trial.stripe_subscription_id} is not in trialing status (${subscription.status}), skipping`);
          continue;
        }

        // If user has a payment method, let Stripe handle the automatic billing
        if (trial.payment_method_id) {
          console.log(`User ${trial.user_id} has payment method, Stripe will handle automatic billing`);
          
          // Update our database to reflect that trial has ended
          const { error: updateError } = await supabase
            .from('user_billing')
            .update({
              billing_status: 'active', // Will be updated by webhook when payment processes
              updated_at: new Date().toISOString()
            })
            .eq('user_id', trial.user_id);

          if (updateError) {
            console.error(`Error updating billing status for user ${trial.user_id}:`, updateError);
            errorCount++;
          } else {
            processedCount++;
            results.push({
              user_id: trial.user_id,
              action: 'trial_ended_with_payment_method',
              status: 'success'
            });
          }

        } else {
          // No payment method - cancel the subscription and mark as unpaid
          console.log(`User ${trial.user_id} has no payment method, canceling subscription`);

          try {
            await withStripe(async (stripe) => {
              return await stripe.subscriptions.cancel(trial.stripe_subscription_id);
            }, null);
          } catch (stripeError) {
            console.error(`Error canceling subscription for user ${trial.user_id}:`, stripeError);
          }

          const { error: updateError } = await supabase
            .from('user_billing')
            .update({
              billing_status: 'unpaid',
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', trial.user_id);

          if (updateError) {
            console.error(`Error updating billing status for user ${trial.user_id}:`, updateError);
            errorCount++;
          } else {
            processedCount++;
            results.push({
              user_id: trial.user_id,
              action: 'trial_ended_no_payment_method',
              status: 'canceled'
            });
          }
        }

      } catch (error) {
        console.error(`Error processing trial for user ${trial.user_id}:`, error);
        errorCount++;
        results.push({
          user_id: trial.user_id,
          action: 'error',
          error: error.message
        });
      }
    }

    console.log(`Trial expiry processing completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      message: 'Trial expiry processing completed',
      processed: processedCount,
      errors: errorCount,
      total_found: expiredTrials.length,
      results
    });

  } catch (error) {
    console.error('Error in trial expiry job:', error);
    return NextResponse.json(
      { error: 'Trial expiry job failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to check for trials that will expire soon (for notifications)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysAhead = parseInt(searchParams.get('days') || '3');

    // Get trials expiring in the next N days
    const { data: expiringTrials, error: fetchError } = await supabase
      .rpc('get_expiring_trials', { days_ahead: daysAhead });

    if (fetchError) {
      console.error('Error fetching expiring trials:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expiring trials' }, { status: 500 });
    }

    return NextResponse.json({
      expiring_trials: expiringTrials || [],
      count: expiringTrials?.length || 0,
      days_ahead: daysAhead
    });

  } catch (error) {
    console.error('Error checking expiring trials:', error);
    return NextResponse.json(
      { error: 'Failed to check expiring trials' },
      { status: 500 }
    );
  }
}
