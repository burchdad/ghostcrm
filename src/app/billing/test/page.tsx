'use client'

import React from 'react'
import '@/styles/components/public-billing.css'

export default function SimpleBillingTest() {
  console.log('🔍 SimpleBillingTest component rendering...')
  
  return (
    <div className="billing-page">
      <div className="billing-hero-background">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
      </div>
      
      <div className="billing-container">
        <div className="billing-header">
          <h1 className="main-title">
            🚀 Simple Billing Test
            <span className="title-highlight">Working!</span>
          </h1>
          <p className="subtitle">
            If you can see this styled text, the CSS is loading correctly.
          </p>
        </div>

        <div className="billing-plans-grid">
          <div className="billing-plan-card">
            <div className="billing-plan-header">
              <div className="billing-plan-name">Test Plan</div>
              <div className="billing-plan-description">Simple test plan</div>
              <div className="billing-plan-price">
                <span className="billing-plan-price-amount">$99</span>
                <span className="billing-plan-price-period">/month</span>
              </div>
            </div>
            <button 
              className="billing-plan-cta primary"
              onClick={() => alert('Button works!')}
            >
              Test Button
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          margin: '2rem 0',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3>🔍 Component Debug Info:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <li>✅ React component rendered</li>
            <li>✅ CSS classes applied</li>
            <li>✅ Event handlers working</li>
            <li>✅ Inline styles working</li>
            <li>⏳ Complex features need testing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}