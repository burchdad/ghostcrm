import { NextRequest, NextResponse } from 'next/server';
import { createTrialSetupIntent, createStripeCustomer, STRIPE_CONFIG } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, userId, organizationId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const customer = await createStripeCustomer(email, {
      userId,
      organizationId: organizationId || '',
      trial_type: 'ghostcrm_14_day'
    });

    // Create setup intent to collect payment method
    const setupIntent = await createTrialSetupIntent(customer.id);

    // Store trial information in database
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + STRIPE_CONFIG.TRIAL_PERIOD_DAYS);

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
        trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
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
        trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
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