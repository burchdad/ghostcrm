export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withCORS } from '@/lib/cors';
import { createVerificationCode } from '@/lib/verification-codes';
import { EmailService } from '@/lib/email-service';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function resendVerificationCodeHandler(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return jsonError('Email is required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError('Invalid email format', 400);
    }

    console.log('[RESEND-CODE] Request for:', email);

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      console.log('[RESEND-CODE] User not found:', email);
      return jsonError('User not found', 404);
    }

    // Check if user is already verified
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (authError) {
      console.error('[RESEND-CODE] Auth user lookup failed:', authError);
      return jsonError('Failed to check verification status', 500);
    }

    if (authUser.user?.email_confirmed_at) {
      return jsonError('Email is already verified', 400);
    }

    // Generate new verification code
    const verificationCode = await createVerificationCode(user.id, email);

    // Send verification code email
    const emailService = EmailService.getInstance();
    const emailSent = await emailService.sendVerificationCode(
      email,
      user.email, // Use email as firstName fallback
      verificationCode
    );

    if (!emailSent) {
      console.error('[RESEND-CODE] Failed to send email');
      return jsonError('Failed to send verification code', 500);
    }

    console.log('[RESEND-CODE] Verification code sent successfully to:', email);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expires_in: 600 // 10 minutes
    });

  } catch (error) {
    console.error('[RESEND-CODE] Unexpected error:', error);
    return jsonError('Internal server error', 500);
  }
}

export const POST = withCORS(resendVerificationCodeHandler);