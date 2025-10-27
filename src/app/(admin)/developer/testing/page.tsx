"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("test-runner");
  const [selectedTestSuite, setSelectedTestSuite] = useState("api_tests");
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const testSuites = [
    {
      id: "api_tests",
      name: "API Endpoints",
      description: "Test all REST API endpoints",
      tests: 47,
      lastRun: "2025-10-22T14:30:00Z",
      status: "passed",
      coverage: 94.2,
      duration: "2m 15s"
    },
    {
      id: "webhook_tests",
      name: "Webhook Delivery",
      description: "Test webhook event delivery",
      tests: 23,
      lastRun: "2025-10-22T13:15:00Z", 
      status: "failed",
      coverage: 87.5,
      duration: "1m 42s"
    },
    {
      id: "integration_tests",
      name: "Third-party Integrations",
      description: "Test external API connections",
      tests: 15,
      lastRun: "2025-10-22T12:00:00Z",
      status: "passed",
      coverage: 92.8,
      duration: "3m 30s"
    },
    {
      id: "performance_tests",
      name: "Performance & Load",
      description: "Load testing and performance benchmarks",
      tests: 8,
      lastRun: "2025-10-22T09:30:00Z",
      status: "warning",
      coverage: 100.0,
      duration: "15m 22s"
    }
  ];

  const testResults = [
    {
      id: "test_001",
      name: "POST /api/v1/leads",
      suite: "API Endpoints",
      status: "passed",
      duration: "145ms",
      assertions: 8,
      timestamp: "2025-10-22T14:30:15Z",
      message: "All assertions passed"
    },
    {
      id: "test_002",
      name: "GET /api/v1/deals?stage=won",
      suite: "API Endpoints", 
      status: "passed",
      duration: "89ms",
      assertions: 5,
      timestamp: "2025-10-22T14:30:10Z",
      message: "Response time within limits"
    },
    {
      id: "test_003",
      name: "Webhook: lead.created",
      suite: "Webhook Delivery",
      status: "failed",
      duration: "2.3s",
      assertions: 3,
      timestamp: "2025-10-22T13:15:30Z",
      message: "Timeout: No response from webhook endpoint"
    },
    {
      id: "test_004",
      name: "Salesforce: Contact Sync",
      suite: "Third-party Integrations",
      status: "passed",
      duration: "567ms",
      assertions: 12,
      timestamp: "2025-10-22T12:00:45Z",
      message: "Data synchronization successful"
    }
  ];

  const performanceMetrics = [
    {
      endpoint: "/api/v1/leads",
      method: "GET",
      avgResponseTime: "145ms",
      p95ResponseTime: "289ms",
      requestsPerSecond: 450,
      errorRate: "0.2%",
      status: "good"
    },
    {
      endpoint: "/api/v1/deals",
      method: "POST", 
      avgResponseTime: "234ms",
      p95ResponseTime: "456ms",
      requestsPerSecond: 280,
      errorRate: "0.1%",
      status: "good"
    },
    {
      endpoint: "/api/v1/contacts",
      method: "PUT",
      avgResponseTime: "567ms",
      p95ResponseTime: "1.2s",
      requestsPerSecond: 120,
      errorRate: "1.8%",
      status: "warning"
    },
    {
      endpoint: "/api/v1/companies",
      method: "DELETE",
      avgResponseTime: "89ms",
      p95ResponseTime: "156ms",
      requestsPerSecond: 50,
      errorRate: "0.0%",
      status: "good"
    }
  ];

  const testTemplates = [
    {
      name: "API Endpoint Test",
      description: "Test HTTP endpoints with various scenarios",
      type: "api",
      icon: "🔌",
      template: {
        method: "GET",
        url: "/api/v1/resource",
        headers: {},
        assertions: ["status === 200", "response.data.length > 0"]
      }
    },
    {
      name: "Webhook Test",
      description: "Test webhook delivery and payload validation",
      type: "webhook",
      icon: "📡",
      template: {
        event: "resource.created",
        payload: {},
        assertions: ["webhook received", "payload valid"]
      }
    },
    {
      name: "Integration Test",
      description: "Test third-party API integration",
      type: "integration",
      icon: "🔗",
      template: {
        integration: "salesforce",
        operation: "sync_contacts",
        assertions: ["connection established", "data synced"]
      }
    },
    {
      name: "Performance Test",
      description: "Load test with concurrent requests",
      type: "performance",
      icon: "⚡",
      template: {
        endpoint: "/api/v1/resource",
        concurrency: 10,
        duration: "60s",
        assertions: ["avg_response_time < 500ms"]
      }
    }
  ];

  const handleRunTests = async (suiteId: string) => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    // Simulate test execution
    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsRunningTests(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const renderTestRunnerTab = () => (
    <div className="space-y-6">
      {/* Test Suites */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Test Suites</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Suite</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Tests</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Coverage</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Duration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Last Run</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testSuites.map((suite) => (
                <tr key={suite.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{suite.name}</div>
                    <div className="text-sm text-slate-600">{suite.description}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{suite.tests}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      suite.status === "passed" 
                        ? "bg-green-100 text-green-800"
                        : suite.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {suite.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-slate-800">
                        {suite.coverage}%
                      </div>
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            suite.coverage >= 90 ? "bg-green-500" :
                            suite.coverage >= 70 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${suite.coverage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {suite.duration}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {new Date(suite.lastRun).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRunTests(suite.id)}
                        disabled={isRunningTests}
                        className="text-blue-600 hover:text-blue-800 text-sm disabled:text-slate-400"
                      >
                        {isRunningTests && selectedTestSuite === suite.id ? "Running..." : "Run"}
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        View
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm">
                        Configure
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Progress */}
      {isRunningTests && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Running Tests</h3>
          <div className="text-center">
            <div className="text-4xl mb-4">🧪</div>
            <div className="text-lg font-medium text-slate-800 mb-2">Executing Test Suite...</div>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-slate-600">{testProgress}% complete</div>
          </div>
        </div>
      )}

      {/* Recent Test Results */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Test Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Test Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Suite</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Duration</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Assertions</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Message</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result) => (
                <tr key={result.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{result.name}</code>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{result.suite}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.status === "passed" 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {result.duration}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {result.assertions} assertions
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {result.message}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {new Date(result.timestamp).toLocaleString()}
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
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">API Performance Metrics</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Endpoint</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Method</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Avg Response</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">P95 Response</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Requests/sec</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Error Rate</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric, index) => (
                <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{metric.endpoint}</code>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                      metric.method === 'GET' ? 'bg-green-100 text-green-800' :
                      metric.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      metric.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.method}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {metric.avgResponseTime}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {metric.p95ResponseTime}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {metric.requestsPerSecond}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                    {metric.errorRate}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      metric.status === "good" 
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {metric.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Response Time Trends</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-2">📈</div>
              <div>Response time chart would be displayed here</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Request Volume</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-2">📊</div>
              <div>Request volume chart would be displayed here</div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Test Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Load Test Configuration</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Endpoint</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="/api/v1/leads">GET /api/v1/leads</option>
                <option value="/api/v1/deals">GET /api/v1/deals</option>
                <option value="/api/v1/contacts">GET /api/v1/contacts</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Concurrent Users</label>
                <input 
                  type="number" 
                  placeholder="10"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (seconds)</label>
                <input 
                  type="number" 
                  placeholder="60"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ramp-up Time (seconds)</label>
              <input 
                type="number" 
                placeholder="10"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-4">Expected Thresholds</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Max Response Time</span>
                <span className="text-sm font-mono text-slate-600">500ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Max Error Rate</span>
                <span className="text-sm font-mono text-slate-600">1%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Min Requests/sec</span>
                <span className="text-sm font-mono text-slate-600">100</span>
              </div>
            </div>
            
            <button className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Load Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Test Templates</h3>
        <p className="text-slate-600 mb-6">
          Use these templates to quickly create comprehensive tests for your API and integrations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testTemplates.map((template, index) => (
            <div key={index} className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{template.name}</div>
                  <div className="text-sm text-slate-600">{template.description}</div>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-3 mb-4">
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{JSON.stringify(template.template, null, 2)}</code>
                </pre>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Test Builder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Custom Test Builder</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Test Name</label>
              <input 
                type="text" 
                placeholder="My Custom Test"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Test Type</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="api">API Test</option>
                <option value="webhook">Webhook Test</option>
                <option value="integration">Integration Test</option>
                <option value="performance">Performance Test</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target URL</label>
              <input 
                type="url" 
                placeholder="https://api.ghostcrm.com/v1/endpoint"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">HTTP Method</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assertions</label>
              <textarea 
                placeholder="response.status === 200&#10;response.data.length > 0&#10;response.time < 500"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-4">Generated Test Code</h4>
            <div className="bg-slate-900 rounded-lg p-4 h-80 overflow-y-auto">
              <pre className="text-green-400 text-sm">
                <code>{`describe('My Custom Test', () => {
  it('should test API endpoint', async () => {
    const response = await fetch('https://api.ghostcrm.com/v1/endpoint', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    // Assertions
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
    
    // Performance assertion
    expect(response.time).toBeLessThan(500);
  });
});`}</code>
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                Create Test
              </button>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🧪</span>
            Testing & Quality Assurance
          </h1>
          <p className="text-slate-600 mt-2">Comprehensive testing suite for APIs, integrations, and performance</p>
        </div>

        {/* Test Summary Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold">93 Total Tests</div>
              <div className="text-green-100">Across 4 test suites</div>
            </div>
            <div>
              <div className="text-2xl font-bold">91.7% Pass Rate</div>
              <div className="text-green-100">Last test run</div>
            </div>
            <div>
              <div className="text-2xl font-bold">93.6% Coverage</div>
              <div className="text-green-100">Code coverage</div>
            </div>
            <div>
              <div className="text-2xl font-bold">145ms</div>
              <div className="text-green-100">Avg response time</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "test-runner", label: "Test Runner", icon: "🏃" },
                { id: "performance", label: "Performance", icon: "⚡" },
                { id: "templates", label: "Test Templates", icon: "📋" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
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
          {activeTab === "test-runner" && renderTestRunnerTab()}
          {activeTab === "performance" && renderPerformanceTab()}
          {activeTab === "templates" && renderTemplatesTab()}
        </div>
      </div>
    </div>
  );
}
