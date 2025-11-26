'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function PressPage() {
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
          <span>Press</span>
        </div>
        <div className="shared-header">
          <h1 className="shared-title">Press</h1>
          <p className="shared-subtitle">Latest news and press releases from GhostCRM.</p>
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