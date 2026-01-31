'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Award } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function SecurityPage() {
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
          <span>Security</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Security & Compliance</h1>
          <p className="shared-subtitle">
            Your data security is our top priority. Learn about our enterprise-grade 
            security measures and compliance certifications.
          </p>
        </div>

        <div className="shared-grid">
          <div className="shared-card">
            <Shield className="w-8 h-8 text-green-500 mb-4" />
            <h4>SOC 2 Certified</h4>
            <p>We maintain SOC 2 Type II compliance for the highest security standards.</p>
          </div>
          <div className="shared-card">
            <Lock className="w-8 h-8 text-blue-500 mb-4" />
            <h4>256-bit Encryption</h4>
            <p>All data is encrypted in transit and at rest using industry-standard encryption.</p>
          </div>
          <div className="shared-card">
            <Eye className="w-8 h-8 text-purple-500 mb-4" />
            <h4>Regular Audits</h4>
            <p>Third-party security audits ensure our systems meet the highest standards.</p>
          </div>
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