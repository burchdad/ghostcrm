'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function PrivacyPage() {
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
          <span>Privacy Policy</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Privacy Policy</h1>
          <p className="shared-subtitle">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
        </div>

        <div className="shared-section">
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, contact us, or use our services.</p>
        </div>

        <div className="shared-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and comply with legal obligations.</p>
        </div>

        <div className="shared-section">
          <h2>Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
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