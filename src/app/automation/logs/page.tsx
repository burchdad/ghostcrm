"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Activity,
  Eye,
  Calendar,
  User,
  Mail,
  Phone,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react";

interface AutomationLog {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: string;
  status: 'success' | 'failed' | 'running' | 'warning';
  startTime: string;
  endTime?: string;
  duration?: number;
  steps: LogStep[];
  leadId?: string;
  leadName?: string;
  errorMessage?: string;
  metadata: any;
}

interface LogStep {
  id: string;
  name: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  status: 'success' | 'failed' | 'running' | 'skipped';
  startTime: string;
  endTime?: string;
  duration?: number;
  input?: any;
  output?: any;
  errorMessage?: string;
}

const mockLogs: AutomationLog[] = [
  {
    id: '1',
    workflowId: 'wf-001',
    workflowName: 'New Lead Welcome Series',
    triggerType: 'new_lead',
    status: 'success',
    startTime: '2024-01-15T14:30:00Z',
    endTime: '2024-01-15T14:31:30Z',
    duration: 90,
    leadId: 'lead-123',
    leadName: 'John Smith',
    steps: [
      {
        id: 'step-1',
        name: 'Lead Created Trigger',
        type: 'trigger',
        status: 'success',
        startTime: '2024-01-15T14:30:00Z',
        endTime: '2024-01-15T14:30:05Z',
        duration: 5,
        output: { leadId: 'lead-123', source: 'website' }
      },
      {
        id: 'step-2',
        name: 'Check Lead Source',
        type: 'condition',
        status: 'success',
        startTime: '2024-01-15T14:30:05Z',
        endTime: '2024-01-15T14:30:10Z',
        duration: 5,
        input: { source: 'website' },
        output: { result: true }
      },
      {
        id: 'step-3',
        name: 'Send Welcome Email',
        type: 'action',
        status: 'success',
        startTime: '2024-01-15T14:30:10Z',
        endTime: '2024-01-15T14:31:30Z',
        duration: 80,
        input: { template: 'welcome-email-001', recipientId: 'lead-123' },
        output: { emailId: 'email-456', status: 'sent' }
      }
    ],
    metadata: {
      source: 'website_form',
      campaign: 'winter_promotion'
    }
  },
  {
    id: '2',
    workflowId: 'wf-002',
    workflowName: 'High-Value Lead Alert',
    triggerType: 'lead_score_updated',
    status: 'failed',
    startTime: '2024-01-15T16:15:00Z',
    endTime: '2024-01-15T16:15:45Z',
    duration: 45,
    leadId: 'lead-456',
    leadName: 'Sarah Johnson',
    errorMessage: 'Failed to send Slack notification: API rate limit exceeded',
    steps: [
      {
        id: 'step-1',
        name: 'Lead Score Updated',
        type: 'trigger',
        status: 'success',
        startTime: '2024-01-15T16:15:00Z',
        endTime: '2024-01-15T16:15:05Z',
        duration: 5,
        output: { leadId: 'lead-456', newScore: 87, oldScore: 75 }
      },
      {
        id: 'step-2',
        name: 'Check Score Threshold',
        type: 'condition',
        status: 'success',
        startTime: '2024-01-15T16:15:05Z',
        endTime: '2024-01-15T16:15:10Z',
        duration: 5,
        input: { score: 87, threshold: 85 },
        output: { result: true }
      },
      {
        id: 'step-3',
        name: 'Send Slack Alert',
        type: 'action',
        status: 'failed',
        startTime: '2024-01-15T16:15:10Z',
        endTime: '2024-01-15T16:15:45Z',
        duration: 35,
        input: { channel: '#sales-alerts', message: 'High-value lead detected' },
        errorMessage: 'API rate limit exceeded'
      }
    ],
    metadata: {
      scoreIncrease: 12,
      trigger: 'email_engagement'
    }
  },
  {
    id: '3',
    workflowId: 'wf-001',
    workflowName: 'New Lead Welcome Series',
    triggerType: 'new_lead',
    status: 'running',
    startTime: '2024-01-15T17:20:00Z',
    leadId: 'lead-789',
    leadName: 'Mike Davis',
    steps: [
      {
        id: 'step-1',
        name: 'Lead Created Trigger',
        type: 'trigger',
        status: 'success',
        startTime: '2024-01-15T17:20:00Z',
        endTime: '2024-01-15T17:20:05Z',
        duration: 5,
        output: { leadId: 'lead-789', source: 'referral' }
      },
      {
        id: 'step-2',
        name: 'Check Lead Source',
        type: 'condition',
        status: 'success',
        startTime: '2024-01-15T17:20:05Z',
        endTime: '2024-01-15T17:20:10Z',
        duration: 5,
        input: { source: 'referral' },
        output: { result: true }
      },
      {
        id: 'step-3',
        name: 'Send Welcome Email',
        type: 'action',
        status: 'running',
        startTime: '2024-01-15T17:20:10Z'
      }
    ],
    metadata: {
      source: 'referral_program',
      referrer: 'partner-abc'
    }
  },
  {
    id: '4',
    workflowId: 'wf-003',
    workflowName: 'Demo No-Show Recovery',
    triggerType: 'appointment_missed',
    status: 'warning',
    startTime: '2024-01-15T11:00:00Z',
    endTime: '2024-01-15T11:02:15Z',
    duration: 135,
    leadId: 'lead-321',
    leadName: 'Emma Wilson',
    steps: [
      {
        id: 'step-1',
        name: 'Appointment Missed',
        type: 'trigger',
        status: 'success',
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T11:00:05Z',
        duration: 5,
        output: { appointmentId: 'apt-123', leadId: 'lead-321' }
      },
      {
        id: 'step-2',
        name: 'Wait 2 Hours',
        type: 'delay',
        status: 'success',
        startTime: '2024-01-15T11:00:05Z',
        endTime: '2024-01-15T11:00:10Z',
        duration: 5
      },
      {
        id: 'step-3',
        name: 'Send Follow-up SMS',
        type: 'action',
        status: 'success',
        startTime: '2024-01-15T11:00:10Z',
        endTime: '2024-01-15T11:02:15Z',
        duration: 125,
        input: { template: 'reschedule-sms', recipientId: 'lead-321' },
        output: { smsId: 'sms-789', status: 'delivered', warning: 'Phone number may be invalid' }
      }
    ],
    metadata: {
      appointmentType: 'demo',
      originalTime: '2024-01-15T10:00:00Z'
    }
  }
];

export default function AutomationLogsPage() {
  const [logs, setLogs] = useState<AutomationLog[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWorkflow, setFilterWorkflow] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const workflows = Array.from(new Set(logs.map(log => log.workflowName)));

  const filteredLogs = logs.filter(log => {
    if (searchQuery && !log.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.leadName?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterWorkflow !== 'all' && log.workflowName !== filterWorkflow) return false;
    return true;
  });

  const refreshLogs = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'skipped': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 60) return `${duration}s`;
    return `${Math.floor(duration / 60)}m ${duration % 60}s`;
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automation Logs</h1>
            <p className="text-gray-600">Monitor and analyze automation execution</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshLogs}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Successful</p>
                <p className="text-2xl font-bold text-green-900">
                  {logs.filter(l => l.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {logs.filter(l => l.status === 'failed').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Running</p>
                <p className="text-2xl font-bold text-blue-900">
                  {logs.filter(l => l.status === 'running').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Warnings</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {logs.filter(l => l.status === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by workflow or lead name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="warning">Warning</option>
          </select>
          <select
            value={filterWorkflow}
            onChange={(e) => setFilterWorkflow(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Workflows</option>
            {workflows.map(workflow => (
              <option key={workflow} value={workflow}>{workflow}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Execution History</h3>
        </div>
        <div className="divide-y">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                    <span className="capitalize font-medium">{log.status}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{log.workflowName}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ID: {log.id}</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.leadName || 'Unknown Lead'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTime(log.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(log.duration)}
                      </span>
                    </div>
                    {log.errorMessage && (
                      <p className="text-sm text-red-600 mt-1">{log.errorMessage}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{log.steps.length} steps</span>
                  {expandedLog === log.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLog === log.id && (
                <div className="mt-4 pl-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Execution Details</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Workflow ID:</span>
                            <span className="font-mono">{log.workflowId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trigger:</span>
                            <span>{log.triggerType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Time:</span>
                            <span>{formatTime(log.startTime)}</span>
                          </div>
                          {log.endTime && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">End Time:</span>
                              <span>{formatTime(log.endTime)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Metadata</h5>
                        <div className="space-y-1 text-sm">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Execution Steps</h5>
                      <div className="space-y-3">
                        {log.steps.map((step, index) => (
                          <div key={step.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(step.status)}`}>
                                <span className="font-bold text-xs">{index + 1}</span>
                              </div>
                              {index < log.steps.length - 1 && (
                                <div className="w-px h-6 bg-gray-300 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2">
                                <h6 className="font-medium text-gray-900">{step.name}</h6>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(step.status)}`}>
                                  {step.status}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {step.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                <span>Started: {formatTime(step.startTime)}</span>
                                {step.endTime && (
                                  <span>Completed: {formatTime(step.endTime)}</span>
                                )}
                                <span>Duration: {formatDuration(step.duration)}</span>
                              </div>
                              {step.errorMessage && (
                                <p className="text-sm text-red-600 mt-2">{step.errorMessage}</p>
                              )}
                              {(step.input || step.output) && (
                                <div className="mt-2 space-y-2">
                                  {step.input && (
                                    <div className="p-2 bg-blue-50 rounded text-xs">
                                      <strong>Input:</strong> {JSON.stringify(step.input)}
                                    </div>
                                  )}
                                  {step.output && (
                                    <div className="p-2 bg-green-50 rounded text-xs">
                                      <strong>Output:</strong> {JSON.stringify(step.output)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}