"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Clock,
  Share2,
  BookOpen,
  FileSpreadsheet,
  File,
  Mail,
  Settings,
  Star,
  RefreshCw
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'customer' | 'financial' | 'operational' | 'custom';
  category: string;
  lastRun: string;
  schedule: string;
  format: 'pdf' | 'excel' | 'csv' | 'dashboard';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  favorite: boolean;
  recipients: string[];
  metrics: {
    revenue: number;
    deals: number;
    conversion: number;
    customers: number;
  };
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'alert' | 'opportunity' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
  data: any;
  actionRequired: boolean;
}

function ReportsInsightsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Sales Performance',
      description: 'Comprehensive analysis of monthly sales metrics, team performance, and revenue trends',
      type: 'sales',
      category: 'Performance',
      lastRun: '2024-01-15T10:30:00Z',
      schedule: 'Monthly',
      format: 'pdf',
      status: 'completed',
      favorite: true,
      recipients: ['manager@company.com', 'sales@company.com'],
      metrics: { revenue: 425000, deals: 67, conversion: 23.5, customers: 234 }
    },
    {
      id: '2',
      name: 'Customer Acquisition Analysis',
      description: 'Deep dive into customer acquisition channels, costs, and lifetime value analysis',
      type: 'customer',
      category: 'Marketing',
      lastRun: '2024-01-14T14:15:00Z',
      schedule: 'Weekly',
      format: 'excel',
      status: 'completed',
      favorite: false,
      recipients: ['marketing@company.com'],
      metrics: { revenue: 156000, deals: 43, conversion: 18.7, customers: 89 }
    },
    {
      id: '3',
      name: 'Financial Health Dashboard',
      description: 'Real-time financial metrics including cash flow, expenses, and profit margins',
      type: 'financial',
      category: 'Finance',
      lastRun: '2024-01-15T09:00:00Z',
      schedule: 'Daily',
      format: 'dashboard',
      status: 'running',
      favorite: true,
      recipients: ['finance@company.com', 'ceo@company.com'],
      metrics: { revenue: 2847500, deals: 347, conversion: 23.8, customers: 1250 }
    },
    {
      id: '4',
      name: 'Team Productivity Report',
      description: 'Analysis of team performance, call volumes, meeting effectiveness, and task completion',
      type: 'operational',
      category: 'Operations',
      lastRun: '2024-01-13T16:45:00Z',
      schedule: 'Bi-weekly',
      format: 'pdf',
      status: 'scheduled',
      favorite: false,
      recipients: ['operations@company.com'],
      metrics: { revenue: 0, deals: 0, conversion: 78.5, customers: 0 }
    }
  ]);

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      title: 'Revenue Growth Acceleration',
      description: 'Q4 revenue is trending 23% above forecast, driven by increased enterprise deals',
      type: 'trend',
      priority: 'high',
      category: 'Sales',
      timestamp: '2024-01-15T11:30:00Z',
      data: { growth: 23, forecast: 2250000, actual: 2767500 },
      actionRequired: false
    },
    {
      id: '2',
      title: 'Customer Churn Risk Alert',
      description: '12 high-value customers showing reduced engagement in the past 30 days',
      type: 'alert',
      priority: 'critical',
      category: 'Customer Success',
      timestamp: '2024-01-15T09:15:00Z',
      data: { customersAtRisk: 12, potentialLoss: 450000 },
      actionRequired: true
    },
    {
      id: '3',
      title: 'Cross-sell Opportunity',
      description: '67 customers eligible for premium features based on usage patterns',
      type: 'opportunity',
      priority: 'medium',
      category: 'Sales',
      timestamp: '2024-01-14T15:20:00Z',
      data: { eligibleCustomers: 67, potentialRevenue: 234000 },
      actionRequired: true
    },
    {
      id: '4',
      title: 'Marketing Channel Optimization',
      description: 'Social media campaigns showing 3x higher conversion than email marketing',
      type: 'recommendation',
      priority: 'medium',
      category: 'Marketing',
      timestamp: '2024-01-14T12:10:00Z',
      data: { socialConversion: 12.5, emailConversion: 4.2 },
      actionRequired: false
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useRibbonPage({
    context: "reports",
    enable: [
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-tenant owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isTenantOwner = user.role === 'owner' && isSubdomain;
      
      if (!isTenantOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        // const [reportsRes, insightsRes] = await Promise.all([
        //   fetch('/api/tenant-owner/reports'),
        //   fetch('/api/tenant-owner/insights')
        // ]);
        // const [reportsData, insightsData] = await Promise.all([
        //   reportsRes.json(),
        //   insightsRes.json()
        // ]);
        // setReports(reportsData);
        // setInsights(insightsData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'alert': return <Clock className="h-5 w-5 text-red-600" />;
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'recommendation': return <BookOpen className="h-5 w-5 text-purple-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reports & Insights</h1>
                  <p className="text-gray-600 mt-1">Generate reports and discover business insights</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export All
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Report
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Insights ({insights.length})
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled
              </button>
            </nav>
          </div>

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <>
              {/* Filters */}
              <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="sales">Sales</option>
                  <option value="customer">Customer</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="custom">Custom</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                          {report.favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{report.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{report.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Schedule:</span>
                          <span className="font-medium">{report.schedule}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last Run:</span>
                          <span className="font-medium">{formatDate(report.lastRun)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Format:</span>
                          <span className="font-medium flex items-center gap-1">
                            {report.format === 'pdf' && <File className="h-4 w-4" />}
                            {report.format === 'excel' && <FileSpreadsheet className="h-4 w-4" />}
                            {report.format === 'dashboard' && <BarChart3 className="h-4 w-4" />}
                            {report.format}
                          </span>
                        </div>
                      </div>

                      {report.type === 'sales' || report.type === 'customer' || report.type === 'financial' ? (
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                          {report.metrics.revenue > 0 && (
                            <div className="text-center p-2 border rounded">
                              <p className="font-bold text-green-600">{formatCurrency(report.metrics.revenue)}</p>
                              <p className="text-gray-500">Revenue</p>
                            </div>
                          )}
                          {report.metrics.deals > 0 && (
                            <div className="text-center p-2 border rounded">
                              <p className="font-bold text-blue-600">{report.metrics.deals}</p>
                              <p className="text-gray-500">Deals</p>
                            </div>
                          )}
                          {report.metrics.conversion > 0 && (
                            <div className="text-center p-2 border rounded">
                              <p className="font-bold text-purple-600">{report.metrics.conversion}%</p>
                              <p className="text-gray-500">Conversion</p>
                            </div>
                          )}
                          {report.metrics.customers > 0 && (
                            <div className="text-center p-2 border rounded">
                              <p className="font-bold text-orange-600">{report.metrics.customers}</p>
                              <p className="text-gray-500">Customers</p>
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getPriorityColor(insight.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                          {insight.actionRequired && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{insight.category}</span>
                          <span>•</span>
                          <span>{formatDate(insight.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      {insight.actionRequired && (
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
              <div className="space-y-4">
                {reports.filter(r => r.schedule !== 'Manual').map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-500">
                          {report.schedule} • Next run: {formatDate(report.lastRun)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function ReportsInsights() {
  return <ReportsInsightsPage />;
}