/**
 * AI Agent Monitoring Dashboard Component
 * 
 * Real-time dashboard for monitoring AI agent performance, status, and jobs.
 * Provides controls for starting, stopping, and configuring agents.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Settings, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface AgentStatus {
  isRunning: boolean;
  activeAgents: number;
  runningJobs: number;
  totalJobs: number;
  config: {
    enabled: boolean;
    interval: number;
    timezone: string;
    maxConcurrent: number;
    retryDelay: number;
  };
}

interface AgentJob {
  id: string;
  agentId: string;
  type: 'scheduled' | 'immediate' | 'background';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
  retryCount: number;
  maxRetries: number;
}

export function AgentMonitoringDashboard() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [recentJobs, setRecentJobs] = useState<AgentJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch agent status
  const fetchAgentStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/agents?action=status');
      const data = await response.json();
      
      if (data.success) {
        setAgentStatus(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch agent status');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    }
  }, []);

  // Fetch recent jobs for all agents
  const fetchRecentJobs = useCallback(async () => {
    const agentIds = ['leads-agent', 'deals-agent', 'inventory-agent', 'calendar-agent', 'collaboration-agent', 'workflow-agent'];
    const allJobs: AgentJob[] = [];

    for (const agentId of agentIds) {
      try {
        const response = await fetch(`/api/agents?action=jobs&agentId=${agentId}`);
        const data = await response.json();
        
        if (data.success && data.data.jobs) {
          allJobs.push(...data.data.jobs.slice(0, 5)); // Get last 5 jobs per agent
        }
      } catch (err) {
        console.error(`Failed to fetch jobs for ${agentId}:`, err);
      }
    }

    // Sort by most recent
    allJobs.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    setRecentJobs(allJobs.slice(0, 20)); // Show last 20 jobs total
  }, []);

  // Control functions
  const startScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAgentStatus();
      } else {
        setError(data.error || 'Failed to start scheduler');
      }
    } catch (err: any) {
      setError('Failed to start scheduler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAgentStatus();
      } else {
        setError(data.error || 'Failed to stop scheduler');
      }
    } catch (err: any) {
      setError('Failed to stop scheduler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const scheduleAllAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule_all', type: 'immediate' })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRecentJobs();
      } else {
        setError(data.error || 'Failed to schedule agents');
      }
    } catch (err: any) {
      setError('Failed to schedule agents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanupJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRecentJobs();
      } else {
        setError(data.error || 'Failed to cleanup jobs');
      }
    } catch (err: any) {
      setError('Failed to cleanup jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchAgentStatus();
    fetchRecentJobs();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAgentStatus();
        fetchRecentJobs();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [fetchAgentStatus, fetchRecentJobs, autoRefresh]);

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getJobStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agent Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor and control your AI agent system performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button
            onClick={() => { fetchAgentStatus(); fetchRecentJobs(); }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentStatus?.isRunning ? (
                <span className="text-green-600">Running</span>
              ) : (
                <span className="text-red-600">Stopped</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduler {agentStatus?.isRunning ? 'active' : 'inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus?.activeAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI agents initialized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus?.runningJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStatus?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={startScheduler}
              disabled={loading || agentStatus?.isRunning}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Scheduler</span>
            </Button>
            
            <Button
              onClick={stopScheduler}
              disabled={loading || !agentStatus?.isRunning}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Stop Scheduler</span>
            </Button>
            
            <Button
              onClick={scheduleAllAgents}
              disabled={loading || !agentStatus?.isRunning}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Run All Agents</span>
            </Button>
            
            <Button
              onClick={cleanupJobs}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Cleanup Jobs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      {agentStatus?.config && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Interval</label>
                <p className="text-lg">{agentStatus.config.interval / 1000}s</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Max Concurrent</label>
                <p className="text-lg">{agentStatus.config.maxConcurrent}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Retry Delay</label>
                <p className="text-lg">{agentStatus.config.retryDelay / 1000}s</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                <p className="text-lg">{agentStatus.config.timezone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Enabled</label>
                <p className="text-lg">{agentStatus.config.enabled ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getJobStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.agentId}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.type} • {new Date(job.scheduledAt).toLocaleString()}
                      </div>
                      {job.error && (
                        <div className="text-sm text-red-500 mt-1">{job.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getJobStatusBadge(job.status)}
                    {job.retryCount > 0 && (
                      <Badge variant="outline">Retry {job.retryCount}/{job.maxRetries}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent jobs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}