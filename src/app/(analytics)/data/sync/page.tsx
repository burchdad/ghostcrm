"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DataSyncPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("integrations");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [syncSettings, setSyncSettings] = useState<{[key: string]: any}>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const integrations = [
    { 
      id: "salesforce", 
      name: "Salesforce", 
      icon: "☁️", 
      status: "connected", 
      lastSync: "2 hours ago",
      records: "2,543",
      description: "Sync leads, contacts, and opportunities"
    },
    { 
      id: "hubspot", 
      name: "HubSpot", 
      icon: "🟠", 
      status: "connected", 
      lastSync: "1 day ago",
      records: "1,876",
      description: "Bidirectional contact and deal sync"
    },
    { 
      id: "mailchimp", 
      name: "Mailchimp", 
      icon: "🐵", 
      status: "disconnected", 
      lastSync: "Never",
      records: "0",
      description: "Sync email marketing lists"
    },
    { 
      id: "google_contacts", 
      name: "Google Contacts", 
      icon: "📧", 
      status: "connected", 
      lastSync: "30 minutes ago",
      records: "892",
      description: "Sync Google workspace contacts"
    },
    { 
      id: "outlook", 
      name: "Microsoft Outlook", 
      icon: "📮", 
      status: "connected", 
      lastSync: "1 hour ago",
      records: "1,234",
      description: "Sync Outlook contacts and calendar"
    },
    { 
      id: "zapier", 
      name: "Zapier", 
      icon: "⚡", 
      status: "connected", 
      lastSync: "15 minutes ago",
      records: "456",
      description: "Automate data flows between apps"
    }
  ];

  const syncHistory = [
    {
      id: "1",
      integration: "Salesforce",
      type: "Automatic",
      status: "completed",
      recordsProcessed: 234,
      timestamp: "2024-12-19 14:30:00",
      duration: "2m 15s"
    },
    {
      id: "2",
      integration: "HubSpot",
      type: "Manual",
      status: "completed",
      recordsProcessed: 89,
      timestamp: "2024-12-19 09:15:00",
      duration: "1m 42s"
    },
    {
      id: "3",
      integration: "Google Contacts",
      type: "Automatic",
      status: "failed",
      recordsProcessed: 0,
      timestamp: "2024-12-19 08:00:00",
      duration: "0m 30s",
      error: "Authentication expired"
    }
  ];

  const handleStartSync = (integrationId: string) => {
    setIsSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
    }, 3000);
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <div key={integration.id} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{integration.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{integration.name}</div>
                  <div className="text-sm text-slate-600">{integration.description}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                integration.status === "connected" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {integration.status}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Last Sync:</span>
                <span className="text-slate-800">{integration.lastSync}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Records:</span>
                <span className="text-slate-800">{integration.records}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {integration.status === "connected" ? (
                <>
                  <button
                    onClick={() => handleStartSync(integration.id)}
                    disabled={isSyncing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        Sync Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedIntegration(integration.id)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    ⚙️
                  </button>
                </>
              ) : (
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                  <span>🔗</span>
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Integration */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">➕</div>
        <div className="text-lg font-medium text-slate-800 mb-2">Add New Integration</div>
        <div className="text-slate-600 mb-4">Connect with more platforms to sync your data</div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Browse Integrations
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Global Sync Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Global Sync Settings</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Auto Sync Frequency</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="realtime">Real-time (Premium)</option>
                <option value="15min">Every 15 minutes</option>
                <option value="1hour">Every hour</option>
                <option value="6hours">Every 6 hours</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Conflict Resolution</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="crm_wins">CRM Data Wins</option>
                <option value="external_wins">External Data Wins</option>
                <option value="newest_wins">Newest Data Wins</option>
                <option value="manual_review">Manual Review</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableNotifications" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableNotifications" className="text-sm text-slate-700">
                Send notifications for sync events
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableBackup" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableBackup" className="text-sm text-slate-700">
                Create backup before major sync operations
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableValidation" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableValidation" className="text-sm text-slate-700">
                Validate data before importing
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Field Mapping Templates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Field Mapping Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Standard Lead Mapping", integration: "Salesforce", fields: 12 },
            { name: "Contact Sync Template", integration: "HubSpot", fields: 8 },
            { name: "Deal Pipeline Mapping", integration: "Pipedrive", fields: 15 },
            { name: "Email List Sync", integration: "Mailchimp", fields: 6 }
          ].map((template, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-slate-800">{template.name}</div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              </div>
              <div className="text-sm text-slate-600 mb-2">{template.integration}</div>
              <div className="text-xs text-slate-500">{template.fields} fields mapped</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {/* Sync Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Syncs Today", value: "24", icon: "🔄", color: "blue" },
          { label: "Records Processed", value: "3,421", icon: "📊", color: "green" },
          { label: "Successful Syncs", value: "22", icon: "✅", color: "green" },
          { label: "Failed Syncs", value: "2", icon: "❌", color: "red" }
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

      {/* Sync History Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Sync Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Integration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Records</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Duration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map((sync, index) => (
                <tr key={sync.id} className="border-t border-slate-100">
                  <td className="py-4 px-6 text-slate-800">{sync.integration}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sync.type === "Automatic" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {sync.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sync.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {sync.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{sync.recordsProcessed.toLocaleString()}</td>
                  <td className="py-4 px-6 text-slate-600">{sync.duration}</td>
                  <td className="py-4 px-6 text-slate-600">{new Date(sync.timestamp).toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      {sync.status === "failed" && (
                        <button className="text-green-600 hover:text-green-800 text-sm">Retry</button>
                      )}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🔄</span>
            Data Sync
          </h1>
          <p className="text-slate-600 mt-2">Synchronize your CRM data with external platforms</p>
        </div>

        {/* Sync Status Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">All Systems Synchronized</div>
              <div className="text-green-100">Last full sync completed 2 hours ago</div>
            </div>
            <div className="text-6xl opacity-80">✅</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "integrations", label: "Integrations", icon: "🔗" },
                { id: "settings", label: "Settings", icon: "⚙️" },
                { id: "history", label: "History", icon: "📈" }
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
          {activeTab === "integrations" && renderIntegrationsTab()}
          {activeTab === "settings" && renderSettingsTab()}
          {activeTab === "history" && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
}
