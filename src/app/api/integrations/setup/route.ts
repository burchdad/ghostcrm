import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * POST /api/integrations/setup
 * Setup integrations during onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const { organizationId, integrations } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Store integrations for the organization
    const integrationPromises = integrations.map(async (integration: any) => {
      return supabase
        .from('organization_integrations')
        .upsert({
          organization_id: organizationId,
          integration_type: integration.type,
          provider: integration.provider,
          configuration: integration.settings,
          enabled: integration.enabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    });

    const results = await Promise.all(integrationPromises);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error setting up integrations:', errors);
      return NextResponse.json({ error: 'Failed to setup some integrations' }, { status: 500 });
    }

    // Mark integrations as configured
    await supabase
      .from('organizations')
      .update({
        integrations_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId);

    return NextResponse.json({ success: true, integrations });
  } catch (error) {
    console.error('Error in integrations setup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}