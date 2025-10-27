import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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

    // Check if user has permission to manage users
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get all organization users
    const { data: orgUsers, error: usersError } = await supabaseAdmin
      .from('organization_memberships')
      .select(`
        user_id,
        role,
        tier,
        status,
        created_at,
        users:auth.users!inner(
          email,
          user_metadata
        ),
        user_subscriptions:organization_user_subscriptions(
          monthly_price
        )
      `)
      .eq('organization_id', membership.organization_id)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    // Transform data for frontend
    const users = orgUsers.map((membership: any) => ({
      id: membership.user_id,
      email: membership.users.email,
      full_name: membership.users.user_metadata?.full_name,
      role: membership.role,
      tier: membership.tier,
      status: membership.status,
      invited_at: membership.created_at,
      monthly_cost: membership.user_subscriptions?.[0]?.monthly_price || 0,
      // You might want to add last_active from a sessions table
      last_active: null
    }))

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error: any) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}