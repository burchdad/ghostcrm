import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// TODO: Install stripe package when implementing billing
// import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getTierPricing, SETUP_FEE } from '@/lib/pricing'

export const runtime = 'nodejs'

// TODO: Implement Stripe integration
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Billing integration not yet implemented. Please install Stripe package and configure.' },
    { status: 501 }
  )
}
