// app/api/billing/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

type CheckoutBody = {
  companyName?: string;
  subdomain?: string;
  priceId?: string; // Stripe price ID for the plan
};

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json().catch(() => ({}));
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 🔐 Require authenticated user with verified email
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: "Email verification required", 
        next_step: "verify_email" 
      }, { status: 403 });
    }

    // 📋 Prepare checkout session data
    const companyName = (body.companyName ?? "").trim() || "My Organization";
    const subdomain = (body.subdomain ?? "").trim().toLowerCase();
    const priceId = body.priceId || process.env.STRIPE_DEFAULT_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Missing price configuration" }, { status: 400 });
    }

    // 🛡️ Basic subdomain validation (full validation happens in webhook)
    if (subdomain && !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(subdomain)) {
      return NextResponse.json({ 
        error: "Invalid subdomain format. Use 3–63 chars: lowercase letters, numbers, hyphens." 
      }, { status: 400 });
    }

    const successUrl = process.env.NODE_ENV === 'production'
      ? `https://ghostcrm.ai/billing/success?session_id={CHECKOUT_SESSION_ID}`
      : `http://localhost:3000/billing/success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = process.env.NODE_ENV === 'production'
      ? 'https://ghostcrm.ai/billing/cancel'
      : 'http://localhost:3000/billing/cancel';

    // � FIX 6: Create or get existing Stripe customer
    let customerId: string = "";
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, email, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to profile
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    if (!customerId) {
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }

    // 💳 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription' as const, // or 'payment' for one-time
      customer: customerId, // Use existing/created customer instead of customer_creation
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id, // 🚨 FIX 4: Add client_reference_id for debugging
      metadata: {
        // 🎯 CRITICAL: Store user data for webhook processing
        auth_user_id: user.id,
        user_email: user.email || '',
        company_name: companyName || '',
        subdomain: subdomain || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
      },
      billing_address_collection: 'required',
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    console.error('[BILLING] Checkout session creation failed:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: "Payment setup failed. Please try again." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Checkout session creation failed" 
    }, { status: 500 });
  }
}