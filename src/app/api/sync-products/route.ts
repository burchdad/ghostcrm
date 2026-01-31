import { NextRequest, NextResponse } from 'next/server'
import { syncAllProductsWithStripe } from '@/lib/stripe/product-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple endpoint to trigger product sync for testing
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [SYNC_PRODUCTS] Starting product sync...')

    const result = await syncAllProductsWithStripe({
      dryRun: false,
      forceUpdate: false
    })

    console.log('✅ [SYNC_PRODUCTS] Sync completed:', result)

    return NextResponse.json({
      success: result.success,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
      syncedProducts: result.syncedProducts.map(p => ({
        localId: p.localId,
        localName: p.localName,
        stripeProductId: p.stripeProductId,
        stripePriceId: p.stripePriceId,
        status: p.status
      }))
    })

  } catch (error) {
    console.error('Product sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync products',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Product sync endpoint - use POST to trigger sync',
    usage: 'POST /api/sync-products'
  })
}