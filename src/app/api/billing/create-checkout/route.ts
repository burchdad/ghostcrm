import { NextRequest, NextResponse } from 'next/server'
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe'
import { createSupabaseServer } from '@/utils/supabase/server'
import { PlanId, getPlan } from '@/lib/features/pricing'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

interface CreateCheckoutRequest {
  priceId: string;
  planId: PlanId;
  setupFee?: number;
  monthlyPrice?: number;
  successUrl?: string;
  cancelUrl?: string;
  tenantId?: string;
  customerId?: string;
  trialDays?: number;
  billing?: 'monthly' | 'yearly';
  promoCode?: string;
  stripePromotionCodeId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json()
    const { priceId, planId, setupFee, monthlyPrice, successUrl, cancelUrl, tenantId, customerId, trialDays, billing, promoCode, stripePromotionCodeId } = body

    console.log(`🛒 [CHECKOUT] Creating session for plan: ${planId}, billing: ${billing}, promo: ${promoCode || 'none'}, setupFee: ${setupFee}`)

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
        // Prepare session parameters
        const baseSessionParams: any = {
          mode: 'subscription',
          success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/payment-gateway?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
          metadata: {
            planId,
            billing: billing || 'monthly',
            ...(tenantId && { tenantId }),
            ...(promoCode && { promoCode }),
          },
          subscription_data: {
            metadata: {
              planId,
              billing: billing || 'monthly',
              ...(tenantId && { tenantId }),
              ...(promoCode && { promoCode }),
            },
            ...(trialDays && {
              trial_period_days: trialDays,
            }),
          },
          allow_promotion_codes: true,
          billing_address_collection: 'required',
        }

        // Add customer info - for subscription mode, customer is required
        if (customerId) {
          baseSessionParams.customer = customerId
          // Only add customer_update if we have an existing customer
          baseSessionParams.customer_update = {
            address: 'auto',
            name: 'auto',
          }
        }
        // Note: customer_creation is only for payment mode, not subscription mode

        // Create checkout session
        try {
          // Prepare line items - start with the subscription
          const lineItems: any[] = [
            {
              price: priceId,
              quantity: 1,
            }
          ]

          // Add setup fee as a one-time payment if provided
          if (setupFee && setupFee > 0) {
            console.log(`💰 [CHECKOUT] Adding setup fee: $${setupFee}`)
            
            // Create a one-time price for the setup fee
            const setupPrice = await stripe.prices.create({
              unit_amount: setupFee * 100, // Convert to cents
              currency: 'usd',
              product_data: {
                name: `${plan.name} Plan - Setup Fee`,
              },
            })

            // Add setup fee as second line item
            lineItems.push({
              price: setupPrice.id,
              quantity: 1,
            })
          }

          const sessionParams: any = {
            ...baseSessionParams,
            line_items: lineItems,
          }

          // Apply promo code if provided
          if (stripePromotionCodeId) {
            console.log(`🎫 [CHECKOUT] Applying Stripe promotion code: ${stripePromotionCodeId}`);
            sessionParams.discounts = [{
              promotion_code: stripePromotionCodeId
            }];
          }

          const session = await stripe.checkout.sessions.create(sessionParams)
          return session.url
          
        } catch (stripeError: any) {
          // Log the actual Stripe error details for debugging
          console.error('❌ [CHECKOUT] Stripe checkout session creation failed:', {
            error: stripeError.message,
            code: stripeError.code,
            type: stripeError.type,
            priceId: priceId,
            baseSessionParams: JSON.stringify(baseSessionParams, null, 2)
          })
          
          // Check if it's specifically a price-related error
          if (stripeError.code === 'resource_missing' || stripeError.message?.includes('price')) {
            throw new Error(`Plan pricing not configured. Please contact support.`)
          } else {
            throw new Error(`Checkout creation failed: ${stripeError.message}`)
          }
        }
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
