import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    // First, check in team_members table where we stored the token
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('performance_metrics->>inviteToken', token)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if token has expired
    const expiresAt = teamMember.performance_metrics?.inviteExpires;
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      return NextResponse.json({
        invite: {
          status: 'expired',
          organizationName: 'Organization',
          inviterEmail: 'admin@company.com'
        }
      });
    }

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, subdomain')
      .eq('id', teamMember.organization_id)
      .single();

    // Check if user already exists and is active
    const { data: existingUser } = await supabase
      .from('users')
      .select('is_active')
      .eq('email', teamMember.email)
      .eq('organization_id', teamMember.organization_id)
      .single();

    if (existingUser && existingUser.is_active) {
      return NextResponse.json({
        invite: {
          status: 'used',
          organizationName: organization?.name || organization?.subdomain || 'Organization',
          inviterEmail: 'admin@company.com'
        }
      });
    }

    return NextResponse.json({
      invite: {
        id: teamMember.id,
        email: teamMember.email,
        firstName: teamMember.name.split(' ')[0] || teamMember.name,
        lastName: teamMember.name.split(' ').slice(1).join(' ') || '',
        role: teamMember.role,
        organizationName: organization?.name || organization?.subdomain || 'Organization',
        inviterEmail: 'admin@company.com',
        expiresAt: expiresAt,
        status: 'valid'
      }
    });

  } catch (error) {
    console.error('Invite validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Find the team member by token
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('performance_metrics->>inviteToken', token)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    // Check if token has expired
    const expiresAt = teamMember.performance_metrics?.inviteExpires;
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if user already exists and is active
    const { data: existingUser } = await supabase
      .from('users')
      .select('is_active, id')
      .eq('email', teamMember.email)
      .eq('organization_id', teamMember.organization_id)
      .single();

    if (existingUser && existingUser.is_active) {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        return NextResponse.json({ error: 'Failed to activate account' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update team member status
    const { error: teamUpdateError } = await supabase
      .from('team_members')
      .update({
        status: 'active',
        performance_metrics: {
          ...teamMember.performance_metrics,
          inviteAccepted: true,
          inviteAcceptedAt: new Date().toISOString()
        }
      })
      .eq('id', teamMember.id);

    if (teamUpdateError) {
      console.error('Failed to update team member:', teamUpdateError);
      // Don't fail the operation, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully! You can now sign in.'
    });

  } catch (error) {
    console.error('Invite acceptance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

