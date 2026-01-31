'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Zap, Target, Globe, Award, Heart } from 'lucide-react'
import '../../styles/shared-pages.css'

export default function AboutPage() {
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
          <span>About Us</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">About GhostCRM</h1>
          <p className="shared-subtitle">
            We're revolutionizing how automotive dealerships manage customer relationships, 
            increase sales, and grow their business with AI-powered technology.
          </p>
        </div>

        <div className="shared-section">
          <h2>Our Mission</h2>
          <p>
            At GhostCRM, we believe every dealership deserves cutting-edge technology to compete 
            and thrive in today's market. Our mission is to empower automotive professionals with 
            intelligent tools that streamline operations, boost sales, and create exceptional 
            customer experiences.
          </p>
        </div>

        <div className="shared-section">
          <h2>Why We Built GhostCRM</h2>
          <div className="shared-grid">
            <div className="shared-card">
              <Zap className="w-8 h-8 text-yellow-500 mb-4" />
              <h4>Eliminate Manual Work</h4>
              <p>
                We saw dealerships drowning in paperwork and repetitive tasks. Our AI automation 
                handles the busy work so your team can focus on what matters - selling cars.
              </p>
            </div>
            <div className="shared-card">
              <Target className="w-8 h-8 text-green-500 mb-4" />
              <h4>Increase Sales</h4>
              <p>
                Traditional CRMs weren't built for automotive. We created specialized tools that 
                understand your unique sales process and help convert more leads into customers.
              </p>
            </div>
            <div className="shared-card">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <h4>Better Customer Experience</h4>
              <p>
                Modern customers expect modern experiences. Our platform helps you deliver 
                personalized service at every touchpoint in the customer journey.
              </p>
            </div>
          </div>
        </div>

        <div className="shared-section">
          <h2>Our Values</h2>
          <div className="shared-grid">
            <div className="shared-card">
              <Heart className="w-8 h-8 text-red-500 mb-4" />
              <h4>Customer Obsession</h4>
              <p>
                We're obsessed with our customers' success. Every feature we build is designed 
                to help dealerships grow and thrive.
              </p>
            </div>
            <div className="shared-card">
              <Zap className="w-8 h-8 text-purple-500 mb-4" />
              <h4>Innovation First</h4>
              <p>
                We leverage cutting-edge AI and technology to solve real problems in the 
                automotive industry.
              </p>
            </div>
            <div className="shared-card">
              <Globe className="w-8 h-8 text-green-500 mb-4" />
              <h4>Transparency</h4>
              <p>
                We believe in honest communication, clear pricing, and building trust through 
                our actions and results.
              </p>
            </div>
          </div>
        </div>

        <div className="shared-section">
          <h2>Our Story</h2>
          <p>
            Founded by automotive industry veterans who understood the pain points dealerships 
            face every day, GhostCRM was born from the need for a modern, intelligent CRM 
            built specifically for automotive retail.
          </p>
          <p>
            After years of working with dealerships struggling with outdated systems, manual 
            processes, and disconnected tools, our founders set out to create something better. 
            Today, GhostCRM serves over 10,000 dealerships worldwide, helping them increase 
            sales by an average of 40% within the first year.
          </p>
        </div>

        <div className="shared-section">
          <h2>Join Our Team</h2>
          <p>
            We're always looking for passionate individuals who want to make a difference in 
            the automotive industry. If you're excited about AI, automotive technology, and 
            helping businesses grow, we'd love to hear from you.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/careers" className="shared-button">
              <Users className="w-5 h-5" />
              View Open Positions
            </Link>
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