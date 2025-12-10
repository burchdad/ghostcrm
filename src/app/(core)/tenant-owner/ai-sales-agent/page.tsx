"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  BarChart3,
  Users,
  Calendar,
  Package,
  Heart,
  Workflow,
  Lightbulb,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  page: string;
  category: string;
  status: 'active' | 'inactive' | 'error' | 'initializing';
  lastActivity: string;
  config: any;
  metrics?: any;
  health?: any;
  isSystemAgent?: boolean; // New field to identify system agents
  readonly?: boolean; // New field to mark read-only agents
}

interface RegistryStatus {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  errorAgents: number;
  lastHealthCheck: string;
  lastMetricsCollection: string;
}

// System agent IDs that should be protected from tenant modification
const SYSTEM_AGENT_IDS = [
  'leads-agent',
  'deals-agent', 
  'inventory-agent',
  'calendar-agent',
  'collaboration-agent',
  'workflow-agent'
];

const getAgentIcon = (agentId: string) => {
  const icons = {
    'leads': Users,
    'leads-agent': Users,
    'deals': Heart,
    'deals-agent': Heart,
    'inventory': Package,
    'inventory-agent': Package,
    'calendar': Calendar,
    'calendar-agent': Calendar,
    'collaboration': Users,
    'collaboration-agent': Users,
    'workflow': Workflow,
    'workflow-agent': Workflow,
  };
  return icons[agentId as keyof typeof icons] || Bot;
};

const isSystemAgent = (agentId: string) => {
  return SYSTEM_AGENT_IDS.includes(agentId);
};

const getAgentTypeColor = (agentId: string) => {
  return isSystemAgent(agentId) 
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';
};

const getStatusColor = (status: string) => {
  const colors = {
    'active': 'text-green-600 bg-green-100',
    'inactive': 'text-gray-600 bg-gray-100',
    'error': 'text-red-600 bg-red-100',
    'initializing': 'text-yellow-600 bg-yellow-100',
  };
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

const getCategoryColor = (category: string) => {
  const colors = {
    'sales': 'bg-blue-100 text-blue-800',
    'management': 'bg-green-100 text-green-800',
    'productivity': 'bg-purple-100 text-purple-800',
    'automation': 'bg-orange-100 text-orange-800',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export default function AISalesAgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [registryStatus, setRegistryStatus] = useState<RegistryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState<any>({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/ai/agents');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data.agents);
        setRegistryStatus(data.data.registry);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    // Protect system agents from tenant modification
    if (isSystemAgent(agentId)) {
      alert('❌ System agents cannot be modified by tenants. These agents are managed automatically by the system.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, agentId }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAgents(); // Refresh the list
      } else {
        alert(`Failed to ${action} agent: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
      alert(`Failed to ${action} agent`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    // Filter out system agents for bulk actions that modify agents
    const modifyActions = ['start-all', 'stop-all'];
    if (modifyActions.includes(action)) {
      alert('❌ Bulk actions are not allowed as they would affect protected system agents. Please manage your custom agents individually.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAgents();
      } else {
        alert(`Failed to ${action}: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async () => {
    if (!selectedAgent) return;

    // Protect system agents from configuration changes
    if (isSystemAgent(selectedAgent.id)) {
      alert('❌ System agent configurations cannot be modified by tenants. These are managed automatically.');
      setShowConfig(false);
      setSelectedAgent(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure',
          agentId: selectedAgent.id,
          config: configData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowConfig(false);
        setSelectedAgent(null);
        await loadAgents();
      } else {
        alert(`Failed to update config: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const openConfigModal = (agent: Agent) => {
    if (isSystemAgent(agent.id)) {
      alert('❌ System agent configurations are read-only for tenants. These agents are managed automatically by the system.');
      return;
    }
    setSelectedAgent(agent);
    setConfigData(agent.config);
    setShowConfig(true);
  };

  const filteredAgents = agents.filter(agent => {
    const categoryMatch = filterCategory === 'all' || agent.category === filterCategory;
    const statusMatch = filterStatus === 'all' || agent.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const categories = ['all', 'sales', 'management', 'productivity', 'automation'];
  const statuses = ['all', 'active', 'inactive', 'error', 'initializing'];

  if (loading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bot className="h-8 w-8 text-blue-600" />
                AI Sales Agent Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor AI agents and manage your custom sales assistants
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">System Agent Protection Active</p>
                    <p className="text-yellow-700 mt-1">
                      Core system agents (leads, deals, inventory, calendar, collaboration, workflow) are automatically managed and cannot be modified by tenants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('health-check')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                disabled={loading}
              >
                <Activity className="h-4 w-4" />
                Health Check
              </button>
              <button
                onClick={() => loadAgents()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Registry Status */}
        {registryStatus && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{registryStatus.totalAgents}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{registryStatus.activeAgents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">{registryStatus.inactiveAgents}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{registryStatus.errorAgents}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Check</p>
                  <p className="text-sm text-gray-900">
                    {new Date(registryStatus.lastHealthCheck).toLocaleTimeString()}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const IconComponent = getAgentIcon(agent.id);
            
            return (
              <div key={agent.id} className={`bg-white rounded-lg shadow-sm border p-6 ${
                isSystemAgent(agent.id) ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-8 w-8 ${
                      isSystemAgent(agent.id) ? 'text-red-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        {isSystemAgent(agent.id) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full border border-red-200">
                            <AlertCircle className="h-3 w-3" />
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                      {isSystemAgent(agent.id) && (
                        <p className="text-xs text-red-600 mt-1">
                          🔒 Protected system agent - automatically managed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(agent.category)}`}>
                    {agent.category}
                  </span>
                  {isSystemAgent(agent.id) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                      protected
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Page:</strong> {agent.page}</p>
                  <p><strong>Last Activity:</strong> {new Date(agent.lastActivity).toLocaleString()}</p>
                </div>
                
                {agent.metrics && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Metrics</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(agent.metrics).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span>{typeof value === 'number' ? value.toLocaleString() : String(value || '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {isSystemAgent(agent.id) ? (
                    // System agents - read-only controls
                    <>
                      <button
                        className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded cursor-not-allowed flex items-center justify-center gap-2"
                        disabled
                        title="System agents cannot be controlled by tenants"
                      >
                        <Settings className="h-3 w-3" />
                        Auto-Managed
                      </button>
                      <button
                        onClick={() => openConfigModal(agent)}
                        className="px-3 py-2 bg-gray-400 text-white text-sm rounded cursor-not-allowed flex items-center justify-center gap-2"
                        disabled
                        title="System agent configuration is read-only"
                      >
                        <Eye className="h-3 w-3" />
                        View Only
                      </button>
                    </>
                  ) : (
                    // Custom tenant agents - full controls
                    <>
                      {agent.status === 'active' ? (
                        <button
                          onClick={() => handleAgentAction(agent.id, 'stop')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          <Pause className="h-3 w-3" />
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAgentAction(agent.id, 'start')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          <Play className="h-3 w-3" />
                          Start
                        </button>
                      )}
                      
                      <button
                        onClick={() => openConfigModal(agent)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Settings className="h-3 w-3" />
                        Config
                      </button>
                    </>
                  )}
                  
                  <a
                    href={agent.page}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Modal */}
        {showConfig && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Configure {selectedAgent.name}
                  </h2>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(configData, null, 2)}
                      onChange={(e) => {
                        try {
                          setConfigData(JSON.parse(e.target.value));
                        } catch (error) {
                          // Invalid JSON, keep the text for editing
                        }
                      }}
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="Enter agent configuration as JSON"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowConfig(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loading}
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}