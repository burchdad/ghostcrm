import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Force dynamic rendering for request.url usage
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    console.log('🔍 [STRIPE-SESSION] Checking session:', sessionId)

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'line_items.data.discounts']
    })

    console.log('📊 [STRIPE-SESSION] Session details:', {
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      hasDiscounts: !!session.total_details?.breakdown?.discounts?.length,
      customerEmail: session.customer_details?.email
    })

    let promoCode: string | null = null
    let discountAmount = 0
    let discountPercentage = 0

    // Check for discounts in the session
    if (session.total_details?.breakdown?.discounts && session.total_details.breakdown.discounts.length > 0) {
      const discount = session.total_details.breakdown.discounts[0]
      discountAmount = discount.amount
      console.log('💰 [STRIPE-SESSION] Discount found:', discount)

      // Get the discount details from the subscription or session
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
            expand: ['discounts.coupon', 'discounts.promotion_code']
          })

          if (subscription.discounts && subscription.discounts.length > 0) {
            const discount = subscription.discounts[0]
            
            // Type check for discount object
            if (typeof discount === 'object' && discount !== null) {
              if ((discount as any).promotion_code) {
                const promotionCode = await stripe.promotionCodes.retrieve((discount as any).promotion_code.id)
                promoCode = promotionCode.code
                console.log('🎫 [STRIPE-SESSION] Promo code found:', promoCode)
              }
              
              if ((discount as any).coupon) {
                if ((discount as any).coupon.percent_off) {
                  discountPercentage = (discount as any).coupon.percent_off
                }
              }
            }
          }
        } catch (subError) {
          console.error('⚠️ [STRIPE-SESSION] Error retrieving subscription:', subError)
        }
      }
    }

    // If no promo code found but there was a 100% discount, likely SOFTWAREOWNER
    if (!promoCode && session.amount_total === 0 && session.amount_subtotal && session.amount_subtotal > 0) {
      promoCode = 'SOFTWAREOWNER'
      discountPercentage = 100
      console.log('🔧 [STRIPE-SESSION] Detected SOFTWAREOWNER promo (100% discount)')
    }

    const result = {
      sessionId,
      promoCode,
      discountAmount,
      discountPercentage,
      totalAmount: session.amount_total,
      subtotalAmount: session.amount_subtotal,
      customerEmail: session.customer_details?.email
    }

    console.log('✅ [STRIPE-SESSION] Final result:', result)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ [STRIPE-SESSION] Error checking session promo code:', error)
    return NextResponse.json({ 
      error: 'Failed to check session promo code',
      details: error.message,
      sessionId: new URL(request.url).searchParams.get('session_id')
    }, { status: 500 })
  }
}