'use client'

import { useState } from 'react'

export default function StripeDebugPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any>(null)
  const [prices, setPrices] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const listStripeProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe/list-products', {
        method: 'GET',
      })
      
      const data = await response.json()
      if (response.ok) {
        setProducts(data)
      } else {
        setError(data.error || 'Failed to list products')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const listStripePrices = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe/list-prices', {
        method: 'GET',
      })
      
      const data = await response.json()
      if (response.ok) {
        setPrices(data)
      } else {
        setError(data.error || 'Failed to list prices')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stripe/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      if (response.ok) {
        alert('Sync completed! Check console for details.')
        console.log('Sync result:', data)
      } else {
        setError(data.error || 'Sync failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Stripe Debug Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={listStripeProducts}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'List Stripe Products'}
          </button>

          <button
            onClick={listStripePrices}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'List Stripe Prices'}
          </button>

          <button
            onClick={triggerSync}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Syncing...' : 'Trigger Product Sync'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-medium mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {products && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-white font-medium mb-4">Stripe Products</h3>
            <pre className="text-green-300 text-sm overflow-auto max-h-96">
              {JSON.stringify(products, null, 2)}
            </pre>
          </div>
        )}

        {prices && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-medium mb-4">Stripe Prices</h3>
            <pre className="text-blue-300 text-sm overflow-auto max-h-96">
              {JSON.stringify(prices, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}