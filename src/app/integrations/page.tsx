'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plug } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function IntegrationsPage() {
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
          <span>Integrations</span>
        </div>
        <div className="shared-header">
          <h1 className="shared-title">Integrations</h1>
          <p className="shared-subtitle">Connect GhostCRM with your existing tools and workflows.</p>
        </div>
        <div className="shared-section">
          <Plug className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2>200+ Integrations Available</h2>
          <p>Connect with DMS systems, marketing tools, and more.</p>
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