"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  X,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Key,
  Webhook,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  CreditCard,
  BarChart3,
  FileText,
  Database,
  Cloud,
  Smartphone,
  Search,
  Filter
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  isConnected: boolean;
  status: 'active' | 'error' | 'pending' | 'disabled';
  lastSync?: string;
  apiKey?: string;
  webhookUrl?: string;
  settings: any;
  connectedAt?: string;
  syncCount?: number;
  errorCount?: number;
}

const mockIntegrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'Communication',
    icon: MessageSquare,
    color: 'bg-purple-500',
    isConnected: true,
    status: 'active',
    lastSync: '2024-10-14T10:30:00Z',
    connectedAt: '2024-09-01T14:20:00Z',
    syncCount: 1247,
    errorCount: 2,
    settings: {
      channels: ['#sales', '#general'],
      notifications: ['deal-closed', 'new-lead']
    }
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email integration and synchronization',
    category: 'Email',
    icon: Mail,
    color: 'bg-red-500',
    isConnected: true,
    status: 'active',
    lastSync: '2024-10-14T09:45:00Z',
    connectedAt: '2024-08-15T11:30:00Z',
    syncCount: 3421,
    errorCount: 0,
    settings: {
      autoSync: true,
      syncFrequency: '15min'
    }
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Calendar synchronization and meeting scheduling',
    category: 'Productivity',
    icon: Calendar,
    color: 'bg-blue-500',
    isConnected: true,
    status: 'error',
    lastSync: '2024-10-13T16:20:00Z',
    connectedAt: '2024-08-20T09:15:00Z',
    syncCount: 567,
    errorCount: 12,
    settings: {
      calendarId: 'primary',
      syncEvents: true
    }
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and financial data',
    category: 'Finance',
    icon: CreditCard,
    color: 'bg-indigo-500',
    isConnected: false,
    status: 'disabled',
    settings: {}
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM data synchronization',
    category: 'CRM',
    icon: Database,
    color: 'bg-blue-600',
    isConnected: false,
    status: 'disabled',
    settings: {}
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing automation and lead management',
    category: 'Marketing',
    icon: BarChart3,
    color: 'bg-orange-500',
    isConnected: true,
    status: 'pending',
    connectedAt: '2024-10-14T08:00:00Z',
    syncCount: 0,
    errorCount: 0,
    settings: {
      syncContacts: true,
      syncDeals: false
    }
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation and app connections',
    category: 'Automation',
    icon: Zap,
    color: 'bg-yellow-500',
    isConnected: false,
    status: 'disabled',
    settings: {}
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication',
    category: 'Communication',
    icon: Phone,
    color: 'bg-red-600',
    isConnected: false,
    status: 'disabled',
    settings: {}
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApiKey, setShowApiKey] = useState(false);

  const categories = [...new Set(integrations.map(i => i.category))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'disabled': return <X className="w-4 h-4 text-gray-600" />;
      default: return <X className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: !integration.isConnected,
            status: integration.isConnected ? 'disabled' : 'pending',
            connectedAt: integration.isConnected ? undefined : new Date().toISOString()
          }
        : integration
    ));
  };

  const syncIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: 'pending',
            lastSync: new Date().toISOString()
          }
        : integration
    ));

    // Simulate sync completion
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: 'active',
              syncCount: (integration.syncCount || 0) + 1
            }
          : integration
      ));
    }, 2000);
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'connected' && integration.isConnected) ||
                         (filterStatus === 'disconnected' && !integration.isConnected) ||
                         integration.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const connectedCount = integrations.filter(i => i.isConnected).length;
  const activeCount = integrations.filter(i => i.status === 'active').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect and manage integrations with external tools and services</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Integration
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Connected</p>
                <p className="text-2xl font-bold text-blue-900">{connectedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-900">{activeCount}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold text-red-900">{errorCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-purple-900">{integrations.length}</p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
            <option value="active">Active</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => {
          const IconComponent = integration.icon;
          return (
            <div key={integration.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center text-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <span className="text-xs text-gray-500">{integration.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-1">{integration.status}</span>
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

              {integration.isConnected && (
                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  {integration.lastSync && (
                    <div>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</div>
                  )}
                  {integration.syncCount && (
                    <div>Syncs: {integration.syncCount}</div>
                  )}
                  {integration.errorCount !== undefined && (
                    <div>Errors: {integration.errorCount}</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    integration.isConnected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {integration.isConnected ? 'Disconnect' : 'Connect'}
                </button>
                <div className="flex items-center gap-2">
                  {integration.isConnected && (
                    <button
                      onClick={() => syncIntegration(integration.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
                      title="Sync now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedIntegration(integration)}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Settings Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${selectedIntegration.color} rounded-lg flex items-center justify-center text-white`}>
                    <selectedIntegration.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedIntegration.name}</h2>
                    <p className="text-gray-600">{selectedIntegration.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Connection Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Connection Status</h4>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedIntegration.status)}
                    <span className="font-medium">{selectedIntegration.status}</span>
                    {selectedIntegration.isConnected && selectedIntegration.connectedAt && (
                      <span className="text-sm text-gray-500">
                        • Connected {new Date(selectedIntegration.connectedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* API Configuration */}
                {selectedIntegration.isConnected && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">API Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">API Key</label>
                        <div className="flex items-center gap-2">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value="sk-1234567890abcdef"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-2 text-gray-600 hover:text-gray-900"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-900">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Webhook URL</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="https://api.ghostcrm.com/webhooks/slack"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <button className="p-2 text-gray-600 hover:text-gray-900">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Statistics */}
                {selectedIntegration.isConnected && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-900">{selectedIntegration.syncCount || 0}</div>
                        <div className="text-xs text-green-600">Total Syncs</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-900">{selectedIntegration.errorCount || 0}</div>
                        <div className="text-xs text-red-600">Errors</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {selectedIntegration.syncCount 
                            ? Math.round(((selectedIntegration.syncCount - (selectedIntegration.errorCount || 0)) / selectedIntegration.syncCount) * 100)
                            : 0}%
                        </div>
                        <div className="text-xs text-blue-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Test Connection
                  </button>
                  {selectedIntegration.isConnected && (
                    <button
                      onClick={() => syncIntegration(selectedIntegration.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}