"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  Users, 
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  Send,
  Copy,
  Filter,
  Search,
  MoreVertical
} from "lucide-react";

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  reportType: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastRun: string;
  nextRun: string;
  createdBy: string;
  createdAt: string;
  successCount: number;
  failureCount: number;
  status: 'running' | 'success' | 'failed' | 'paused';
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Daily Sales Summary',
    description: 'Daily overview of sales metrics and team performance',
    reportType: 'Sales Performance',
    schedule: {
      frequency: 'daily',
      time: '08:00',
      timezone: 'America/New_York'
    },
    recipients: ['manager@company.com', 'sales-team@company.com'],
    format: 'pdf',
    isActive: true,
    lastRun: '2024-10-14T08:00:00Z',
    nextRun: '2024-10-15T08:00:00Z',
    createdBy: 'John Smith',
    createdAt: '2024-09-01T10:00:00Z',
    successCount: 42,
    failureCount: 1,
    status: 'success'
  },
  {
    id: '2',
    name: 'Weekly Lead Report',
    description: 'Comprehensive weekly lead generation and conversion analysis',
    reportType: 'Lead Analysis',
    schedule: {
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1, // Monday
      timezone: 'America/New_York'
    },
    recipients: ['marketing@company.com', 'ceo@company.com'],
    format: 'excel',
    isActive: true,
    lastRun: '2024-10-14T09:00:00Z',
    nextRun: '2024-10-21T09:00:00Z',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-08-15T14:20:00Z',
    successCount: 8,
    failureCount: 0,
    status: 'success'
  },
  {
    id: '3',
    name: 'Monthly Revenue Dashboard',
    description: 'Monthly financial performance and trend analysis',
    reportType: 'Revenue Analysis',
    schedule: {
      frequency: 'monthly',
      time: '10:00',
      dayOfMonth: 1,
      timezone: 'America/New_York'
    },
    recipients: ['finance@company.com', 'board@company.com'],
    format: 'pdf',
    isActive: true,
    lastRun: '2024-10-01T10:00:00Z',
    nextRun: '2024-11-01T10:00:00Z',
    createdBy: 'Mike Chen',
    createdAt: '2024-07-01T11:15:00Z',
    successCount: 3,
    failureCount: 0,
    status: 'success'
  },
  {
    id: '4',
    name: 'Quarterly Business Review',
    description: 'Comprehensive quarterly business performance report',
    reportType: 'Business Analytics',
    schedule: {
      frequency: 'quarterly',
      time: '11:00',
      dayOfMonth: 1,
      timezone: 'America/New_York'
    },
    recipients: ['executives@company.com', 'board@company.com'],
    format: 'pdf',
    isActive: false,
    lastRun: '2024-10-01T11:00:00Z',
    nextRun: '2025-01-01T11:00:00Z',
    createdBy: 'Emily Davis',
    createdAt: '2024-06-01T09:30:00Z',
    successCount: 1,
    failureCount: 0,
    status: 'paused'
  },
  {
    id: '5',
    name: 'Customer Activity Digest',
    description: 'Weekly customer interaction and engagement summary',
    reportType: 'Customer Analytics',
    schedule: {
      frequency: 'weekly',
      time: '16:00',
      dayOfWeek: 5, // Friday
      timezone: 'America/New_York'
    },
    recipients: ['support@company.com', 'customer-success@company.com'],
    format: 'csv',
    isActive: true,
    lastRun: '2024-10-11T16:00:00Z',
    nextRun: '2024-10-18T16:00:00Z',
    createdBy: 'Alex Rodriguez',
    createdAt: '2024-09-15T12:45:00Z',
    successCount: 4,
    failureCount: 1,
    status: 'failed'
  }
];

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>(mockScheduledReports);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyDisplay = (schedule: ScheduledReport['schedule']) => {
    switch (schedule.frequency) {
      case 'daily': return `Daily at ${schedule.time}`;
      case 'weekly': 
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[schedule.dayOfWeek!]} at ${schedule.time}`;
      case 'monthly': return `Monthly on the ${schedule.dayOfMonth}st at ${schedule.time}`;
      case 'quarterly': return `Quarterly on the 1st at ${schedule.time}`;
      default: return 'Custom schedule';
    }
  };

  const toggleReportStatus = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, isActive: !report.isActive, status: report.isActive ? 'paused' : 'success' }
        : report
    ));
  };

  const runReportNow = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'running',
            lastRun: new Date().toISOString(),
            successCount: report.successCount + 1
          }
        : report
    ));
    
    // Simulate completion after 2 seconds
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'success' }
          : report
      ));
    }, 2000);
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && report.isActive) ||
                         (filterStatus === 'inactive' && !report.isActive) ||
                         report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Reports</h1>
            <p className="text-gray-600">Automate report generation and delivery with flexible scheduling</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Schedule Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Scheduled</p>
                <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Reports</p>
                <p className="text-2xl font-bold text-green-900">
                  {reports.filter(r => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(
                    (reports.reduce((sum, r) => sum + r.successCount, 0) / 
                     reports.reduce((sum, r) => sum + r.successCount + r.failureCount, 0)) * 100
                  )}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Recipients</p>
                <p className="text-2xl font-bold text-orange-900">
                  {new Set(reports.flatMap(r => r.recipients)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
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
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reports</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1">{report.status}</span>
                  </span>
                  {!report.isActive && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{report.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Schedule:</span>
                    <p className="font-medium">{getFrequencyDisplay(report.schedule)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <p className="font-medium uppercase">{report.format}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Recipients:</span>
                    <p className="font-medium">{report.recipients.length} recipients</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Run:</span>
                    <p className="font-medium">{new Date(report.nextRun).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                  <span>Success: {report.successCount}</span>
                  <span>Failures: {report.failureCount}</span>
                  <span>Created by {report.createdBy}</span>
                  <span>Last run: {new Date(report.lastRun).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => runReportNow(report.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Run now"
                  disabled={report.status === 'running'}
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleReportStatus(report.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    report.isActive 
                      ? 'text-orange-600 hover:bg-orange-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={report.isActive ? 'Pause' : 'Resume'}
                >
                  {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedReport.name}</h2>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <span className="ml-2">{selectedReport.schedule.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-2">{selectedReport.schedule.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timezone:</span>
                        <span className="ml-2">{selectedReport.schedule.timezone}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <span className="ml-2 uppercase">{selectedReport.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Recipients:</span>
                        <span className="ml-2">{selectedReport.recipients.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2">{selectedReport.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recipients</h4>
                  <div className="space-y-1">
                    {selectedReport.recipients.map((email, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{selectedReport.successCount}</div>
                      <div className="text-sm text-green-600">Successful Runs</div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-900">{selectedReport.failureCount}</div>
                      <div className="text-sm text-red-600">Failed Runs</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">
                        {Math.round((selectedReport.successCount / (selectedReport.successCount + selectedReport.failureCount)) * 100)}%
                      </div>
                      <div className="text-sm text-blue-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}