"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationsDevPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const integrations = [
    {
      id: "int_001",
      name: "Salesforce Connector",
      type: "CRM",
      status: "active",
      version: "2.1.0",
      apiVersion: "v58.0",
      environment: "production",
      lastSync: "2025-10-22T14:30:00Z",
      totalCalls: 15847,
      successRate: 99.2,
      avgResponseTime: "145ms",
      developer: "John Smith",
      webhookUrl: "https://api.ghostcrm.com/webhooks/salesforce",
      scopes: ["read_leads", "write_contacts", "read_opportunities"]
    },
    {
      id: "int_002", 
      name: "HubSpot Marketing",
      type: "Marketing",
      status: "development",
      version: "1.0.0-beta",
      apiVersion: "v3",
      environment: "sandbox",
      lastSync: "2025-10-22T13:15:00Z",
      totalCalls: 3421,
      successRate: 94.8,
      avgResponseTime: "89ms",
      developer: "Jane Doe",
      webhookUrl: "https://api.ghostcrm.com/webhooks/hubspot",
      scopes: ["read_contacts", "write_campaigns", "read_analytics"]
    },
    {
      id: "int_003",
      name: "Slack Notifications",
      type: "Communication",
      status: "testing",
      version: "1.2.1",
      apiVersion: "v1",
      environment: "staging", 
      lastSync: "2025-10-22T12:45:00Z",
      totalCalls: 892,
      successRate: 97.3,
      avgResponseTime: "67ms",
      developer: "Bob Johnson",
      webhookUrl: "https://hooks.slack.com/services/...",
      scopes: ["chat:write", "channels:read"]
    }
  ];

  const integrationTemplates = [
    {
      name: "CRM Platform",
      description: "Template for connecting to CRM systems",
      endpoints: 8,
      methods: ["GET", "POST", "PUT", "DELETE"],
      authentication: "OAuth 2.0",
      rateLimit: "1000/hour",
      icon: "🏢"
    },
    {
      name: "Email Marketing",
      description: "Template for email marketing platforms",
      endpoints: 6,
      methods: ["GET", "POST"],
      authentication: "API Key",
      rateLimit: "500/hour",
      icon: "📧"
    },
    {
      name: "Communication Tool",
      description: "Template for chat and messaging platforms",
      endpoints: 4,
      methods: ["POST"],
      authentication: "Webhook",
      rateLimit: "100/hour",
      icon: "💬"
    },
    {
      name: "Analytics Platform",
      description: "Template for analytics and reporting tools",
      endpoints: 12,
      methods: ["GET"],
      authentication: "OAuth 2.0",
      rateLimit: "2000/hour",
      icon: "📊"
    }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/v1/integrations/{id}",
      description: "Get integration details",
      parameters: ["id (required)"],
      response: "Integration object"
    },
    {
      method: "POST", 
      path: "/api/v1/integrations",
      description: "Create new integration",
      parameters: ["name", "type", "config"],
      response: "Created integration"
    },
    {
      method: "PUT",
      path: "/api/v1/integrations/{id}",
      description: "Update integration",
      parameters: ["id (required)", "config"],
      response: "Updated integration"
    },
    {
      method: "DELETE",
      path: "/api/v1/integrations/{id}",
      description: "Delete integration",
      parameters: ["id (required)"],
      response: "Success message"
    },
    {
      method: "POST",
      path: "/api/v1/integrations/{id}/test",
      description: "Test integration connection",
      parameters: ["id (required)"],
      response: "Test results"
    },
    {
      method: "GET",
      path: "/api/v1/integrations/{id}/logs",
      description: "Get integration logs",
      parameters: ["id (required)", "limit", "offset"],
      response: "Log entries array"
    }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Integrations", value: "3", icon: "🔗", color: "blue" },
          { label: "Active Integrations", value: "1", icon: "✅", color: "green" },
          { label: "In Development", value: "2", icon: "🔧", color: "yellow" },
          { label: "API Calls Today", value: "1,247", icon: "📊", color: "purple" }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Your Integrations</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            New Integration
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Integration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Version</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Success Rate</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Last Sync</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr key={integration.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{integration.name}</div>
                    <div className="text-sm text-slate-500">{integration.developer}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {integration.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      integration.status === "active" 
                        ? "bg-green-100 text-green-800"
                        : integration.status === "development"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {integration.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-sm text-slate-600">{integration.version}</div>
                    <div className="text-xs text-slate-500">API {integration.apiVersion}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-slate-800">
                        {integration.successRate}%
                      </div>
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            integration.successRate >= 95 ? "bg-green-500" :
                            integration.successRate >= 80 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${integration.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {integration.totalCalls.toLocaleString()} calls
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {new Date(integration.lastSync).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedIntegration(integration.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Configure
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Test
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Logs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Integration Templates</h3>
        <p className="text-slate-600 mb-6">
          Start with pre-built templates to accelerate your integration development.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationTemplates.map((template, index) => (
            <div key={index} className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{template.name}</div>
                  <div className="text-sm text-slate-600">{template.description}</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Endpoints:</span>
                  <span className="text-slate-800 font-medium">{template.endpoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Methods:</span>
                  <div className="flex gap-1">
                    {template.methods.map(method => (
                      <span key={method} className={`px-2 py-1 rounded text-xs font-mono ${
                        method === 'GET' ? 'bg-green-100 text-green-800' :
                        method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Auth:</span>
                  <span className="text-slate-800 font-medium">{template.authentication}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Rate Limit:</span>
                  <span className="text-slate-800 font-medium">{template.rateLimit}</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Integration Builder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Custom Integration Builder</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-slate-800 mb-4">Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Integration Name</label>
                <input 
                  type="text" 
                  placeholder="My Custom Integration"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Base URL</label>
                <input 
                  type="url" 
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Authentication Type</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rate Limit (per hour)</label>
                <input 
                  type="number" 
                  placeholder="1000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-4">Generated Code</h4>
            <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto">
              <pre className="text-green-400 text-sm">
                <code>{`{
  "name": "My Custom Integration",
  "baseUrl": "https://api.example.com/v1",
  "authentication": {
    "type": "api_key",
    "header": "Authorization",
    "prefix": "Bearer"
  },
  "rateLimit": {
    "requests": 1000,
    "period": "hour"
  },
  "endpoints": [],
  "webhooks": {
    "enabled": false,
    "url": null
  },
  "retry": {
    "attempts": 3,
    "delay": 1000
  }
}`}</code>
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                Generate Integration
              </button>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                Download Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Integration API Reference</h3>
        
        <div className="space-y-6">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded text-xs font-mono font-medium ${
                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {endpoint.method}
                </span>
                <code className="font-mono text-slate-800">{endpoint.path}</code>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-slate-600">{endpoint.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Parameters</div>
                  <div className="space-y-1">
                    {endpoint.parameters.map((param, paramIndex) => (
                      <div key={paramIndex} className="text-sm text-slate-600">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs">{param}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Response</div>
                  <div className="text-sm text-slate-600">{endpoint.response}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SDK Examples */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">SDK Examples</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-slate-800 mb-4">JavaScript SDK</h4>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm">
                <code>{`import { GhostCRM } from '@ghostcrm/sdk';

const client = new GhostCRM({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.ghostcrm.com/v1'
});

// Create integration
const integration = await client.integrations.create({
  name: 'My Integration',
  type: 'CRM',
  config: {
    baseUrl: 'https://api.example.com',
    auth: { type: 'api_key' }
  }
});

// Test integration
const result = await client.integrations.test(integration.id);
console.log('Test result:', result);`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-4">Python SDK</h4>
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm">
                <code>{`from ghostcrm import GhostCRM

client = GhostCRM(
    api_key='your_api_key_here',
    base_url='https://api.ghostcrm.com/v1'
)

# Create integration
integration = client.integrations.create({
    'name': 'My Integration',
    'type': 'CRM',
    'config': {
        'base_url': 'https://api.example.com',
        'auth': {'type': 'api_key'}
    }
})

# Test integration
result = client.integrations.test(integration['id'])
print('Test result:', result)`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🔌</span>
            Integrations Development
          </h1>
          <p className="text-slate-600 mt-2">Build and manage custom integrations with external platforms</p>
        </div>

        {/* Quick Stats Banner */}
        <div className="mb-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold">3 Active Integrations</div>
              <div className="text-teal-100">Across different platforms</div>
            </div>
            <div>
              <div className="text-2xl font-bold">97.8% Uptime</div>
              <div className="text-teal-100">Last 30 days</div>
            </div>
            <div>
              <div className="text-2xl font-bold">20,160 API Calls</div>
              <div className="text-teal-100">This month</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: "📋" },
                { id: "templates", label: "Templates", icon: "🎯" },
                { id: "api", label: "API Reference", icon: "📚" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "templates" && renderTemplatesTab()}
          {activeTab === "api" && renderApiTab()}
        </div>
      </div>
    </div>
  );
}
