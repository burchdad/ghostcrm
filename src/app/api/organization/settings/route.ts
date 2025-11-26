import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

/**
 * PUT /api/organization/settings
 * Update organization settings during onboarding
 */
export async function PUT(req: NextRequest) {
  try {
    const {
      organizationId,
      companyName,
      industry,
      teamSize,
      timezone,
      currency,
      salesGoals
    } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Update organization settings
    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: companyName,
        industry,
        team_size: teamSize,
        timezone,
        currency,
        sales_goals: salesGoals,
        settings_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, organization: data });
  } catch (error) {
    console.error('Error in organization settings update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}