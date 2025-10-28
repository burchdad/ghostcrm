import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// TODO: Install stripe package when implementing billing
// import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

// TODO: Implement Stripe session verification
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Billing session verification not yet implemented. Please install Stripe package and configure.' },
    { status: 501 }
  )
}
