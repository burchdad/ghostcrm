export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withCORS } from '@/lib/cors';

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

async function verifyCodeHandler(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, email } = body;

    console.log('[VERIFY-CODE] Request received:', { 
      email, 
      hasCode: !!code, 
      codeLength: code?.length 
    });

    // Validate input
    if (!code || !email) {
      return jsonError('Missing verification code or email', 400);
    }

    if (!/^\d{6}$/.test(code)) {
      return jsonError('Invalid code format. Must be 6 digits.', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError('Invalid email format', 400);
    }

    // Find valid verification code
    const { data: codeRecord, error: codeError } = await supabaseAdmin
      .from('verification_codes')
      .select('id, user_id, code, expires_at, used')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) {
      console.error('[VERIFY-CODE] Database error:', codeError);
      return jsonError('Verification failed. Please try again.', 500);
    }

    if (!codeRecord) {
      console.log('[VERIFY-CODE] No valid code found:', { email, code });
      return jsonError('Invalid or expired verification code', 400);
    }

    console.log('[VERIFY-CODE] Found valid code for user:', codeRecord.user_id);

    // Mark code as used
    const { error: updateError } = await supabaseAdmin
      .from('verification_codes')
      .update({ 
        used: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', codeRecord.id);

    if (updateError) {
      console.error('[VERIFY-CODE] Failed to mark code as used:', updateError);
      // Continue anyway - don't fail verification for this
    }

    // Mark user email as verified in Supabase Auth
    const { data: updatedUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      codeRecord.user_id,
      { email_confirm: true }
    );

    if (authError) {
      console.error('[VERIFY-CODE] Failed to confirm email in auth:', authError);
      return jsonError('Failed to verify email. Please try again.', 500);
    }

    console.log('[VERIFY-CODE] Email verified successfully for user:', codeRecord.user_id);

    // Get user info for response
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, organization_id')
      .eq('id', codeRecord.user_id)
      .single();

    if (profileError) {
      console.warn('[VERIFY-CODE] Could not fetch user profile:', profileError);
    }

    // Check for active subdomain
    let subdomainInfo: { subdomain: string; url: string } | null = null;
    if (userProfile?.organization_id) {
      const { data: subdomain, error: subdomainError } = await supabaseAdmin
        .from('subdomains')
        .select('subdomain, status')
        .eq('organization_id', userProfile.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subdomainError && subdomain) {
        subdomainInfo = {
          subdomain: subdomain.subdomain,
          url: `https://${subdomain.subdomain}.ghostcrm.ai`
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: codeRecord.user_id,
        email: updatedUser.user?.email,
        email_confirmed: true,
        organization_id: userProfile?.organization_id
      },
      subdomain: subdomainInfo,
      next_action: subdomainInfo ? 'redirect_to_subdomain' : 'wait_for_payment'
    });

  } catch (error) {
    console.error('[VERIFY-CODE] Unexpected error:', error);
    return jsonError('Internal server error', 500);
  }
}

export const POST = withCORS(verifyCodeHandler);