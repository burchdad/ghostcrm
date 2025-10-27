import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { organizationData, teamConfig, checkoutSessionId } = await request.json()

    // Get user from Authorization header
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

    // Verify the user has a paid organization
    const { data: existingOrg, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select(`
        *,
        organization_memberships!inner(*)
      `)
      .eq('organization_memberships.user_id', user.id)
      .eq('organization_memberships.role', 'owner')
      .eq('subscription_status', 'active')
      .single()

    if (orgError || !existingOrg) {
      return NextResponse.json(
        { error: 'No active organization found. Please complete billing first.' },
        { status: 400 }
      )
    }

    // Update organization with detailed information
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({
        name: organizationData.companyName,
        subdomain: organizationData.subdomain,
        industry: organizationData.industry,
        phone: organizationData.phone || null,
        website: organizationData.website || null,
        address: organizationData.address || null,
        logo_url: organizationData.logoUrl || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingOrg.id)

    if (updateError) {
      throw new Error(`Failed to update organization: ${updateError.message}`)
    }

    // Store team configuration as organization settings
    const settingsToInsert = [
      {
        organization_id: existingOrg.id,
        setting_key: 'team_config',
        setting_value: teamConfig
      },
      {
        organization_id: existingOrg.id,
        setting_key: 'onboarding_completed_at',
        setting_value: { timestamp: new Date().toISOString() }
      }
    ]

    const { error: settingsError } = await supabaseAdmin
      .from('organization_settings')
      .upsert(settingsToInsert, { 
        onConflict: 'organization_id,setting_key',
        ignoreDuplicates: false 
      })

    if (settingsError) {
      console.error('Failed to save settings:', settingsError)
      // Continue anyway, settings are not critical
    }

    // Initialize default data structures if not already done
    await initializeOrganizationDefaults(supabaseAdmin, existingOrg.id)

    // Log completion in audit trail
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        organization_id: existingOrg.id,
        user_id: user.id,
        action: 'organization_setup_completed',
        details: {
          company_name: organizationData.companyName,
          industry: organizationData.industry,
          workflow_preferences: teamConfig.workflowPreferences
        },
        created_at: new Date().toISOString()
      })

    // Get the updated organization data
    const { data: updatedOrg } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', existingOrg.id)
      .single()

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: 'Organization setup completed successfully'
    })

  } catch (error: any) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete setup' },
      { status: 500 }
    )
  }
}

async function initializeOrganizationDefaults(supabaseClient: any, organizationId: string) {
  try {
    // Create default sales pipeline stages if they don't exist
    const { data: existingStages } = await supabaseClient
      .from('pipeline_stages')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1)

    if (!existingStages?.length) {
      const defaultStages = [
        { name: 'Lead', order_index: 0, color: '#8B5CF6', is_closed: false },
        { name: 'Qualified', order_index: 1, color: '#3B82F6', is_closed: false },
        { name: 'Proposal', order_index: 2, color: '#F59E0B', is_closed: false },
        { name: 'Negotiation', order_index: 3, color: '#EF4444', is_closed: false },
        { name: 'Closed Won', order_index: 4, color: '#10B981', is_closed: true },
        { name: 'Closed Lost', order_index: 5, color: '#6B7280', is_closed: true }
      ]

      await supabaseClient
        .from('pipeline_stages')
        .insert(
          defaultStages.map(stage => ({
            ...stage,
            organization_id: organizationId,
            created_at: new Date().toISOString()
          }))
        )
    }

    // Create default lead sources if they don't exist
    const { data: existingSources } = await supabaseClient
      .from('lead_sources')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1)

    if (!existingSources?.length) {
      const defaultSources = [
        { name: 'Website', color: '#8B5CF6' },
        { name: 'Referral', color: '#3B82F6' },
        { name: 'Social Media', color: '#F59E0B' },
        { name: 'Cold Outreach', color: '#EF4444' },
        { name: 'Trade Show', color: '#10B981' },
        { name: 'Advertisement', color: '#EC4899' }
      ]

      await supabaseClient
        .from('lead_sources')
        .insert(
          defaultSources.map(source => ({
            ...source,
            organization_id: organizationId,
            created_at: new Date().toISOString()
          }))
        )
    }

  } catch (error) {
    console.error('Failed to initialize organization defaults:', error)
    // Don't throw, this is non-critical
  }
}