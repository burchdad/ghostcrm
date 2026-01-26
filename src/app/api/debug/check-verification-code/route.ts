import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * GET /api/debug/check-verification-code
 * Debug endpoint to check what verification code is stored for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const verificationData = {
      email: user.email,
      firstName: user.user_metadata?.first_name || 'User',
      needsVerification: user.user_metadata?.email_verification_pending === true,
      hasStoredCode: !!user.user_metadata?.verification_code,
      storedCode: user.user_metadata?.verification_code, // In production, don't return this!
      expiresAt: user.user_metadata?.verification_code_expires,
      sentAt: user.user_metadata?.verification_code_sent_at,
      isExpired: user.user_metadata?.verification_code_expires ? 
        new Date() > new Date(user.user_metadata.verification_code_expires) : false
    };

    console.log('🔍 [DEBUG] Verification status for:', user.email, verificationData);

    return NextResponse.json({
      success: true,
      user: user.email,
      verification: verificationData
    });

  } catch (error) {
    console.error('Error checking verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}