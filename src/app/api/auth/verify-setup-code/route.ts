export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/verify-setup-code
 * Verify code during post-login setup flow
 */
export async function POST(request: NextRequest) {
  try {
    const { code, email, method } = await request.json();
    
    if (!code || !email || !method) {
      return NextResponse.json({ error: 'Code, email, and method are required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format. Must be 6 digits.' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[VERIFY-SETUP-CODE] Verifying code for user:', user.id);

    // Find and validate verification code
    const { data: codeRecord, error: codeError } = await supabaseAdmin
      .from('verification_codes')
      .select('id, user_id, code, expires_at, used')
      .eq('email', email.toLowerCase())
      .eq('user_id', user.id)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) {
      console.error('[VERIFY-SETUP-CODE] Database error:', codeError);
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
    }

    if (!codeRecord) {
      console.log('[VERIFY-SETUP-CODE] No valid code found');
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Mark code as used
    const { error: updateError } = await supabaseAdmin
      .from('verification_codes')
      .update({ 
        used: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', codeRecord.id);

    if (updateError) {
      console.error('[VERIFY-SETUP-CODE] Failed to mark code as used:', updateError);
    }

    // Mark email as verified in auth
    const { error: authVerifyError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        verification_setup_pending: false,
        verification_setup_completed: true,
        verification_setup_completed_at: new Date().toISOString(),
        email_verified_at: new Date().toISOString()
      }
    });

    if (authVerifyError) {
      console.error('[VERIFY-SETUP-CODE] Failed to mark email as verified:', authVerifyError);
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    // Update user profile to mark setup as complete
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        verification_setup_completed: true,
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.warn('[VERIFY-SETUP-CODE] Profile update failed:', profileError);
    }

    console.log('[VERIFY-SETUP-CODE] Setup verification completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true,
      setup_completed: true
    });

  } catch (error) {
    console.error('Error in verify-setup-code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}