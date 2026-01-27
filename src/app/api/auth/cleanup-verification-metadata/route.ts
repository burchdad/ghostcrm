export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/cleanup-verification-metadata
 * Clean up stale verification metadata for already-verified users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is already verified
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        success: false, 
        message: 'User email is not yet verified' 
      });
    }

    console.log('[CLEANUP] Cleaning stale verification metadata for verified user:', user.email);

    // Clean up stale verification metadata
    const { error: cleanupError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        email_verification_pending: false,
        verification_setup_completed: true,
        email_verified_at: user.email_confirmed_at,
        // Clear any stale verification codes
        verification_code: null,
        verification_code_expires: null,
        verification_code_sent_at: null
      }
    });

    if (cleanupError) {
      console.error('[CLEANUP] Failed to clean metadata:', cleanupError);
      return NextResponse.json({ error: 'Failed to clean up metadata' }, { status: 500 });
    }

    console.log('[CLEANUP] Successfully cleaned stale verification metadata');

    return NextResponse.json({
      success: true,
      message: 'Verification metadata cleaned up successfully',
      was_verified: true
    });

  } catch (error) {
    console.error('Error in cleanup-verification-metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}