/**
 * AI Agent Management API
 * 
 * Provides endpoints for managing AI agents, scheduling tasks, and monitoring performance.
 * Accessible at: /api/agents
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { agentScheduler } from '../../lib/agents/scheduler';

interface AgentApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
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
    console.error('Agent API error:', error.message);
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
      // Get overall scheduler status
      const status = agentScheduler.getStatus();
      res.status(200).json({
        success: true,
        data: status,
        timestamp,
      });
      break;

    case 'jobs':
      if (agentId) {
        // Get jobs for specific agent
        const jobs = agentScheduler.getAgentJobs(agentId as string);
        res.status(200).json({
          success: true,
          data: { agentId, jobs },
          timestamp,
        });
      } else {
        // Get all jobs (limited to recent ones)
        res.status(200).json({
          success: true,
          data: { message: 'Use agentId parameter to get specific agent jobs' },
          timestamp,
        });
      }
      break;

    case 'job':
      if (jobId) {
        // Get specific job status
        const job = agentScheduler.getJobStatus(jobId as string);
        if (job) {
          res.status(200).json({
            success: true,
            data: job,
            timestamp,
          });
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
      // Get health status of all agents
      res.status(200).json({
        success: true,
        data: {
          scheduler: agentScheduler.getStatus(),
          agents: {
            // Add individual agent health checks here
            message: 'Individual agent health checks not yet implemented',
          },
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
      // Start the scheduler
      await agentScheduler.start();
      res.status(200).json({
        success: true,
        data: { message: 'Agent scheduler started successfully' },
        timestamp,
      });
      break;

    case 'stop':
      // Stop the scheduler
      await agentScheduler.stop();
      res.status(200).json({
        success: true,
        data: { message: 'Agent scheduler stopped successfully' },
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

      // Schedule a job for specific agent
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

    case 'schedule_all':
      // Schedule jobs for all agents
      const scheduledJobs: Array<{agentId: string; jobId: string}> = [];
      const agentIds = ['leads-agent', 'deals-agent', 'inventory-agent', 'calendar-agent', 'collaboration-agent', 'workflow-agent'];
      
      for (const id of agentIds) {
        try {
          const jobId = await agentScheduler.scheduleJob(id, type || 'background', delay || 0);
          scheduledJobs.push({ agentId: id, jobId });
        } catch (error: any) {
          console.error(`Failed to schedule job for ${id}:`, error.message);
        }
      }

      res.status(201).json({
        success: true,
        data: {
          scheduledJobs,
          total: scheduledJobs.length,
          message: 'Batch jobs scheduled successfully',
        },
        timestamp,
      });
      break;

    case 'cleanup':
      // Clean up old jobs
      const maxAge = req.body.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
      agentScheduler.cleanupOldJobs(maxAge);
      
      res.status(200).json({
        success: true,
        data: { message: 'Job cleanup completed', maxAge },
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
  const { action } = req.body;

  switch (action) {
    case 'configure':
      // Update scheduler configuration
      const { config } = req.body;
      if (!config) {
        res.status(400).json({
          success: false,
          error: 'config object is required',
          timestamp,
        });
        return;
      }

      agentScheduler.updateConfig(config);
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Configuration updated successfully',
          newConfig: agentScheduler.getStatus().config,
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

async function handleDeleteRequest(
  req: NextApiRequest,
  res: NextApiResponse<AgentApiResponse>,
  timestamp: string
) {
  const { action } = req.query;

  switch (action) {
    case 'cleanup':
      // Force cleanup of all completed/failed jobs
      agentScheduler.cleanupOldJobs(0); // Clean all completed jobs
      
      res.status(200).json({
        success: true,
        data: { message: 'All completed jobs cleaned up' },
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

// Export types for external use
export type { AgentApiResponse };