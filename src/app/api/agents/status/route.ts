/**
 * AI Agent Status API
 * Provides comprehensive status information for all AI agents
 * Protected by owner/super-admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/agentAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mock data for agent statuses (in production, these would be real agent instances)
const MOCK_AGENT_DATA = [
  {
    id: 'tenant-management',
    name: 'Tenant Management Agent',
    description: 'Monitors multi-tenant resource usage and scaling',
    status: 'running',
    health: { cpu: 15, memory: 32, uptime: 99.8, responseTime: 45 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  },
  {
    id: 'api-performance',
    name: 'API Performance Agent',
    description: 'Monitors API performance and optimization',
    status: 'running',
    health: { cpu: 23, memory: 45, uptime: 99.5, responseTime: 38 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence Agent',
    description: 'Provides business insights and analytics',
    status: 'running',
    health: { cpu: 18, memory: 52, uptime: 99.2, responseTime: 67 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  },
  {
    id: 'billing-intelligence',
    name: 'Billing Intelligence Agent',
    description: 'Monitors billing metrics and predicts churn',
    status: 'running',
    health: { cpu: 12, memory: 38, uptime: 99.7, responseTime: 42 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  },
  {
    id: 'integration-health',
    name: 'Integration Health Agent',
    description: 'Monitors integration health and sync status',
    status: 'running',
    health: { cpu: 8, memory: 28, uptime: 99.9, responseTime: 25 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance Agent',
    description: 'Monitors security events and compliance',
    status: 'running',
    health: { cpu: 31, memory: 43, uptime: 99.6, responseTime: 52 },
    lastActivity: new Date().toISOString(),
    tenant: 'System'
  }
];

export const GET = withAgentAuth(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent');

    // If specific agent requested
    if (agentId) {
      const agent = MOCK_AGENT_DATA.find(a => a.id === agentId);
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: agent,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate summary stats
    const summary = {
      total: MOCK_AGENT_DATA.length,
      running: MOCK_AGENT_DATA.filter(a => a.status === 'running').length,
      stopped: MOCK_AGENT_DATA.filter(a => a.status === 'stopped').length,
      error: MOCK_AGENT_DATA.filter(a => a.status === 'error').length,
      initializing: MOCK_AGENT_DATA.filter(a => a.status === 'initializing').length,
      avgResponseTime: Math.round(
        MOCK_AGENT_DATA.reduce((acc, a) => acc + a.health.responseTime, 0) / MOCK_AGENT_DATA.length
      )
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        agents: MOCK_AGENT_DATA,
        registry: MOCK_AGENT_DATA.map(({ id, name, description }) => ({
          id,
          name,
          description
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in agent status API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve agent statuses',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});

export const POST = withAgentAuth(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent');
    const body = await req.json();
    const { action } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const agent = MOCK_AGENT_DATA.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'start':
        agent.status = 'running';
        result = 'Agent started successfully';
        break;
      case 'stop':
        agent.status = 'stopped';
        result = 'Agent stopped successfully';
        break;
      case 'restart':
        agent.status = 'initializing';
        setTimeout(() => { agent.status = 'running'; }, 2000);
        result = 'Agent restarted successfully';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: result,
      data: agent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in agent control API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to control agent',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});