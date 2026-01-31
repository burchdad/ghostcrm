"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WebhooksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("manage");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  const webhooks = [
    {
      id: "wh_001",
      name: "Lead Created Notification",
      url: "https://api.myapp.com/webhooks/lead-created",
      events: ["lead.created", "lead.updated"],
      status: "active",
      createdAt: "2024-12-15",
      lastTriggered: "2024-12-19 14:30:00",
      successRate: 98.5,
      totalRequests: 1247
    },
    {
      id: "wh_002", 
      name: "Deal Stage Updates",
      url: "https://crm.company.com/hooks/deals",
      events: ["deal.stage_changed", "deal.won", "deal.lost"],
      status: "active",
      createdAt: "2024-12-10",
      lastTriggered: "2024-12-19 13:15:00",
      successRate: 95.2,
      totalRequests: 892
    },
    {
      id: "wh_003",
      name: "Contact Sync",
      url: "https://mailserver.example.com/sync",
      events: ["contact.created", "contact.updated", "contact.deleted"],
      status: "failed",
      createdAt: "2024-12-08",
      lastTriggered: "2024-12-18 09:20:00",
      successRate: 67.3,
      totalRequests: 156
    }
  ];

  const webhookEvents = [
    {
      category: "Leads",
      events: [
        { name: "lead.created", description: "A new lead is created" },
        { name: "lead.updated", description: "Lead information is modified" },
        { name: "lead.deleted", description: "A lead is deleted" },
        { name: "lead.status_changed", description: "Lead status changes" },
        { name: "lead.assigned", description: "Lead is assigned to a team member" }
      ]
    },
    {
      category: "Deals",
      events: [
        { name: "deal.created", description: "A new deal is created" },
        { name: "deal.updated", description: "Deal information is modified" },
        { name: "deal.stage_changed", description: "Deal moves to different stage" },
        { name: "deal.won", description: "Deal is marked as won" },
        { name: "deal.lost", description: "Deal is marked as lost" }
      ]
    },
    {
      category: "Contacts",
      events: [
        { name: "contact.created", description: "A new contact is added" },
        { name: "contact.updated", description: "Contact information is modified" },
        { name: "contact.deleted", description: "A contact is deleted" }
      ]
    },
    {
      category: "Activities",
      events: [
        { name: "activity.created", description: "New activity is logged" },
        { name: "task.completed", description: "A task is marked complete" },
        { name: "meeting.scheduled", description: "A meeting is scheduled" }
      ]
    }
  ];

  const webhookLogs = [
    {
      id: "log_001",
      webhook: "Lead Created Notification",
      event: "lead.created",
      status: "success",
      timestamp: "2024-12-19T14:30:15Z",
      responseCode: 200,
      responseTime: "145ms",
      payload: { id: "lead_456", firstName: "John", lastName: "Smith" }
    },
    {
      id: "log_002",
      webhook: "Deal Stage Updates", 
      event: "deal.stage_changed",
      status: "success",
      timestamp: "2024-12-19T13:15:30Z",
      responseCode: 200,
      responseTime: "89ms",
      payload: { id: "deal_789", stage: "negotiation", oldStage: "proposal" }
    },
    {
      id: "log_003",
      webhook: "Contact Sync",
      event: "contact.updated",
      status: "failed",
      timestamp: "2024-12-19T12:45:22Z",
      responseCode: 500,
      responseTime: "2.3s",
      error: "Internal Server Error",
      payload: { id: "contact_123", email: "updated@example.com" }
    }
  ];

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Webhooks List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Active Webhooks</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Create Webhook
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">URL</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Events</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Success Rate</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Last Triggered</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{webhook.name}</div>
                    <div className="text-sm text-slate-500">{webhook.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-sm text-slate-600 max-w-xs truncate">
                      {webhook.url}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map(event => (
                        <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {event}
                        </span>
                      ))}
                      {webhook.events.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          +{webhook.events.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      webhook.status === "active" 
                        ? "bg-green-100 text-green-800"
                        : webhook.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {webhook.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-slate-800">
                        {webhook.successRate}%
                      </div>
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            webhook.successRate >= 95 ? "bg-green-500" :
                            webhook.successRate >= 80 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${webhook.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {webhook.totalRequests.toLocaleString()} requests
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {new Date(webhook.lastTriggered).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedWebhook(webhook.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Test
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Webhooks", value: "3", icon: "🔗", color: "blue" },
          { label: "Active Webhooks", value: "2", icon: "✅", color: "green" },
          { label: "Failed Webhooks", value: "1", icon: "❌", color: "red" },
          { label: "Total Requests Today", value: "847", icon: "📊", color: "purple" }
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
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Available Webhook Events</h3>
        <p className="text-slate-600 mb-6">
          Subscribe to these events to receive real-time notifications when data changes in your CRM.
        </p>

        <div className="space-y-6">
          {webhookEvents.map((category, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📁</span>
                {category.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.events.map((event, eventIndex) => (
                  <div key={eventIndex} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-mono text-sm text-blue-600 mb-1">
                      {event.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {event.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Payload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Sample Payload Structure</h3>
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
            <code>{`{
  "event": "lead.created",
  "timestamp": "2024-12-19T14:30:15Z",
  "data": {
    "id": "lead_456",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "company": "Acme Corp",
    "source": "website",
    "status": "new",
    "createdAt": "2024-12-19T14:30:15Z"
  },
  "previous": null,
  "metadata": {
    "userId": "user_123",
    "source": "api",
    "version": "1.0"
  }
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Webhook Delivery Logs</h3>
            <div className="flex gap-3">
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="">All Webhooks</option>
                <option value="wh_001">Lead Created Notification</option>
                <option value="wh_002">Deal Stage Updates</option>
                <option value="wh_003">Contact Sync</option>
              </select>
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Webhook</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Event</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Response</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Duration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhookLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800 text-sm">{log.webhook}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                      {log.event}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.status === "success" 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <span className={`font-mono ${
                        log.responseCode >= 200 && log.responseCode < 300 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {log.responseCode}
                      </span>
                      {log.error && (
                        <div className="text-xs text-red-600 mt-1">{log.error}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {log.responseTime}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Retry
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

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Global Webhook Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Retry Attempts</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
              <div className="text-xs text-slate-500 mt-1">
                Number of retry attempts for failed webhooks
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timeout Duration</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
              </select>
              <div className="text-xs text-slate-500 mt-1">
                Maximum time to wait for webhook response
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableSignatures" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableSignatures" className="text-sm text-slate-700">
                Enable webhook signatures for security verification
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableLogging" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableLogging" className="text-sm text-slate-700">
                Log all webhook delivery attempts
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableNotifications" className="w-4 h-4 text-blue-600" />
              <label htmlFor="enableNotifications" className="text-sm text-slate-700">
                Send email notifications for failed webhooks
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Security Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Webhook Secret</label>
            <div className="flex gap-3">
              <input 
                type="password" 
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"
              />
              <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Regenerate
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Used to sign webhook payloads for verification
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Allowed IP Addresses</label>
            <textarea 
              placeholder="Enter IP addresses or CIDR blocks, one per line"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="text-xs text-slate-500 mt-1">
              Restrict webhook deliveries to specific IP addresses (optional)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🔗</span>
            Webhooks
          </h1>
          <p className="text-slate-600 mt-2">Manage real-time data notifications and integrations</p>
        </div>

        {/* Status Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">2 Active Webhooks</div>
              <div className="text-green-100">98.5% average success rate</div>
            </div>
            <div className="text-6xl opacity-80">📡</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "manage", label: "Manage Webhooks", icon: "🔧" },
                { id: "events", label: "Available Events", icon: "📋" },
                { id: "logs", label: "Delivery Logs", icon: "📊" },
                { id: "settings", label: "Settings", icon: "⚙️" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
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
          {activeTab === "manage" && renderManageTab()}
          {activeTab === "events" && renderEventsTab()}
          {activeTab === "logs" && renderLogsTab()}
          {activeTab === "settings" && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}
