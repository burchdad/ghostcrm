import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    // Create Stripe client directly with proper API version
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
    });
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const priceId = 'price_1SPYxYRWQoKtpKqCxDbv59St'; // The failing price ID
    
    console.log('🔍 Testing price lookup for:', priceId);
    console.log('🔍 Using Stripe API version: 2025-09-30.clover');
    console.log('🔍 Stripe key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));
    
    // Try to retrieve the specific price
    const price = await stripe.prices.retrieve(priceId);
    
    return NextResponse.json({
      success: true,
      price: {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        active: price.active,
        product: price.product,
        recurring: price.recurring
      },
      stripe_version: '2025-09-30.clover',
      environment: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test'
    });

  } catch (error: any) {
    console.error('❌ Price lookup failed:', error);
    return NextResponse.json({ 
      error: 'Price lookup failed', 
      details: error.message,
      code: error.code,
      type: error.type,
      price_id: 'price_1SPYxYRWQoKtpKqCxDbv59St'
    }, { status: 500 });
  }
}