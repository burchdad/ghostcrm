import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSafeStripeClient } from '@/lib/stripe-safe';

export async function GET(request: NextRequest) {
  try {
    // Initialize Stripe using the same client as checkout
    const stripe = createSafeStripeClient();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all prices from Stripe
    console.log('🔍 Fetching prices from Stripe...');
    const stripePrices = await stripe.prices.list({ limit: 100, active: true });
    
    // Get all mappings from database
    console.log('🔍 Fetching mappings from database...');
    const { data: dbMappings, error } = await supabase
      .from('stripe_product_mappings')
      .select('*')
      .order('local_product_id');

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
    }

    // Find mismatches
    const mismatches = [];
    const validMappings = [];

    for (const mapping of dbMappings || []) {
      const stripePrice = stripePrices.data.find(p => p.id === mapping.stripe_price_id);
      
      if (!stripePrice) {
        mismatches.push({
          local_product_id: mapping.local_product_id,
          db_price_id: mapping.stripe_price_id,
          issue: 'Price not found in Stripe'
        });
      } else {
        validMappings.push({
          local_product_id: mapping.local_product_id,
          stripe_price_id: mapping.stripe_price_id,
          amount: stripePrice.unit_amount,
          currency: stripePrice.currency,
          interval: stripePrice.recurring?.interval
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_stripe_prices: stripePrices.data.length,
        total_db_mappings: dbMappings?.length || 0,
        valid_mappings_count: validMappings.length,
        mismatches_count: mismatches.length
      },
      stripe_prices: stripePrices.data.map(p => ({
        id: p.id,
        amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval,
        product: p.product
      })),
      db_mappings: dbMappings,
      mismatches,
      validMappings
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}