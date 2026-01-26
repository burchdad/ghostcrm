import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/verify-login-code
 * Verify the code entered by user after login
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const storedCode = user.user_metadata?.verification_code;
    const expiresAt = user.user_metadata?.verification_code_expires;
    
    if (!storedCode) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    // Check if code expired
    if (expiresAt && new Date() > new Date(expiresAt)) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify code
    if (code !== storedCode) {
      console.log(`❌ [VERIFY] Code mismatch - entered: "${code}", stored: "${storedCode}"`);
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    console.log(`✅ [VERIFY] Code verified successfully for user: ${user.email}`);

    // Mark email as verified and clear verification metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        email_verification_pending: false,
        verification_code: null,
        verification_code_expires: null,
        verification_code_sent_at: null,
        email_verified_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('Failed to mark email as verified:', updateError);
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true
    });

  } catch (error) {
    console.error('Error in verify-login-code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}