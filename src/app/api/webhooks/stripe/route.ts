/**
 * STRIPE WEBHOOK HANDLER
 * Processes Stripe webhooks for subscription events and triggers feature provisioning
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSafeStripeClient } from '@/lib/stripe-safe';
import { createSupabaseServer } from '@/utils/supabase/server';
import { provisionSubscription, updateSubscription, suspendSubscription } from '@/lib/features/provisioning';
import { PlanId } from '@/lib/features/pricing';
import { FeatureId } from '@/lib/features/definitions';
import { trackPromoCodeUsage } from '@/lib/promo-code-tracking';

export const runtime = 'nodejs';

/**
 * Enhanced user lookup with comprehensive table search
 */
async function findUserByEmail(email: string): Promise<any> {
  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  
  console.log('🔍 [WEBHOOK] Looking for user with email:', email);
  
  // Try users table first (primary)
  const { data: userData, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, organization_id, email, tenant_id')
    .eq('email', email)
    .single();
    
  if (userData) {
    console.log('✅ [WEBHOOK] Found user in users table:', userData.id);
    return userData;
  } else {
    console.log('❌ [WEBHOOK] Users table lookup failed:', usersError?.message);
  }
  
  // Fallback to profiles table
  const { data: profileData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, organization_id, email, tenant_id')
    .eq('email', email)
    .single();
    
  if (profileData) {
    console.log('✅ [WEBHOOK] Found user in profiles table:', profileData.id);
    return profileData;
  } else {
    console.log('❌ [WEBHOOK] Profiles table lookup failed:', profilesError?.message);
  }
  
  // Try direct auth.users lookup
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authUsers?.users) {
    const authUser = authUsers.users.find(u => u.email === email);
    if (authUser) {
      console.log('✅ [WEBHOOK] Found user in auth.users:', authUser.id);
      // Return in expected format
      return {
        id: authUser.id,
        email: authUser.email,
        organization_id: null, // Will need to be set later
        tenant_id: null
      };
    }
  }
  
  console.log('❌ [WEBHOOK] User not found in any table for email:', email);
  return null;
}

/**
 * Create retry entry for failed webhook operations
 */
async function createRetryEntry(retryData: any): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
    await supabaseAdmin
      .from('webhook_retries')
      .insert({
        ...retryData,
        created_at: new Date().toISOString(),
        status: 'pending'
      });
  } catch (error) {
    console.warn('⚠️ [WEBHOOK] Could not create retry entry:', error);
  }
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for subscription management
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = createSafeStripeClient();
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process the event
    const result = await processWebhookEvent(event);

    if (result.success) {
      return NextResponse.json({ received: true, processed: result.processed });
    } else {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Process different Stripe webhook event types
 */
async function processWebhookEvent(event: Stripe.Event): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      
      case 'customer.subscription.deleted':
        return await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
      
      // 🚨 FIX 5: Enhanced webhook events for subscription lifecycle
      case 'invoice.payment_succeeded':
        return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      
      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, processed: false };
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing checkout session completed:', session.id);

    // Track promo code usage if any discounts were applied
    try {
      await trackPromoCodeUsage(session);
    } catch (trackingError) {
      console.error('Error tracking promo code usage:', trackingError);
      // Don't fail the entire webhook for tracking errors
    }

    // Activate subdomain for the user who just paid
    try {
      await activateSubdomainAfterPayment(session);
    } catch (activationError) {
      console.error('Error activating subdomain after payment:', activationError);
      // Don't fail the entire webhook for subdomain activation errors
    }

    if (session.mode === 'subscription' && session.subscription) {
      // For subscription checkouts, the subscription.created event will handle provisioning
      console.log('Subscription checkout completed, subscription events will handle provisioning');
      return { success: true, processed: true };
    }

    if (session.mode === 'payment') {
      // Handle one-time payments if needed
      console.log('One-time payment completed');
      return { success: true, processed: true };
    }

    return { success: true, processed: false };
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle subscription changes (created/updated)
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing subscription change:', subscription.id);

    const planId = subscription.metadata.planId as PlanId;
    const tenantId = subscription.metadata.tenantId;

    if (!planId) {
      console.error('Missing planId in subscription metadata');
      return { success: false, processed: false, error: 'Missing planId' };
    }

    const supabase = await createSupabaseServer();

    // Update or create subscription record
    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
      ...(tenantId && { tenant_id: tenantId }),
    };

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, processed: false, error: dbError.message };
    }

    // Provision or update features based on subscription status
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      if (tenantId) {
        const context = {
          tenantId,
          subscriptionId: subscription.id,
          planId,
          addOnFeatures: [] as FeatureId[],
          billingCycle: 'monthly' as const,
          status: subscription.status as 'active' | 'trial',
        };
        await provisionSubscription(context);
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling subscription change:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing subscription cancellation:', subscription.id);

    const tenantId = subscription.metadata.tenantId;
    const supabase = await createSupabaseServer();

    // Update subscription status
    const { error: dbError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, processed: false, error: dbError.message };
    }

    // Suspend features
    if (tenantId) {
      const context = {
        tenantId,
        subscriptionId: subscription.id,
        planId: subscription.metadata.planId as PlanId || 'starter',
        addOnFeatures: [] as FeatureId[],
        billingCycle: 'monthly' as const,
        status: 'cancelled' as const,
      };
      await suspendSubscription(context);
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing successful payment:', invoice.id);

    if ((invoice as any).subscription) {
      const supabase = await createSupabaseServer();

      // Update last payment info
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({
          last_payment_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, processed: false, error: dbError.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    console.log('Processing failed payment:', invoice.id);

    if ((invoice as any).subscription) {
      const supabase = await createSupabaseServer();

      // Update subscription status
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', (invoice as any).subscription);

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, processed: false, error: dbError.message };
      }

      // Optionally suspend features or send notifications
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error('Error handling failed payment:', error);
    return { success: false, processed: false, error: String(error) };
  }
}

/**
 * Activate subdomain after successful payment
 */
async function activateSubdomainAfterPayment(session: Stripe.Checkout.Session): Promise<void> {
  try {
    console.log('🌐 [STRIPE_WEBHOOK] Activating subdomain after payment for session:', session.id);

    // Get customer email from session
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      console.warn('⚠️ [STRIPE_WEBHOOK] No customer email found in session');
      return;
    }

    const supabase = await createSupabaseServer();

    // Use admin client for reliable access
    const { supabaseAdmin } = await import('@/lib/supabaseAdmin');

    // Find user with comprehensive lookup across all possible tables
    const user = await findUserByEmail(customerEmail);
    
    if (!user) {
      console.warn('⚠️ [STRIPE_WEBHOOK] User not found in any table for email:', customerEmail);
      // Create a retry entry for manual intervention
      await createRetryEntry({
        type: 'user_not_found',
        email: customerEmail,
        session_id: session.id,
        created_at: new Date().toISOString()
      });
      return;
    }

    if (!user) {
      console.warn('⚠️ [STRIPE_WEBHOOK] User not found in any table for email:', customerEmail);
      return;
    }

    console.log('✅ [STRIPE_WEBHOOK] Found user:', user.id, 'Organization:', user.organization_id);

    if (!user.organization_id) {
      console.warn('⚠️ [STRIPE_WEBHOOK] User has no organization:', user.id);
      return;
    }

    // Find subdomain records - check multiple status types
    const { data: subdomainRecords, error: subdomainError } = await supabaseAdmin
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .in('status', ['pending_payment', 'pending', 'inactive']);

    if (subdomainError || !subdomainRecords || subdomainRecords.length === 0) {
      console.warn('⚠️ [STRIPE_WEBHOOK] No eligible subdomain found for organization:', user.organization_id);
      return;
    }

    const subdomainRecord = subdomainRecords[0]; // Take the first eligible subdomain
    console.log('🔍 [STRIPE_WEBHOOK] Found subdomain:', subdomainRecord.subdomain, 'Status:', subdomainRecord.status);

    // Mark subdomain as provisioning first (not yet fully active)
    const { error: provisioningError } = await supabaseAdmin
      .from('subdomains')
      .update({
        status: 'provisioning',
        updated_at: new Date().toISOString()
      })
      .eq('id', subdomainRecord.id);

    if (provisioningError) {
      console.error('❌ [STRIPE_WEBHOOK] Failed to mark subdomain as provisioning:', provisioningError);
      await createRetryEntry({
        type: 'provisioning_failed',
        subdomain_id: subdomainRecord.id,
        error: provisioningError.message
      });
      return;
    }

    console.log('✅ [STRIPE_WEBHOOK] Subdomain marked as provisioning, proceeding with DNS setup...');

    // Optionally create tenant memberships if needed using RLS bypass
    try {
      const { data: existingMembership } = await supabaseAdmin
        .from('tenant_memberships')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingMembership && user.organization_id) {
        // Use RPC function to bypass RLS
        const { data: membershipResult, error: membershipError } = await supabaseAdmin
          .rpc('create_tenant_membership', {
            p_user_id: user.id,
            p_tenant_id: user.organization_id,
            p_role: 'owner'
          });

        if (membershipError) {
          console.warn('⚠️ [STRIPE_WEBHOOK] Could not create tenant membership:', membershipError);
        } else {
          console.log('✅ [STRIPE_WEBHOOK] Created tenant membership for user:', user.id);
        }
      }
    } catch (membershipError) {
      console.warn('⚠️ [STRIPE_WEBHOOK] Error handling tenant membership:', membershipError);
    }

    // CRITICAL: Call the subdomain provisioning API to set up DNS - must succeed
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostcrm.ai';
      const response = await fetch(`${baseUrl}/api/subdomains/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: subdomainRecord.subdomain,
          organizationId: user.organization_id,
          organizationName: subdomainRecord.organization_name,
          ownerEmail: customerEmail,
          autoProvision: true
        })
      });

      if (response.ok) {
        // DNS provisioning successful - mark subdomain as fully active
        const { error: activationError } = await supabaseAdmin
          .from('subdomains')
          .update({
            status: 'active',
            provisioned_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subdomainRecord.id);
          
        if (activationError) {
          console.error('❌ [STRIPE_WEBHOOK] Failed to mark subdomain as active after DNS provisioning:', activationError);
          throw new Error('Failed to activate subdomain after DNS setup');
        }
        
        console.log('✅ [STRIPE_WEBHOOK] Subdomain fully activated with DNS:', subdomainRecord.subdomain);
      } else {
        const errorText = await response.text();
        console.error('❌ [STRIPE_WEBHOOK] DNS provisioning failed:', response.status, errorText);
        
        // Keep subdomain in provisioning state and create retry entry
        await createRetryEntry({
          type: 'dns_provisioning_failed',
          subdomain_id: subdomainRecord.id,
          subdomain_name: subdomainRecord.subdomain,
          error: `HTTP ${response.status}: ${errorText}`,
          retry_count: 0
        });
        
        throw new Error(`DNS provisioning failed: ${response.status}`);
      }
    } catch (provisionError) {
      console.error('❌ [STRIPE_WEBHOOK] Error provisioning subdomain DNS:', provisionError);
      
      // Create retry entry for failed DNS provisioning
      await createRetryEntry({
        type: 'dns_provisioning_error',
        subdomain_id: subdomainRecord.id,
        subdomain_name: subdomainRecord.subdomain,
        error: String(provisionError),
        retry_count: 0
      });
      
      // This is now critical - fail the webhook if DNS provisioning fails
      throw provisionError;
    }

  } catch (error) {
    console.error('❌ [STRIPE_WEBHOOK] Error in activateSubdomainAfterPayment:', error);
    throw error; // Re-throw to ensure webhook failure is logged
  }
}