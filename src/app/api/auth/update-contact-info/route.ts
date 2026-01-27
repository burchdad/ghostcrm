export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/auth/update-contact-info
 * Update user's personal contact information after login
 */
export async function POST(request: NextRequest) {
  try {
    const { personalPhone, confirmedEmail } = await request.json();
    
    if (!personalPhone || !confirmedEmail) {
      return NextResponse.json({ error: 'Phone and email are required' }, { status: 400 });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(personalPhone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[UPDATE-CONTACT] Updating contact info for user:', user.id);

    // Update user profile with personal contact info
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({
        personal_phone: personalPhone,
        confirmed_email: confirmedEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('[UPDATE-CONTACT] Profile update failed:', profileError);
      return NextResponse.json({ error: 'Failed to update contact information' }, { status: 500 });
    }

    // Also update auth metadata for easy access
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        personal_phone: personalPhone,
        confirmed_email: confirmedEmail,
        contact_info_updated_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.warn('[UPDATE-CONTACT] Auth metadata update failed:', authError);
      // Don't fail the request for this
    }

    console.log('[UPDATE-CONTACT] Contact info updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Contact information updated successfully'
    });

  } catch (error) {
    console.error('Error in update-contact-info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}