'use client'

import { useState } from 'react'

export default function SyncTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const triggerSync = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log('🔄 Triggering Stripe product sync...')
      
      const response = await fetch('/api/stripe/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Sync completed successfully!', data)
        setResult(data)
      } else {
        console.error('❌ Sync failed:', data)
        setError(data.error || 'Sync failed')
      }
    } catch (err) {
      console.error('❌ Error triggering sync:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Stripe Product Sync Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <button
            onClick={triggerSync}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Syncing...' : 'Trigger Stripe Product Sync'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-medium mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
            <h3 className="text-green-400 font-medium mb-2">Sync Result</h3>
            <pre className="text-green-300 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}