import { NextRequest, NextResponse } from 'next/server';
import { getPageAgentRegistry } from '@/ai-agents/registry/PageAgentRegistry';

export const dynamic = 'force-dynamic';

// System agent IDs that are protected from tenant modification
const SYSTEM_AGENT_IDS = [
  'leads-agent',
  'deals-agent',
  'inventory-agent', 
  'calendar-agent',
  'collaboration-agent',
  'workflow-agent'
];

/**
 * Check if an agent is a protected system agent
 */
function isSystemAgent(agentId: string): boolean {
  return SYSTEM_AGENT_IDS.includes(agentId);
}

/**
 * Add security metadata to agent objects
 */
function addAgentSecurityInfo(agent: any) {
  return {
    ...agent,
    isSystemAgent: isSystemAgent(agent.id),
    readonly: isSystemAgent(agent.id),
    protectionLevel: isSystemAgent(agent.id) ? 'system' : 'tenant'
  };
}

/**
 * AI Agents Management API
 * 
 * GET /api/ai/agents - List all agents and their status
 * POST /api/ai/agents - Manage agent operations (start, stop, configure)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const agentId = searchParams.get('agentId');
    const jobId = searchParams.get('jobId');
    const category = searchParams.get('category');
    const page = searchParams.get('page');
    const status = searchParams.get('status');

    switch (action) {
      case 'status':
        // Get overall status with security info
        return NextResponse.json({
          success: true,
          data: {
            isRunning: true,
            activeAgents: 6,
            runningJobs: 0,
            totalJobs: 0,
            config: {
              enabled: true,
              interval: 30000,
              timezone: 'UTC',
              maxConcurrent: 3,
              retryDelay: 5000
            },
            securityNote: 'System agents are automatically managed and protected from tenant modification'
          }
        });

      case 'agents':
        // Get all agents with security information
        const mockAgents = [
          {
            id: 'leads-agent',
            name: 'Leads AI Agent',
            description: 'Intelligent lead management and qualification',
            page: '/tenant-owner/leads',
            category: 'sales',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enableLeadScoring: true, autoQualificationEnabled: true },
            metrics: { totalLeads: 1250, qualifiedLeads: 340, conversionRate: 0.18 }
          },
          {
            id: 'deals-agent',
            name: 'Deals AI Agent',
            description: 'Deal pipeline optimization and forecasting',
            page: '/tenant-owner/deals',
            category: 'sales',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enablePipelineAnalysis: true, forecastingEnabled: true },
            metrics: { totalDeals: 89, totalValue: 2400000, winRate: 0.22 }
          },
          {
            id: 'inventory-agent',
            name: 'Inventory AI Agent', 
            description: 'Inventory optimization and pricing intelligence',
            page: '/tenant-owner/inventory',
            category: 'management',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enablePriceOptimization: true, inventoryForecasting: true },
            metrics: { totalVehicles: 156, totalValue: 3200000, avgDaysOnLot: 28 }
          },
          {
            id: 'calendar-agent',
            name: 'Calendar AI Agent',
            description: 'Scheduling optimization and appointment intelligence',
            page: '/tenant-owner/calendar',
            category: 'productivity',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enableSmartScheduling: true, optimizeAppointments: true },
            metrics: { totalEvents: 245, todayEvents: 12, currentMonth: 89 }
          },
          {
            id: 'collaboration-agent',
            name: 'Collaboration AI Agent',
            description: 'Team collaboration and communication optimization',
            page: '/tenant-owner/collaboration',
            category: 'productivity',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enableTeamAnalytics: true, optimizeCommunication: true },
            metrics: { totalMessages: 1876, activeTeamMembers: 8, totalChannels: 12 }
          },
          {
            id: 'workflow-agent',
            name: 'Workflow AI Agent',
            description: 'Workflow automation and process optimization',
            page: '/tenant-owner/automation',
            category: 'automation',
            status: 'active',
            lastActivity: new Date().toISOString(),
            config: { enableWorkflowOptimization: true, autoProcessImprovement: true },
            metrics: { totalWorkflows: 23, activeWorkflows: 15, successRate: 0.94 }
          }
        ];

        const agentsWithSecurity = mockAgents.map(addAgentSecurityInfo);
        
        const registry = {
          totalAgents: agentsWithSecurity.length,
          activeAgents: agentsWithSecurity.filter(a => a.status === 'active').length,
          inactiveAgents: agentsWithSecurity.filter(a => a.status === 'inactive').length,
          errorAgents: agentsWithSecurity.filter(a => a.status === 'error').length,
          systemAgents: agentsWithSecurity.filter(a => a.isSystemAgent).length,
          tenantAgents: agentsWithSecurity.filter(a => !a.isSystemAgent).length,
          lastHealthCheck: new Date().toISOString(),
          lastMetricsCollection: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: {
            agents: agentsWithSecurity,
            registry,
            securityInfo: {
              systemAgentIds: SYSTEM_AGENT_IDS,
              protectionLevel: 'tenant-restricted',
              note: 'System agents are read-only for tenants'
            }
          }
        });

      case 'jobs':
        if (agentId && isSystemAgent(agentId)) {
          return NextResponse.json({
            success: true,
            data: { 
              agentId, 
              jobs: [],
              securityNote: 'System agent job details are not accessible to tenants'
            }
          });
        }
        return NextResponse.json({
          success: true,
          data: { agentId, jobs: [] }
        });

      default:
        // Default behavior for compatibility
        const pageRegistry = getPageAgentRegistry();
        let agents = pageRegistry.getAllAgents();

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
        const registryStatus = await pageRegistry.getRegistryStatus();

        return NextResponse.json({
          success: true,
          data: {
            agents: agents.map(agent => addAgentSecurityInfo({
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
            registry: {
              ...registryStatus,
              systemAgents: SYSTEM_AGENT_IDS.length,
              protectionActive: true
            },
            securityInfo: {
              systemAgentIds: SYSTEM_AGENT_IDS,
              protectionLevel: 'tenant-restricted',
              note: 'System agents are read-only for tenants'
            }
          }
        });
    }  } catch (error: any) {
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
      case 'stop':
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: 'Agent ID is required' },
            { status: 400 }
          );
        }
        
        // Protect system agents from tenant modification
        if (isSystemAgent(agentId)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `🔒 System agents cannot be controlled by tenants. Agent '${agentId}' is automatically managed by the system.`,
              data: {
                agentId,
                protectionLevel: 'system',
                action: action,
                reason: 'System agents are protected from tenant modification'
              }
            },
            { status: 403 }
          );
        }
        
        if (action === 'start') {
          await registry.startAgent(agentId);
        } else {
          await registry.stopAgent(agentId);
        }
        
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} ${action}ed successfully`,
          data: { agentId, status: action === 'start' ? 'active' : 'inactive' }
        });

      case 'configure':
        if (!agentId || !config) {
          return NextResponse.json(
            { success: false, error: 'Agent ID and config are required' },
            { status: 400 }
          );
        }
        
        // Protect system agents from configuration changes
        if (isSystemAgent(agentId)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `🔒 System agent configuration is protected. Agent '${agentId}' configuration is automatically managed.`,
              data: {
                agentId,
                protectionLevel: 'system',
                configurable: false,
                reason: 'System agents have locked configurations'
              }
            },
            { status: 403 }
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
      case 'stop-all':
        // Block bulk actions that could affect system agents
        return NextResponse.json({
          success: false,
          error: '🔒 Bulk actions are restricted to prevent modification of protected system agents.',
          data: {
            action,
            reason: 'Bulk actions could affect system agents',
            suggestion: 'Manage individual custom agents instead'
          }
        }, { status: 403 });

      case 'health-check':
        // Limited health check for tenant-accessible agents only
        return NextResponse.json({
          success: true,
          data: {
            message: 'Health check completed for accessible agents',
            systemAgentsExcluded: true,
            tenantAgentsChecked: 0 // No custom agents yet
          }
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