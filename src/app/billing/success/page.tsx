'use client'

import { useEffect, useState, Suspense } from 'react'
import { 
  CheckCircle, 
  Mail, 
  Star, 
  Users, 
  Car, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Target, 
  Zap,
  Shield,
  Smartphone,
  Globe,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import './page.css'

function SuccessContent() {
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null)
  const [planType, setPlanType] = useState<string>('Professional')

  useEffect(() => {
    async function initializeSuccess() {
      try {
        // Get auth info and subdomain
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()
        const userEmail = authData.user?.email
        
        if (userEmail) {
          try {
            const subdomainResponse = await fetch('/api/subdomains/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userEmail }),
              credentials: 'include'
            })
            
            if (subdomainResponse.ok) {
              const subdomainData = await subdomainResponse.json()
              if (subdomainData.success && subdomainData.subdomain) {
                setUserSubdomain(subdomainData.subdomain.subdomain)
              }
            }
          } catch (error) {
            console.warn('Could not fetch subdomain:', error)
          }
        }
        
      } catch (error) {
        console.error('Success page initialization error:', error)
      }
    }

    initializeSuccess()
  }, [])

  return (
    <div className="success-container">
      {/* Header Section */}
      <div className="success-header-section">
        <div className="success-icon-large">
          <CheckCircle className="check-icon-large" />
        </div>
        <h1 className="success-main-title">🎉 Welcome to GhostCRM!</h1>
        <h2 className="success-subtitle">Your {planType} Plan is Now Active</h2>
        
        {/* Email Check Notice */}
        <div className="email-check-notice">
          <div className="email-icon">
            <Mail className="mail-icon" />
          </div>
          <div className="email-content">
            <h3>📧 Check Your Email Now!</h3>
            <p>
              We've sent you a <strong>comprehensive welcome email</strong> containing:
            </p>
            <ul>
              <li>🔗 Your personalized subdomain login link{userSubdomain ? ` (${userSubdomain}.ghostcrm.ai)` : ''}</li>
              <li>📚 Complete getting started guide</li>
              <li>💡 Pro tips from automotive CRM experts</li>
              <li>📞 Direct contact information for your setup specialist</li>
            </ul>
          </div>
        </div>
      </div>

      {/* What You Can Do Section */}
      <div className="features-showcase">
        <h2 className="features-title">🚀 Here's What You Can Do Right Now</h2>
        
        <div className="features-grid">
          {/* Lead Management */}
          <div className="feature-card">
            <div className="feature-icon">
              <Target className="icon" />
            </div>
            <h3>Smart Lead Management</h3>
            <ul>
              <li>Capture leads from 15+ sources automatically</li>
              <li>AI-powered lead scoring and prioritization</li>
              <li>Automatic follow-up sequences</li>
              <li>Hot lead alerts via SMS/Email</li>
            </ul>
          </div>

          {/* Inventory Management */}
          <div className="feature-card">
            <div className="feature-icon">
              <Car className="icon" />
            </div>
            <h3>Vehicle Inventory</h3>
            <ul>
              <li>Track up to 2,000 vehicles in your inventory</li>
              <li>Automatic VIN decoding and specifications</li>
              <li>Photo management and virtual tours</li>
              <li>Pricing intelligence and market analysis</li>
            </ul>
          </div>

          {/* Team Collaboration */}
          <div className="feature-card">
            <div className="feature-icon">
              <Users className="icon" />
            </div>
            <h3>Team Management</h3>
            <ul>
              <li>Add up to 25 team members</li>
              <li>Role-based permissions and access control</li>
              <li>Performance tracking and leaderboards</li>
              <li>Commission calculations and reporting</li>
            </ul>
          </div>

          {/* Analytics & Reporting */}
          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 className="icon" />
            </div>
            <h3>Advanced Analytics</h3>
            <ul>
              <li>Real-time sales performance dashboards</li>
              <li>ROI tracking and conversion analytics</li>
              <li>Customer journey mapping</li>
              <li>Automated daily/weekly reports</li>
            </ul>
          </div>

          {/* Communication Hub */}
          <div className="feature-card">
            <div className="feature-icon">
              <MessageSquare className="icon" />
            </div>
            <h3>Omnichannel Communication</h3>
            <ul>
              <li>Unified inbox for SMS, Email, Chat</li>
              <li>AI-powered response suggestions</li>
              <li>Automated appointment scheduling</li>
              <li>Customer communication history</li>
            </ul>
          </div>

          {/* Mobile Access */}
          <div className="feature-card">
            <div className="feature-icon">
              <Smartphone className="icon" />
            </div>
            <h3>Mobile CRM Access</h3>
            <ul>
              <li>Full-featured mobile app for iOS/Android</li>
              <li>Offline mode for lot walks and test drives</li>
              <li>Photo capture and document scanning</li>
              <li>Push notifications for urgent leads</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="next-steps-section">
        <h2 className="next-steps-title">🎯 Your Next Steps</h2>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Check Your Email</h3>
              <p>Open the welcome email we just sent you. It contains your login link and getting started checklist.</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Access Your CRM</h3>
              <p>Click the link in your email to access your personalized CRM at {userSubdomain ? `${userSubdomain}.ghostcrm.ai` : 'your custom subdomain'}.</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Schedule Your Setup Call</h3>
              <p>Book a 30-minute onboarding call with your dedicated setup specialist (included in your plan).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="guarantee-section">
        <div className="guarantee-content">
          <div className="guarantee-icon">
            <Shield className="shield-icon" />
          </div>
          <div>
            <h3>30-Day Money-Back Guarantee</h3>
            <p>Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love GhostCRM!</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <h3>Need Help Getting Started?</h3>
        <div className="support-options">
          <button className="support-btn primary">
            <MessageSquare className="btn-icon" />
            Live Chat Support
          </button>
          <button className="support-btn secondary">
            <Calendar className="btn-icon" />
            Schedule Setup Call
          </button>
          <a 
            href={userSubdomain ? `https://${userSubdomain}.ghostcrm.ai/login` : '#'}
            className="support-btn tertiary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="btn-icon" />
            Access Your CRM
          </a>
        </div>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}