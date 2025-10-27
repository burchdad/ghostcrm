import { NextRequest, NextResponse } from 'next/server';
import { TenantManagementAgent } from '@/ai-agents/agents/TenantManagementAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Initialize agent
const tenantAgent = new TenantManagementAgent();

// Initialize the agent when the module loads
(async () => {
  try {
    await tenantAgent.initialize();
    console.log('🏢 Tenant Management Agent initialized successfully');
  } catch (error) {
    console.error('🏢 Failed to initialize Tenant Management Agent:', error);
  }
})();

export async function GET(request: NextRequest) {
  try {
    const status = await tenantAgent.getTenantManagementStatus();
    
    return NextResponse.json({
      success: true,
      agent: {
        id: tenantAgent.id,
        name: tenantAgent.name,
        description: tenantAgent.description,
        version: tenantAgent.version,
        status: status.status,
        lastCheck: status.lastCheck,
        tenantSummary: status.tenantSummary,
        resourceUtilization: status.resourceUtilization,
        scalingNeeds: status.scalingNeeds,
        recentAlerts: status.recentAlerts,
        recommendations: status.recommendations
      }
    });
  } catch (error) {
    console.error('🏢 [TENANT_API] Error getting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get tenant agent status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    const result = await tenantAgent.performAction(action, params);

    return NextResponse.json({
      success: true,
      action,
      result
    });
  } catch (error) {
    console.error('🏢 [TENANT_API] Error performing action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform tenant agent action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}