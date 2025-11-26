'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Book, MessageCircle, Video } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function HelpPage() {
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
          <span>Help Center</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Help Center</h1>
          <p className="shared-subtitle">
            Find answers to common questions, tutorials, and get the help you need 
            to make the most of GhostCRM.
          </p>
        </div>

        <div className="shared-grid">
          <div className="shared-card">
            <Book className="w-8 h-8 text-blue-500 mb-4" />
            <h4>Documentation</h4>
            <p>Comprehensive guides and API documentation for developers and users.</p>
            <Link href="/documentation" className="shared-button" style={{ marginTop: '1rem' }}>View Docs</Link>
          </div>
          <div className="shared-card">
            <Video className="w-8 h-8 text-red-500 mb-4" />
            <h4>Video Tutorials</h4>
            <p>Step-by-step video guides to help you master GhostCRM features.</p>
            <Link href="/training" className="shared-button" style={{ marginTop: '1rem' }}>Watch Videos</Link>
          </div>
          <div className="shared-card">
            <MessageCircle className="w-8 h-8 text-green-500 mb-4" />
            <h4>Contact Support</h4>
            <p>Get personalized help from our support team via chat, email, or phone.</p>
            <Link href="/contact" className="shared-button" style={{ marginTop: '1rem' }}>Get Help</Link>
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