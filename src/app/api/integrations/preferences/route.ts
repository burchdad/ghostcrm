import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin'
import { IntegrationPreferences } from '@/lib/integrations'
import { isAuthenticated, getUserFromRequest } from '@/lib/auth/server'

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromRequest(request);
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 401 });
    }

    const body = await request.json()
    const { integrationPreferences, organizationData } = body

    // Get user's organization using the organizationId from user object
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', user.organizationId)
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
    const integrationTasks: any[] = [];
    
    // Database integration task
    if (integrationPreferences.database?.type !== 'supabase') {
      integrationTasks.push({
        organization_id: user.organizationId,
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
        organization_id: user.organizationId,
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
        organization_id: user.organizationId,
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
        organization_id: user.organizationId,
        type: 'integration_setup',
        title: 'New Integration Setup Required',
        message: `Organization "${userOrg?.name || 'Unknown'}" has completed onboarding with ${integrationTasks.length} integration tasks`,
        data: {
          integrationCount: integrationTasks.length,
          implementationSupport: integrationPreferences.implementationSupport,
          organizationName: userOrg?.name
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
    // Authenticate user
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromRequest(request);
    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 401 });
    }

    // Get user's organization integration preferences using organizationId directly
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('integration_preferences, onboarding_completed')
      .eq('id', user.organizationId)
      .single()

    if (orgError || !userOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({
      integrationPreferences: userOrg.integration_preferences,
      onboardingCompleted: userOrg.onboarding_completed
    })

  } catch (error) {
    console.error('Error fetching integration preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}