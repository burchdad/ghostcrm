import { NextRequest, NextResponse } from 'next/server';
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';

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

    const { email, userId, organizationId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Create Stripe customer using safe client
    const customer = await withStripe(async (stripe) => {
      return await stripe.customers.create({
        email,
        metadata: {
          userId,
          organizationId: organizationId || '',
          trial_type: 'ghostcrm_14_day'
        }
      });
    }, null);

    if (!customer) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create setup intent to collect payment method
    const setupIntent = await withStripe(async (stripe) => {
      return await stripe.setupIntents.create({
        customer: customer.id,
        usage: 'off_session',
        payment_method_types: ['card'],
      });
    }, null);

    if (!setupIntent) {
      return NextResponse.json(
        { error: 'Failed to create setup intent' },
        { status: 500 }
      );
    }

    // Store trial information in database
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 day trial

    const { error: dbError } = await supabase
      .from('user_billing')
      .upsert({
        user_id: userId,
        organization_id: organizationId,
        stripe_customer_id: customer.id,
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        billing_status: 'trial',
        setup_intent_id: setupIntent.id,
        trial_period_days: 14,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error creating trial record:', dbError);
      return NextResponse.json(
        { error: 'Failed to create trial record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      setupIntent: {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
      },
      customer: {
        id: customer.id,
        email: customer.email,
      },
      trial: {
        trial_period_days: 14,
        trial_end_date: trialEndDate.toISOString(),
        billing_status: 'trial'
      }
    });

  } catch (error) {
    console.error('Error creating trial setup:', error);
    return NextResponse.json(
      { error: 'Failed to create trial setup' },
      { status: 500 }
    );
  }
}