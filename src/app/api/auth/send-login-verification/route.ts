import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/send-login-verification
 * Send verification code after successful login (Verizon-style flow)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user needs verification
    const needsVerification = user.user_metadata?.email_verification_pending === true;
    
    if (!needsVerification) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email already verified',
        needsVerification: false 
      });
    }

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code in user metadata with timestamp
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_code: verificationCode,
        verification_code_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        verification_code_sent_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('Failed to store verification code:', updateError);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Send verification email with code
    try {
      console.log(`📧 [VERIFICATION] Generated code ${verificationCode} for user ${user.email}`);
      console.log(`📧 [VERIFICATION] Code expires at: ${new Date(Date.now() + 10 * 60 * 1000).toISOString()}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firstName: user.user_metadata?.first_name || 'User',
          verificationCode: verificationCode
        })
      });

      if (!response.ok) {
        console.warn('⚠️ [VERIFICATION] Email sending failed, but code is stored');
      } else {
        console.log('✅ [VERIFICATION] Email sent successfully (check console logs for actual code)');
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.log(`📧 [VERIFICATION] EMAIL FAILED - Use this code manually: ${verificationCode}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      needsVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('Error in send-login-verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/auth/send-login-verification  
 * Check if user needs post-login verification
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const needsVerification = user.user_metadata?.email_verification_pending === true;
    
    return NextResponse.json({
      success: true,
      needsVerification,
      email: user.email,
      firstName: user.user_metadata?.first_name || 'User'
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}