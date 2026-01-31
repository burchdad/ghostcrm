export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types for organization settings
interface OrganizationSettings {
  id: string
  name: string
  subdomain: string
  industry?: string
  company_size?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  timezone?: string
  currency?: string
  language?: string
  date_format?: string
  time_format?: string
  fiscal_year_start?: string
  logo_url?: string
  brand_color?: string
  secondary_color?: string
  created_at?: string
  updated_at?: string
}

interface UpdateSettingsRequest {
  name?: string
  industry?: string
  company_size?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  timezone?: string
  currency?: string
  language?: string
  date_format?: string
  time_format?: string
  fiscal_year_start?: string
  logo_url?: string
  brand_color?: string
  secondary_color?: string
}

// Initialize Supabase client
function createSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// GET - Retrieve organization settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ORG-SETTINGS] Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userOrg, error: userOrgError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userOrgError || !userOrg?.organization_id) {
      console.error('❌ [ORG-SETTINGS] User organization error:', userOrgError)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Fetch organization settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        subdomain,
        industry,
        company_size,
        phone,
        email,
        website,
        address,
        city,
        state,
        postal_code,
        country,
        timezone,
        currency,
        language,
        date_format,
        time_format,
        fiscal_year_start,
        logo_url,
        brand_color,
        secondary_color,
        created_at,
        updated_at
      `)
      .eq('id', userOrg.organization_id)
      .single()

    if (orgError) {
      console.error('❌ [ORG-SETTINGS] Organization fetch error:', orgError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch organization settings' },
        { status: 500 }
      )
    }

    console.log('✅ [ORG-SETTINGS] Settings retrieved for org:', organization.id)
    
    return NextResponse.json({
      success: true,
      data: organization
    })

  } catch (error) {
    console.error('❌ [ORG-SETTINGS] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update organization settings (complete replacement)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ORG-SETTINGS] Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: UpdateSettingsRequest = await request.json()

    // Get user's organization and check permissions
    const { data: userOrg, error: userOrgError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userOrgError || !userOrg?.organization_id) {
      console.error('❌ [ORG-SETTINGS] User organization error:', userOrgError)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update settings (admin or owner)
    if (!['admin', 'owner'].includes(userOrg.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update organization settings
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', userOrg.organization_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [ORG-SETTINGS] Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update organization settings' },
        { status: 500 }
      )
    }

    console.log('✅ [ORG-SETTINGS] Settings updated for org:', updatedOrg.id)
    
    return NextResponse.json({
      success: true,
      data: updatedOrg,
      message: 'Organization settings updated successfully'
    })

  } catch (error) {
    console.error('❌ [ORG-SETTINGS] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update of organization settings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ORG-SETTINGS] Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: Partial<UpdateSettingsRequest> = await request.json()

    // Validate that we have some data to update
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data provided for update' },
        { status: 400 }
      )
    }

    // Get user's organization and check permissions
    const { data: userOrg, error: userOrgError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userOrgError || !userOrg?.organization_id) {
      console.error('❌ [ORG-SETTINGS] User organization error:', userOrgError)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update settings (admin or owner)
    if (!['admin', 'owner'].includes(userOrg.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Update organization settings
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', userOrg.organization_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [ORG-SETTINGS] Partial update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update organization settings' },
        { status: 500 }
      )
    }

    console.log('✅ [ORG-SETTINGS] Settings partially updated for org:', updatedOrg.id)
    
    return NextResponse.json({
      success: true,
      data: updatedOrg,
      message: 'Organization settings updated successfully',
      updated_fields: Object.keys(body)
    })

  } catch (error) {
    console.error('❌ [ORG-SETTINGS] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Reset organization settings to defaults
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ORG-SETTINGS] Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's organization and check permissions
    const { data: userOrg, error: userOrgError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userOrgError || !userOrg?.organization_id) {
      console.error('❌ [ORG-SETTINGS] User organization error:', userOrgError)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to reset settings (owner only)
    if (userOrg.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only organization owners can reset settings' },
        { status: 403 }
      )
    }

    // Reset organization settings to defaults
    const defaultSettings = {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      fiscal_year_start: 'january',
      brand_color: '#3b82f6',
      secondary_color: '#64748b',
      updated_at: new Date().toISOString()
    }

    const { data: resetOrg, error: resetError } = await supabase
      .from('organizations')
      .update(defaultSettings)
      .eq('id', userOrg.organization_id)
      .select()
      .single()

    if (resetError) {
      console.error('❌ [ORG-SETTINGS] Reset error:', resetError)
      return NextResponse.json(
        { success: false, error: 'Failed to reset organization settings' },
        { status: 500 }
      )
    }

    console.log('✅ [ORG-SETTINGS] Settings reset for org:', resetOrg.id)
    
    return NextResponse.json({
      success: true,
      data: resetOrg,
      message: 'Organization settings reset to defaults'
    })

  } catch (error) {
    console.error('❌ [ORG-SETTINGS] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
