import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized - No JWT token' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Verify user is owner
    if (!jwtUser || jwtUser.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Only owners can update team members' }, { status: 403 });
    }

    // Get organization ID
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      return NextResponse.json({ error: 'Unauthorized - No organization' }, { status: 401 });
    }

    // Check if organizationId is a UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
    let actualOrganizationId = jwtOrganizationId;
    
    if (!isUUID) {
      const { data: org, error: orgLookupError } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', jwtOrganizationId)
        .single();

      if (orgLookupError || !org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      
      actualOrganizationId = org.id;
    }

    const { id } = params;
    const body = await request.json();
    const { name, email, role, department, status } = body;

    // Update user record
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({
        first_name: name?.split(' ')[0] || undefined,
        last_name: name?.split(' ').slice(1).join(' ') || undefined,
        email: email?.toLowerCase() || undefined,
        role: role?.toLowerCase().replace(/\s+/g, '_') || undefined,
        is_active: status === 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', actualOrganizationId)
      .select()
      .single();

    if (userError) {
      console.error('Failed to update user:', userError);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    // Update team_members record if it exists
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .update({
        name: name || undefined,
        email: email?.toLowerCase() || undefined,
        role: role || undefined,
        status: status || undefined,
        performance_metrics: {
          department: department || 'General',
          lastUpdated: new Date().toISOString()
        }
      })
      .eq('email', email?.toLowerCase() || updatedUser.email)
      .eq('organization_id', actualOrganizationId);

    if (teamMemberError) {
      console.error('Failed to update team member record:', teamMemberError);
      // Don't fail the operation, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      member: updatedUser
    });

  } catch (error) {
    console.error('Team member update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user info from JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'Unauthorized - No JWT token' }, { status: 401 });
    }

    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Unauthorized - Invalid JWT' }, { status: 401 });
    }

    // Verify user is owner
    if (!jwtUser || jwtUser.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Only owners can delete team members' }, { status: 403 });
    }

    // Get organization ID
    const jwtOrganizationId = jwtUser.organizationId;
    if (!jwtOrganizationId) {
      return NextResponse.json({ error: 'Unauthorized - No organization' }, { status: 401 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jwtOrganizationId);
    
    let actualOrganizationId = jwtOrganizationId;
    
    if (!isUUID) {
      const { data: org, error: orgLookupError } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', jwtOrganizationId)
        .single();

      if (orgLookupError || !org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      
      actualOrganizationId = org.id;
    }

    const { id } = params;

    // Get user info before deletion for cleanup
    const { data: userToDelete, error: getUserError } = await supabase
      .from('users')
      .select('email')
      .eq('id', id)
      .eq('organization_id', actualOrganizationId)
      .single();

    if (getUserError || !userToDelete) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Don't allow deletion of the owner
    if (userToDelete.email === jwtUser.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user record
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('organization_id', actualOrganizationId);

    if (deleteUserError) {
      console.error('Failed to delete user:', deleteUserError);
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }

    // Delete team_members record if it exists
    const { error: deleteTeamMemberError } = await supabase
      .from('team_members')
      .delete()
      .eq('email', userToDelete.email)
      .eq('organization_id', actualOrganizationId);

    if (deleteTeamMemberError) {
      console.error('Failed to delete team member record:', deleteTeamMemberError);
      // Don't fail the operation, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    });

  } catch (error) {
    console.error('Team member delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}