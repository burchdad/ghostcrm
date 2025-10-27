"use client";
import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Check, 
  X, 
  Clock, 
  Eye, 
  Users, 
  BarChart3, 
  Filter,
  Search,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  User,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { 
  OrganizationalChartRegistry, 
  getCurrentUserContext 
} from "../library/organizationalRegistry";
import { 
  OrganizationalChartTemplate, 
  ChartApprovalRequest, 
  ApprovalStatus 
} from "../library/types";

interface ChartAdminStats {
  totalCharts: number;
  pendingApproval: number;
  approvedCharts: number;
  rejectedCharts: number;
  aiGeneratedCharts: number;
  topCreators: {
    name: string;
    count: number;
    usage: number;
  }[];
}

export default function AIChartAdminInterface() {
  const [charts, setCharts] = useState<OrganizationalChartTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<OrganizationalChartTemplate | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [stats, setStats] = useState<ChartAdminStats | null>(null);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setLoading(true);
      const userContext = getCurrentUserContext();
      const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
      const orgLibrary = await orgRegistry.getOrganizationalLibrary(userContext.userId, userContext.userRole);
      
      // Get all organizational charts for admin view
      const allCharts = [
        ...orgLibrary.aiGenerated,
        ...orgLibrary.myCharts,
        ...orgLibrary.teamCharts,
        ...orgLibrary.pendingApproval
      ];
      
      // Remove duplicates
      const uniqueCharts = allCharts.filter((chart, index, self) => 
        index === self.findIndex(c => c.id === chart.id)
      );
      
      setCharts(uniqueCharts);
      setStats(calculateStats(uniqueCharts));
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (chartList: OrganizationalChartTemplate[]): ChartAdminStats => {
    const totalCharts = chartList.length;
    const pendingApproval = chartList.filter(c => c.approvalStatus === 'pending').length;
    const approvedCharts = chartList.filter(c => c.approvalStatus === 'approved').length;
    const rejectedCharts = chartList.filter(c => c.approvalStatus === 'rejected').length;
    const aiGeneratedCharts = chartList.filter(c => c.source === 'ai').length;

    // Calculate top creators
    const creatorMap = new Map<string, { count: number; usage: number }>();
    chartList.forEach(chart => {
      const existing = creatorMap.get(chart.creatorName) || { count: 0, usage: 0 };
      existing.count++;
      existing.usage += chart.usage.totalInstalls;
      creatorMap.set(chart.creatorName, existing);
    });

    const topCreators = Array.from(creatorMap.entries())
      .map(([name, data]) => ({ name, count: data.count, usage: data.usage }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCharts,
      pendingApproval,
      approvedCharts,
      rejectedCharts,
      aiGeneratedCharts,
      topCreators
    };
  };

  const handleApprovalAction = async (chart: OrganizationalChartTemplate, action: 'approve' | 'reject') => {
    setSelectedChart(chart);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (!selectedChart || !approvalAction) return;

    try {
      const userContext = getCurrentUserContext();
      const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
      
      const request: ChartApprovalRequest = {
        chartId: selectedChart.id,
        action: approvalAction,
        reason: approvalReason,
        reviewerNotes: `${approvalAction === 'approve' ? 'Approved' : 'Rejected'} by ${userContext.userName}`
      };

      await orgRegistry.approveChart(request, userContext.userId);
      
      // Reload charts to reflect changes
      await loadCharts();
      
      // Close modal
      setShowApprovalModal(false);
      setSelectedChart(null);
      setApprovalAction(null);
      setApprovalReason('');
      
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  const filteredCharts = charts.filter(chart => {
    const matchesStatus = filterStatus === 'all' || chart.approvalStatus === filterStatus;
    const matchesSearch = !searchQuery || 
      chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chart.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chart.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chart.aiMetadata?.originalPrompt?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading charts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-blue-600" />
            AI Chart Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage organizational AI-generated charts and approval workflows
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Charts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCharts}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-semibold text-orange-600">{stats.pendingApproval}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{stats.approvedCharts}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.aiGeneratedCharts}</p>
              </div>
              <div className="text-2xl">🤖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">{stats.rejectedCharts}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search charts, creators, or prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApprovalStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chart
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCharts.map((chart) => (
                <tr key={chart.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {chart.source === 'ai' ? '🤖' : '📊'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{chart.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {chart.description}
                        </div>
                        {chart.aiMetadata && (
                          <div className="text-xs text-purple-600 italic mt-1 max-w-xs truncate">
                            "{chart.aiMetadata.originalPrompt}"
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{chart.creatorName}</div>
                        <div className="text-sm text-gray-500">{chart.creatorRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {chart.type}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">{chart.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      chart.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      chart.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                      chart.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {chart.approvalStatus === 'approved' && <Check className="h-3 w-3 mr-1" />}
                      {chart.approvalStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {chart.approvalStatus === 'rejected' && <X className="h-3 w-3 mr-1" />}
                      {chart.approvalStatus.charAt(0).toUpperCase() + chart.approvalStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div>{chart.usage.totalInstalls} installs</div>
                        <div className="text-xs text-gray-500">{chart.usage.uniqueUsers} users</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(chart.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {chart.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovalAction(chart, 'approve')}
                            className="text-green-600 hover:text-green-700 flex items-center"
                            title="Approve Chart"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprovalAction(chart, 'reject')}
                            className="text-red-600 hover:text-red-700 flex items-center"
                            title="Reject Chart"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedChart(chart)}
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCharts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No charts found</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all' 
                ? 'No charts match your current filters.'
                : 'No organizational charts have been created yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedChart && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              {approvalAction === 'approve' ? (
                <Check className="h-6 w-6 text-green-600 mr-2" />
              ) : (
                <X className="h-6 w-6 text-red-600 mr-2" />
              )}
              <h3 className="text-lg font-semibold">
                {approvalAction === 'approve' ? 'Approve Chart' : 'Reject Chart'}
              </h3>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{selectedChart.name}</h4>
              <p className="text-sm text-gray-600">{selectedChart.description}</p>
              {selectedChart.aiMetadata && (
                <p className="text-xs text-purple-600 italic mt-2">
                  AI Prompt: "{selectedChart.aiMetadata.originalPrompt}"
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {approvalAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
              </label>
              <textarea
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={approvalAction === 'approve' 
                  ? 'Optional notes about the approval...'
                  : 'Please provide a reason for rejection...'
                }
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedChart(null);
                  setApprovalAction(null);
                  setApprovalReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className={`px-4 py-2 text-white rounded-lg ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Creators Sidebar */}
      {stats && stats.topCreators.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Top Chart Creators
          </h3>
          <div className="space-y-3">
            {stats.topCreators.map((creator, index) => (
              <div key={creator.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{creator.name}</p>
                    <p className="text-sm text-gray-500">{creator.count} charts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{creator.usage}</p>
                  <p className="text-xs text-gray-500">total installs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
