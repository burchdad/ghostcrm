'use client';

import { useState } from 'react';

interface TestResult {
  status: string;
  message: string;
  data?: any;
  error?: any;
}

export default function TestManualActivationOptimized() {
  const [email, setEmail] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testStatusAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subdomains/status?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      setTestResults(prev => [...prev, {
        status: 'Status Check',
        message: `HTTP ${response.status}`,
        data: data
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        status: 'Status Check',
        message: 'Error',
        error: error
      }]);
    }
    setIsLoading(false);
  };

  const testManualActivation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subdomains/manual-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });
      
      const data = await response.json();
      
      setTestResults(prev => [...prev, {
        status: 'Manual Activation',
        message: `HTTP ${response.status}`,
        data: data
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        status: 'Manual Activation',
        message: 'Error',
        error: error
      }]);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Manual Activation (Optimized)
          </h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Owner Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="Enter owner email address..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={testStatusAPI}
                disabled={isLoading || !email}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Test Status API
              </button>
              
              <button
                onClick={testManualActivation}
                disabled={isLoading || !email}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Test Manual Activation
              </button>
              
              <button
                onClick={clearResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Results
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
            
            {testResults.length === 0 && (
              <p className="text-gray-500 italic">No tests run yet.</p>
            )}
            
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{result.status}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.message.includes('200') 
                      ? 'bg-green-100 text-green-800'
                      : result.message.includes('Error')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.message}
                  </span>
                </div>
                
                {result.data && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                    <pre className="bg-white p-2 rounded text-xs border overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.error && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700 mb-1">Error:</p>
                    <pre className="bg-red-50 p-2 rounded text-xs border border-red-200 overflow-x-auto">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Testing Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Both APIs now use direct owner_email lookup from subdomain table</li>
              <li>• This bypasses the users table to avoid "User not found" errors</li>
              <li>• The APIs should work for any valid owner email in subdomain table</li>
              <li>• Test with actual owner emails from your database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}