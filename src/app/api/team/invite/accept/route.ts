import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, tempPassword } = body;

    if (!token || !email || !tempPassword) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: token, email, tempPassword'
      }, { status: 400 });
    }

    console.log('👥 [INVITE-ACCEPT] Processing invite acceptance:', { token, email });

    // 1. Verify the invitation token and get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single();

    if (inviteError || !invite) {
      console.error('❌ [INVITE-ACCEPT] Invite not found:', inviteError);
      return NextResponse.json({
        success: false,
        message: 'Invalid invitation token or email'
      }, { status: 400 });
    }

    // 2. Check if invite is still valid (not expired)
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      console.error('❌ [INVITE-ACCEPT] Invite expired:', { expiresAt });
      return NextResponse.json({
        success: false,
        message: 'This invitation has expired. Please request a new invitation.'
      }, { status: 400 });
    }

    // 3. Check if invite is still pending
    if (invite.status !== 'pending') {
      console.error('❌ [INVITE-ACCEPT] Invite not pending:', { status: invite.status });
      return NextResponse.json({
        success: false,
        message: 'This invitation has already been used or cancelled.'
      }, { status: 400 });
    }

    // 4. Get the user record to verify temporary password
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('requires_password_reset', true)
      .single();

    if (userError || !user) {
      console.error('❌ [INVITE-ACCEPT] User not found or not requiring password reset:', userError);
      return NextResponse.json({
        success: false,
        message: 'User account not found or not in temporary password state'
      }, { status: 400 });
    }

    // 5. Verify the temporary password
    const isValidTempPassword = await bcrypt.compare(tempPassword, user.password_hash);
    if (!isValidTempPassword) {
      console.error('❌ [INVITE-ACCEPT] Invalid temporary password');
      return NextResponse.json({
        success: false,
        message: 'Invalid temporary password. Please check your email for the correct password.'
      }, { status: 401 });
    }

    console.log('✅ [INVITE-ACCEPT] Temporary password verified successfully');

    // 6. Return success with user ID for profile setup
    return NextResponse.json({
      success: true,
      message: 'Temporary password verified successfully',
      userId: user.id,
      userData: {
        email: user.email,
        role: invite.role,
        organizationName: invite.organization_name
      }
    });

  } catch (error) {
    console.error('❌ [INVITE-ACCEPT] Server error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}