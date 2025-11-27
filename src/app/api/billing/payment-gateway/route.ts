import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    console.log('🔄 [PAYMENT-GATEWAY] Processing payment completion...');

    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      console.error('❌ [PAYMENT-GATEWAY] No session ID provided');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=no-session`);
    }

    console.log('🔍 [PAYMENT-GATEWAY] Processing session:', sessionId);

    // Get session details from Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      console.error('❌ [PAYMENT-GATEWAY] Invalid session ID');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=invalid-session`);
    }

    if (session.payment_status !== 'paid') {
      console.error('❌ [PAYMENT-GATEWAY] Payment not completed');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=payment-failed`);
    }

    console.log('✅ [PAYMENT-GATEWAY] Payment confirmed, activating subdomain...');

    // Activate subdomain for this payment
    const activationResult = await activateSubdomainAfterPayment(session);
    
    if (!activationResult.success) {
      console.warn('⚠️ [PAYMENT-GATEWAY] Subdomain activation failed but allowing success page:', activationResult.error);
      // Don't block success page for activation failures - user paid successfully
    } else {
      console.log('✅ [PAYMENT-GATEWAY] Subdomain activated successfully');
    }

    // Update any other payment-related status
    await updatePaymentStatus(session);

    // Redirect to success page with processed flag
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id=${sessionId}&processed=true`;
    console.log('🎉 [PAYMENT-GATEWAY] Payment processing complete, redirecting to:', successUrl);
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('❌ [PAYMENT-GATEWAY] Unexpected error:', error);
    // Don't block user from success page due to processing errors
    const fallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id=${searchParams.get('session_id')}&gateway_error=true`;
    return NextResponse.redirect(fallbackUrl);
  }
}

/**
 * Activate subdomain after successful payment - same logic as webhook
 */
async function activateSubdomainAfterPayment(session: any): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('🌐 [PAYMENT-GATEWAY] Activating subdomain for session:', session.id);

    // Get customer email from session
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      return { success: false, error: 'No customer email found in session' };
    }

    const supabase = await createSupabaseServer();

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('email', customerEmail)
      .single();

    if (userError || !user) {
      return { success: false, error: `User not found for email: ${customerEmail}` };
    }

    if (!user.organization_id) {
      return { success: false, error: 'User has no organization' };
    }

    // Find and activate ALL pending subdomains for this organization
    const { data: pendingSubdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('status', 'pending_payment');

    if (subdomainError) {
      return { success: false, error: `Database error: ${subdomainError.message}` };
    }

    if (!pendingSubdomains || pendingSubdomains.length === 0) {
      console.log('ℹ️ [PAYMENT-GATEWAY] No pending subdomains found - may already be activated');
      return { success: true, error: 'No pending subdomains found' };
    }

    console.log(`🔄 [PAYMENT-GATEWAY] Activating ${pendingSubdomains.length} subdomain(s)...`);

    // Activate all pending subdomains
    const activationPromises = pendingSubdomains.map(async (subdomain) => {
      const { error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomain.id);

      if (updateError) {
        console.error(`❌ [PAYMENT-GATEWAY] Failed to activate subdomain ${subdomain.subdomain}:`, updateError);
        return { success: false, subdomain: subdomain.subdomain, error: updateError.message };
      }

      console.log(`✅ [PAYMENT-GATEWAY] Activated subdomain: ${subdomain.subdomain}`);
      return { success: true, subdomain: subdomain.subdomain };
    });

    const results = await Promise.all(activationPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (failed.length > 0) {
      console.error('❌ [PAYMENT-GATEWAY] Some subdomain activations failed:', failed);
      return { success: false, error: `Failed to activate ${failed.length} subdomain(s)` };
    }

    console.log(`✅ [PAYMENT-GATEWAY] Successfully activated ${successful.length} subdomain(s)`);
    return { success: true };

  } catch (error) {
    console.error('❌ [PAYMENT-GATEWAY] Subdomain activation error:', error);
    return { success: false, error: `Activation error: ${error}` };
  }
}

/**
 * Update payment status in database
 */
async function updatePaymentStatus(session: any): Promise<void> {
  try {
    // Add any additional payment status updates here
    console.log('💰 [PAYMENT-GATEWAY] Updating payment status for session:', session.id);
    
    // This could include:
    // - Updating user subscription status
    // - Recording payment history
    // - Triggering welcome emails
    // - Etc.
    
  } catch (error) {
    console.error('❌ [PAYMENT-GATEWAY] Error updating payment status:', error);
    // Don't throw - this is not critical for user experience
  }
}