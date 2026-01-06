import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, isAuthenticated } from '@/lib/auth/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { EmailService } from '@/lib/email-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase SSR
    if (!(await isAuthenticated(request))) {
      console.error('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Supabase session
    const user = await getUserFromRequest(request);
    if (!user || !user.organizationId) {
      console.error('❌ User or organization not found');
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    // Verify user is owner
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Only owners can invite team members' }, { status: 403 });
    }

    // Use organizationId from user object
    const actualOrganizationId = user.organizationId;

    // Get organization details for email
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subdomain')
      .eq('id', actualOrganizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }    const body = await request.json();
    const { name, email, role, department } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email is already in use in this organization
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .eq('organization_id', actualOrganizationId)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists in your organization' }, { status: 409 });
    }

    // Generate a secure invite token and temporary password
    const inviteToken = randomBytes(32).toString('hex');
    const tempPassword = randomBytes(8).toString('hex').toUpperCase(); // 16-char temp password
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Hash the temporary password for storage
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

    // Create the user with temporary password and pending status
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        email: email.toLowerCase(),
        role: role.toLowerCase().replace(/\s+/g, '_'),
        organization_id: actualOrganizationId,
        is_active: false,
        password_hash: tempPasswordHash, // Use temporary password hash
        requires_password_reset: true, // Flag to require password change on first login
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('Failed to create user:', createError);
      if (createError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create user invitation' }, { status: 500 });
    }

    // Create team invitation record for enhanced invitation flow
    const { error: inviteError } = await supabase
      .from('team_invites')
      .insert([{
        token: inviteToken,
        email: email.toLowerCase(),
        role: role.toLowerCase().replace(/\s+/g, '_'),
        organization_id: actualOrganizationId,
        organization_name: organization.name || organization.subdomain,
        inviter_id: user.id || null,
        inviter_name: user.email || 'Team Owner',
        status: 'pending',
        expires_at: inviteExpires.toISOString(),
        metadata: {
          department: department || 'General',
          tempPasswordGenerated: true
        }
      }]);

    if (inviteError) {
      console.error('Failed to create team invite record:', inviteError);
      // Don't fail the whole operation, just log it since the user was already created
    }

    // Also add to team_members table for additional team management data
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .insert([{
        organization_id: actualOrganizationId,
        name: name,
        email: email.toLowerCase(),
        role: role,
        status: 'pending',
        hire_date: new Date().toISOString().split('T')[0], // Today's date
        performance_metrics: {
          department: department || 'General',
          joinDate: new Date().toISOString(),
          inviteStatus: 'sent',
          inviteToken: inviteToken,
          inviteExpires: inviteExpires.toISOString()
        }
      }]);

    if (teamMemberError) {
      console.error('Failed to create team member record:', teamMemberError);
      // Don't fail the whole operation, just log it
    }

    // Send email invitation  
    // Use the correct base URL for the tenant's subdomain
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostcrm.ai';
    if (organization.subdomain) {
      baseUrl = `https://${organization.subdomain}.ghostcrm.ai`;
    }
    // Redirect to tenant login page with invite token as parameter
    const inviteUrl = `${baseUrl}/tenant-login?subdomain=${organization.subdomain}&invite=${inviteToken}`;
    const emailService = EmailService.getInstance();
    
    const emailSent = await emailService.sendTeamInvitation(email, {
      inviteeName: name,
      inviterName: user.email || 'Team Owner',
      inviterEmail: user.email || 'owner@company.com',
      inviteeEmail: email.toLowerCase(),
      organizationName: organization.name || organization.subdomain || 'Your Organization',
      role: role,
      inviteUrl: inviteUrl,
      tempPassword: tempPassword,
      expiresAt: inviteExpires.toISOString()
    });

    console.log('🎯 [INVITE] Created invitation for:', {
      email: email,
      role: role,
      inviteUrl: inviteUrl,
      expiresAt: inviteExpires,
      emailSent: emailSent
    });

    return NextResponse.json({
      success: true,
      message: emailSent ? 
        'Team member invitation sent successfully! They will receive an email with instructions to join.' :
        `Team member added successfully. Email sending failed - please share this invite link manually: ${inviteUrl}`,
      member: {
        id: newUser.id,
        name: name,
        email: email.toLowerCase(),
        role: role,
        department: department || 'General',
        status: 'pending',
        inviteToken: inviteToken,
        inviteUrl: inviteUrl,
        expiresAt: inviteExpires.toISOString(),
        emailSent: emailSent
      },
      // Include these for enhanced invitation system testing
      token: inviteToken,
      tempPassword: tempPassword
    });

  } catch (error) {
    console.error('Team member invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}