'use client'

import { useState } from 'react'

export default function SignupFlowTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const addResult = (step: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { step, success, data, timestamp: new Date().toISOString() }])
  }

  const testCompleteFlow = async () => {
    setLoading(true)
    setResults([])
    setCurrentStep(0)

    try {
      // Step 1: Check if demo_admin already exists
      setCurrentStep(1)
      console.log('🔍 Step 1: Checking if demo_admin exists...')
      
      const checkResponse = await fetch('/api/debug/check-user?email=demo_admin@example.com')
      const checkData = await checkResponse.json()
      addResult('Check Existing User', true, checkData)

      // Step 2: Register demo_admin (if doesn't exist)
      setCurrentStep(2)
      console.log('👤 Step 2: Registering demo_admin...')
      
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo_admin@example.com',
          password: 'DemoPassword123!',
          firstName: 'Demo',
          lastName: 'Admin'
        })
      })
      
      const registerData = await registerResponse.json()
      addResult('Register User', registerResponse.ok, registerData)

      // Step 3: Test mock billing (create organization)
      setCurrentStep(3)
      console.log('💳 Step 3: Testing mock billing...')
      
      const billingResponse = await fetch('/api/billing/mock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedUsers: [{ role: 'admin', tier: 'admin_pro', count: 1 }],
          setupFee: 99,
          returnUrl: '/onboarding/organization',
          cancelUrl: '/billing',
          userEmail: 'demo_admin@example.com'
        })
      })
      
      const billingData = await billingResponse.json()
      addResult('Mock Billing', billingResponse.ok, billingData)

      // Step 4: Verify user and organization were created
      setCurrentStep(4)
      console.log('✅ Step 4: Verifying final state...')
      
      const finalCheckResponse = await fetch('/api/debug/check-user?email=demo_admin@example.com')
      const finalCheckData = await finalCheckResponse.json()
      addResult('Final Verification', true, finalCheckData)

      console.log('🎉 Complete signup flow test finished!')

    } catch (error) {
      console.error('💥 Test failed:', error)
      addResult('Test Error', false, { error: String(error) })
    } finally {
      setLoading(false)
      setCurrentStep(0)
    }
  }

  const clearTestData = async () => {
    setLoading(true)
    try {
      console.log('🧹 Clearing test data...')
      
      // This would require an admin API to clean up test data
      // For now, just log what would be cleared
      addResult('Clear Test Data', true, { 
        message: 'Manual cleanup required',
        instructions: [
          'Delete demo_admin user from users table',
          'Delete related organization from organizations table',
          'Delete organization_memberships records',
          'Delete billing_sessions records'
        ]
      })
      
    } catch (error) {
      addResult('Clear Error', false, { error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const stepNames = [
    'Idle',
    'Checking Existing User',
    'Registering User', 
    'Creating Organization',
    'Final Verification'
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Complete Signup Flow Test</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={testCompleteFlow}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? `${stepNames[currentStep]}...` : 'Run Complete Test'}
        </button>
        
        <button
          onClick={clearTestData}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Clear Test Data
        </button>
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Step {currentStep}: {stepNames[currentStep]}</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results</h2>
        
        {results.length === 0 && (
          <p className="text-gray-500">No test results yet. Click "Run Complete Test" to begin.</p>
        )}
        
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                result.success ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {result.success ? '✓' : '✗'}
              </span>
              <h3 className="font-semibold">{result.step}</h3>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            
            <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-60">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {/* Manual Test Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Manual Test Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to <a href="/register" className="text-blue-600 hover:underline">/register</a> and create demo_admin@example.com</li>
          <li>Check <a href="/api/debug/check-user?email=demo_admin@example.com" className="text-blue-600 hover:underline">user debug</a> to verify registration</li>
          <li>Go to <a href="/billing" className="text-blue-600 hover:underline">/billing</a> and enable "Development Mode"</li>
          <li>Configure team plan and click "Create Test Organization"</li>
          <li>Verify you're redirected to <a href="/onboarding/organization" className="text-blue-600 hover:underline">/onboarding/organization</a></li>
          <li>Check debug endpoint again to verify organization was created</li>
        </ol>
      </div>
    </div>
  )
}
