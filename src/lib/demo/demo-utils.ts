// =============================================================================
// DEMO DATA MANAGEMENT UTILITIES
// Helper functions and scripts for managing demo environment
// =============================================================================

import { DemoDataProvider, DEMO_CREDENTIALS, initializeDemoData } from './demo-data-provider';

/**
 * Reset demo data - useful for development and testing
 */
export async function resetDemoData(supabase: any): Promise<void> {
  console.log('🔄 [DEMO] Resetting demo data...');
  
  try {
    // Get demo organization
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DEMO_CREDENTIALS.subdomain)
      .single();

    if (!orgData) {
      throw new Error('Demo organization not found');
    }

    // Get demo user
    const { data: userData } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    });

    if (!userData?.user) {
      throw new Error('Demo user not found');
    }

    // Re-initialize demo data
    await initializeDemoData(supabase, orgData.id, userData.user.id);
    
    console.log('✅ [DEMO] Demo data reset successfully');
  } catch (error) {
    console.error('❌ [DEMO] Error resetting demo data:', error);
    throw error;
  }
}

/**
 * Validate demo environment setup
 */
export async function validateDemoEnvironment(supabase: any): Promise<boolean> {
  try {
    console.log('🔍 [DEMO] Validating demo environment...');
    
    // Check if demo organization exists
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DEMO_CREDENTIALS.subdomain)
      .single();

    if (!orgData) {
      console.log('⚠️ [DEMO] Demo organization not found');
      return false;
    }

    // Check if demo user exists
    const { data: userData } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    });

    if (!userData?.user) {
      console.log('⚠️ [DEMO] Demo user not found');
      return false;
    }

    // Check if demo data exists
    const { data: leadsData } = await supabase
      .from('leads')
      .select('count(*)')
      .eq('organization_id', orgData.id);

    const leadsCount = leadsData?.[0]?.count || 0;
    
    if (leadsCount === 0) {
      console.log('⚠️ [DEMO] Demo data not found');
      return false;
    }

    console.log(`✅ [DEMO] Demo environment valid (${leadsCount} leads found)`);
    return true;
    
  } catch (error) {
    console.error('❌ [DEMO] Error validating demo environment:', error);
    return false;
  }
}

/**
 * Create or update demo user in Supabase Auth
 */
export async function ensureDemoUser(supabase: any): Promise<any> {
  try {
    console.log('👤 [DEMO] Ensuring demo user exists...');
    
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    });

    if (!signInError && signInData?.user) {
      console.log('✅ [DEMO] Demo user already exists');
      return signInData.user;
    }

    // User doesn't exist, create it
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      options: {
        data: {
          full_name: 'Demo User',
          organization_name: DEMO_CREDENTIALS.organizationName,
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    console.log('✅ [DEMO] Demo user created successfully');
    return signUpData.user;
    
  } catch (error) {
    console.error('❌ [DEMO] Error ensuring demo user:', error);
    throw error;
  }
}

/**
 * Create or update demo organization
 */
export async function ensureDemoOrganization(supabase: any): Promise<any> {
  try {
    console.log('🏢 [DEMO] Ensuring demo organization exists...');
    
    // Check if organization exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DEMO_CREDENTIALS.subdomain)
      .single();

    if (existingOrg) {
      console.log('✅ [DEMO] Demo organization already exists');
      return existingOrg;
    }

    // Create organization
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: DEMO_CREDENTIALS.organizationName,
        subdomain: DEMO_CREDENTIALS.subdomain,
        plan: 'demo',
        status: 'active',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          demo_mode: true,
          industry: 'Automotive Sales',
          size: 'small'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log('✅ [DEMO] Demo organization created successfully');
    return newOrg;
    
  } catch (error) {
    console.error('❌ [DEMO] Error ensuring demo organization:', error);
    throw error;
  }
}

/**
 * Complete demo environment setup
 */
export async function setupCompleteDemo(supabase: any): Promise<void> {
  try {
    console.log('🚀 [DEMO] Setting up complete demo environment...');
    
    // Ensure organization exists
    const organization = await ensureDemoOrganization(supabase);
    
    // Ensure user exists
    const user = await ensureDemoUser(supabase);
    
    // Initialize demo data
    await initializeDemoData(supabase, organization.id, user.id);
    
    console.log('🎉 [DEMO] Complete demo environment setup successful!');
    
  } catch (error) {
    console.error('❌ [DEMO] Error setting up complete demo:', error);
    throw error;
  }
}

/**
 * Get demo environment statistics
 */
export async function getDemoStats(supabase: any): Promise<any> {
  try {
    console.log('📊 [DEMO] Getting demo environment statistics...');
    
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DEMO_CREDENTIALS.subdomain)
      .single();

    if (!orgData) {
      return { error: 'Demo organization not found' };
    }

    // Get counts for each data type
    const [
      { data: leadsData },
      { data: dealsData },
      { data: inventoryData },
      { data: activitiesData },
      { data: teamData }
    ] = await Promise.all([
      supabase.from('leads').select('count(*)').eq('organization_id', orgData.id),
      supabase.from('deals').select('count(*)').eq('organization_id', orgData.id),
      supabase.from('inventory').select('count(*)').eq('organization_id', orgData.id),
      supabase.from('activities').select('count(*)').eq('organization_id', orgData.id),
      supabase.from('team_members').select('count(*)').eq('organization_id', orgData.id)
    ]);

    const stats = {
      organization: orgData,
      data_counts: {
        leads: leadsData?.[0]?.count || 0,
        deals: dealsData?.[0]?.count || 0,
        inventory: inventoryData?.[0]?.count || 0,
        activities: activitiesData?.[0]?.count || 0,
        team_members: teamData?.[0]?.count || 0
      },
      last_updated: new Date().toISOString()
    };

    console.log('📊 [DEMO] Demo stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ [DEMO] Error getting demo stats:', error);
    return { error: error.message };
  }
}

// Export all utilities
export const DemoUtils = {
  resetDemoData,
  validateDemoEnvironment,
  ensureDemoUser,
  ensureDemoOrganization,
  setupCompleteDemo,
  getDemoStats,
  credentials: DEMO_CREDENTIALS
};

export default DemoUtils;