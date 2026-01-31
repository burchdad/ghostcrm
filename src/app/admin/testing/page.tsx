/**
 * ADMIN TESTING DASHBOARD - Main Page
 * Secure admin-only interface for running comprehensive tests
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: string;
}

import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function AdminTestingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [testStatus, setTestStatus] = useState('idle'); // idle, running, completed, failed
  const [activeTests, setActiveTests] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState(['main']);
  const [selectedTestSuites, setSelectedTestSuites] = useState(['all']);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<EventSource | null>(null);

  const testSuites = [
    { id: 'all', name: 'Complete Test Suite', description: 'All test categories', critical: true },
    { id: 'ui', name: 'UI Components', description: 'Buttons, forms, modals', critical: true },
    { id: 'pages', name: 'Page Functionality', description: 'Routes and navigation', critical: true },
    { id: 'api', name: 'API Endpoints', description: 'Backend functionality', critical: true },
    { id: 'auth', name: 'Authentication', description: 'Security and access', critical: true },
    { id: 'db', name: 'Database Integration', description: 'Data operations', critical: false },
    { id: 'platform', name: 'Cross-Platform', description: 'Responsive and accessibility', critical: false }
  ];

  useEffect(() => {
    // Check admin authentication
    checkAdminAccess();
    
    // Load initial data
    loadTenants();
    loadTestSchedules();
    loadRecentResults();
    
    // Setup real-time updates
    setupRealTimeUpdates();
    
    return () => {
      if (realTimeUpdates) {
        realTimeUpdates.close();
      }
    };
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        router.push('/login?redirect=/admin/testing');
        return;
      }
      
      const userData = await response.json();
      
      // Verify super admin role
      if (userData.role !== 'super_admin' && userData.email !== process.env.NEXT_PUBLIC_OWNER_EMAIL) {
        router.push('/dashboard');
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Admin access check failed:', error);
      router.push('/login');
    }
  };

  const setupRealTimeUpdates = () => {
    const eventSource = new EventSource('/api/admin/testing/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'test_progress':
          setActiveTests(current => 
            current.map(test => 
              test.id === data.testId 
                ? { ...test, progress: data.progress, status: data.status }
                : test
            )
          );
          break;
          
        case 'test_completed':
          setActiveTests(current => 
            current.filter(test => test.id !== data.testId)
          );
          loadRecentResults();
          break;
          
        case 'test_failed':
          setTestStatus('failed');
          setActiveTests(current => 
            current.map(test => 
              test.id === data.testId 
                ? { ...test, status: 'failed', error: data.error }
                : test
            )
          );
          break;
      }
    };
    
    setRealTimeUpdates(eventSource);
  };

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants/list');
      const tenantsData = await response.json();
      setTenants([
        { id: 'main', name: 'Main Application', url: process.env.NEXT_PUBLIC_APP_URL },
        ...tenantsData
      ]);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const loadTestSchedules = async () => {
    try {
      const response = await fetch('/api/admin/testing/schedules');
      const schedulesData = await response.json();
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadRecentResults = async () => {
    try {
      const response = await fetch('/api/admin/testing/results?limit=10');
      const resultsData = await response.json();
      setTestResults(resultsData);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const runTests = async () => {
    if (testStatus === 'running') return;
    
    setTestStatus('running');
    
    try {
      const response = await fetch('/api/admin/testing/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenants: selectedTenants,
          testSuites: selectedTestSuites,
          executionType: 'manual'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start tests');
      }
      
      const result = await response.json();
      setActiveTests(result.executions);
      
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestStatus('failed');
    }
  };

  const stopTests = async () => {
    try {
      await fetch('/api/admin/testing/stop', {
        method: 'POST'
      });
      
      setTestStatus('idle');
      setActiveTests([]);
    } catch (error) {
      console.error('Failed to stop tests:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPassRateColor = (passRate) => {
    if (passRate >= 95) return 'text-green-600';
    if (passRate >= 85) return 'text-yellow-600';
    if (passRate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <span className="mr-3">🛡️</span>
                Cybersecurity Command Center
              </h1>
              <p className="text-blue-100">Centralized monitoring • Functionality validation • Security oversight</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-blue-200">
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                  Owner Access Only
                </span>
                <span>•</span>
                <span>Real-time monitoring across all systems</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 px-3 py-1 rounded-full">
                <span className="text-sm text-blue-100">🔒 Secured Access: {user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${testStatus === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-sm font-medium capitalize text-white">{testStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Security Testing Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Threat Assessment Configuration */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-1 bg-blue-600 rounded">
                  <span className="text-sm">🔍</span>
                </div>
                <h2 className="text-xl font-semibold text-white">Threat Assessment Configuration</h2>
              </div>
              
              {/* Target Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    🎯 Target Systems
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-900 p-3 rounded border border-slate-600">
                    {tenants.map(tenant => (
                      <label key={tenant.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTenants([...selectedTenants, tenant.id]);
                            } else {
                              setSelectedTenants(selectedTenants.filter(id => id !== tenant.id));
                            }
                          }}
                          className="rounded border-slate-500 text-blue-600 focus:ring-blue-500 bg-slate-700"
                        />
                        <span className="ml-2 text-sm text-slate-200">{tenant.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    🔐 Security Test Suites
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-900 p-3 rounded border border-slate-600">
                    {testSuites.map(suite => (
                      <label key={suite.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTestSuites.includes(suite.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTestSuites([...selectedTestSuites, suite.id]);
                            } else {
                              setSelectedTestSuites(selectedTestSuites.filter(id => id !== suite.id));
                            }
                          }}
                          className="rounded border-slate-500 text-blue-600 focus:ring-blue-500 bg-slate-700"
                        />
                        <span className="ml-2 text-sm text-slate-200">
                          {suite.name}
                          {suite.critical && <span className="text-red-400 ml-1">⚠️</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Execute Button */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={runTests}
                  disabled={testStatus === 'running' || selectedTenants.length === 0}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  <span className="mr-2">🚀</span>
                  {testStatus === 'running' ? 'Security Scan Running...' : 'Launch Security Scan'}
                </button>
                
                {testStatus === 'running' && (
                  <button
                    onClick={stopTests}
                    className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span className="mr-2">🛑</span>
                    Stop Scan
                  </button>
                )}
              </div>
            </div>

            {/* Active Security Scans */}
            {activeTests.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-1 bg-yellow-600 rounded">
                    <span className="text-sm">⚡</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Active Security Scans</h2>
                </div>
                <div className="space-y-4">
                  {activeTests.map(test => (
                    <div key={test.id} className="border border-slate-600 bg-slate-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <span className="font-medium text-white">{test.tenant_name}</span>
                          <span className="text-sm text-slate-400">- {test.test_suite}</span>
                        </div>
                        <span className="text-sm text-slate-400">
                          {test.progress ? `${test.progress}%` : 'Initializing scan...'}
                        </span>
                      </div>
                      
                      {test.progress && (
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${test.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {test.error && (
                        <div className="mt-2 text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-800">
                          ⚠️ Error: {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Intelligence Reports */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-green-600 rounded">
                    <span className="text-sm">📊</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Security Intelligence Reports</h2>
                </div>
                <button
                  onClick={loadRecentResults}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  🔄 Refresh Data
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-600">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        System Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Security Suite
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Scan Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Threat Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-700">
                    {testResults.map(result => (
                      <tr key={result.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {result.tenant_name || 'Main App'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {result.test_suite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${getPassRateColor(result.pass_rate)}`}>
                            {result.pass_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {result.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(result.executed_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusIcon(result.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Intelligence Sidebar */}
          <div className="space-y-6">
            
            {/* Threat Overview */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-1 bg-purple-600 rounded">
                  <span className="text-sm">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Threat Overview</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Protected Systems</span>
                  <span className="font-semibold text-green-400">{tenants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Active Scans</span>
                  <span className="font-semibold text-yellow-400">{activeTests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Automated Checks</span>
                  <span className="font-semibold text-blue-400">{schedules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Security Level</span>
                  <span className="font-semibold text-green-400">🔒 HIGH</span>
                </div>
              </div>
            </div>

            {/* Security Control Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-1 bg-orange-600 rounded">
                  <span className="text-sm">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Control Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center px-3 py-2 text-left text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200">
                  <span className="mr-2">📊</span>
                  Security Reports
                </button>
                <button className="w-full flex items-center px-3 py-2 text-left text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200">
                  <span className="mr-2">⚙️</span>
                  Scan Schedules
                </button>
                <button className="w-full flex items-center px-3 py-2 text-left text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200">
                  <span className="mr-2">🏥</span>
                  System Health
                </button>
                <button className="w-full flex items-center px-3 py-2 text-left text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200">
                  <span className="mr-2">🚨</span>
                  Alert Matrix
                </button>
              </div>
            </div>

            {/* Scheduled Tests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Scheduled Tests</h3>
              {schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.slice(0, 3).map(schedule => (
                    <div key={schedule.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-sm">{schedule.name}</div>
                      <div className="text-xs text-gray-500">
                        Next: {new Date(schedule.next_run).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No scheduled tests configured</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}