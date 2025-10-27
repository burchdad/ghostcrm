import { NextRequest, NextResponse } from 'next/server';
import { BillingIntelligenceAgent } from '@/ai-agents/agents/BillingIntelligenceAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Initialize agent
const billingAgent = new BillingIntelligenceAgent();

// Initialize the agent when the module loads
(async () => {
  try {
    await billingAgent.initialize();
    console.log('💰 Billing Intelligence Agent initialized successfully');
  } catch (error) {
    console.error('💰 Failed to initialize Billing Intelligence Agent:', error);
  }
})();

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

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