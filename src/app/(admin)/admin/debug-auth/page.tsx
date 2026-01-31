'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugAuthPage() {
  const router = useRouter()
  const [cookies, setCookies] = useState('')
  const [localStorage, setLocalStorage] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)
    
    // Get all localStorage
    const localData: {[key: string]: string} = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) {
        localData[key] = window.localStorage.getItem(key) || ''
      }
    }
    setLocalStorage(localData)
  }, [])

  const clearAllAuth = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/") 
    })
    
    // Clear localStorage
    window.localStorage.clear()
    
    alert('All authentication data cleared! Refreshing page...')
    window.location.reload()
  }

  const testRegistration = () => {
    router.push('/register')
  }

  const testBilling = () => {
    router.push('/billing')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={clearAllAuth}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Clear All Auth Data
        </button>
        
        <button
          onClick={testRegistration}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test Registration
        </button>
        
        <button
          onClick={testBilling}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Test Billing Page
        </button>
      </div>

      {/* Current Cookies */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Current Cookies:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {cookies || 'No cookies found'}
        </pre>
      </div>

      {/* Current localStorage */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Current localStorage:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {Object.keys(localStorage).length > 0 ? JSON.stringify(localStorage, null, 2) : 'No localStorage data'}
        </pre>
      </div>

      {/* Flow Testing */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Expected Flow:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Start Free Trial" → Should go to registration page</li>
          <li>Fill out registration form → Should redirect to billing page</li>
          <li>Enable development mode on billing → Should create test organization</li>
          <li>Complete billing → Should redirect to onboarding</li>
          <li>Complete onboarding → Should access dashboard</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <strong>Current Issue:</strong> Clicking "Start Free Trial" goes to login, then immediately to dashboard
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Quick Debug Links:</h3>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:underline">🏠 Home/Marketing Page</a>
          <a href="/register" className="block text-blue-600 hover:underline">📝 Registration Page</a>
          <a href="/login" className="block text-blue-600 hover:underline">🔑 Login Page</a>
          <a href="/billing" className="block text-blue-600 hover:underline">💳 Billing Page</a>
          <a href="/dashboard" className="block text-blue-600 hover:underline">📊 Dashboard</a>
          <a href="/api/debug/check-user?email=demo_admin@example.com" className="block text-blue-600 hover:underline">
            🔍 Check demo_admin user
          </a>
        </div>
      </div>
    </div>
  )
}
