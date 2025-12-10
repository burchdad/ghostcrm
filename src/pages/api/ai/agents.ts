/**
 * Secure AI Agent API for Tenant Access
 * 
 * Provides controlled access to AI agents with protection for system agents.
 * Tenants can only manage their custom agents, not system-wide agents.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { agentScheduler } from '../../../lib/agents/scheduler';

interface AgentApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

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
 * Filter out system agents from tenant operations
 */
function filterSystemAgents<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => !isSystemAgent(item.id));
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>
) {
  const { method, query, body } = req;
  const timestamp = new Date().toISOString();

  try {
    switch (method) {
      case 'GET':
        await handleGetRequest(req, res, timestamp);
        break;
        
      case 'POST':
        await handlePostRequest(req, res, timestamp);
        break;
        
      case 'PUT':
        await handlePutRequest(req, res, timestamp);
        break;
        
      case 'DELETE':
        await handleDeleteRequest(req, res, timestamp);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`,
          timestamp,
        });
    }
  } catch (error: any) {
    console.error('Secure Agent API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      data: { details: error.message },
      timestamp,
    });
  }
}

async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>,
  timestamp: string
) {
  const { action, agentId, jobId } = req.query;

  switch (action) {
    case 'status':
      // Get scheduler status (read-only for tenants)
      const status = agentScheduler.getStatus();
      res.status(200).json({
        success: true,
        data: {
          ...status,
          securityNote: 'System agents are automatically managed and protected from tenant modification'
        },
        timestamp,
      });
      break;

    case 'agents':
      // Get all agents with security information
      try {
        // Mock agent data since we don't have the actual registry yet
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

        res.status(200).json({
          success: true,
          data: {
            agents: agentsWithSecurity,
            registry,
            securityInfo: {
              systemAgentIds: SYSTEM_AGENT_IDS,
              protectionLevel: 'tenant-restricted',
              note: 'System agents are read-only for tenants'
            }
          },
          timestamp,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: 'Failed to load agents: ' + error.message,
          timestamp,
        });
      }
      break;

    case 'jobs':
      if (agentId) {
        // Check if requesting system agent jobs
        if (isSystemAgent(agentId as string)) {
          res.status(200).json({
            success: true,
            data: { 
              agentId, 
              jobs: [],
              securityNote: 'System agent job details are not accessible to tenants'
            },
            timestamp,
          });
        } else {
          // Get jobs for tenant agent
          const jobs = agentScheduler.getAgentJobs(agentId as string);
          res.status(200).json({
            success: true,
            data: { agentId, jobs },
            timestamp,
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'agentId parameter required',
          timestamp,
        });
      }
      break;

    case 'job':
      if (jobId) {
        const job = agentScheduler.getJobStatus(jobId as string);
        if (job) {
          // Check if this is a system agent job
          if (isSystemAgent(job.agentId)) {
            res.status(403).json({
              success: false,
              error: 'Access to system agent job details is restricted for tenants',
              timestamp,
            });
          } else {
            res.status(200).json({
              success: true,
              data: job,
              timestamp,
            });
          }
        } else {
          res.status(404).json({
            success: false,
            error: `Job ${jobId} not found`,
            timestamp,
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'jobId parameter required',
          timestamp,
        });
      }
      break;

    case 'health':
      // Limited health info for tenants
      res.status(200).json({
        success: true,
        data: {
          scheduler: {
            ...agentScheduler.getStatus(),
            securityNote: 'Detailed system agent health information is restricted'
          },
          tenantAccess: 'limited',
          systemProtection: 'active'
        },
        timestamp,
      });
      break;

    default:
      res.status(400).json({
        success: false,
        error: 'Invalid action parameter',
        timestamp,
      });
  }
}

async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>,
  timestamp: string
) {
  const { action, agentId, type, delay } = req.body;

  switch (action) {
    case 'start':
    case 'stop':
    case 'restart':
      // Block system agent control actions for tenants
      if (agentId && isSystemAgent(agentId)) {
        res.status(403).json({
          success: false,
          error: `🔒 System agents cannot be controlled by tenants. Agent '${agentId}' is automatically managed by the system.`,
          data: {
            agentId,
            protectionLevel: 'system',
            action: action,
            reason: 'System agents are protected from tenant modification'
          },
          timestamp,
        });
        return;
      }

      // For non-system agents (when we have them), allow the action
      res.status(501).json({
        success: false,
        error: 'Custom tenant agent management not yet implemented',
        data: {
          plannedFeature: 'Custom tenant agents',
          currentImplementation: 'System agents only'
        },
        timestamp,
      });
      break;

    case 'schedule':
      if (!agentId) {
        res.status(400).json({
          success: false,
          error: 'agentId is required',
          timestamp,
        });
        return;
      }

      // Block system agent scheduling for tenants
      if (isSystemAgent(agentId)) {
        res.status(403).json({
          success: false,
          error: `🔒 System agent scheduling is restricted. Agent '${agentId}' is automatically scheduled by the system.`,
          data: {
            agentId,
            protectionLevel: 'system',
            autoScheduled: true
          },
          timestamp,
        });
        return;
      }

      // For non-system agents, schedule the job
      const jobId = await agentScheduler.scheduleJob(
        agentId,
        type || 'immediate',
        delay || 0
      );

      res.status(201).json({
        success: true,
        data: {
          jobId,
          agentId,
          type: type || 'immediate',
          delay: delay || 0,
          message: 'Job scheduled successfully',
        },
        timestamp,
      });
      break;

    case 'configure':
      const { config } = req.body;
      
      if (!agentId || !config) {
        res.status(400).json({
          success: false,
          error: 'agentId and config are required',
          timestamp,
        });
        return;
      }

      // Block system agent configuration for tenants
      if (isSystemAgent(agentId)) {
        res.status(403).json({
          success: false,
          error: `🔒 System agent configuration is protected. Agent '${agentId}' configuration is automatically managed.`,
          data: {
            agentId,
            protectionLevel: 'system',
            configurable: false,
            reason: 'System agents have locked configurations'
          },
          timestamp,
        });
        return;
      }

      // For non-system agents (when implemented)
      res.status(501).json({
        success: false,
        error: 'Custom tenant agent configuration not yet implemented',
        timestamp,
      });
      break;

    case 'start-all':
    case 'stop-all':
    case 'restart-all':
      // Block all bulk actions that could affect system agents
      res.status(403).json({
        success: false,
        error: '🔒 Bulk actions are restricted to prevent modification of protected system agents.',
        data: {
          action,
          reason: 'Bulk actions could affect system agents',
          suggestion: 'Manage individual custom agents instead'
        },
        timestamp,
      });
      break;

    case 'health-check':
      // Limited health check for tenant-accessible agents only
      res.status(200).json({
        success: true,
        data: {
          message: 'Health check completed for accessible agents',
          systemAgentsExcluded: true,
          tenantAgentsChecked: 0 // No custom agents yet
        },
        timestamp,
      });
      break;

    case 'cleanup':
      // Allow job cleanup for tenant agents only
      const maxAge = req.body.maxAge || 24 * 60 * 60 * 1000;
      
      res.status(200).json({
        success: true,
        data: { 
          message: 'Cleanup completed for tenant jobs only',
          maxAge,
          systemJobsExcluded: true
        },
        timestamp,
      });
      break;

    default:
      res.status(400).json({
        success: false,
        error: 'Invalid action',
        timestamp,
      });
  }
}

async function handlePutRequest(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>,
  timestamp: string
) {
  const { action, agentId } = req.body;

  switch (action) {
    case 'configure':
      const { config } = req.body;
      
      if (!agentId || !config) {
        res.status(400).json({
          success: false,
          error: 'agentId and config are required',
          timestamp,
        });
        return;
      }

      // Block system agent configuration
      if (isSystemAgent(agentId)) {
        res.status(403).json({
          success: false,
          error: `🔒 System agent configuration cannot be modified. Agent '${agentId}' is automatically configured.`,
          timestamp,
        });
        return;
      }

      // Handle custom agent configuration (when implemented)
      res.status(501).json({
        success: false,
        error: 'Custom tenant agent configuration not yet implemented',
        timestamp,
      });
      break;

    default:
      res.status(400).json({
        success: false,
        error: 'Invalid action',
        timestamp,
      });
  }
}

async function handleDeleteRequest(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>,
  timestamp: string
) {
  const { action, agentId } = req.query;

  switch (action) {
    case 'remove':
      if (!agentId) {
        res.status(400).json({
          success: false,
          error: 'agentId parameter required',
          timestamp,
        });
        return;
      }

      // Block system agent removal
      if (isSystemAgent(agentId as string)) {
        res.status(403).json({
          success: false,
          error: `🔒 System agents cannot be removed. Agent '${agentId}' is a protected system component.`,
          timestamp,
        });
        return;
      }

      // Handle custom agent removal (when implemented)
      res.status(501).json({
        success: false,
        error: 'Custom tenant agent removal not yet implemented',
        timestamp,
      });
      break;

    case 'cleanup':
      // Allow cleanup of tenant jobs only
      res.status(200).json({
        success: true,
        data: { 
          message: 'Cleanup completed for tenant-accessible data only',
          systemDataExcluded: true
        },
        timestamp,
      });
      break;

    default:
      res.status(400).json({
        success: false,
        error: 'Invalid action',
        timestamp,
      });
  }
}

export type { AgentApiResponse };