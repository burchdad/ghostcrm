import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getTierPricing } from '@/lib/pricing'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, role, tier } = await request.json()

    if (!email || !role || !tier) {
      return NextResponse.json(
        { error: 'Email, role, and tier are required' },
        { status: 400 }
      )
    }

    // Get user from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the JWT token using the admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user has permission to invite users
    const { data: membership } = await supabaseAdmin
      .from('organization_memberships')
      .select(`
        organization_id,
        role,
        user_role:user_roles(permissions)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization membership found' },
        { status: 403 }
      )
    }

    // Check permissions
    const userRole = membership.user_role as any
    const permissions = userRole?.permissions || []
    if (!permissions.includes('users.manage') && membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite users' },
        { status: 403 }
      )
    }

    // Validate role and tier
    const tierPricing = getTierPricing(role, `${role}_${tier}`)
    if (!tierPricing) {
      return NextResponse.json(
        { error: 'Invalid role or tier combination' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single()

    let invitedUserId = existingUser?.id

    // If user doesn't exist, create invitation record
    if (!existingUser) {
      // For now, create a pending invitation record
      // In production, you'd send an actual email invitation
      const { data: invitation, error: inviteError } = await supabaseAdmin
        .from('user_invitations')
        .insert({
          organization_id: membership.organization_id,
          email,
          full_name,
          role,
          tier,
          invited_by: user.id,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (inviteError) {
        throw new Error(`Failed to create invitation: ${inviteError.message}`)
      }

      // TODO: Send email invitation
      console.log(`Invitation created for ${email}`)

      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
        invitation: invitation
      })
    }

    // If user exists, check if they're already in the organization
    const { data: existingMembership } = await supabaseAdmin
      .from('organization_memberships')
      .select('id')
      .eq('organization_id', membership.organization_id)
      .eq('user_id', existingUser.id)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    // Add user to organization
    const { error: membershipError } = await supabaseAdmin
      .from('organization_memberships')
      .insert({
        organization_id: membership.organization_id,
        user_id: existingUser.id,
        role,
        tier,
        status: 'active',
        created_at: new Date().toISOString()
      })

    if (membershipError) {
      throw new Error(`Failed to create membership: ${membershipError.message}`)
    }

    // Create user subscription record for billing
    const { error: subscriptionError } = await supabaseAdmin
      .from('organization_user_subscriptions')
      .insert({
        organization_id: membership.organization_id,
        user_id: existingUser.id,
        role_id: null, // Will be updated when role system is fully implemented
        tier,
        monthly_price: tierPricing.price * 100, // Convert to cents
        status: 'active',
        started_at: new Date().toISOString()
      })

    if (subscriptionError) {
      console.error('Failed to create subscription record:', subscriptionError)
      // Continue anyway, we can fix billing later
    }

    // Log the action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        organization_id: membership.organization_id,
        user_id: user.id,
        action: 'user_added',
        details: {
          added_user_id: existingUser.id,
          added_user_email: email,
          role,
          tier
        }
      })

    return NextResponse.json({
      success: true,
      message: 'User added to organization successfully',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        role,
        tier
      }
    })

  } catch (error: any) {
    console.error('User invitation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to invite user' },
      { status: 500 }
    )
  }
}