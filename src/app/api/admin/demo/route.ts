import { NextRequest, NextResponse } from 'next/server';
import { supaFromReq } from '@/lib/supa-ssr';
import { DemoUtils } from '@/lib/demo/demo-utils';


export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    const supabaseResponse = supaFromReq(request);
    const supabase = supabaseResponse.s;
    
    switch (action) {
      case 'stats':
        const stats = await DemoUtils.getDemoStats(supabase);
        return NextResponse.json(stats);
        
      case 'validate':
        const isValid = await DemoUtils.validateDemoEnvironment(supabase);
        return NextResponse.json({ 
          valid: isValid,
          message: isValid ? 'Demo environment is valid' : 'Demo environment needs setup'
        });
        
      case 'credentials':
        return NextResponse.json({
          credentials: DemoUtils.credentials,
          message: 'Demo credentials for testing'
        });
        
      default:
        return NextResponse.json({
          message: 'Demo Management API',
          available_actions: [
            'GET /?action=stats - Get demo environment statistics',
            'GET /?action=validate - Validate demo environment',
            'GET /?action=credentials - Get demo credentials',
            'POST with action=reset - Reset demo data',
            'POST with action=setup - Setup complete demo environment'
          ]
        });
    }
    
  } catch (error) {
    console.error('❌ [DEMO-ADMIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, confirm } = body;
    
    const supabaseResponse = supaFromReq(request);
    const supabase = supabaseResponse.s;
    
    switch (action) {
      case 'reset':
        if (!confirm) {
          return NextResponse.json(
            { error: 'Please confirm reset action by setting confirm: true' },
            { status: 400 }
          );
        }
        
        console.log('🔄 [DEMO-ADMIN] Resetting demo data...');
        await DemoUtils.resetDemoData(supabase);
        
        return NextResponse.json({
          success: true,
          message: 'Demo data reset successfully'
        });
        
      case 'setup':
        console.log('🚀 [DEMO-ADMIN] Setting up complete demo environment...');
        await DemoUtils.setupCompleteDemo(supabase);
        
        return NextResponse.json({
          success: true,
          message: 'Complete demo environment setup successfully'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: reset, setup' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('❌ [DEMO-ADMIN] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');
    
    if (confirm !== 'true') {
      return NextResponse.json(
        { error: 'Please confirm deletion by adding ?confirm=true' },
        { status: 400 }
      );
    }
    
    const supabaseResponse = supaFromReq(request);
    const supabase = supabaseResponse.s;
    
    console.log('🗑️ [DEMO-ADMIN] Clearing all demo data...');
    
    // Get demo organization
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', DemoUtils.credentials.subdomain)
      .single();

    if (orgData) {
      // Clear all related data
      const tables = [
        'leads', 'deals', 'inventory', 'activities', 
        'team_members', 'notifications', 'calendar_events', 
        'campaigns', 'analytics_metrics', 'organization_settings'
      ];
      
      for (const table of tables) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq('organization_id', orgData.id);
        } catch (error) {
          console.warn(`⚠️ [DEMO-ADMIN] Could not clear table ${table}:`, error);
        }
      }
      
      // Delete organization
      await supabase
        .from('organizations')
        .delete()
        .eq('id', orgData.id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'All demo data cleared successfully'
    });
    
  } catch (error) {
    console.error('❌ [DEMO-ADMIN] Error clearing demo data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
