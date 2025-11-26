import { NextRequest, NextResponse } from 'next/server'
import { syncAllProductsWithStripe } from '@/lib/stripe/product-sync'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Verify software owner authentication using the same method as middleware
    const cookieStore = cookies()
    const ownerToken = cookieStore.get('owner_session')?.value
    
    if (!ownerToken) {
      return NextResponse.json(
        { success: false, error: 'Software owner authentication required. Please log in at /owner/login' },
        { status: 401 }
      )
    }

    try {
      // Decode owner session (same as middleware)
      const payload = JSON.parse(
        Buffer.from(ownerToken.split(".")[1], "base64").toString()
      );
      
      // Verify this is a software owner session
      if (payload.type !== 'software_owner' || !payload.level) {
        return NextResponse.json(
          { success: false, error: 'Software owner privileges required' },
          { status: 403 }
        )
      }
      
      console.log('✅ [STRIPE_SYNC] Software owner authenticated:', {
        type: payload.type,
        level: payload.level,
        permissions: payload.permissions
      });
      
    } catch (decodeError) {
      return NextResponse.json(
        { success: false, error: 'Invalid software owner session' },
        { status: 401 }
      )
    }
    
    console.log('🔄 Starting product sync with Stripe...')
    
    const result = await syncAllProductsWithStripe()
    
    console.log('✅ Product sync completed:', result)
    
    return NextResponse.json({
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