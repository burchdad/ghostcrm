import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/agents/dashboard
 * AI Agent Dashboard endpoint for agent interactions
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = request.cookies.get('ghostcrm_jwt')?.value || 
                  request.cookies.get('jwt')?.value;
    
    if (!token) {
      console.log('⚠️ [AI-AGENT-API] Authentication failed - no token');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (error: any) {
      console.log('⚠️ [AI-AGENT-API] Authentication failed - invalid token:', error.message);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!decoded || !decoded.organizationId) {
      console.log('⚠️ [AI-AGENT-API] Authentication failed - missing organization');
      return NextResponse.json({ error: 'Authentication failed for agent dashboard' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    console.log('🤖 [AI-AGENT-API] Dashboard request:', {
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: body.action
    });

    // Handle different agent actions
    switch (body.action) {
      case 'health_check':
        return NextResponse.json({
          success: true,
          status: 'healthy',
          agents: {
            dashboard: 'active',
            analytics: 'active',
            collaboration: 'active'
          },
          timestamp: new Date().toISOString()
        });

      case 'get_insights':
        return NextResponse.json({
          success: true,
          insights: [
            {
              type: 'performance',
              title: 'Dashboard Performance',
              description: 'System running optimally',
              score: 95
            },
            {
              type: 'engagement', 
              title: 'User Engagement',
              description: 'Active user sessions detected',
              score: 88
            }
          ]
        });

      default:
        console.log('❌ [AI-AGENT-API] Unknown action:', body.action);
        return NextResponse.json({
          success: false,
          error: 'Unknown agent action',
          availableActions: ['health_check', 'get_insights']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ [AI-AGENT-API] Error in dashboard endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Agent dashboard error',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET /api/ai/agents/dashboard  
 * Get dashboard agent status and available actions
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      agent: 'dashboard',
      status: 'active',
      availableActions: ['health_check', 'get_insights'],
      description: 'AI Dashboard Agent - Provides insights and analytics for the tenant dashboard'
    });
  } catch (error: any) {
    console.error('❌ [AI-AGENT-API] Error getting dashboard info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get agent info'
    }, { status: 500 });
  }
}