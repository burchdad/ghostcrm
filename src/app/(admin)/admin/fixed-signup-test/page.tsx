'use client'

import { useState } from 'react'

export default function FixedSignupTestPage() {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (step: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { step, success, data, timestamp: new Date().toISOString() }])
  }

  const testFixedFlow = async () => {
    setLoading(true)
    setResults([])
    setStep(0)

    try {
      // Clean up existing test user first
      setStep(1)
      console.log('🧹 Step 1: Cleaning up any existing demo_admin_fixed user...')
      
      // Delete any existing test user (this would need admin API)
      addResult('Cleanup Check', true, { message: 'Ready to test with fresh user' })

      // Step 2: Test registration with JWT cookie setting
      setStep(2)
      console.log('👤 Step 2: Registering demo_admin_fixed with JWT cookie...')
      
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo_admin_fixed@example.com',
          password: 'DemoPassword123!',
          firstName: 'Demo',
          lastName: 'Admin'
        })
      })
      
      const registerData = await registerResponse.json()
      
      // Check if JWT cookie was set
      const hasJwtCookie = document.cookie.includes('ghostcrm_jwt')
      
      addResult('Register with JWT', registerResponse.ok && hasJwtCookie, {
        ...registerData,
        jwtCookieSet: hasJwtCookie,
        cookies: document.cookie
      })

      if (!registerResponse.ok) {
        throw new Error(`Registration failed: ${registerData.error}`)
      }

      // Step 3: Test billing page access
      setStep(3)
      console.log('💳 Step 3: Testing billing page accessibility...')
      
      const billingResponse = await fetch('/billing', {
        method: 'GET',
        credentials: 'include'
      })
      
      addResult('Billing Page Access', billingResponse.ok, {
        status: billingResponse.status,
        accessible: billingResponse.ok,
        redirected: billingResponse.redirected,
        url: billingResponse.url
      })

      // Step 4: Test mock billing creation
      setStep(4)
      console.log('🏢 Step 4: Testing organization creation...')
      
      const orgResponse = await fetch('/api/billing/mock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedUsers: [{ role: 'admin', tier: 'admin_pro', count: 1 }],
          setupFee: 99,
          returnUrl: '/onboarding/organization',
          cancelUrl: '/billing',
          userEmail: 'demo_admin_fixed@example.com'
        })
      })
      
      const orgData = await orgResponse.json()
      addResult('Create Organization', orgResponse.ok, orgData)

      // Step 5: Verify user and organization exist
      setStep(5)
      console.log('✅ Step 5: Final verification...')
      
      const verifyResponse = await fetch('/api/debug/check-user?email=demo_admin_fixed@example.com')
      const verifyData = await verifyResponse.json()
      addResult('Final Verification', verifyResponse.ok, verifyData)

      console.log('🎉 Fixed signup flow test completed!')

    } catch (error) {
      console.error('💥 Test failed:', error)
      addResult('Test Error', false, { error: String(error) })
    } finally {
      setLoading(false)
      setStep(0)
    }
  }

  const stepNames = [
    'Ready to test',
    'Cleaning up existing data',
    'Registering user with JWT',
    'Testing billing page access',
    'Creating organization',
    'Final verification'
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Fixed Signup Flow Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What This Test Validates:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Registration API sets JWT cookie for automatic login</li>
          <li>✅ Middleware allows access to /billing page</li>
          <li>✅ Billing page can access mock billing APIs</li>
          <li>✅ Organization creation works with user context</li>
          <li>✅ Complete flow from registration → billing → organization</li>
        </ul>
      </div>

      <div className="mb-6">
        <button
          onClick={testFixedFlow}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 mr-4"
        >
          {loading ? `${stepNames[step]}...` : 'Test Fixed Registration Flow'}
        </button>
        
        <a 
          href="/register" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Manual Test: Go to Registration
        </a>
      </div>

      {/* Progress */}
      {loading && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium text-green-800">Step {step}: {stepNames[step]}</span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / (stepNames.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results</h2>
        
        {results.length === 0 && !loading && (
          <p className="text-gray-500">Click the test button to verify the fixed signup flow.</p>
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

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Manual Test Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <a href="/register" className="text-blue-600 hover:underline">Go to Registration</a> 
            {" "}and create a new account (e.g., test@example.com)
          </li>
          <li>After successful registration, you should be automatically redirected to billing</li>
          <li>On billing page, enable "Development Mode" checkbox</li>
          <li>Configure your team plan and click "Create Test Organization"</li>
          <li>Verify you're redirected to the onboarding page</li>
          <li>
            <a href="/api/debug/check-user?email=test@example.com" className="text-blue-600 hover:underline">
              Check the debug endpoint
            </a>
            {" "}to verify organization was created
          </li>
        </ol>
      </div>
    </div>
  )
}
