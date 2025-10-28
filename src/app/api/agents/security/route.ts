import { NextRequest, NextResponse } from 'next/server';
import { SecurityComplianceAgent } from '@/ai-agents/agents/SecurityComplianceAgent';


export const dynamic = 'force-dynamic';
// Runtime configuration
export const runtime = 'nodejs';

// Function to safely get or create agent instance
function getSafeSecurityAgent() {
  try {
    // Only create agent if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔄 OpenAI API key not configured, agent features disabled');
      return null;
    }
    return new SecurityComplianceAgent(
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
  } catch (error) {
    console.error('🛡️ Failed to create Security & Compliance Agent:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const securityAgent = getSafeSecurityAgent();
    
    if (!securityAgent) {
      return NextResponse.json({
        success: true,
        agent: {
          id: 'security-compliance',
          name: 'Security & Compliance Agent',
          description: 'Security monitoring and compliance (OpenAI API key required)',
          version: '1.0.0',
          status: 'unavailable',
          lastCheck: new Date().toISOString(),
          metrics: {},
          compliance: {},
          recentEvents: [],
          recommendations: ['Configure OpenAI API key to enable security intelligence features']
        }
      });
    }

    // Initialize the agent if needed
    await securityAgent.initialize();
    
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
    const securityAgent = getSafeSecurityAgent();
    
    if (!securityAgent) {
      return NextResponse.json({
        success: false,
        error: 'Security & Compliance Agent unavailable. OpenAI API key required.',
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
    await securityAgent.initialize();

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
