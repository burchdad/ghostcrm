import { NextRequest, NextResponse } from 'next/server'
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing Stripe prices...')
    
    const result = await withStripe(async (stripe) => {
      const prices = await stripe.prices.list({
        limit: 100,
        expand: ['data.product']
      })
      
      return {
        count: prices.data.length,
        prices: prices.data.map(price => ({
          id: price.id,
          product: typeof price.product === 'string' ? price.product : (price.product && 'name' in price.product ? price.product.name : 'Unknown'),
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
          active: price.active,
          nickname: price.nickname,
          metadata: price.metadata,
          created: price.created
        }))
      }
    }, { count: 0, prices: [] }) // Fallback value
    
    console.log(`✅ Found ${result.count} Stripe prices`)
    
    return NextResponse.json({
      success: true,
      count: result.count,
      prices: result.prices
    })
  } catch (error) {
    console.error('❌ Failed to list Stripe prices:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}