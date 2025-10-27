import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { IntegrationPreferences } from '@/lib/integrations'

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs'

// Helper function to extract user from Authorization header or JWT token
async function getAuthenticatedUser(request: NextRequest) {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) return user
    } catch (error) {
      console.log('Bearer token auth failed:', error)
    }
  }

  // Try cookie-based authentication
  const sessionCookie = request.cookies.get('ghostcrm_jwt')?.value
  if (sessionCookie) {
    try {
      // For cookie-based auth, we might need to verify JWT manually
      // This is a placeholder - you might need to adjust based on your auth implementation
      const jwt = await import('jsonwebtoken')
      const decoded = jwt.verify(sessionCookie, process.env.JWT_SECRET!) as any
      if (decoded?.sub) {
        // Get user by ID from our database
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('id', decoded.sub)
          .single()
        
        if (!error && user) {
          return { id: user.id, email: user.email }
        }
      }
    } catch (error) {
      console.log('JWT cookie auth failed:', error)
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { integrationPreferences, organizationData } = body

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, organizations(*)')
      .eq('user_id', user.id)
      .single()

    if (orgError || !userOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Save integration preferences to organization settings
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({
        integration_preferences: integrationPreferences,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userOrg.organization_id)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    // Create integration setup tasks for implementation team
    const integrationTasks = []
    
    // Database integration task
    if (integrationPreferences.database?.type !== 'supabase') {
      integrationTasks.push({
        organization_id: userOrg.organization_id,
        task_type: 'database_integration',
        title: `Set up ${integrationPreferences.database.type} integration`,
        description: `Configure database integration for ${integrationPreferences.database.type}`,
        priority: 'high',
        status: 'pending',
        config: integrationPreferences.database,
        created_at: new Date().toISOString()
      })
    }

    // Telephony integration task
    if (integrationPreferences.telephony?.provider !== 'none') {
      integrationTasks.push({
        organization_id: userOrg.organization_id,
        task_type: 'telephony_integration',
        title: `Set up ${integrationPreferences.telephony.provider} integration`,
        description: `Configure phone system integration with ${integrationPreferences.telephony.provider}`,
        priority: 'medium',
        status: 'pending',
        config: integrationPreferences.telephony,
        created_at: new Date().toISOString()
      })
    }

    // Implementation support task
    if (integrationPreferences.implementationSupport !== 'self_service') {
      integrationTasks.push({
        organization_id: userOrg.organization_id,
        task_type: 'implementation_support',
        title: `Provide ${integrationPreferences.implementationSupport.replace('_', ' ')} support`,
        description: `Customer requested ${integrationPreferences.implementationSupport} implementation support`,
        priority: integrationPreferences.implementationSupport === 'white_glove' ? 'high' : 'medium',
        status: 'pending',
        config: { supportType: integrationPreferences.implementationSupport },
        created_at: new Date().toISOString()
      })
    }

    // Save integration tasks if any
    if (integrationTasks.length > 0) {
      const { error: tasksError } = await supabaseAdmin
        .from('integration_tasks')
        .insert(integrationTasks)

      if (tasksError) {
        console.error('Error creating integration tasks:', tasksError)
        // Don't fail the request, just log the error
      }
    }

    // Send notification to implementation team
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        organization_id: userOrg.organization_id,
        type: 'integration_setup',
        title: 'New Integration Setup Required',
        message: `Organization "${(userOrg.organizations as any)?.name || 'Unknown'}" has completed onboarding with ${integrationTasks.length} integration tasks`,
        data: {
          integrationCount: integrationTasks.length,
          implementationSupport: integrationPreferences.implementationSupport,
          organizationName: (userOrg.organizations as any)?.name
        },
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Integration preferences saved successfully',
      integrationTasksCreated: integrationTasks.length
    })

  } catch (error) {
    console.error('Error saving integration preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization integration preferences
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, organizations!inner(integration_preferences, onboarding_completed)')
      .eq('user_id', user.id)
      .single()

    if (orgError || !userOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({
      integrationPreferences: (userOrg.organizations as any)?.integration_preferences,
      onboardingCompleted: (userOrg.organizations as any)?.onboarding_completed
    })

  } catch (error) {
    console.error('Error fetching integration preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}