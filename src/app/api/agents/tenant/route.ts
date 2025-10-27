import { NextRequest, NextResponse } from 'next/server';
import { TenantManagementAgent } from '@/ai-agents/agents/TenantManagementAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Function to safely get or create agent instance
function getSafeTenantAgent() {
  try {
    // Only create agent if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔄 OpenAI API key not configured, agent features disabled');
      return null;
    }
    return new TenantManagementAgent();
  } catch (error) {
    console.error('🏢 Failed to create Tenant Management Agent:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantAgent = getSafeTenantAgent();
    
    if (!tenantAgent) {
      return NextResponse.json({
        success: true,
        agent: {
          id: 'tenant-management',
          name: 'Tenant Management Agent',
          description: 'Multi-tenant resource management (OpenAI API key required)',
          version: '1.0.0',
          status: 'unavailable',
          lastCheck: new Date().toISOString(),
          tenantSummary: [],
          resourceUtilization: {},
          scalingNeeds: [],
          recentAlerts: [],
          recommendations: ['Configure OpenAI API key to enable tenant management features']
        }
      });
    }

    // Initialize the agent if needed
    await tenantAgent.initialize();
    
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
    const tenantAgent = getSafeTenantAgent();
    
    if (!tenantAgent) {
      return NextResponse.json({
        success: false,
        error: 'Tenant Management Agent unavailable. OpenAI API key required.',
      }, { status: 503 });
    }

    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Initialize the agent if needed
    await tenantAgent.initialize();

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