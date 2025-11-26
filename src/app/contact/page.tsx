'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  CheckCircle
} from 'lucide-react'
import '../../styles/shared-pages.css'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    subject: 'General Inquiry'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isSubmitted) {
    return (
      <div className="shared-page">
        <div className="shared-page-background">
          <div className="shared-bg-gradient" />
          <div className="shared-bg-blur-1" />
          <div className="shared-bg-blur-2" />
          <div className="shared-bg-blur-3" />
        </div>

        <div className="shared-container">
          <div className="shared-header">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="shared-title">Thank You!</h1>
            <p className="shared-subtitle">
              We've received your message and will get back to you within 24 hours.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/" className="shared-button">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          <span>Contact</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Contact Us</h1>
          <p className="shared-subtitle">
            Ready to transform your dealership? Get in touch with our team for a 
            personalized demo and see how GhostCRM can help you grow.
          </p>
        </div>

        <div className="shared-grid">
          {/* Contact Information */}
          <div className="shared-section">
            <h2>Get in Touch</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Phone className="w-6 h-6 text-green-500" />
                <div>
                  <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Phone</h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    <a href="tel:+1-555-GHOST-1" style={{ color: '#a855f7', textDecoration: 'none' }}>
                      (555) GHOST-1
                    </a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail className="w-6 h-6 text-blue-500" />
                <div>
                  <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Email</h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    <a href="mailto:sales@ghostcrm.ai" style={{ color: '#a855f7', textDecoration: 'none' }}>
                      sales@ghostcrm.ai
                    </a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapPin className="w-6 h-6 text-red-500" />
                <div>
                  <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Headquarters</h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Austin, Texas<br />
                    United States
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock className="w-6 h-6 text-purple-500" />
                <div>
                  <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Business Hours</h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Monday - Friday: 8:00 AM - 8:00 PM CST<br />
                    Saturday: 9:00 AM - 5:00 PM CST<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MessageCircle className="w-6 h-6 text-green-500" />
                <div>
                  <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>Live Chat</h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Available 24/7 on our website<br />
                    Average response: Under 5 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="shared-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Schedule Demo">Schedule Demo</option>
                  <option value="Pricing Question">Pricing Question</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="shared-button"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '1rem', 
                      height: '1rem', 
                      border: '2px solid transparent',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
          <Link href="/" className="shared-button secondary">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}