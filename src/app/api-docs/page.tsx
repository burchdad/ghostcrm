'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function ApiDocsPage() {
  return (
    <div className="shared-page">
      <div className="shared-page-background">
        <div className="shared-bg-gradient" />
        <div className="shared-bg-blur-1" />
        <div className="shared-bg-blur-2" />
        <div className="shared-bg-blur-3" />
      </div>
      <div className="shared-container">
        <div className="shared-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>API Documentation</span>
        </div>
        <div className="shared-header">
          <h1 className="shared-title">API Documentation</h1>
          <p className="shared-subtitle">Complete API documentation for developers.</p>
        </div>
        <div className="shared-section">
          <h2>Coming Soon</h2>
          <p>This section is currently under development. Please check back soon for updates.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
          <Link href="/" className="shared-button secondary">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}