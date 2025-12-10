import { NextRequest, NextResponse } from 'next/server';
import { getPageAgentRegistry } from '@/ai-agents/registry/PageAgentRegistry';

export const dynamic = 'force-dynamic';

/**
 * AI Agents Management API
 * 
 * GET /api/ai/agents - List all agents and their status
 * POST /api/ai/agents - Manage agent operations (start, stop, configure)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const status = searchParams.get('status');

    const registry = getPageAgentRegistry();
    let agents = registry.getAllAgents();

    // Apply filters
    if (category) {
      agents = agents.filter(agent => agent.category === category);
    }
    if (page) {
      agents = agents.filter(agent => agent.page.includes(page));
    }
    if (status) {
      agents = agents.filter(agent => agent.status === status);
    }

    // Get registry status
    const registryStatus = await registry.getRegistryStatus();

    return NextResponse.json({
      success: true,
      data: {
        agents: agents.map(agent => ({
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
        })),
        registry: registryStatus,
      }
    });

  } catch (error: any) {
    console.error('AI Agents API Error:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, config } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    const registry = getPageAgentRegistry();

    switch (action) {
      case 'start':
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: 'Agent ID is required for start action' },
            { status: 400 }
          );
        }
        
        await registry.startAgent(agentId);
        
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} started successfully`,
          data: { agentId, status: 'active' }
        });

      case 'stop':
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: 'Agent ID is required for stop action' },
            { status: 400 }
          );
        }
        
        await registry.stopAgent(agentId);
        
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} stopped successfully`,
          data: { agentId, status: 'inactive' }
        });

      case 'configure':
        if (!agentId || !config) {
          return NextResponse.json(
            { success: false, error: 'Agent ID and config are required for configure action' },
            { status: 400 }
          );
        }
        
        await registry.updateAgentConfig(agentId, config);
        const updatedAgent = registry.getAgent(agentId);
        
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} configured successfully`,
          data: { agentId, config: updatedAgent?.config }
        });

      case 'start-all':
        await registry.startAllAgents();
        
        return NextResponse.json({
          success: true,
          message: 'All agents started successfully'
        });

      case 'stop-all':
        await registry.stopAllAgents();
        
        return NextResponse.json({
          success: true,
          message: 'All agents stopped successfully'
        });

      case 'health-check':
        await registry.performHealthChecks();
        const healthStatus = await registry.getRegistryStatus();
        
        return NextResponse.json({
          success: true,
          message: 'Health check completed',
          data: healthStatus
        });

      case 'collect-metrics':
        await registry.collectMetrics();
        const metricsData = registry.getAllAgents().map(agent => ({
          id: agent.id,
          metrics: agent.metrics
        }));
        
        return NextResponse.json({
          success: true,
          message: 'Metrics collected successfully',
          data: metricsData
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('AI Agents API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process agent operation',
        message: error.message 
      },
      { status: 500 }
    );
  }
}