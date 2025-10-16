"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Database, 
  Clock, 
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus,
  CheckSquare,
  Square,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Mail
} from "lucide-react";

interface ExportJob {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  schedule?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  lastRun?: string;
  nextRun?: string;
  recordCount: number;
  fileSize?: string;
  filters: any;
  fields: string[];
  createdAt: string;
  completedAt?: string;
}

const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    name: 'Monthly Lead Report',
    description: 'All leads created in the current month with contact details',
    dataSource: 'leads',
    format: 'excel',
    status: 'completed',
    schedule: '0 9 1 * *',
    frequency: 'monthly',
    lastRun: '2024-01-15T09:00:00Z',
    nextRun: '2024-02-01T09:00:00Z',
    recordCount: 1250,
    fileSize: '2.4 MB',
    filters: { dateRange: 'thisMonth', status: 'all' },
    fields: ['name', 'email', 'phone', 'company', 'status', 'created_date'],
    createdAt: '2024-01-01T10:00:00Z',
    completedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '2',
    name: 'Weekly Deal Pipeline',
    description: 'Active deals with current stage and value information',
    dataSource: 'deals',
    format: 'csv',
    status: 'scheduled',
    schedule: '0 8 * * 1',
    frequency: 'weekly',
    lastRun: '2024-01-08T08:00:00Z',
    nextRun: '2024-01-22T08:00:00Z',
    recordCount: 450,
    fileSize: '890 KB',
    filters: { status: 'active', stage: 'all' },
    fields: ['deal_name', 'company', 'value', 'stage', 'probability', 'close_date'],
    createdAt: '2024-01-01T15:30:00Z',
    completedAt: '2024-01-08T08:12:00Z'
  },
  {
    id: '3',
    name: 'Customer Data Backup',
    description: 'Complete customer database export for backup purposes',
    dataSource: 'contacts',
    format: 'json',
    status: 'running',
    frequency: 'daily',
    schedule: '0 2 * * *',
    lastRun: '2024-01-15T02:00:00Z',
    recordCount: 0,
    filters: { includeInactive: true },
    fields: ['all'],
    createdAt: '2024-01-10T12:00:00Z'
  },
  {
    id: '4',
    name: 'Activity Summary Report',
    description: 'Sales team activity summary for management review',
    dataSource: 'activities',
    format: 'pdf',
    status: 'failed',
    frequency: 'weekly',
    schedule: '0 17 * * 5',
    lastRun: '2024-01-12T17:00:00Z',
    nextRun: '2024-01-19T17:00:00Z',
    recordCount: 0,
    filters: { dateRange: 'lastWeek', type: 'all' },
    fields: ['user', 'type', 'outcome', 'duration', 'date'],
    createdAt: '2024-01-05T14:20:00Z'
  }
];

export default function DataExportPage() {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(mockExportJobs);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewExportForm, setShowNewExportForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileText className="w-4 h-4 text-green-600" />;
      case 'excel': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
      case 'json': return <Database className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(jobId)) {
        newSelection.delete(jobId);
      } else {
        newSelection.add(jobId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const filteredJobs = exportJobs.filter(job => 
      filterStatus === 'all' || job.status === filterStatus
    );
    
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const handleRunJob = (jobId: string) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'running' as const, lastRun: new Date().toISOString() }
        : job
    ));

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'completed' as const, 
              completedAt: new Date().toISOString(),
              recordCount: Math.floor(Math.random() * 1000) + 100,
              fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`
            }
          : job
      ));
    }, 3000);
  };

  const filteredJobs = exportJobs.filter(job => 
    filterStatus === 'all' || job.status === filterStatus
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
            <p className="text-gray-600">Export your CRM data with custom filters and scheduling</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              Export Settings
            </button>
            <button 
              onClick={() => setShowNewExportForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Exports</p>
                <p className="text-2xl font-bold text-blue-900">{exportJobs.length}</p>
              </div>
              <Download className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {exportJobs.filter(j => j.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {exportJobs.filter(j => j.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Running</p>
                <p className="text-2xl font-bold text-purple-900">
                  {exportJobs.filter(j => j.status === 'running').length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {exportJobs.filter(j => j.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>

            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedJobs.size === filteredJobs.length && filteredJobs.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              Select All
            </button>
          </div>

          {selectedJobs.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedJobs.size} selected
              </span>
              <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4 inline mr-1" />
                Run Selected
              </button>
              <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Export Jobs List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4"
                  >
                    {selectedJobs.size === filteredJobs.length && filteredJobs.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-left font-medium text-gray-700">Name</th>
                <th className="p-4 text-left font-medium text-gray-700">Data Source</th>
                <th className="p-4 text-left font-medium text-gray-700">Format</th>
                <th className="p-4 text-left font-medium text-gray-700">Status</th>
                <th className="p-4 text-left font-medium text-gray-700">Schedule</th>
                <th className="p-4 text-left font-medium text-gray-700">Records</th>
                <th className="p-4 text-left font-medium text-gray-700">Last Run</th>
                <th className="p-4 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <button
                      onClick={() => handleSelectJob(job.id)}
                      className="flex items-center justify-center w-4 h-4"
                    >
                      {selectedJobs.has(job.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{job.name}</div>
                      <div className="text-sm text-gray-600">{job.description}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{job.dataSource}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(job.format)}
                      <span className="uppercase text-sm font-medium">{job.format}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="capitalize">{job.frequency}</span>
                      </div>
                      {job.nextRun && (
                        <div className="text-gray-600 text-xs mt-1">
                          Next: {new Date(job.nextRun).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div>{job.recordCount.toLocaleString()}</div>
                      {job.fileSize && (
                        <div className="text-gray-600 text-xs">{job.fileSize}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunJob(job.id)}
                        disabled={job.status === 'running'}
                        className="p-1 text-gray-600 hover:text-blue-600 rounded disabled:opacity-50"
                        title="Run export"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-green-600 rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {job.status === 'completed' && (
                        <button className="p-1 text-gray-600 hover:text-blue-600 rounded" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-600 hover:text-gray-900 rounded" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center">
            <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No export jobs found</h3>
            <p className="text-gray-600">Create your first export job to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}