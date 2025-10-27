import { NextRequest, NextResponse } from 'next/server';
import { IntegrationHealthAgent } from '@/ai-agents/agents/IntegrationHealthAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Initialize agent
const integrationAgent = new IntegrationHealthAgent();

// Initialize the agent when the module loads
(async () => {
  try {
    await integrationAgent.initialize();
    console.log('🔗 Integration Health Agent initialized successfully');
  } catch (error) {
    console.error('🔗 Failed to initialize Integration Health Agent:', error);
  }
})();

export async function GET(request: NextRequest) {
  try {
    const status = await integrationAgent.getIntegrationStatus();
    
    return NextResponse.json({
      success: true,
      agent: {
        id: integrationAgent.id,
        name: integrationAgent.name,
        description: integrationAgent.description,
        version: integrationAgent.version,
        status: status.status,
        lastCheck: status.lastCheck,
        metrics: status.metrics,
        recentIssues: status.recentIssues,
        integrationSummary: status.integrationSummary,
        recommendations: status.recommendations
      }
    });
  } catch (error) {
    console.error('🔗 [INTEGRATION_API] Error getting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get integration agent status',
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

    const result = await integrationAgent.performAction(action, params);

    return NextResponse.json({
      success: true,
      action,
      result
    });
  } catch (error) {
    console.error('🔗 [INTEGRATION_API] Error performing action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform integration agent action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}