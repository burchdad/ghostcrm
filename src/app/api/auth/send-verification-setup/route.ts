export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createVerificationCode } from '@/lib/verification-codes';
import { EmailService } from '@/lib/email-service';

/**
 * POST /api/auth/send-verification-setup
 * Send verification code during post-login setup flow
 */
export async function POST(request: NextRequest) {
  try {
    const { method, email, phone } = await request.json();
    
    if (!method || !email) {
      return NextResponse.json({ error: 'Method and email are required' }, { status: 400 });
    }

    if (method !== 'email' && method !== 'phone') {
      return NextResponse.json({ error: 'Invalid verification method' }, { status: 400 });
    }

    // For now, only support email
    if (method === 'phone') {
      return NextResponse.json({ error: 'SMS verification coming soon' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[SEND-VERIFICATION-SETUP] Sending code to:', email);

    // Generate verification code
    const verificationCode = await createVerificationCode(user.id, email);

    // Send verification code email
    const emailService = EmailService.getInstance();
    const emailSent = await emailService.sendVerificationCode(
      email,
      user.email?.split('@')[0] || 'User', // Use first part of email as name
      verificationCode
    );

    if (!emailSent) {
      console.error('[SEND-VERIFICATION-SETUP] Failed to send email');
      // Still log the code for development
      console.log(`🔥🔥🔥 VERIFICATION CODE FOR ${email}: ${verificationCode} 🔥🔥🔥`);
    }

    // Store verification attempt in user metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_setup_pending: true,
        verification_setup_method: method,
        verification_setup_email: email,
        verification_setup_sent_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.warn('[SEND-VERIFICATION-SETUP] Auth metadata update failed:', authError);
    }

    console.log('[SEND-VERIFICATION-SETUP] Verification code sent successfully');

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${method === 'email' ? 'your email' : 'your phone'}`,
      method,
      expires_in: 600 // 10 minutes
    });

  } catch (error) {
    console.error('Error in send-verification-setup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}