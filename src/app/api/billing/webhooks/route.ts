import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// TODO: Install stripe package when implementing billing
// import Stripe from 'stripe'
import { supabaseAdmin } from '@/utils/supabase/admin'

export const runtime = 'nodejs'

// TODO: Implement Stripe webhook handling
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Billing webhooks not yet implemented. Please install Stripe package and configure.' },
    { status: 501 }
  )
}
