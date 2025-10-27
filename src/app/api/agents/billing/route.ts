import { NextRequest, NextResponse } from 'next/server';
import { BillingIntelligenceAgent } from '@/ai-agents/agents/BillingIntelligenceAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Function to safely get or create agent instance
function getSafeBillingAgent() {
  try {
    // Only create agent if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔄 OpenAI API key not configured, agent features disabled');
      return null;
    }
    return new BillingIntelligenceAgent();
  } catch (error) {
    console.error('💰 Failed to create Billing Intelligence Agent:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const billingAgent = getSafeBillingAgent();
    
    if (!billingAgent) {
      return NextResponse.json({
        success: true,
        agent: {
          id: 'billing-intelligence',
          name: 'Billing Intelligence Agent',
          description: 'Billing analytics and insights (OpenAI API key required)',
          version: '1.0.0',
          status: 'unavailable',
          lastCheck: new Date().toISOString(),
          metrics: {},
          recentActivity: [],
          riskMetrics: {},
          anomalies: [],
          recommendations: ['Configure OpenAI API key to enable billing intelligence features']
        }
      });
    }

    // Initialize the agent if needed
    await billingAgent.initialize();
    
    const status = await billingAgent.getBillingStatus();
    
    return NextResponse.json({
      success: true,
      agent: {
        id: billingAgent.id,
        name: billingAgent.name,
        description: billingAgent.description,
        version: billingAgent.version,
        status: status.status,
        lastCheck: status.lastCheck,
        metrics: status.metrics,
        recentActivity: status.recentActivity,
        riskMetrics: status.riskMetrics,
        anomalies: status.anomalies,
        recommendations: status.recommendations
      }
    });
  } catch (error) {
    console.error('💰 [BILLING_API] Error getting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get billing agent status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const billingAgent = getSafeBillingAgent();
    
    if (!billingAgent) {
      return NextResponse.json({
        success: false,
        error: 'Billing Intelligence Agent unavailable. OpenAI API key required.',
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
    await billingAgent.initialize();

    const result = await billingAgent.performAction(action, params);

    return NextResponse.json({
      success: true,
      action,
      result
    });
  } catch (error) {
    console.error('💰 [BILLING_API] Error performing action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform billing agent action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}