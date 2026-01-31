'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Zap, 
  Users, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Globe,
  Bot,
  MessageSquare,
  Calendar,
  DollarSign,
  Target,
  Workflow
} from 'lucide-react'
import '../../styles/shared-pages.css'

const FEATURES = [
  {
    category: "AI-Powered Intelligence",
    icon: Bot,
    color: "text-purple-500",
    features: [
      {
        name: "AI Lead Scoring",
        description: "Automatically prioritize leads based on likelihood to purchase"
      },
      {
        name: "Predictive Analytics",
        description: "Forecast sales trends and identify opportunities before competitors"
      },
      {
        name: "Smart Recommendations",
        description: "Get AI-suggested next actions for every customer interaction"
      },
      {
        name: "Automated Insights",
        description: "Receive intelligent reports and insights without manual analysis"
      }
    ]
  },
  {
    category: "Customer Relationship Management",
    icon: Users,
    color: "text-blue-500",
    features: [
      {
        name: "360° Customer View",
        description: "Complete customer history, preferences, and interaction timeline"
      },
      {
        name: "Advanced Segmentation",
        description: "Automatically group customers based on behavior and preferences"
      },
      {
        name: "Communication Hub",
        description: "Unified inbox for email, SMS, calls, and social media"
      },
      {
        name: "Customer Portal",
        description: "Branded self-service portal for customers to track orders and service"
      }
    ]
  },
  {
    category: "Sales & Marketing Automation",
    icon: Zap,
    color: "text-yellow-500",
    features: [
      {
        name: "Lead Nurturing Campaigns",
        description: "Automated email and SMS sequences that convert leads to customers"
      },
      {
        name: "Follow-up Automation",
        description: "Never miss a follow-up with intelligent scheduling and reminders"
      },
      {
        name: "Pipeline Management",
        description: "Visual sales pipeline with drag-and-drop deal management"
      },
      {
        name: "Performance Tracking",
        description: "Individual and team performance metrics with coaching insights"
      }
    ]
  },
  {
    category: "Inventory & Vehicle Management",
    icon: Target,
    color: "text-green-500",
    features: [
      {
        name: "Smart Inventory Sync",
        description: "Real-time inventory updates across all platforms and websites"
      },
      {
        name: "Vehicle Matching",
        description: "AI-powered customer-to-vehicle matching based on preferences"
      },
      {
        name: "Pricing Optimization",
        description: "Market-based pricing recommendations to maximize profits"
      },
      {
        name: "Trade-in Valuation",
        description: "Instant, accurate trade-in values with market data integration"
      }
    ]
  },
  {
    category: "Analytics & Reporting",
    icon: BarChart3,
    color: "text-indigo-500",
    features: [
      {
        name: "Real-time Dashboards",
        description: "Live performance metrics and KPIs for managers and sales teams"
      },
      {
        name: "Custom Reports",
        description: "Build and schedule custom reports for any business metric"
      },
      {
        name: "ROI Tracking",
        description: "Track marketing spend and return on investment by channel"
      },
      {
        name: "Forecasting",
        description: "AI-powered sales forecasting and goal tracking"
      }
    ]
  },
  {
    category: "Mobile & Accessibility",
    icon: Smartphone,
    color: "text-pink-500",
    features: [
      {
        name: "Native Mobile Apps",
        description: "Full-featured iOS and Android apps for on-the-go access"
      },
      {
        name: "Offline Capability",
        description: "Work seamlessly even without internet connection"
      },
      {
        name: "Voice Commands",
        description: "Hands-free data entry and search using voice recognition"
      },
      {
        name: "QR Code Integration",
        description: "Instant vehicle and customer information via QR codes"
      }
    ]
  }
]

export default function FeaturesPage() {
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
          <span>Features</span>
        </div>

        <div className="shared-header">
          <h1 className="shared-title">Powerful Features</h1>
          <p className="shared-subtitle">
            Discover how GhostCRM's comprehensive feature set helps dealerships 
            streamline operations, increase sales, and deliver exceptional customer experiences.
          </p>
        </div>

        <div className="shared-section">
          <h2>Why Dealerships Choose GhostCRM</h2>
          <div className="shared-grid">
            <div className="shared-card">
              <Zap className="w-8 h-8 text-yellow-500 mb-4" />
              <h4>40% Average Sales Increase</h4>
              <p>Our customers see significant sales growth within the first year of implementation.</p>
            </div>
            <div className="shared-card">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <h4>98% Customer Satisfaction</h4>
              <p>Industry-leading customer satisfaction with 24/7 support and training.</p>
            </div>
            <div className="shared-card">
              <Shield className="w-8 h-8 text-green-500 mb-4" />
              <h4>Enterprise Security</h4>
              <p>SOC 2 certified with enterprise-grade security and compliance features.</p>
            </div>
          </div>
        </div>

        {FEATURES.map((category, index) => {
          const IconComponent = category.icon
          return (
            <div key={index} className="shared-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <IconComponent className={`w-10 h-10 ${category.color}`} />
                <h2>{category.category}</h2>
              </div>
              <div className="shared-grid">
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="shared-card">
                    <h4>{feature.name}</h4>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="shared-section">
          <h2>Integration Ecosystem</h2>
          <p>
            GhostCRM integrates with over 200+ popular automotive tools and platforms, 
            ensuring seamless data flow and eliminating duplicate data entry.
          </p>
          <ul>
            <li>Major DMS systems (CDK, Reynolds, Dealertrack, etc.)</li>
            <li>F&I providers and lenders</li>
            <li>Marketing platforms and lead sources</li>
            <li>Accounting and finance systems</li>
            <li>Communication tools and phone systems</li>
            <li>Website and digital retailing platforms</li>
          </ul>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/integrations" className="shared-button">
              <Globe className="w-5 h-5" />
              View All Integrations
            </Link>
          </div>
        </div>

        <div className="shared-section">
          <h2>Ready to Get Started?</h2>
          <p>
            Experience the power of GhostCRM with a personalized demo tailored to your 
            dealership's specific needs and goals.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link href="/billing" className="shared-button">
              <DollarSign className="w-5 h-5" />
              View Pricing
            </Link>
            <Link href="/contact" className="shared-button secondary">
              <MessageSquare className="w-5 h-5" />
              Schedule Demo
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