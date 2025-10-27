import { NextRequest, NextResponse } from 'next/server';
import { IntegrationHealthAgent } from '@/ai-agents/agents/IntegrationHealthAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Function to safely get or create agent instance
function getSafeIntegrationAgent() {
  try {
    // Only create agent if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔄 OpenAI API key not configured, agent features disabled');
      return null;
    }
    return new IntegrationHealthAgent();
  } catch (error) {
    console.error('🔗 Failed to create Integration Health Agent:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const integrationAgent = getSafeIntegrationAgent();
    
    if (!integrationAgent) {
      return NextResponse.json({
        success: true,
        agent: {
          id: 'integration-health',
          name: 'Integration Health Agent',
          description: 'Monitors integration health (OpenAI API key required)',
          version: '1.0.0',
          status: 'unavailable',
          lastCheck: new Date().toISOString(),
          metrics: {},
          recentIssues: [],
          integrationSummary: [],
          recommendations: ['Configure OpenAI API key to enable integration monitoring']
        }
      });
    }

    // Initialize the agent if needed
    await integrationAgent.initialize();
    
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
    const integrationAgent = getSafeIntegrationAgent();
    
    if (!integrationAgent) {
      return NextResponse.json({
        success: false,
        error: 'Integration Health Agent unavailable. OpenAI API key required.',
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
    await integrationAgent.initialize();
    
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