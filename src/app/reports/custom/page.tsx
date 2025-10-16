"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  Copy, 
  Settings,
  Save,
  Play,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Table,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Database
} from "lucide-react";

interface CustomReport {
  id: string;
  name: string;
  description: string;
  chartType: 'bar' | 'pie' | 'line' | 'table';
  dataSource: string;
  filters: any;
  dateRange: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  isPublic: boolean;
  viewCount: number;
  data?: any[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  chartType: 'bar' | 'pie' | 'line' | 'table';
  category: string;
  icon: any;
  color: string;
}

const mockReports: CustomReport[] = [
  {
    id: '1',
    name: 'Sales Performance by Team',
    description: 'Monthly sales performance breakdown by team members',
    chartType: 'bar',
    dataSource: 'deals',
    filters: { status: 'closed-won', period: 'last-month' },
    dateRange: 'last-month',
    createdBy: 'John Smith',
    createdAt: '2024-10-01T10:00:00Z',
    lastModified: '2024-10-14T15:30:00Z',
    isPublic: true,
    viewCount: 47,
    data: [
      { name: 'Sarah Johnson', value: 125000, deals: 12 },
      { name: 'Mike Chen', value: 98000, deals: 9 },
      { name: 'Emily Davis', value: 87000, deals: 8 },
      { name: 'Alex Rodriguez', value: 76000, deals: 7 },
      { name: 'Jessica Wang', value: 69000, deals: 6 }
    ]
  },
  {
    id: '2',
    name: 'Lead Source Analysis',
    description: 'Distribution of leads by source channels',
    chartType: 'pie',
    dataSource: 'leads',
    filters: { period: 'last-quarter' },
    dateRange: 'last-quarter',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-09-15T14:20:00Z',
    lastModified: '2024-10-12T09:45:00Z',
    isPublic: false,
    viewCount: 23,
    data: [
      { name: 'Website', value: 342, color: '#3B82F6' },
      { name: 'Referrals', value: 287, color: '#10B981' },
      { name: 'Social Media', value: 198, color: '#F59E0B' },
      { name: 'Email Campaign', value: 156, color: '#EF4444' },
      { name: 'Trade Shows', value: 89, color: '#8B5CF6' }
    ]
  },
  {
    id: '3',
    name: 'Revenue Trend Analysis',
    description: 'Monthly revenue trends over the past year',
    chartType: 'line',
    dataSource: 'deals',
    filters: { status: 'closed-won', period: 'last-year' },
    dateRange: 'last-year',
    createdBy: 'Mike Chen',
    createdAt: '2024-09-01T11:15:00Z',
    lastModified: '2024-10-10T16:20:00Z',
    isPublic: true,
    viewCount: 89,
    data: [
      { month: 'Jan', revenue: 245000, target: 230000 },
      { month: 'Feb', revenue: 267000, target: 250000 },
      { month: 'Mar', revenue: 289000, target: 270000 },
      { month: 'Apr', revenue: 312000, target: 290000 },
      { month: 'May', revenue: 298000, target: 310000 },
      { month: 'Jun', revenue: 334000, target: 320000 },
      { month: 'Jul', revenue: 356000, target: 340000 },
      { month: 'Aug', revenue: 341000, target: 350000 },
      { month: 'Sep', revenue: 378000, target: 360000 },
      { month: 'Oct', revenue: 387000, target: 380000 }
    ]
  },
  {
    id: '4',
    name: 'Customer Activity Report',
    description: 'Detailed table of customer interactions and touchpoints',
    chartType: 'table',
    dataSource: 'activities',
    filters: { type: 'all', period: 'last-week' },
    dateRange: 'last-week',
    createdBy: 'Emily Davis',
    createdAt: '2024-10-08T09:30:00Z',
    lastModified: '2024-10-13T14:10:00Z',
    isPublic: false,
    viewCount: 12
  }
];

const reportTemplates: ReportTemplate[] = [
  {
    id: 't1',
    name: 'Sales Performance',
    description: 'Track sales metrics and team performance',
    chartType: 'bar',
    category: 'Sales',
    icon: BarChart3,
    color: 'bg-blue-500'
  },
  {
    id: 't2',
    name: 'Lead Distribution',
    description: 'Analyze lead sources and conversion rates',
    chartType: 'pie',
    category: 'Marketing',
    icon: PieChartIcon,
    color: 'bg-green-500'
  },
  {
    id: 't3',
    name: 'Revenue Trends',
    description: 'Monitor revenue growth over time',
    chartType: 'line',
    category: 'Finance',
    icon: TrendingUp,
    color: 'bg-purple-500'
  },
  {
    id: 't4',
    name: 'Activity Summary',
    description: 'Detailed breakdown of all activities',
    chartType: 'table',
    category: 'Operations',
    icon: Table,
    color: 'bg-orange-500'
  }
];

export default function CustomReportsPage() {
  const [reports, setReports] = useState<CustomReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChartIcon className="w-4 h-4" />;
      case 'line': return <TrendingUp className="w-4 h-4" />;
      case 'table': return <Table className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getChartColor = (chartType: string) => {
    switch (chartType) {
      case 'bar': return 'text-blue-600 bg-blue-100';
      case 'pie': return 'text-green-600 bg-green-100';
      case 'line': return 'text-purple-600 bg-purple-100';
      case 'table': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderChart = (report: CustomReport) => {
    if (!report.data) return null;

    switch (report.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={report.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={report.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {report.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={report.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="h-40 flex items-center justify-center text-gray-500">
            <Table className="w-8 h-8 mb-2" />
            <span>Table view available in full report</span>
          </div>
        );
    }
  };

  const duplicateReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const newReport = {
        ...report,
        id: Date.now().toString(),
        name: `${report.name} (Copy)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        viewCount: 0
      };
      setReports(prev => [newReport, ...prev]);
    }
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>
            <p className="text-gray-600">Build and manage custom reports with advanced analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Reports</p>
                <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Public Reports</p>
                <p className="text-2xl font-bold text-green-900">
                  {reports.filter(r => r.isPublic).length}
                </p>
              </div>
              <Share2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold text-purple-900">
                  {reports.reduce((sum, r) => sum + r.viewCount, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Chart Types</p>
                <p className="text-2xl font-bold text-orange-900">
                  {new Set(reports.map(r => r.chartType)).size}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map(template => {
              const IconComponent = template.icon;
              return (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Use Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1 rounded ${getChartColor(report.chartType)}`}>
                      {getChartIcon(report.chartType)}
                    </span>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    {report.isPublic && (
                      <Share2 className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {report.createdBy}</span>
                    <span>{report.viewCount} views</span>
                    <span>Modified {new Date(report.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-1 text-gray-600 hover:text-blue-600 rounded"
                    title="View report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateReport(report.id)}
                    className="p-1 text-gray-600 hover:text-green-600 rounded"
                    title="Duplicate report"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-orange-600 rounded" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-1 text-gray-600 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {renderChart(report)}
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Data from {report.dataSource}
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    <Download className="w-3 h-3 inline mr-1" />
                    Export
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                    <Play className="w-3 h-3 inline mr-1" />
                    Run
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="h-96 mb-6">
                {renderChart(selectedReport)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <span className="ml-2 font-medium">{selectedReport.createdBy}</span>
                </div>
                <div>
                  <span className="text-gray-500">Data source:</span>
                  <span className="ml-2 font-medium">{selectedReport.dataSource}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date range:</span>
                  <span className="ml-2 font-medium">{selectedReport.dateRange}</span>
                </div>
                <div>
                  <span className="text-gray-500">Views:</span>
                  <span className="ml-2 font-medium">{selectedReport.viewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}