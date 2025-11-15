import { NextRequest, NextResponse } from 'next/server'
import { createSafeStripeClient, withStripe } from '@/lib/stripe-safe'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing Stripe products...')
    
    const result = await withStripe(async (stripe) => {
      const products = await stripe.products.list({
        limit: 100,
        expand: ['data.default_price']
      })
      
      return {
        count: products.data.length,
        products: products.data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          created: product.created,
          metadata: product.metadata,
          default_price: product.default_price
        }))
      }
    }, { count: 0, products: [] }) // Fallback value
    
    console.log(`✅ Found ${result.count} Stripe products`)
    
    return NextResponse.json({
      success: true,
      count: result.count,
      products: result.products
    })
  } catch (error) {
    console.error('❌ Failed to list Stripe products:', error)
    
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