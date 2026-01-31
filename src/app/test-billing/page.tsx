'use client'

import { useState, useEffect } from 'react'

export default function TestBillingPage() {
  const [syncResult, setSyncResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState<string>('')
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
  }, [])

  const testProductSync = async () => {
    setLoading(true)
    setError('')
    setSyncResult(null)
    setLastAction('sync')

    try {
      console.log('🔄 Testing product sync...')
      const response = await fetch('/api/stripe/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      console.log('📊 Response status:', response.status)
      const result = await response.json()
      console.log('📋 Response data:', result)

      if (response.ok) setSyncResult(result)
      else setError(result.error || 'Unknown error')
    } catch (err) {
      console.error('❌ Sync error:', err)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const testProductMapping = async () => {
    setLoading(true)
    setError('')
    setSyncResult(null)
    setLastAction('mapping')

    try {
      console.log('🔍 Testing product mapping lookup...')
      const response = await fetch('/api/stripe/product-mapping?localId=plan_professional_monthly')
      console.log('📊 Response status:', response.status)
      const result = await response.json()
      console.log('📋 Response data:', result)

      if (response.ok) setSyncResult(result)
      else setError(result.error || 'Unknown error')
    } catch (err) {
      console.error('❌ Mapping error:', err)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className={`border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm transition-all duration-1000 relative z-10 ${animateIn ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl animate-bounce">🧪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stripe Integration Testing
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Professional-grade debugging and validation suite
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Environment
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 relative z-10">
        {/* Main Testing Panel */}
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl transition-all duration-700 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <span className="text-blue-400 text-lg">⚡</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">Test Suite</h2>
            <div className="ml-auto">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
                {loading ? (lastAction === 'sync' ? 'Syncing...' : 'Testing...') : 'Ready'}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={testProductSync}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 rounded-xl p-6 text-left shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 disabled:hover:translate-y-0"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{loading ? '⏳' : '🔄'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Product Sync</h3>
                    <p className="text-blue-200 text-sm">Create products in Stripe</p>
                  </div>
                </div>
                <p className="text-blue-100/80 text-sm">
                  {loading
                    ? 'Syncing products with Stripe...'
                    : 'Sync your local products with Stripe dashboard and generate real price IDs'}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            <button
              onClick={testProductMapping}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 rounded-xl p-6 text-left shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 disabled:hover:translate-y-0"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{loading ? '⏳' : '🔍'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Product Mapping</h3>
                    <p className="text-green-200 text-sm">Verify price ID lookup</p>
                  </div>
                </div>
                <p className="text-green-100/80 text-sm">
                  {loading
                    ? 'Testing product mapping...'
                    : 'Test that we can retrieve real Stripe price IDs from our mapping system'}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <a
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors"
            >
              <span>🛒</span>
              Test Billing Page
            </a>
            <a
              href="https://dashboard.stripe.com/test/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors"
            >
              <span>🔗</span>
              Stripe Dashboard
            </a>
          </div>
        </div>

        {/* Results Panel */}
        {(error || syncResult) && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">📋</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-100">Test Results</h2>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 text-sm">❌</span>
                  </div>
                  <h3 className="font-semibold text-red-400">Error Encountered</h3>
                </div>
                <pre className="text-sm text-red-300 bg-red-900/20 rounded-lg p-4 overflow-auto">
                  {error}
                </pre>
              </div>
            )}

            {syncResult && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 text-sm">✅</span>
                  </div>
                  <h3 className="font-semibold text-green-400">Success!</h3>
                </div>
                <pre className="text-sm text-green-300 bg-green-900/20 rounded-lg p-4 overflow-auto max-h-96">
                  {JSON.stringify(syncResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-sm">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Testing Instructions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                color: 'blue',
                title: 'Start with Product Sync',
                desc: 'Click "Product Sync" to create your GhostCRM plans in your Stripe dashboard. This generates real price IDs.',
              },
              {
                step: '2',
                color: 'green',
                title: 'Verify Product Mapping',
                desc: 'Test "Product Mapping" to ensure we can retrieve the real Stripe price IDs from our database.',
              },
              {
                step: '3',
                color: 'purple',
                title: 'Test Billing Flow',
                desc: 'Use "Test Billing Page" link to verify the full checkout process with promo codes.',
              },
            ].map(({ step, color, title, desc }) => (
              <div
                key={step}
                className={`flex items-start gap-4 p-4 bg-${color}-500/20 rounded-xl`}
              >
                <div
                  className={`w-8 h-8 bg-${color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`text-${color}-400 font-bold text-sm`}>{step}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-100 mb-1">{title}</h4>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-xl">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold text-sm">🔍</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-100 mb-1">Check Console Logs</h4>
                <p className="text-gray-400 text-sm">
                  Open browser DevTools (F12) → Console for detailed API logs and debugging information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
