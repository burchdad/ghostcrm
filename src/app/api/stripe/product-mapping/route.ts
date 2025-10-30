import { NextRequest, NextResponse } from 'next/server'
import { getStripeProductMapping } from '@/lib/stripe/product-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const localId = searchParams.get('localId')

    if (!localId) {
      return NextResponse.json(
        { error: 'localId parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 [PRODUCT_MAPPING] Looking up mapping for: ${localId}`)

    const mapping = await getStripeProductMapping(localId)

    if (!mapping) {
      console.log(`❌ [PRODUCT_MAPPING] No mapping found for: ${localId}`)
      return NextResponse.json(
        { error: 'Product mapping not found' },
        { status: 404 }
      )
    }

    console.log(`✅ [PRODUCT_MAPPING] Found mapping:`, mapping)

    return NextResponse.json({
      success: true,
      localProductId: localId,
      stripeProductId: mapping.stripeProductId,
      stripePriceId: mapping.stripePriceId
    })

  } catch (error) {
    console.error('Product mapping lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup product mapping' },
      { status: 500 }
    )
  }
}