'use client';

/**
 * Customer Success Workflows Dashboard
 * Comprehensive interface for managing trial-to-paid conversion automation and customer journey tracking
 * Provides real-time monitoring of onboarding workflows, engagement metrics, and conversion analytics
 */

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Users, TrendingUp, Target, Award, 
         PlayCircle, CheckCircle, Clock, Mail, MessageSquare, 
         ArrowRight, BarChart3, PieChart, Star, Zap } from 'lucide-react';

interface CustomerSuccessDashboard {
  activeEnrollments: number;
  completedWorkflows: number;
  trialConversions: number;
  avgEngagementScore: number;
  conversionRate: number;
}

interface WorkflowEnrollment {
  id: string;
  organizationId: string;
  organizationName: string;
  workflowId: string;
  workflowName: string;
  targetPlan: string;
  enrolledAt: string;
  enrollmentSource: string;
  currentStepOrder: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  completedAt: string | null;
  stepsCompleted: number;
  totalSteps: number;
  completionPercentage: number;
  lastActivityAt: string;
  engagementScore: number;
}

interface EngagementEvent {
  id: string;
  organizationId: string;
  eventType: string;
  eventName: string;
  eventData: any;
  engagementValue: number;
  milestoneAchieved: boolean;
  occurredAt: string;
}

interface Conversion {
  id: string;
  organizationId: string;
  conversionType: string;
  fromState: string;
  toState: string;
  revenueImpact: number;
  workflowName: string;
  journeyDurationDays: number;
  touchpointCount: number;
  successScore: number;
  convertedAt: string;
}

interface OnboardingWorkflow {
  id: string;
  workflowName: string;
  targetPlan: string;
  workflowDescription: string;
  isActive: boolean;
  autoEnroll: boolean;
  totalDurationDays: number;
  stepIntervals: number[];
  createdAt: string;
}

export default function CustomerSuccessWorkflowsDashboard() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<CustomerSuccessDashboard | null>(null);
  const [enrollments, setEnrollments] = useState<WorkflowEnrollment[]>([]);
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<WorkflowEnrollment | null>(null);
  const [engagementEvents, setEngagementEvents] = useState<EngagementEvent[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard and main data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, enrollmentsRes, workflowsRes, engagementRes, conversionsRes] = await Promise.all([
        fetch('/api/customer-success?type=dashboard'),
        fetch(`/api/customer-success?type=enrollments&limit=50${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`),
        fetch('/api/customer-success?type=workflows'),
        fetch(`/api/customer-success?type=engagement-events&days=${timeRange}`),
        fetch(`/api/customer-success?type=conversions&days=${timeRange}`)
      ]);

      const [dashboardData, enrollmentsData, workflowsData, engagementData, conversionsData] = await Promise.all([
        dashboardRes.json(),
        enrollmentsRes.json(),
        workflowsRes.json(),
        engagementRes.json(),
        conversionsRes.json()
      ]);

      if (dashboardData.success) setDashboard(dashboardData.dashboard);
      if (enrollmentsData.success) setEnrollments(enrollmentsData.enrollments || []);
      if (workflowsData.success) setWorkflows(workflowsData.workflows || []);
      if (engagementData.success) setEngagementEvents(engagementData.engagementEvents || []);
      if (conversionsData.success) setConversions(conversionsData.conversions || []);

      if (!dashboardData.success || !enrollmentsData.success) {
        setError('Some data failed to load');
      }

    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load customer success data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-enroll trial customers
  const autoEnrollTrials = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/customer-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_enroll_trials' })
      });

      const data = await response.json();
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        setError('Failed to auto-enroll trials');
      }
    } catch (err) {
      console.error('Auto-enroll error:', err);
      setError('Failed to auto-enroll trials');
    } finally {
      setRefreshing(false);
    }
  };

  // Process scheduled steps
  const processScheduledSteps = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/customer-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_scheduled_steps' })
      });

      const data = await response.json();
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        setError('Failed to process scheduled steps');
      }
    } catch (err) {
      console.error('Process steps error:', err);
      setError('Failed to process scheduled steps');
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on mount and filter change
  useEffect(() => {
    fetchData();
  }, [statusFilter, timeRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <Target className="h-4 w-4" />;
      case 'failed': return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Get engagement score color
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer success data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Success Workflows</h1>
          <p className="text-gray-600">Trial-to-paid conversion automation and customer journey tracking</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Enrollments</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>

          <button
            onClick={autoEnrollTrials}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Auto-Enroll Trials
          </button>

          <button
            onClick={processScheduledSteps}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Process Steps
          </button>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.activeEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.completedWorkflows}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trial Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.trialConversions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.avgEngagementScore.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Enrollments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Enrollments</h3>
          </div>
          
          <div className="p-6">
            {enrollments.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {enrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    onClick={() => setSelectedEnrollment(enrollment)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedEnrollment?.id === enrollment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {getStatusIcon(enrollment.status)}
                          <span className="ml-1 capitalize">{enrollment.status}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.organizationName}</p>
                          <p className="text-sm text-gray-600">{enrollment.workflowName} • {enrollment.targetPlan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEngagementColor(enrollment.engagementScore)}`}>
                            <Star className="h-3 w-3 mr-1" />
                            {enrollment.engagementScore}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {enrollment.completionPercentage.toFixed(0)}% Complete
                          </p>
                          <p className="text-xs text-gray-500">
                            {enrollment.stepsCompleted}/{enrollment.totalSteps} steps
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${enrollment.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No workflow enrollments found</p>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Enrollment Details */}
          {selectedEnrollment ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Details</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Organization</label>
                  <p className="text-gray-900">{selectedEnrollment.organizationName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Workflow</label>
                  <p className="text-gray-900">{selectedEnrollment.workflowName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status & Progress</label>
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEnrollment.status)}`}>
                      {getStatusIcon(selectedEnrollment.status)}
                      <span className="ml-1 capitalize">{selectedEnrollment.status}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedEnrollment.completionPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Engagement Score</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${selectedEnrollment.engagementScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnrollment.engagementScore}/100
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrolled</label>
                  <p className="text-gray-900">{new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Activity</label>
                  <p className="text-gray-900">{new Date(selectedEnrollment.lastActivityAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">Select an enrollment to view details</p>
            </div>
          )}

          {/* Recent Conversions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Conversions</h3>
            </div>
            
            <div className="p-6">
              {conversions.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {conversions.slice(0, 5).map((conversion) => (
                    <div key={conversion.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium capitalize">
                            {conversion.conversionType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(conversion.revenueImpact)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                        <span>{conversion.fromState} → {conversion.toState}</span>
                        <span>{conversion.journeyDurationDays} days</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversion.convertedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No recent conversions</p>
              )}
            </div>
          </div>

          {/* Active Workflows */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Workflows</h3>
            </div>
            
            <div className="p-6">
              {workflows.length > 0 ? (
                <div className="space-y-3">
                  {workflows.filter(w => w.isActive).map((workflow) => (
                    <div key={workflow.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{workflow.workflowName}</span>
                        <div className="flex items-center space-x-2">
                          {workflow.autoEnroll && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              Auto-enroll
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{workflow.targetPlan} • {workflow.totalDurationDays} days</p>
                      <p className="text-xs text-gray-500 mt-1">{workflow.workflowDescription}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No active workflows</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}