'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

export default function AuthDebugPage() {
  const { user, isLoading } = useAuth()
  const [authMeData, setAuthMeData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch directly from /api/auth/me to see what we get
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        console.log('Direct /api/auth/me response:', data)
        setAuthMeData(data)
      })
      .catch(err => {
        console.error('Error fetching auth data:', err)
        setError(err.message)
      })
  }, [])

  if (isLoading) {
    return <div className="p-8">Loading authentication state...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AuthContext Data */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">AuthContext Data</h2>
          <pre className="bg-white p-3 rounded text-sm overflow-auto">
            {JSON.stringify({ 
              user, 
              isLoading,
              hasUser: !!user,
              userRole: user?.role,
              tenantId: user?.tenantId 
            }, null, 2)}
          </pre>
        </div>

        {/* Direct API Response */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Direct /api/auth/me Response</h2>
          <pre className="bg-white p-3 rounded text-sm overflow-auto">
            {JSON.stringify(authMeData, null, 2)}
          </pre>
          {error && (
            <div className="mt-2 text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>

        {/* JWT Cookie Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Cookie Information</h2>
          <pre className="bg-white p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              hasGhostcrmJwt: typeof document !== 'undefined' ? document.cookie.includes('ghostcrm_jwt') : 'SSR',
              allCookies: typeof document !== 'undefined' ? (document.cookie || 'No cookies found') : 'SSR mode'
            }, null, 2)}
          </pre>
        </div>

        {/* Access Tests */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Access Tests</h2>
          <div className="space-y-2">
            <div>
              <strong>Can access billing:</strong> {user?.role === 'owner' ? '✅ YES' : '❌ NO'}
            </div>
            <div>
              <strong>User role:</strong> {user?.role || 'No role'}
            </div>
            <div>
              <strong>Expected role:</strong> owner
            </div>
            <div>
              <strong>Organization/Tenant ID:</strong> {user?.tenantId || 'No tenant ID'}
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href="/billing" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Billing Access
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-4 border-t">
        <a href="/dashboard" className="text-blue-600 hover:underline mr-4">← Back to Dashboard</a>
        <a href="/register" className="text-blue-600 hover:underline">Register New User</a>
      </div>
    </div>
  )
}