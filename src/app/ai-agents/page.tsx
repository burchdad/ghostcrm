"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  TrendingUp, 
  Users, 
  Server,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'initializing';
  health: {
    cpu: number;
    memory: number;
    uptime: number;
    responseTime: number;
  };
  metrics?: any;
  lastActivity: string;
  tenant?: string;
}

interface AgentGroup {
  name: string;
  agents: AgentStatus[];
  icon: React.ComponentType<any>;
  description: string;
}

export default function AIAgentDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch agent statuses
  const fetchAgentStatuses = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/agents/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setAgents(result.data.agents || []);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch agent data');
      }
    } catch (err) {
      setError('Failed to fetch agent statuses');
      console.error('Error fetching agent statuses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentStatuses();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAgentStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group agents by type
  const agentGroups: AgentGroup[] = [
    {
      name: 'Infrastructure',
      icon: Server,
      description: 'Core system monitoring and management agents',
      agents: agents.filter(a => ['tenant-management', 'api-performance', 'integration-health'].includes(a.id))
    },
    {
      name: 'Business Intelligence',
      icon: TrendingUp,
      description: 'Analytics and business intelligence agents',
      agents: agents.filter(a => ['business-intelligence', 'billing-intelligence'].includes(a.id))
    },
    {
      name: 'Security',
      icon: Shield,
      description: 'Security monitoring and compliance agents',
      agents: agents.filter(a => ['security-compliance'].includes(a.id))
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'initializing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'initializing': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAgentAction = async (agentId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`/api/agents/status?agent=${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchAgentStatuses(); // Refresh data
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to perform action');
      }
    } catch (err) {
      console.error(`Failed to ${action} agent ${agentId}:`, err);
      setError(`Failed to ${action} agent: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Agent Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              AI Agent Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage your multi-tenant AI agent infrastructure
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAgentStatuses}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-green-600">
                {agents.filter(a => a.status === 'running').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {agents.filter(a => a.status === 'error').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(agents.reduce((acc, a) => acc + a.health.responseTime, 0) / agents.length || 0)}ms
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Agent Groups */}
      {agentGroups.map((group) => (
        <div key={group.name} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <group.icon className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            <span className="text-sm text-gray-500">({group.agents.length} agents)</span>
          </div>
          <p className="text-gray-600 mb-4">{group.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {group.agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)}
                      {agent.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">CPU Usage:</span>
                      <span className="font-medium">{agent.health.cpu}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Memory:</span>
                      <span className="font-medium">{agent.health.memory}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uptime:</span>
                      <span className="font-medium">{Math.round(agent.health.uptime)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Response Time:</span>
                      <span className="font-medium">{agent.health.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tenant:</span>
                      <span className="font-medium">{agent.tenant}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Activity:</span>
                      <span className="font-medium">
                        {new Date(agent.lastActivity).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleAgentAction(agent.id, agent.status === 'running' ? 'stop' : 'start')}
                      className={`flex items-center gap-1 px-3 py-1 text-xs rounded ${
                        agent.status === 'running'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.status === 'running' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Start
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAgentAction(agent.id, 'restart')}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Restart
                    </button>
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                    >
                      <Settings className="w-3 h-3" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedAgent.name} Details</h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Agent Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono text-sm">{selectedAgent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.status)}`}>
                        {getStatusIcon(selectedAgent.status)}
                        {selectedAgent.status}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenant:</span>
                      <span>{selectedAgent.tenant}</span>
                    </div>
                  </div>
                </div>
                
                {selectedAgent.metrics && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedAgent.metrics, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}