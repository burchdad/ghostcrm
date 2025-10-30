import { NextRequest, NextResponse } from 'next/server'
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe'
import { createSupabaseServer } from '@/utils/supabase/server'
import { PlanId, getPlan } from '@/lib/features/pricing'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

interface CreateCheckoutRequest {
  priceId: string;
  planId: PlanId;
  successUrl?: string;
  cancelUrl?: string;
  tenantId?: string;
  customerId?: string;
  trialDays?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json()
    const { priceId, planId, successUrl, cancelUrl, tenantId, customerId, trialDays } = body

    // Validate required fields
    if (!priceId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId and planId' },
        { status: 400 }
      )
    }

    // Get plan details
    const plan = getPlan(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create checkout session with Stripe
    const checkoutUrl = await withStripe(
      async (stripe) => {
        const sessionParams: any = {
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
          metadata: {
            planId,
            ...(tenantId && { tenantId }),
          },
          subscription_data: {
            metadata: {
              planId,
              ...(tenantId && { tenantId }),
            },
            ...(trialDays && {
              trial_period_days: trialDays,
            }),
          },
          allow_promotion_codes: true,
          billing_address_collection: 'required',
          customer_update: {
            address: 'auto',
            name: 'auto',
          },
        }

        // If customer ID is provided, use it
        if (customerId) {
          sessionParams.customer = customerId
        } else {
          sessionParams.customer_creation = 'always'
        }

        const session = await stripe.checkout.sessions.create(sessionParams)
        return session.url
      },
      null
    )

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Stripe is not configured.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
