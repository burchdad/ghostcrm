import { NextRequest, NextResponse } from 'next/server'
import { syncAllProductsWithStripe } from '@/lib/stripe/product-sync'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting product sync with Stripe...')
    
    const result = await syncAllProductsWithStripe()
    
    console.log('✅ Product sync completed:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Products synced successfully with Stripe',
      ...result
    })
  } catch (error) {
    console.error('❌ Product sync failed:', error)
    
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