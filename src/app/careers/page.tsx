'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Briefcase, MapPin, Users, Heart } from 'lucide-react'
import '../../styles/shared-pages.css'

const OPENINGS = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Austin, TX / Remote",
    type: "Full-time"
  },
  {
    title: "Product Manager - AI/ML",
    department: "Product",
    location: "Austin, TX / Remote",
    type: "Full-time"
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Sales Development Representative",
    department: "Sales",
    location: "Austin, TX",
    type: "Full-time"
  }
]

export default function CareersPage() {
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
          <span>Careers</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Join Our Team</h1>
          <p className="shared-subtitle">
            Help us revolutionize the automotive industry. We're looking for passionate individuals 
            who want to make a real impact on dealerships worldwide.
          </p>
        </div>

        <div className="shared-section">
          <h2>Why Work at GhostCRM?</h2>
          <div className="shared-grid">
            <div className="shared-card">
              <Heart className="w-8 h-8 text-red-500 mb-4" />
              <h4>Mission-Driven Work</h4>
              <p>Help dealerships grow and succeed with cutting-edge technology.</p>
            </div>
            <div className="shared-card">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <h4>Amazing Team</h4>
              <p>Work alongside industry experts and brilliant minds who care about quality.</p>
            </div>
            <div className="shared-card">
              <Briefcase className="w-8 h-8 text-green-500 mb-4" />
              <h4>Great Benefits</h4>
              <p>Competitive salary, equity, health benefits, and flexible remote work.</p>
            </div>
          </div>
        </div>

        <div className="shared-section">
          <h2>Open Positions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {OPENINGS.map((job, index) => (
              <div key={index} className="shared-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>{job.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      <span>{job.department}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <button className="shared-button" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shared-section">
          <h2>Don't See Your Role?</h2>
          <p>
            We're always looking for exceptional talent. Send us your resume and tell us how 
            you'd like to contribute to our mission.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/contact" className="shared-button">
              <Briefcase className="w-5 h-5" />
              Send Your Resume
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