'use client';

/**
 * Dunning Management Dashboard
 * Comprehensive interface for managing failed payment recovery, account suspension, and customer communication
 * Provides real-time monitoring of dunning cases and automated recovery workflows
 */

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertTriangle, DollarSign, Clock, Shield,
         Mail, MessageSquare, CheckCircle, XCircle, PlayCircle, PauseCircle,
         TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';

interface DunningDashboard {
  activeCases: number;
  suspendedAccounts: number;
  totalOutstanding: number;
  recoveryRate: number;
  avgRecoveryDays: number;
}

interface DunningCase {
  id: string;
  organizationId: string;
  organizationName: string;
  subscriptionId: string;
  planName: string;
  stripeSubscriptionId: string;
  stripeInvoiceId: string;
  paymentAmount: number;
  currency: string;
  status: 'active' | 'retrying' | 'grace_period' | 'suspended' | 'recovered' | 'cancelled';
  currentRetryAttempt: number;
  maxRetryAttempts: number;
  failureReason: string;
  paymentFailedAt: string;
  gracePeriodEndsAt: string;
  nextRetryAt: string;
  suspendedAt: string | null;
  recoveredAt: string | null;
  emailsSent: number;
  smsSent: number;
  createdAt: string;
}

interface Communication {
  id: string;
  caseId: string;
  communicationType: string;
  deliveryMethod: string;
  recipient: string;
  subject: string;
  messageBody: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export default function DunningManagementDashboard() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<DunningDashboard | null>(null);
  const [cases, setCases] = useState<DunningCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<DunningCase | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard and cases data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, casesRes] = await Promise.all([
        fetch('/api/dunning?type=dashboard'),
        fetch(`/api/dunning?type=cases&limit=50${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`)
      ]);

      const [dashboardData, casesData] = await Promise.all([
        dashboardRes.json(),
        casesRes.json()
      ]);

      if (dashboardData.success) setDashboard(dashboardData.dashboard);
      if (casesData.success) setCases(casesData.cases || []);

      if (!dashboardData.success || !casesData.success) {
        setError('Some data failed to load');
      }

    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load dunning data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch communications for selected case
  const fetchCommunications = async (caseId: string) => {
    try {
      const response = await fetch(`/api/dunning?type=communications&caseId=${caseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCommunications(data.communications || []);
      }
    } catch (err) {
      console.error('Communications fetch error:', err);
    }
  };

  // Process retry for a case
  const processRetry = async (caseId: string) => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/dunning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_retry',
          caseId
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        setError('Failed to process retry');
      }
    } catch (err) {
      console.error('Process retry error:', err);
      setError('Failed to process retry');
    } finally {
      setRefreshing(false);
    }
  };

  // Recover case manually
  const recoverCase = async (caseId: string) => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/dunning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recover_case',
          caseId
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        setError('Failed to recover case');
      }
    } catch (err) {
      console.error('Recover case error:', err);
      setError('Failed to recover case');
    } finally {
      setRefreshing(false);
    }
  };

  // Send notification
  const sendNotification = async (caseId: string, type: string) => {
    try {
      const response = await fetch('/api/dunning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_notification',
          caseId,
          communicationType: type
        })
      });

      const data = await response.json();
      if (data.success) {
        if (selectedCase?.id === caseId) {
          fetchCommunications(caseId); // Refresh communications
        }
      } else {
        setError('Failed to send notification');
      }
    } catch (err) {
      console.error('Send notification error:', err);
      setError('Failed to send notification');
    }
  };

  // Load data on mount and filter change
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Load communications when case is selected
  useEffect(() => {
    if (selectedCase) {
      fetchCommunications(selectedCase.id);
    } else {
      setCommunications([]);
    }
  }, [selectedCase]);

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
      retrying: 'bg-yellow-100 text-yellow-800',
      grace_period: 'bg-orange-100 text-orange-800',
      suspended: 'bg-red-100 text-red-800',
      recovered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'retrying': return <RefreshCw className="h-4 w-4" />;
      case 'grace_period': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <PauseCircle className="h-4 w-4" />;
      case 'recovered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dunning data...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Dunning Management</h1>
          <p className="text-gray-600">Failed payment recovery and account management</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cases</option>
            <option value="active">Active</option>
            <option value="retrying">Retrying</option>
            <option value="grace_period">Grace Period</option>
            <option value="suspended">Suspended</option>
            <option value="recovered">Recovered</option>
          </select>

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
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.activeCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <PauseCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.suspendedAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard.totalOutstanding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.recoveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Recovery</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.avgRecoveryDays.toFixed(0)} days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Dunning Cases</h3>
          </div>
          
          <div className="p-6">
            {cases.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cases.map((caseItem) => (
                  <div 
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCase?.id === caseItem.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                          {getStatusIcon(caseItem.status)}
                          <span className="ml-1 capitalize">{caseItem.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{caseItem.organizationName}</p>
                          <p className="text-sm text-gray-600">{caseItem.planName} • {formatCurrency(caseItem.paymentAmount)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Attempt {caseItem.currentRetryAttempt}/{caseItem.maxRetryAttempts}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {caseItem.failureReason && (
                      <p className="mt-2 text-sm text-red-600">{caseItem.failureReason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No dunning cases found</p>
            )}
          </div>
        </div>

        {/* Case Details and Actions */}
        <div className="space-y-6">
          {/* Case Details */}
          {selectedCase ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Case Details</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Organization</label>
                  <p className="text-gray-900">{selectedCase.organizationName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan & Amount</label>
                  <p className="text-gray-900">{selectedCase.planName} • {formatCurrency(selectedCase.paymentAmount)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                    {getStatusIcon(selectedCase.status)}
                    <span className="ml-1 capitalize">{selectedCase.status.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Retry Progress</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(selectedCase.currentRetryAttempt / selectedCase.maxRetryAttempts) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedCase.currentRetryAttempt}/{selectedCase.maxRetryAttempts}
                    </span>
                  </div>
                </div>
                
                {selectedCase.nextRetryAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Next Retry</label>
                    <p className="text-gray-900">{new Date(selectedCase.nextRetryAt).toLocaleString()}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emails Sent</label>
                    <p className="text-gray-900">{selectedCase.emailsSent}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SMS Sent</label>
                    <p className="text-gray-900">{selectedCase.smsSent}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {selectedCase.status === 'active' || selectedCase.status === 'retrying' ? (
                    <>
                      <button
                        onClick={() => processRetry(selectedCase.id)}
                        disabled={refreshing}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Process Retry
                      </button>
                      <button
                        onClick={() => recoverCase(selectedCase.id)}
                        disabled={refreshing}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Recovered
                      </button>
                    </>
                  ) : null}
                  
                  <button
                    onClick={() => sendNotification(selectedCase.id, 'retry_reminder')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">Select a case to view details</p>
            </div>
          )}

          {/* Communications */}
          {selectedCase && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
              </div>
              
              <div className="p-6">
                {communications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {communications.map((comm) => (
                      <div key={comm.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium capitalize">
                              {comm.communicationType.replace('_', ' ')}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            comm.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comm.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comm.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comm.sentAt ? new Date(comm.sentAt).toLocaleString() : 'Not sent yet'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No communications yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}