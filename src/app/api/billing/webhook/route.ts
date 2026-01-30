// app/api/billing/webhook/route.ts  
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ [STRIPE WEBHOOK] Signature verification failed:`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`🔔 [STRIPE WEBHOOK] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      default:
        console.log(`🔕 [STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error(`❌ [STRIPE WEBHOOK] Processing failed:`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`💳 [STRIPE WEBHOOK] Checkout completed: ${session.id}`);

  const metadata = session.metadata;
  if (!metadata?.auth_user_id) {
    console.error('❌ [STRIPE WEBHOOK] Missing auth_user_id in metadata');
    throw new Error('Missing required metadata: auth_user_id');
  }

  const authUserId = metadata.auth_user_id;
  const userEmail = metadata.user_email || session.customer_email;
  const companyName = metadata.company_name || "My Organization";
  const requestedSubdomain = metadata.subdomain || "";

  console.log(`🏢 [STRIPE WEBHOOK] Provisioning tenant for user: ${authUserId}`);

  try {
    // 🎯 PROVISION TENANT AFTER PAYMENT SUCCESS (idempotent)
    const { data: orgResult, error: provisionError } = await supabaseAdmin.rpc('provision_tenant_after_payment', {
      p_user_id: authUserId,
      p_org_name: companyName,
      p_requested_subdomain: requestedSubdomain,
      p_owner_email: userEmail,
      p_stripe_customer_id: session.customer as string,
      p_stripe_subscription_id: session.subscription as string,
    });

    if (provisionError) {
      console.error('❌ [STRIPE WEBHOOK] Tenant provisioning failed:', provisionError);
      throw new Error(`Tenant provisioning failed: ${provisionError.message}`);
    }

    console.log(`✅ [STRIPE WEBHOOK] Tenant provisioned successfully:`, orgResult);
    
    // Log if this was already provisioned (webhook retry)
    if (orgResult?.already_provisioned) {
      console.log('ℹ️ [STRIPE WEBHOOK] Tenant was already provisioned (webhook retry)');
    }

    return orgResult;

  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Tenant provisioning error:', error);
    throw error; // Re-throw to trigger 500 response
  }
}