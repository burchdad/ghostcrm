import { NextRequest, NextResponse } from 'next/server';
import { SecurityComplianceAgent } from '@/ai-agents/agents/SecurityComplianceAgent';

// Runtime configuration
export const runtime = 'nodejs';

// Initialize agent
const securityAgent = new SecurityComplianceAgent(
  'security-compliance',
  'Security & Compliance Agent',
  'Monitors security events, analyzes threats, ensures compliance, and provides real-time security intelligence',
  '1.0.0',
  {
    enabled: true,
    schedule: { interval: 300000 }, // 5 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxDelay: 30000
    },
    logging: {
      level: 'info',
      persistent: true
    },
    notifications: {
      onError: true,
      onSuccess: false,
      channels: []
    }
  }
);

// Initialize the agent when the module loads
(async () => {
  try {
    await securityAgent.initialize();
    console.log('🛡️ Security & Compliance Agent initialized successfully');
  } catch (error) {
    console.error('🛡️ Failed to initialize Security & Compliance Agent:', error);
  }
})();

export async function GET(request: NextRequest) {
  try {
    const status = await securityAgent.getSecurityStatus();
    
    return NextResponse.json({
      success: true,
      agent: {
        id: securityAgent.id,
        name: securityAgent.name,
        description: securityAgent.description,
        version: securityAgent.version,
        status: status.status,
        lastCheck: status.lastCheck,
        metrics: status.metrics,
        compliance: status.compliance,
        recentEvents: status.recentEvents,
        recommendations: status.recommendations
      }
    });
  } catch (error) {
    console.error('🛡️ [SECURITY_API] Error getting status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get security agent status',
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

    const result = await securityAgent.performAction(action, params);

    return NextResponse.json({
      success: true,
      action,
      result
    });
  } catch (error) {
    console.error('🛡️ [SECURITY_API] Error performing action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform security agent action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}