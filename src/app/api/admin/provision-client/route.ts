import { NextRequest, NextResponse } from 'next/server'
import { triggerClientProvisioning } from '../../../../../migrations/client-provisioning/provisioning-system'
import { createSafeSupabaseClient } from '@/lib/supabase-safe'

/**
 * API Route: POST /api/admin/provision-client
 * Triggers automated database provisioning for new clients
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSafeSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      )
    }

    // Authenticate admin user
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify admin permissions (using main admin database)
    const token = authHeader.substring(7)
    // Update Supabase client with auth token
    const authenticatedSupabase = createSafeSupabaseClient()
    if (!authenticatedSupabase) {
      return NextResponse.json(
        { error: 'Supabase authentication failed' },
        { status: 503 }
      )
    }

    // Note: For admin operations, we may need service role key
    // This implementation assumes the safe client has appropriate permissions
    const { data: user, error: userError } = await authenticatedSupabase.auth.getUser(token)
    if (userError || !user.user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check if user has admin role in main system
    const { data: adminProfile, error: profileError } = await authenticatedSupabase
      .from('admin_users')
      .select('role')
      .eq('id', user.user.id)
      .single()

    if (profileError || !adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { clientData } = body

    // Validate required fields
    if (!clientData || !clientData.name || !clientData.adminEmail) {
      return NextResponse.json(
        { error: 'Missing required client data (name, adminEmail)' },
        { status: 400 }
      )
    }

    // Generate client ID if not provided
    if (!clientData.id) {
      clientData.id = crypto.randomUUID()
    }

    console.log(`🎯 Provisioning request received for client: ${clientData.name}`)

    // Trigger the provisioning process
    await triggerClientProvisioning({
      id: clientData.id,
      name: clientData.name,
      adminEmail: clientData.adminEmail,
      adminPassword: clientData.adminPassword,
      customSettings: clientData.settings || {}
    })

    return NextResponse.json({
      success: true,
      message: 'Client provisioning initiated successfully',
      clientId: clientData.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Client provisioning API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: GET /api/admin/provision-client/status
 * Get provisioning queue status
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check for GET requests
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    // Import here to avoid circular dependencies
    const { provisioningQueue } = await import('../../../../../migrations/client-provisioning/provisioning-system')
    const status = provisioningQueue.getQueueStatus()

    return NextResponse.json({
      queue: status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Queue status API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get queue status',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}