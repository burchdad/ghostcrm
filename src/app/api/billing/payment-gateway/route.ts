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
    
    if (!stripe) {
      console.error('❌ [PAYMENT-GATEWAY] Stripe not configured');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=stripe-not-configured`);
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'subscription']
      });
      console.log('✅ [PAYMENT-GATEWAY] Stripe session retrieved:', {
        id: session.id,
        customer_email: session.customer_email,
        customer_details: session.customer_details,
        payment_status: session.payment_status,
        mode: session.mode,
        status: session.status
      });
    } catch (stripeError) {
      console.error('❌ [PAYMENT-GATEWAY] Failed to retrieve Stripe session:', stripeError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=stripe-session-failed`);
    }

    if (!session) {
      console.error('❌ [PAYMENT-GATEWAY] Invalid session ID - session is null');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=invalid-session`);
    }

    console.log('🔍 [PAYMENT-GATEWAY] Session payment status check:', {
      payment_status: session.payment_status,
      status: session.status,
      mode: session.mode
    });

    if (session.payment_status !== 'paid') {
      console.error('❌ [PAYMENT-GATEWAY] Payment not completed:', {
        payment_status: session.payment_status,
        status: session.status,
        session_id: session.id
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/billing/error?error=payment-failed&payment_status=${session.payment_status}`);
    }

    console.log('✅ [PAYMENT-GATEWAY] Payment confirmed, activating subdomain...');

    // Activate subdomain for this payment
    console.log('🔄 [PAYMENT-GATEWAY] Starting subdomain activation process...');
    const activationResult = await activateSubdomainAfterPayment(session);
    
    console.log('🔍 [PAYMENT-GATEWAY] Activation result:', activationResult);
    
    if (!activationResult.success) {
      console.error('❌ [PAYMENT-GATEWAY] Subdomain activation failed:', {
        error: activationResult.error,
        session_id: sessionId,
        customer_email: session.customer_email || session.customer_details?.email
      });
      // Don't block success page for activation failures - user paid successfully
      // But redirect with error flag so we can show appropriate message
      const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id=${sessionId}&gateway_error=true&activation_error=${encodeURIComponent(activationResult.error || 'Unknown error')}`;
      return NextResponse.redirect(errorUrl);
    } else {
      console.log('✅ [PAYMENT-GATEWAY] Subdomain activated successfully:', activationResult);
    }

    // Update any other payment-related status
    await updatePaymentStatus(session);

    // Redirect to success page with processed flag
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostcrm.ai';
    const successUrl = `${baseUrl}/billing/success?session_id=${sessionId}&processed=true`;
    console.log('🎉 [PAYMENT-GATEWAY] Payment processing complete, redirecting to:', successUrl);
    console.log('🔍 [PAYMENT-GATEWAY] Environment NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('❌ [PAYMENT-GATEWAY] Unexpected error:', error);
    // Don't block user from success page due to processing errors
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostcrm.ai';
    const fallbackUrl = `${baseUrl}/billing/success?session_id=${searchParams.get('session_id')}&gateway_error=true`;
    console.log('🔄 [PAYMENT-GATEWAY] Using fallback redirect:', fallbackUrl);
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
    console.log('🔍 [PAYMENT-GATEWAY] Session details:', {
      id: session.id,
      customer_email: session.customer_email,
      customer_details: session.customer_details,
      payment_status: session.payment_status
    });

    // Get customer email from session
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      console.error('❌ [PAYMENT-GATEWAY] No customer email found in session');
      return { success: false, error: 'No customer email found in session' };
    }

    console.log('📧 [PAYMENT-GATEWAY] Customer email found:', customerEmail);

    const supabase = await createSupabaseServer();

    // Find the user by email
    console.log('👤 [PAYMENT-GATEWAY] Looking up user by email...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, email')
      .eq('email', customerEmail)
      .single();

    console.log('👤 [PAYMENT-GATEWAY] User lookup result:', { user, userError });

    if (userError || !user) {
      console.error('❌ [PAYMENT-GATEWAY] User not found:', userError);
      return { success: false, error: `User not found for email: ${customerEmail}` };
    }

    if (!user.organization_id) {
      console.error('❌ [PAYMENT-GATEWAY] User has no organization:', user);
      return { success: false, error: 'User has no organization' };
    }

    console.log('🏢 [PAYMENT-GATEWAY] Found user with organization:', user.organization_id);

    // Find and activate ALL pending subdomains for this organization
    console.log('🌐 [PAYMENT-GATEWAY] Looking for pending subdomains for organization:', user.organization_id);
    const { data: pendingSubdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('status', 'pending_payment');

    console.log('🌐 [PAYMENT-GATEWAY] Subdomain query result:', { 
      pendingSubdomains, 
      subdomainError,
      organizationId: user.organization_id 
    });

    if (subdomainError) {
      console.error('❌ [PAYMENT-GATEWAY] Database error querying subdomains:', subdomainError);
      return { success: false, error: `Database error: ${subdomainError.message}` };
    }

    if (!pendingSubdomains || pendingSubdomains.length === 0) {
      console.log('ℹ️ [PAYMENT-GATEWAY] No pending subdomains found - checking if any exist...');
      
      // Check if there are ANY subdomains for this organization
      const { data: allSubdomains, error: allSubdomainsError } = await supabase
        .from('subdomains')
        .select('*')
        .eq('organization_id', user.organization_id);
      
      console.log('🌐 [PAYMENT-GATEWAY] All subdomains for org:', { allSubdomains, allSubdomainsError });
      
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