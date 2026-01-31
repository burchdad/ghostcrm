'use client'

import { useState } from 'react'

export default function SubdomainTestPage() {
  const [email, setEmail] = useState('david@burch-motors.com')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectActivation = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/subdomains/activate-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testManualActivation = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/subdomains/manual-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/subdomains/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Subdomain Testing Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          User Email:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={checkStatus}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : '🔍 Check Status'}
        </button>

        <button
          onClick={testDirectActivation}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : '⚡ Direct Activate'}
        </button>

        <button
          onClick={testManualActivation}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : '🚀 Manual Activate'}
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <h3>📊 Result:</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            overflow: 'auto',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h4>📋 Testing Instructions:</h4>
        <ol>
          <li><strong>Check Status</strong>: See current subdomain status in database</li>
          <li><strong>Direct Activate</strong>: Bypass Stripe and activate directly by email (RECOMMENDED)</li>
          <li><strong>Manual Activate</strong>: Alternative activation method</li>
          <li>After activation, go to <code>/billing/success?session_id=test&amp;processed=true</code> to test UI</li>
          <li>Database should show <code>status: "active"</code> instead of <code>"pending_payment"</code></li>
        </ol>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fecaca', borderRadius: '8px' }}>
        <h4>🔧 Manual Database Fix (Alternative):</h4>
        <p>If API doesn't work, run this SQL in Supabase:</p>
        <code style={{ 
          display: 'block', 
          backgroundColor: 'white', 
          padding: '0.5rem', 
          borderRadius: '4px',
          fontSize: '0.8rem'
        }}>
          UPDATE subdomains SET status = 'active', updated_at = NOW(), provisioned_at = NOW() WHERE subdomain = 'burchmotors';
        </code>
      </div>
    </div>
  )
}