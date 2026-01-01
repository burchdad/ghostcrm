import { createClient } from '@supabase/supabase-js'

/**
 * SERVICE ROLE CLIENT - Use ONLY for privileged server operations
 * - Webhooks (Stripe, billing events)  
 * - Provisioning and admin tasks
 * - Background jobs
 * 
 * 🔧 CRITICAL FIX: Use server-only SUPABASE_URL, not NEXT_PUBLIC
 * WARNING: This client bypasses RLS - ensure proper tenant validation in code
 */
export const supabaseServiceRole = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

/**
 * SECURE SERVICE ROLE OPERATIONS
 * These functions ensure proper tenant validation even with service role access
 */

/**
 * Safely insert/update data with explicit tenant validation
 */
export async function secureServiceInsert<T>(
  table: string,
  data: T & { organization_id?: string; tenant_id?: string },
  requiredTenantId?: string
) {
  // Ensure tenant ID is present
  const tenantId = data.organization_id || data.tenant_id || requiredTenantId
  
  if (!tenantId) {
    throw new Error('Tenant ID is required for secure service operations')
  }

  // Verify tenant exists
  const { data: tenant, error: tenantError } = await supabaseServiceRole
    .from('organizations')
    .select('id')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    throw new Error(`Invalid tenant ID: ${tenantId}`)
  }

  // Perform the operation with verified tenant
  const finalData = { ...data, organization_id: tenantId }
  return await supabaseServiceRole
    .from(table)
    .insert(finalData)
}

/**
 * Safely update data with explicit tenant validation
 */
export async function secureServiceUpdate<T>(
  table: string,
  data: Partial<T>,
  filter: { column: string; value: any },
  requiredTenantId: string
) {
  // Verify the record belongs to the tenant before updating
  const { data: existing, error: checkError } = await supabaseServiceRole
    .from(table)
    .select('organization_id, tenant_id')
    .eq(filter.column, filter.value)
    .single()

  if (checkError || !existing) {
    throw new Error('Record not found for update')
  }

  const recordTenantId = existing.organization_id || existing.tenant_id
  if (recordTenantId !== requiredTenantId) {
    throw new Error('Tenant mismatch - cannot update record from different tenant')
  }

  // Perform the update
  return await supabaseServiceRole
    .from(table)
    .update(data)
    .eq(filter.column, filter.value)
}

/**
 * Safely query data with tenant filtering
 */
export async function secureServiceQuery(
  table: string,
  tenantId: string,
  additionalFilters?: { [key: string]: any }
) {
  let query = supabaseServiceRole
    .from(table)
    .select('*')
    .or(`organization_id.eq.${tenantId},tenant_id.eq.${tenantId}`)

  // Add additional filters if provided
  if (additionalFilters) {
    Object.entries(additionalFilters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  return await query
}

/**
 * Create tenant membership safely
 */
export async function createTenantMembership(
  userId: string,
  tenantId: string,
  role: string = 'member'
) {
  return await secureServiceInsert('tenant_memberships', {
    user_id: userId,
    tenant_id: tenantId,
    role: role
  })
}

/**
 * Update user's JWT custom claims to include tenant_id
 * 🔧 CRITICAL FIX: Use app_metadata for JWT claims, not user_metadata
 * This enables proper JWT-based RLS policies
 */
export async function updateUserTenantClaims(userId: string, tenantId: string) {
  try {
    // Get user's current metadata
    const { data, error: getUserError } = await supabaseServiceRole.auth.admin.getUserById(userId)
    
    if (getUserError || !data?.user) {
      throw new Error(`User not found: ${getUserError?.message || 'Unknown error'}`)
    }

    const user = data.user;

    // Update app_metadata with tenant claims (this affects JWT tokens)
    const updatedAppMetadata = {
      ...user.app_metadata,
      tenant_id: tenantId,
      organization_id: tenantId, // Keep both for compatibility
      custom_claims: {
        ...user.app_metadata?.custom_claims,
        tenant_id: tenantId,
        organization_id: tenantId
      }
    }

    const { data: updatedUser, error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(userId, {
      app_metadata: updatedAppMetadata
    })

    if (updateError) {
      throw new Error(`Failed to update claims: ${updateError.message}`)
    }

    return updatedUser
  } catch (error) {
    console.error('Failed to update user tenant claims:', error)
    throw error
  }
}

/**
 * Verify JWT claims are properly set for a user
 */
export async function verifyUserTenantClaims(userId: string): Promise<{ valid: boolean, tenantId?: string, error?: string }> {
  try {
    const { data } = await supabaseServiceRole.auth.admin.getUserById(userId)
    
    if (!data?.user) {
      return { valid: false, error: 'User not found' }
    }

    const user = data.user;
    const tenantId = user.app_metadata?.tenant_id || user.app_metadata?.custom_claims?.tenant_id
    
    return {
      valid: !!tenantId,
      tenantId,
      error: tenantId ? undefined : 'No tenant_id in JWT claims'
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

/**
 * Provision tenant features securely
 */
export async function provisionTenantFeatures(
  tenantId: string,
  features: string[],
  subscriptionId?: string
) {
  // Verify tenant exists
  const { data: tenant } = await supabaseServiceRole
    .from('organizations')
    .select('id, name')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`)
  }

  // Create or update tenant features
  const featurePromises = features.map(feature => 
    supabaseServiceRole
      .from('tenant_features')
      .upsert({
        tenant_id: tenantId,
        feature_name: feature,
        enabled: true,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
  )

  return await Promise.all(featurePromises)
}

export default supabaseServiceRole