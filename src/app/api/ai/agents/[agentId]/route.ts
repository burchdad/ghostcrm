import { NextRequest, NextResponse } from 'next/server';
import { getPageAgentRegistry } from '@/ai-agents/registry/PageAgentRegistry';

export const dynamic = 'force-dynamic';

/**
 * Individual Agent API
 * 
 * GET /api/ai/agents/[agentId] - Get specific agent details
 * POST /api/ai/agents/[agentId] - Execute agent-specific operations
 */

interface AgentParams {
  params: {
    agentId: string;
  };
}

export async function GET(request: NextRequest, { params }: AgentParams) {
  try {
    const { agentId } = params;
    
    const registry = getPageAgentRegistry();
    const agent = registry.getAgent(agentId);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: `Agent ${agentId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        page: agent.page,
        category: agent.category,
        status: agent.status,
        lastActivity: agent.lastActivity,
        config: agent.config,
        metrics: agent.metrics,
        health: agent.health,
      }
    });

  } catch (error: any) {
    console.error(`Agent ${params.agentId} API Error:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch agent information',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: AgentParams) {
  try {
    const { agentId } = params;
    const body = await request.json();
    const { operation, data: operationData } = body;

    console.log(`🔍 [AI-AGENT-API] POST request for agentId: ${agentId}, operation: ${operation}`);

    // Check for authentication
    const authHeader = request.headers.get('Authorization');
    console.log(`🔍 [AI-AGENT-API] Auth header present: ${!!authHeader}`);
    
    if (!authHeader) {
      console.warn(`⚠️ [AI-AGENT-API] No authorization header for agent ${agentId}`);
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const registry = getPageAgentRegistry();
    console.log(`🔍 [AI-AGENT-API] Registry available agents:`, registry.getRegisteredAgents());
    
    const agentInfo = registry.getAgent(agentId);
    console.log(`🔍 [AI-AGENT-API] Agent info for ${agentId}:`, agentInfo ? 'Found' : 'Not Found');

    if (!agentInfo) {
      console.error(`❌ [AI-AGENT-API] Agent ${agentId} not found in registry`);
      return NextResponse.json(
        { success: false, error: `Agent ${agentId} not found` },
        { status: 404 }
      );
    }

    const agent = agentInfo.instance;

    switch (operation) {
      case 'get-insights':
        // Get general page insights without specific entity analysis
        let insights;
        
        switch (agentId) {
          case 'leads':
            insights = await (agent as any).generateLeadInsights();
            break;
            
          case 'deals':
            insights = await (agent as any).generateDealInsights();
            break;
            
          case 'inventory':
            insights = await (agent as any).generateInventoryInsights();
            break;
            
          case 'calendar':
            insights = await (agent as any).generateCalendarInsights?.() || { insights: [], message: 'Calendar insights not implemented yet' };
            break;
            
          case 'collaboration':
            insights = await (agent as any).generateCollaborationInsights?.() || { insights: [], message: 'Collaboration insights not implemented yet' };
            break;
            
          case 'workflow':
            insights = await (agent as any).generateWorkflowInsights?.() || { insights: [], message: 'Workflow insights not implemented yet' };
            break;
            
          default:
            insights = { insights: [], message: `Insights not available for ${agentId}` };
        }
        
        return NextResponse.json({
          success: true,
          data: insights.insights || insights || []
        });

      case 'analyze':
        // Agent-specific analysis operations
        let result;
        
        switch (agentId) {
          case 'leads':
            if (operationData.leadId && operationData.leadData) {
              result = await (agent as any).analyzeLeadQuality(operationData.leadId, operationData.leadData);
            } else {
              result = await (agent as any).generateLeadInsights();
            }
            break;
            
          case 'deals':
            if (operationData.dealId && operationData.dealData) {
              result = await (agent as any).analyzeDeal(operationData.dealId, operationData.dealData);
            } else if (operationData.action === 'forecast') {
              result = await (agent as any).generatePipelineForecast(operationData.timeframe);
            } else if (operationData.action === 'at-risk') {
              result = await (agent as any).identifyAtRiskDeals();
            } else {
              result = await (agent as any).generateDealInsights();
            }
            break;
            
          case 'inventory':
            if (operationData.vehicleId && operationData.vehicleData) {
              result = await (agent as any).optimizeVehiclePricing(operationData.vehicleId, operationData.vehicleData);
            } else {
              result = await (agent as any).generateInventoryInsights();
            }
            break;
            
          case 'calendar':
            if (operationData.userId) {
              result = await (agent as any).optimizeScheduling(operationData.userId, operationData.preferences);
            } else if (operationData.participants && operationData.duration) {
              result = await (agent as any).suggestOptimalMeetingTimes(operationData.participants, operationData.duration, operationData.preferences);
            } else {
              result = { message: 'Calendar analysis requires userId or meeting parameters' };
            }
            break;
            
          case 'collaboration':
            if (operationData.teamId) {
              result = await (agent as any).analyzeTeamCommunication(operationData.teamId);
            } else if (operationData.userId) {
              result = await (agent as any).analyzeProductivity(operationData.userId, operationData.timeframe);
            } else {
              result = await (agent as any).generateTeamInsights(operationData.teamId || 'default');
            }
            break;
            
          case 'workflow':
            if (operationData.description) {
              result = await (agent as any).suggestWorkflowFromDescription(operationData.description, operationData.context);
            } else if (operationData.workflowId) {
              result = await (agent as any).optimizeExistingWorkflow(operationData.workflowId, operationData.performanceData);
            } else if (operationData.action === 'templates') {
              result = await (agent as any).suggestWorkflowTemplates(operationData.category, operationData.context);
            } else if (operationData.action === 'repetitive') {
              result = await (agent as any).detectRepetitiveTasks(operationData.userId, operationData.timeframe);
            } else {
              result = await (agent as any).generateWorkflowInsights();
            }
            break;
            
          default:
            return NextResponse.json(
              { success: false, error: `Analysis not supported for agent ${agentId}` },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          data: result,
          operation: 'analyze',
          agentId
        });

      case 'get-insights':
        // Get stored insights for specific entities
        let storedInsights;
        
        switch (agentId) {
          case 'leads':
            storedInsights = operationData.leadId 
              ? await (agent as any).getLeadRecommendations(operationData.leadId)
              : await (agent as any).generateLeadInsights();
            break;
            
          case 'deals':
            storedInsights = await (agent as any).generateDealInsights();
            break;
            
          case 'inventory':
            storedInsights = await (agent as any).generateInventoryInsights();
            break;
            
          case 'collaboration':
            storedInsights = operationData.teamId
              ? await (agent as any).generateTeamInsights(operationData.teamId)
              : await (agent as any).generateTeamInsights('default');
            break;
            
          case 'workflow':
            storedInsights = await (agent as any).generateWorkflowInsights();
            break;
            
          default:
            storedInsights = [];
        }

        return NextResponse.json({
          success: true,
          data: storedInsights,
          operation: 'get-insights',
          agentId
        });

      case 'get-metrics':
        const metrics = await agent.getMetrics();
        
        return NextResponse.json({
          success: true,
          data: metrics,
          operation: 'get-metrics',
          agentId
        });

      case 'health-check':
        const health = await agent.getHealth();
        
        return NextResponse.json({
          success: true,
          data: health,
          operation: 'health-check',
          agentId
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error(`Agent ${params.agentId} operation error:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute agent operation',
        message: error.message 
      },
      { status: 500 }
    );
  }
}