'use client'

import { useState } from 'react'

export default function TestManualActivation() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [statusCheck, setStatusCheck] = useState<any>(null)

  const handleActivate = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/subdomains/manual-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Network error' })
    }
    setLoading(false)
  }

  const handleCheckStatus = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/subdomains/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      })
      
      const data = await response.json()
      setStatusCheck(data)
    } catch (error) {
      console.error('Error:', error)
      setStatusCheck({ error: 'Network error' })
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Manual Activation Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>User Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginTop: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={handleActivate}
          disabled={loading || !email}
          style={{
            padding: '0.75rem 1rem',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: loading || !email ? 0.5 : 1
          }}
        >
          {loading ? 'Processing...' : 'Manual Activate'}
        </button>
        
        <button 
          onClick={handleCheckStatus}
          disabled={loading || !email}
          style={{
            padding: '0.75rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: loading || !email ? 0.5 : 1
          }}
        >
          {loading ? 'Processing...' : 'Check Status'}
        </button>
      </div>

      {result && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Activation Result:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {statusCheck && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Status Check Result:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(statusCheck, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Enter a user email that exists in your database</li>
          <li>Click "Check Status" to see current subdomain status</li>
          <li>Click "Manual Activate" to activate the subdomain</li>
          <li>Check status again to verify activation</li>
        </ol>
      </div>
    </div>
  )
}