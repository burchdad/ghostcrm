import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Missing invite token'
      }, { status: 400 });
    }

    const supabase = createClientComponentClient();

    console.log('🔍 [INVITE-VERIFY] Verifying invite token:', token);

    // Get invitation details
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('email, role, organization_name, status, expires_at')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      console.error('❌ [INVITE-VERIFY] Invite not found:', inviteError);
      return NextResponse.json({
        success: false,
        message: 'Invalid invitation token'
      }, { status: 404 });
    }

    // Check if invite is still valid
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      console.error('❌ [INVITE-VERIFY] Invite expired:', { expiresAt });
      return NextResponse.json({
        success: false,
        message: 'This invitation has expired'
      }, { status: 400 });
    }

    if (invite.status !== 'pending') {
      console.error('❌ [INVITE-VERIFY] Invite not pending:', { status: invite.status });
      return NextResponse.json({
        success: false,
        message: 'This invitation is no longer valid'
      }, { status: 400 });
    }

    console.log('✅ [INVITE-VERIFY] Invite verified successfully:', { email: invite.email, role: invite.role });

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        role: invite.role,
        organization_name: invite.organization_name
      }
    });

  } catch (error) {
    console.error('❌ [INVITE-VERIFY] Server error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}