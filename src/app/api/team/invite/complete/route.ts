import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId, firstName, lastName, phone, newPassword } = body;

    if (!token || !userId || !firstName || !lastName || !phone || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const supabase = createClientComponentClient();

    console.log('🔧 [PROFILE-COMPLETE] Processing profile completion:', { userId, firstName, lastName });

    // 1. Verify the invitation token is still valid
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      console.error('❌ [PROFILE-COMPLETE] Invalid invite token:', inviteError);
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired invitation token'
      }, { status: 400 });
    }

    // 2. Check if invite is not expired
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      console.error('❌ [PROFILE-COMPLETE] Invite expired:', { expiresAt });
      return NextResponse.json({
        success: false,
        message: 'This invitation has expired'
      }, { status: 400 });
    }

    // 3. Verify user exists and is in temporary password state
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('email', invite.email)
      .eq('requires_password_reset', true)
      .single();

    if (userError || !user) {
      console.error('❌ [PROFILE-COMPLETE] User not found or invalid state:', userError);
      return NextResponse.json({
        success: false,
        message: 'User account not found or not in valid state for profile completion'
      }, { status: 400 });
    }

    // 4. Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Update user profile with new information
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        password_hash: hashedNewPassword,
        requires_password_reset: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('❌ [PROFILE-COMPLETE] Failed to update user:', updateUserError);
      return NextResponse.json({
        success: false,
        message: 'Failed to update user profile'
      }, { status: 500 });
    }

    // 6. Mark the invitation as accepted
    const { error: updateInviteError } = await supabase
      .from('team_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (updateInviteError) {
      console.error('❌ [PROFILE-COMPLETE] Failed to update invite status:', updateInviteError);
      // Don't fail the request for this, just log it
    }

    console.log('✅ [PROFILE-COMPLETE] Profile setup completed successfully for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Profile setup completed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        role: invite.role,
      }
    });

  } catch (error) {
    console.error('❌ [PROFILE-COMPLETE] Server error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}