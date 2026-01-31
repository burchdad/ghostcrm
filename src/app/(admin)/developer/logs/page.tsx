"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("system");
  const [selectedLogLevel, setSelectedLogLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24h");

  const systemLogs = [
    {
      id: "log_001",
      timestamp: "2025-10-22T14:30:15.234Z",
      level: "info",
      service: "api-gateway",
      message: "Request processed successfully",
      requestId: "req_abc123",
      userId: "user_456",
      endpoint: "GET /api/v1/leads",
      responseTime: 145,
      statusCode: 200
    },
    {
      id: "log_002",
      timestamp: "2025-10-22T14:29:45.123Z",
      level: "error",
      service: "webhook-service",
      message: "Failed to deliver webhook to endpoint",
      requestId: "req_def456",
      webhookId: "wh_789",
      endpoint: "https://api.example.com/webhook",
      error: "Connection timeout after 5 seconds"
    },
    {
      id: "log_003",
      timestamp: "2025-10-22T14:29:30.567Z",
      level: "warn",
      service: "auth-service",
      message: "Multiple failed login attempts detected",
      requestId: "req_ghi789",
      userId: "user_123",
      ipAddress: "192.168.1.100",
      attemptCount: 5
    },
    {
      id: "log_004",
      timestamp: "2025-10-22T14:29:15.890Z",
      level: "debug",
      service: "database",
      message: "Query executed successfully",
      requestId: "req_jkl012",
      query: "SELECT * FROM leads WHERE status = 'new'",
      executionTime: 23,
      rowsReturned: 156
    }
  ];

  const applicationLogs = [
    {
      id: "app_001",
      timestamp: "2025-10-22T14:30:20.456Z",
      level: "info",
      component: "LeadController",
      action: "create",
      message: "New lead created successfully",
      leadId: "lead_123",
      userId: "user_456",
      metadata: { source: "website", campaign: "q4_2025" }
    },
    {
      id: "app_002",
      timestamp: "2025-10-22T14:30:10.789Z",
      level: "error",
      component: "EmailService",
      action: "send_notification",
      message: "Failed to send email notification",
      emailId: "email_789",
      recipientEmail: "user@example.com",
      error: "SMTP server unavailable"
    },
    {
      id: "app_003",
      timestamp: "2025-10-22T14:30:05.234Z",
      level: "info",
      component: "DealPipeline",
      action: "stage_change",
      message: "Deal moved to next stage",
      dealId: "deal_456",
      oldStage: "proposal",
      newStage: "negotiation",
      userId: "user_789"
    }
  ];

  const auditLogs = [
    {
      id: "audit_001",
      timestamp: "2025-10-22T14:30:25.123Z",
      action: "USER_LOGIN",
      userId: "user_456",
      userEmail: "john.smith@company.com",
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
      sessionId: "sess_abc123"
    },
    {
      id: "audit_002",
      timestamp: "2025-10-22T14:30:20.456Z",
      action: "LEAD_CREATE",
      userId: "user_456",
      userEmail: "john.smith@company.com",
      resourceId: "lead_123",
      resourceType: "Lead",
      changes: { firstName: "Jane", lastName: "Doe", email: "jane@example.com" },
      ipAddress: "192.168.1.50"
    },
    {
      id: "audit_003",
      timestamp: "2025-10-22T14:30:15.789Z",
      action: "PERMISSION_CHANGE",
      userId: "admin_123",
      userEmail: "admin@company.com",
      targetUserId: "user_789",
      targetUserEmail: "bob@company.com",
      oldPermissions: ["read_leads"],
      newPermissions: ["read_leads", "write_leads"],
      ipAddress: "192.168.1.10"
    }
  ];

  const performanceLogs = [
    {
      id: "perf_001",
      timestamp: "2025-10-22T14:30:30.123Z",
      endpoint: "GET /api/v1/leads",
      method: "GET",
      responseTime: 145,
      statusCode: 200,
      requestSize: 0,
      responseSize: 15420,
      userId: "user_456",
      userAgent: "Mozilla/5.0",
      cacheHit: false
    },
    {
      id: "perf_002",
      timestamp: "2025-10-22T14:30:25.456Z",
      endpoint: "POST /api/v1/deals",
      method: "POST",
      responseTime: 289,
      statusCode: 201,
      requestSize: 1240,
      responseSize: 890,
      userId: "user_789",
      userAgent: "PostmanRuntime/7.32.0",
      cacheHit: false
    },
    {
      id: "perf_003",
      timestamp: "2025-10-22T14:30:20.789Z",
      endpoint: "PUT /api/v1/contacts/123",
      method: "PUT", 
      responseTime: 567,
      statusCode: 200,
      requestSize: 890,
      responseSize: 1120,
      userId: "user_456",
      userAgent: "axios/1.5.0",
      cacheHit: false
    }
  ];

  const logLevels = [
    { value: "all", label: "All Levels", count: 1247, color: "slate" },
    { value: "error", label: "Error", count: 23, color: "red" },
    { value: "warn", label: "Warning", count: 45, color: "yellow" },
    { value: "info", label: "Info", count: 892, color: "blue" },
    { value: "debug", label: "Debug", count: 287, color: "green" }
  ];

  const logStats = [
    { label: "Total Logs Today", value: "12,847", icon: "📝", color: "blue" },
    { label: "Error Rate", value: "0.18%", icon: "❌", color: "red" },
    { label: "Avg Response Time", value: "145ms", icon: "⚡", color: "green" },
    { label: "Active Sessions", value: "234", icon: "👥", color: "purple" }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "error": return "bg-red-100 text-red-800";
      case "warn": return "bg-yellow-100 text-yellow-800";
      case "info": return "bg-blue-100 text-blue-800";
      case "debug": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const renderSystemTab = () => (
    <div className="space-y-6">
      {/* System Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">System Logs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Level</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Service</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Message</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Request ID</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.service}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-800">
                    {log.message}
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {log.requestId}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApplicationTab = () => (
    <div className="space-y-6">
      {/* Application Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Application Logs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Level</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Component</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Action</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Message</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">User</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {applicationLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.component}
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {log.action}
                    </code>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-800">
                    {log.message}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.userId}
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Audit Trail</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Action</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">User</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Resource</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">IP Address</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Changes</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <div>{log.userEmail}</div>
                    <div className="text-xs text-slate-500">{log.userId}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.resourceId && (
                      <div>
                        <div>{log.resourceType}</div>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">{log.resourceId}</code>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.changes && (
                      <div className="max-w-xs truncate">
                        {JSON.stringify(log.changes)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Performance Logs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Endpoint</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Method</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Response Time</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Size</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">User</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Cache</th>
              </tr>
            </thead>
            <tbody>
              {performanceLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                      {log.endpoint}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                      log.method === 'GET' ? 'bg-green-100 text-green-800' :
                      log.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-mono ${
                      log.responseTime < 200 ? 'text-green-600' :
                      log.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {log.responseTime}ms
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                      log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-800' :
                      log.statusCode >= 400 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    <div>Req: {log.requestSize}B</div>
                    <div>Res: {log.responseSize}B</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {log.userId}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.cacheHit ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.cacheHit ? 'HIT' : 'MISS'}
                    </span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            System Logs & Monitoring
          </h1>
          <p className="text-slate-600 mt-2">Comprehensive logging and monitoring for system health and debugging</p>
        </div>

        {/* Log Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {logStats.map((stat, index) => (
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

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Logs</label>
              <input
                type="text"
                placeholder="Search messages, IDs, errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Log Level</label>
              <select
                value={selectedLogLevel}
                onChange={(e) => setSelectedLogLevel(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {logLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} ({level.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <span>🔍</span>
                Filter Logs
              </button>
            </div>
          </div>
        </div>

        {/* Log Level Distribution */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Log Level Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {logLevels.map(level => (
              <div key={level.value} className="text-center">
                <div className={`text-2xl font-bold ${
                  level.color === 'red' ? 'text-red-600' :
                  level.color === 'yellow' ? 'text-yellow-600' :
                  level.color === 'blue' ? 'text-blue-600' :
                  level.color === 'green' ? 'text-green-600' : 'text-slate-600'
                }`}>
                  {level.count.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">{level.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "system", label: "System Logs", icon: "⚙️" },
                { id: "application", label: "Application", icon: "📱" },
                { id: "audit", label: "Audit Trail", icon: "🔍" },
                { id: "performance", label: "Performance", icon: "⚡" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
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
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "application" && renderApplicationTab()}
          {activeTab === "audit" && renderAuditTab()}
          {activeTab === "performance" && renderPerformanceTab()}
        </div>

        {/* Log Export */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Logs</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <span>📄</span>
              Export as CSV
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span>📊</span>
              Export as JSON
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <span>📋</span>
              Generate Report
            </button>
            <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span>⚙️</span>
              Configure Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
