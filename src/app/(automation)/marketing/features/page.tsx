'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Users,
  Workflow,
  BarChart3,
  Calendar,
  MessageSquare,
  TrendingUp,
  Zap,
  CheckCircle,
  Sparkles,
  Play,
  Rocket,
} from 'lucide-react'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import '../../../../styles/components/features.css'

// ---------- Data ----------
const allFeatures = [
  // Inventory & Vehicle Management
  {
    id: 'inventory-management',
    Icon: Users,
    category: 'Inventory Management',
    title: 'Smart Vehicle Inventory',
    description:
      'Complete vehicle inventory management with advanced analytics, real-time tracking, and intelligent optimization.',
    benefits: [
      'Real-time inventory tracking',
      'Vehicle analytics & insights',
      'Automated pricing optimization',
      'Multi-location management',
    ],
  },
  {
    id: 'qr-system',
    Icon: Sparkles,
    category: 'Digital Innovation',
    title: 'QR Code Vehicle Profiles',
    description:
      'Revolutionary QR code system with bulk generation, digital window stickers, and comprehensive vehicle profiles for enhanced customer engagement.',
    benefits: [
      'Bulk QR code generation (PDF/ZIP)',
      'Digital window stickers',
      'Financial calculators',
      'Interactive vehicle profiles',
    ],
  },
  {
    id: 'test-drive-scheduling',
    Icon: Calendar,
    category: 'Customer Experience',
    title: 'Intelligent Test Drive Scheduling',
    description:
      'Round-robin sales agent assignment with specialty matching, automated scheduling, and comprehensive appointment management.',
    benefits: [
      'Round-robin agent assignment',
      'Specialty matching algorithms',
      'Automated scheduling',
      'Customer preference tracking',
    ],
  },

  // Sales & Lead Management
  {
    id: 'lead-management',
    Icon: TrendingUp,
    category: 'Lead Management',
    title: 'Advanced Lead Capture',
    description:
      'Capture leads from multiple sources including web forms, phone calls, walk-ins, and referrals with intelligent routing and automatic assignment.',
    benefits: [
      'Multi-channel lead capture',
      'Automatic lead scoring',
      'Intelligent routing',
      'Real-time notifications',
    ],
  },
  {
    id: 'sales-pipeline',
    Icon: BarChart3,
    category: 'Sales Pipeline',
    title: 'Visual Sales Pipeline',
    description:
      'Track deals through every stage with a visual pipeline that shows progress and identifies bottlenecks.',
    benefits: ['Drag-and-drop interface', 'Pipeline analytics', 'Deal forecasting', 'Stage automation'],
  },

  // Authentication & Security
  {
    id: 'role-based-auth',
    Icon: CheckCircle,
    category: 'Security & Access',
    title: 'Role-Based Authentication',
    description:
      'Comprehensive multi-tenant authentication system with Owner, Admin, Manager, Sales Rep, and User roles with complete tenant isolation.',
    benefits: [
      'Multi-tenant isolation',
      '5-tier role system',
      'Granular permissions',
      'Company data separation',
    ],
  },
  {
    id: 'tenant-management',
    Icon: Users,
    category: 'Multi-Tenant Architecture',
    title: 'Company Isolation System',
    description:
      'Complete tenant isolation ensuring sales reps from Company A only see Company A data, with secure multi-company management.',
    benefits: [
      'Complete data isolation',
      'Multi-company support',
      'Secure tenant boundaries',
      'Role-based access control',
    ],
  },

  // Analytics & Reporting
  {
    id: 'analytics-reporting',
    Icon: BarChart3,
    category: 'Analytics',
    title: 'Advanced Analytics & Reporting',
    description:
      'Get deep insights into your sales performance with comprehensive analytics, QR code tracking, and customizable dashboards.',
    benefits: [
      'Real-time dashboards',
      'QR code analytics',
      'Performance metrics',
      'Custom report builder',
    ],
  },
  {
    id: 'performance-tracking',
    Icon: TrendingUp,
    category: 'Performance',
    title: 'Sales Performance Tracking',
    description:
      'Track individual and team performance with detailed metrics, goal tracking, and automated reporting.',
    benefits: [
      'Individual performance metrics',
      'Team performance tracking',
      'Goal setting & tracking',
      'Automated performance reports',
    ],
  },

  // Automation & Workflow
  {
    id: 'workflow-automation',
    Icon: Workflow,
    category: 'Automation',
    title: 'Sales Workflow Automation',
    description:
      "Automate repetitive tasks and streamline your sales process with intelligent workflows that adapt to your team's needs.",
    benefits: ['Custom workflow builder', 'Automated follow-ups', 'Task assignments', 'Performance tracking'],
  },
  {
    id: 'ai-integration',
    Icon: Sparkles,
    category: 'AI & Intelligence',
    title: 'AI-Powered Sales Assistant',
    description:
      'Intelligent AI assistant that helps with customer interactions, lead qualification, and sales process optimization.',
    benefits: [
      'Intelligent lead scoring',
      'Automated customer responses',
      'Sales process optimization',
      'Predictive analytics',
    ],
  },

  // Communication & Customer Engagement
  {
    id: 'communication-hub',
    Icon: MessageSquare,
    category: 'Communication',
    title: 'Unified Communication Hub',
    description: 'Centralize all customer communications in one place with email, SMS, and call integration.',
    benefits: ['Multi-channel messaging', 'Conversation history', 'Template library', 'Automated responses'],
  },
  {
    id: 'customer-portal',
    Icon: Users,
    category: 'Customer Experience',
    title: 'Customer Self-Service Portal',
    description:
      'Comprehensive customer portal for financing applications, document uploads, service scheduling, and communication.',
    benefits: [
      'Online financing applications',
      'Document management',
      'Service scheduling',
      'Real-time updates',
    ],
  },

  // Financial & Compliance
  {
    id: 'financial-tools',
    Icon: BarChart3,
    category: 'Financial Tools',
    title: 'Advanced Financial Calculators',
    description:
      'Built-in financing calculators, lease calculators, trade-in estimators, and payment calculators for customer convenience.',
    benefits: [
      'Financing calculators',
      'Lease payment tools',
      'Trade-in estimators',
      'Payment calculators',
    ],
  },
  {
    id: 'compliance-management',
    Icon: CheckCircle,
    category: 'Compliance',
    title: 'Compliance & Document Management',
    description:
      'Ensure regulatory compliance with automated document management, audit trails, and compliance monitoring.',
    benefits: [
      'Automated compliance checks',
      'Document management',
      'Audit trail tracking',
      'Regulatory reporting',
    ],
  },

  // Integration & Scalability
  {
    id: 'integration-platform',
    Icon: Workflow,
    category: 'Integrations',
    title: 'Enterprise Integration Platform',
    description:
      'Seamlessly integrate with existing DMS systems, financial institutions, and third-party tools.',
    benefits: [
      'DMS integration',
      'Financial system connections',
      'Third-party app support',
      'API-first architecture',
    ],
  },
  {
    id: 'mobile-optimization',
    Icon: Sparkles,
    category: 'Mobile Experience',
    title: 'Mobile-First Design',
    description:
      'Fully responsive design optimized for mobile devices with native app functionality and offline capabilities.',
    benefits: [
      'Mobile-responsive design',
      'Touch-optimized interface',
      'Offline functionality',
      'Cross-platform support',
    ],
  },
]

const featureCategories = [
  {
    id: 'inventory-management',
    title: 'Inventory & Vehicle Management',
    icon: <Users />,
    description: 'Complete vehicle inventory system with QR codes and digital innovation.',
    features: allFeatures.filter((f) => f.category === 'Inventory Management'),
  },
  {
    id: 'digital-innovation',
    title: 'Digital Innovation',
    icon: <Sparkles />,
    description: 'Revolutionary QR codes, digital profiles, and mobile-first experiences.',
    features: allFeatures.filter((f) => f.category === 'Digital Innovation'),
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience',
    icon: <Calendar />,
    description: 'Intelligent scheduling, self-service portals, and enhanced engagement.',
    features: allFeatures.filter((f) => f.category === 'Customer Experience'),
  },
  {
    id: 'lead-management',
    title: 'Lead & Sales Management',
    icon: <TrendingUp />,
    description: 'Capture, score, and convert leads with advanced pipeline management.',
    features: allFeatures.filter((f) => f.category === 'Lead Management' || f.category === 'Sales Pipeline'),
  },
  {
    id: 'security-access',
    title: 'Security & Multi-Tenant',
    icon: <CheckCircle />,
    description: 'Enterprise-grade security with complete tenant isolation and role-based access.',
    features: allFeatures.filter((f) => f.category === 'Security & Access' || f.category === 'Multi-Tenant Architecture'),
  },
  {
    id: 'analytics',
    title: 'Analytics & Performance',
    icon: <BarChart3 />,
    description: 'Advanced analytics, reporting, and performance tracking for data-driven decisions.',
    features: allFeatures.filter((f) => f.category === 'Analytics' || f.category === 'Performance'),
  },
  {
    id: 'automation',
    title: 'Automation & AI',
    icon: <Workflow />,
    description: 'Intelligent automation and AI-powered tools to streamline operations.',
    features: allFeatures.filter((f) => f.category === 'Automation' || f.category === 'AI & Intelligence'),
  },
  {
    id: 'communication',
    title: 'Communication & Engagement',
    icon: <MessageSquare />,
    description: 'Unified communication hub with multi-channel customer engagement.',
    features: allFeatures.filter((f) => f.category === 'Communication'),
  },
  {
    id: 'financial-tools',
    title: 'Financial & Compliance',
    icon: <BarChart3 />,
    description: 'Advanced financial tools, calculators, and compliance management.',
    features: allFeatures.filter((f) => f.category === 'Financial Tools' || f.category === 'Compliance'),
  },
  {
    id: 'integrations',
    title: 'Integrations & Platform',
    icon: <Workflow />,
    description: 'Enterprise integrations and mobile-optimized platform architecture.',
    features: allFeatures.filter((f) => f.category === 'Integrations' || f.category === 'Mobile Experience'),
  },
]

// ---------- Helpers (declare before component) ----------
function getIconBg(index: number) {
  const backgrounds = ['bg-blue-100', 'bg-purple-100', 'bg-green-100']
  return backgrounds[index % backgrounds.length]
}

// ---------- Page ----------
export default function FeaturesPage() {
  const cardsRef = React.useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = React.useState('hero')
  const [isMobile, setIsMobile] = React.useState(false)
  const [expandedAccordion, setExpandedAccordion] = React.useState<string | null>(null)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const mobileNavItems = [
    { id: 'hero', label: 'Overview' },
    { id: 'innovations', label: 'Innovations' },
    { id: 'features', label: 'Features' },
    { id: 'categories', label: 'Categories' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'platform', label: 'Platform' },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  const toggleAccordion = (accordionId: string) => {
    setExpandedAccordion(expandedAccordion === accordionId ? null : accordionId)
  }

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <MarketingHeader />

      {/* Animated Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #312e81 0%, #1e3a8a 50%, #312e81 100%)',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '2.5rem',
            width: '8rem',
            height: '8rem',
            background: '#a78bfa',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.15,
          }}
          className="animate-blob"
        />
        <div
          style={{
            position: 'absolute',
            top: '10rem',
            right: '2.5rem',
            width: '8rem',
            height: '8rem',
            background: '#60a5fa',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.1,
          }}
          className="animate-blob animation-delay-2000"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-2rem',
            left: '5rem',
            width: '8rem',
            height: '8rem',
            background: '#f472b6',
            borderRadius: '50%',
            mixBlendMode: 'multiply',
            filter: 'blur(40px)',
            opacity: 0.15,
          }}
          className="animate-blob animation-delay-4000"
        />

        {/* Floating Particles */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '0.5rem',
            height: '0.5rem',
            background: '#a78bfa',
            borderRadius: '50%',
            opacity: 0.15,
          }}
          className="animate-float"
        />
        <div
          style={{
            position: 'absolute',
            top: '33%',
            right: '33%',
            width: '0.25rem',
            height: '0.25rem',
            background: '#f472b6',
            borderRadius: '50%',
            opacity: 0.1,
          }}
          className="animate-float animation-delay-2000"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '50%',
            width: '0.75rem',
            height: '0.75rem',
            background: '#60a5fa',
            borderRadius: '50%',
            opacity: 0.12,
          }}
          className="animate-float animation-delay-4000"
        />
      </div>

      {/* Hero */}
      <section
        id="hero"
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: isMobile ? '2rem' : '3rem',
          paddingBottom: isMobile ? '3rem' : '4rem',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(147, 51, 234, 0.6)',
                color: '#ffffff',
                marginBottom: '1.5rem',
              }}
              className="animate-fade-in-up epic-entrance"
            >
              <Sparkles
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                  color: '#fbbf24',
                }}
                className="animate-pulse"
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                17+ Revolutionary Features
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                lineHeight: 1.2,
              }}
              className="animate-fade-in-up animation-delay-200"
            >
              The Most Advanced
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #e9d5ff, #fbcfe8, #ddd6fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 900,
                }}
                className="animate-gradient-x"
              >
                Automotive CRM
              </span>
            </h1>

            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                color: '#f9fafb',
                maxWidth: '56rem',
                margin: '0 auto 2rem auto',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                fontWeight: 500,
                lineHeight: 1.6,
                padding: isMobile ? '0 0.5rem' : '0',
              }}
              className="animate-fade-in-up animation-delay-400"
            >
              From revolutionary QR code vehicle profiles to enterprise-grade multi-tenant security, we've built the{' '}
              <span
                style={{
                  color: '#e9d5ff',
                  fontWeight: 'bold',
                }}
              >
                complete automotive sales ecosystem
              </span>{' '}
              that transforms how dealerships operate and sell.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem',
                justifyContent: 'center',
                marginBottom: '2.5rem',
                alignItems: 'center',
              }}
              className="animate-fade-in-up animation-delay-600"
            >
              <Link
                href="/register"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                }}
                className="group magnetic-button glow-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                  Start Free Trial
                  <ArrowRight
                    style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </Link>

              <Link
                href="/demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                }}
                className="group magnetic-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Watch Magic Happen
                  <Play
                    style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }}
                    className="group-hover:scale-110 transition-transform"
                  />
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: isMobile ? '0.75rem' : '2rem',
                maxWidth: '32rem',
                margin: '0 auto',
              }}
              className="animate-fade-in-up animation-delay-800"
            >
              {[
                { value: '17+', label: 'Core Features' },
                { value: '5-Tier', label: 'Role System' },
                { value: 'Multi', label: 'Tenant Support' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '0.75rem',
                    padding: isMobile ? '0.75rem' : '1rem',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div
                    style={{
                      fontSize: isMobile ? '1.5rem' : '1.875rem',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                      textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                    className={`animate-pulse-glow ${i === 1 ? 'animation-delay-200' : i === 2 ? 'animation-delay-400' : ''
                      }`}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#e5e7eb', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="mobile-sticky-nav">
          <div className="mobile-nav-scroll">
            {mobileNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`mobile-nav-pill ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Innovations Highlight */}
      <section
        id="innovations"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobile ? '2rem 0' : '4rem 0',
          background: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
            <h2
              style={{
                fontSize: isMobile ? '1.75rem' : '2.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              Revolutionary Innovations
            </h2>
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: '#e5e7eb',
                maxWidth: '48rem',
                margin: '0 auto',
                padding: isMobile ? '0 0.5rem' : '0',
              }}
            >
              Game-changing features that set us apart from every other automotive CRM platform
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem',
            }}
          >
            {/* QR Code Innovation */}
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              className="group hover:scale-105"
            >
              <div
                style={{
                  width: isMobile ? '3rem' : '4rem',
                  height: isMobile ? '3rem' : '4rem',
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <Sparkles style={{ width: isMobile ? '1.5rem' : '2rem', height: isMobile ? '1.5rem' : '2rem', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                QR Code Vehicle Profiles
              </h3>
              <p style={{ color: '#e5e7eb', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                Revolutionary QR system with bulk PDF/ZIP generation, digital window stickers, financial calculators, and test drive scheduling. Print hundreds of QR codes instantly.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {['Bulk Generation', 'Digital Stickers', 'Financial Calc', 'Test Drives'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#e9d5ff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Multi-Tenant Security */}
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              className="group hover:scale-105"
            >
              <div
                style={{
                  width: isMobile ? '3rem' : '4rem',
                  height: isMobile ? '3rem' : '4rem',
                  background: 'linear-gradient(90deg, #ec4899, #f59e0b)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <CheckCircle style={{ width: isMobile ? '1.5rem' : '2rem', height: isMobile ? '1.5rem' : '2rem', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                Enterprise-Grade Security
              </h3>
              <p style={{ color: '#e5e7eb', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                Complete tenant isolation with 5-tier role system. Sales reps from Company A never see Company B data. Granular permissions and secure multi-company management.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {['Tenant Isolation', '5-Tier Roles', 'Permissions', 'Multi-Company'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(236, 72, 153, 0.2)',
                      color: '#fbcfe8',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* AI-Powered Sales Intelligence */}
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              className="group hover:scale-105"
            >
              <div
                style={{
                  width: isMobile ? '3rem' : '4rem',
                  height: isMobile ? '3rem' : '4rem',
                  background: 'linear-gradient(90deg, #22c55e, #06b6d4)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <Rocket style={{ width: isMobile ? '1.5rem' : '2rem', height: isMobile ? '1.5rem' : '2rem', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                Intelligent Sales Automation
              </h3>
              <p style={{ color: '#e5e7eb', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                Round-robin agent assignment with specialty matching, automated test drive scheduling, performance analytics, and AI-powered lead scoring for maximum conversion.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {['Round-Robin', 'Agent Matching', 'Auto Scheduling', 'AI Scoring'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#bbf7d0',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Mobile Accordion / Desktop Grid */}
      <section
        id="features"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobile ? '2rem 0' : '3rem 0',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '2.5rem' }}>
            <h2
              style={{
                fontSize: isMobile ? '1.75rem' : '2.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              Experience the <span style={{ color: '#a78bfa' }}>Power</span>
            </h2>
          </div>

          {isMobile ? (
            // Mobile Accordion Layout
            <div className="mobile-accordion-section">
              <div
                className="mobile-accordion-header"
                onClick={() => toggleAccordion('all-features')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>
                  All Features ({allFeatures.length})
                </h3>
                <div style={{ color: '#a78bfa', fontSize: '1.25rem' }}>
                  {expandedAccordion === 'all-features' ? '−' : '+'}
                </div>
              </div>
              <div className={`mobile-accordion-content ${expandedAccordion === 'all-features' ? 'expanded' : ''}`}>
                <div className="mobile-feature-grid">
                  {allFeatures.map((feature, index) => (
                    <div
                      key={feature.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <feature.Icon 
                          style={{ 
                            width: '1.5rem', 
                            height: '1.5rem', 
                            marginRight: '0.75rem',
                            color: '#a78bfa'
                          }} 
                        />
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                          {feature.title}
                        </h4>
                      </div>
                      
                      <p
                        style={{
                          color: '#e5e7eb',
                          marginBottom: '1rem',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {feature.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {feature.benefits.slice(0, 2).map((benefit, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#e9d5ff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Desktop Grid Layout
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {allFeatures.map((feature, index) => (
                <div
                  key={feature.id}
                  className="animate-fade-in-up"
                  style={{
                    position: 'relative',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    animationDelay: `${index * 150}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-0.5rem) scale(1.02)'
                    e.currentTarget.style.borderColor = '#8b5cf6'
                    e.currentTarget.style.boxShadow = `0 20px 40px #8b5cf640`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Icon */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', display: 'inline-flex' }}>
                      <feature.Icon className={`feature-icon ${getIconBg(index)} w-10 h-10 p-2 rounded-lg`} />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
                      {feature.title}
                    </h3>

                    <p
                      style={{
                        color: '#f9fafb',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </p>

                    <ul style={{ marginBottom: '1rem' }}>
                      {feature.benefits.map((b, i) => (
                        <li key={i} style={{ color: '#f9fafb', fontSize: '0.875rem', lineHeight: 1.6 }}>
                          • {b}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="#"
                      className="group"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#e9d5ff',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                      }}
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Cards (links) */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '3rem 0',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              Choose Your <span style={{ color: '#e9d5ff', fontWeight: 900 }}>Superpower</span>
            </h2>
            <p
              style={{
                fontSize: '1.25rem',
                color: '#f9fafb',
                maxWidth: '48rem',
                margin: '0 auto',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                fontWeight: 500,
              }}
            >
              Each category packs incredible features that will revolutionize how you run your dealership
            </p>
          </div>

          <div
            ref={cardsRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {featureCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/marketing/features/${category.id}`}
                style={{ position: 'relative', display: 'block', textDecoration: 'none', opacity: 1 }}
                className={`group feature-card-scroll stagger-${index + 1}`}
              >
                <div
                  className="feature-card-3d gpu-accelerated"
                  style={{
                    position: 'relative',
                    background: 'rgba(30, 41, 59, 0.85)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.5s ease',
                    cursor: 'pointer',
                    minHeight: '320px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-8px) rotateY(2deg)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(139, 92, 246, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0) rotateY(0deg)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                      borderRadius: '1rem',
                    }}
                  />

                  {/* Icon */}
                  <div style={{ position: 'relative', zIndex: 10, marginBottom: '1.5rem' }}>
                    <div
                      className="animate-float group-hover:rotate-12"
                      style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: '#ffffff',
                        transition: 'transform 0.5s ease',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      {category.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h3
                      className="group-hover:text-purple-100"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        marginBottom: '1rem',
                        textShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {category.title}
                    </h3>
                    <p
                      style={{
                        color: '#f9fafb',
                        marginBottom: '1.5rem',
                        lineHeight: 1.6,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        fontWeight: 500,
                      }}
                    >
                      {category.description}
                    </p>

                    <div
                      className="group-hover:scale-110"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(139, 92, 246, 0.8)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '9999px',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(147, 51, 234, 0.5)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {category.features.length} Features
                    </div>

                    {/* Preview list */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {category.features.slice(0, 3).map((feature, idx) => (
                        <div
                          key={feature.id}
                          className="group-hover:translate-x-2"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.875rem',
                            color: '#f9fafb',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            fontWeight: 500,
                            transition: 'transform 0.3s ease',
                            transitionDelay: `${idx * 50}ms`,
                          }}
                        >
                          <div
                            className="group-hover:animate-pulse"
                            style={{
                              width: '0.375rem',
                              height: '0.375rem',
                              background: '#e9d5ff',
                              borderRadius: '50%',
                              marginRight: '0.75rem',
                            }}
                          />
                          {feature.title}
                        </div>
                      ))}
                    </div>

                    <div
                      className="group-hover:text-white"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#e9d5ff',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      <span>Explore Powers</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section
        id="testimonials"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobile ? '2rem 0' : '3rem 0',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '2.5rem' }}>
            <h2
              style={{
                fontSize: isMobile ? '1.75rem' : '2.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              Trusted by <span style={{ color: '#a78bfa' }}>10,000+</span> Dealerships
            </h2>
            <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', color: '#f9fafb', maxWidth: '48rem', margin: '0 auto' }}>
              Join the elite dealers who've already transformed their business
            </p>
          </div>

          {isMobile ? (
            // Mobile: Single column with condensed testimonials
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                {
                  quote: "GhostCRM increased our sales by 300% in just 6 months.",
                  author: 'Mike Chen',
                  role: 'Sales Director',
                  company: 'Premier Auto Group',
                  metric: '+300% Sales',
                },
                {
                  quote: 'The AI lead scoring is incredible. We close 5x more deals now.',
                  author: 'Sarah Johnson',
                  role: 'General Manager',
                  company: 'Elite Motors',
                  metric: '5x More Closes',
                },
                {
                  quote: 'Setup took 3 minutes. ROI came in 2 weeks.',
                  author: 'David Rodriguez',
                  role: 'Owner',
                  company: 'Speed Dealership',
                  metric: '2 Week ROI',
                },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      right: '1rem',
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      color: '#ffffff',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    {t.metric}
                  </div>

                  <blockquote
                    style={{
                      fontSize: '1rem',
                      color: '#f9fafb',
                      marginBottom: '1rem',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    "{t.quote}"
                  </blockquote>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: `linear-gradient(135deg, ${
                          i % 3 === 0 ? '#8b5cf6, #ec4899' : i % 3 === 1 ? '#ec4899, #3b82f6' : '#3b82f6, #8b5cf6'
                        })`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        marginRight: '0.75rem',
                        fontSize: '1rem',
                      }}
                    >
                      {t.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{t.author}</div>
                      <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Grid layout
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2.5rem',
              }}
            >
              {[
                {
                  quote: "GhostCRM increased our sales by 300% in just 6 months. It's like having a sales superpower.",
                  author: 'Mike Chen',
                  role: 'Sales Director',
                  company: 'Premier Auto Group',
                  metric: '+300% Sales',
                },
                {
                  quote: 'The AI lead scoring is incredible. We close 5x more deals now with the same effort.',
                  author: 'Sarah Johnson',
                  role: 'General Manager',
                  company: 'Elite Motors',
                  metric: '5x More Closes',
                },
                {
                  quote: 'Setup took 3 minutes. ROI came in 2 weeks. This is the future of automotive sales.',
                  author: 'David Rodriguez',
                  role: 'Owner',
                  company: 'Speed Dealership',
                  metric: '2 Week ROI',
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="animate-fade-in-up"
                  style={{
                    position: 'relative',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    transform: `translateY(${i % 2 === 0 ? '1rem' : '0'})`,
                    animationDelay: `${i * 200}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-0.5rem) scale(1.02)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `translateY(${i % 2 === 0 ? '1rem' : '0'})`
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-0.75rem',
                      right: '1rem',
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    {t.metric}
                  </div>

                  <blockquote
                    style={{
                      fontSize: '1.125rem',
                      color: '#f9fafb',
                      marginBottom: '1.5rem',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    "{t.quote}"
                  </blockquote>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '3rem',
                        height: '3rem',
                        background: `linear-gradient(135deg, ${
                          i % 3 === 0 ? '#8b5cf6, #ec4899' : i % 3 === 1 ? '#ec4899, #3b82f6' : '#3b82f6, #8b5cf6'
                        })`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        marginRight: '1rem',
                        fontSize: '1.25rem',
                      }}
                    >
                      {t.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '0.25rem' }}>{t.author}</div>
                      <div style={{ fontSize: '0.875rem', color: '#a78bfa' }}>
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '2rem' : '3rem',
              flexWrap: 'wrap',
              opacity: 0.7,
            }}
          >
            {['SOC 2 Certified', 'GDPR Compliant', '99.9% Uptime', 'Enterprise Security', '24/7 Support'].map(
              (badge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', color: '#a78bfa', fontSize: isMobile ? '0.8rem' : '0.875rem', fontWeight: 500 }}>
                  <div style={{ width: '0.5rem', height: '0.5rem', background: '#a78bfa', borderRadius: '50%', marginRight: '0.5rem' }} />
                  {badge}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Comparison Matrix - Desktop Only */}
      {!isMobile && (
        <section
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '3rem 0',
          }}
        >
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '1rem',
                  textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                Why Choose <span style={{ color: '#a78bfa' }}>GhostCRM</span>?
              </h2>
            </div>

            <div
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '2rem',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 150px 150px',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#f9fafb', fontSize: '1.125rem' }}>Feature</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#a78bfa' }}>GhostCRM</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#9ca3af' }}>Competitor A</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#9ca3af' }}>Competitor B</div>

                {[
                  ['AI Lead Scoring', '✅', '❌', '❌'],
                  ['5-Min Setup', '✅', '❌', '⚠️'],
                  ['Real-time Analytics', '✅', '✅', '❌'],
                  ['Mobile App', '✅', '❌', '✅'],
                  ['24/7 Support', '✅', '⚠️', '❌'],
                  ['Custom Integrations', '✅', '❌', '❌'],
                  ['Price', '$99/mo', '$299/mo', '$199/mo'],
                ].map((row, index) => (
                  <React.Fragment key={index}>
                    <div style={{ color: '#f9fafb', padding: '1rem 0', borderTop: index > 0 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none' }}>
                      {row[0]}
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '1rem 0',
                        borderTop: index > 0 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                        color: row[1] === '✅' ? '#10b981' : row[1] === '❌' ? '#ef4444' : '#f59e0b',
                        fontWeight: 'bold',
                      }}
                    >
                      {row[1]}
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '1rem 0',
                        borderTop: index > 0 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                        color: row[2] === '✅' ? '#10b981' : row[2] === '❌' ? '#ef4444' : '#f59e0b',
                      }}
                    >
                      {row[2]}
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '1rem 0',
                        borderTop: index > 0 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                        color: row[3] === '✅' ? '#10b981' : row[3] === '❌' ? '#ef4444' : '#f59e0b',
                      }}
                    >
                      {row[3]}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Platform Overview */}
      <section
        id="platform"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobile ? '3rem 0' : '5rem 0',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '4rem' }}>
            <h2
              style={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              The Complete Automotive
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #e9d5ff, #fbcfe8, #ddd6fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 900,
                }}
              >
                Sales Ecosystem
              </span>
            </h2>
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                color: '#e5e7eb',
                maxWidth: '56rem',
                margin: '0 auto',
                lineHeight: 1.6,
                padding: isMobile ? '0 0.5rem' : '0',
              }}
            >
              Every tool your dealership needs to capture, convert, and close more deals—all in one powerful platform
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem',
              marginBottom: isMobile ? '3rem' : '4rem',
            }}
          >
            {/* Vehicle Management */}
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                🚗 Vehicle Management
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• Smart inventory tracking & analytics</li>
                <li>• QR code bulk generation (PDF/ZIP)</li>
                <li>• Digital window stickers</li>
                <li>• Multi-location management</li>
                <li>• Automated pricing optimization</li>
              </ul>
            </div>

            {/* Customer Engagement */}
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                👥 Customer Engagement
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• Test drive scheduling with round-robin</li>
                <li>• Financial calculators & estimators</li>
                <li>• Customer self-service portal</li>
                <li>• Multi-channel communication hub</li>
                <li>• Automated follow-up sequences</li>
              </ul>
            </div>

            {/* Sales & Analytics */}
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                📊 Sales & Analytics
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• Visual sales pipeline management</li>
                <li>• Real-time performance dashboards</li>
                <li>• AI-powered lead scoring</li>
                <li>• QR code engagement tracking</li>
                <li>• Custom reporting & insights</li>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                🔒 Security & Compliance
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• 5-tier role-based authentication</li>
                <li>• Complete tenant data isolation</li>
                <li>• Multi-company support</li>
                <li>• Compliance monitoring & reporting</li>
                <li>• Audit trail tracking</li>
              </ul>
            </div>

            {/* Automation & AI */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                🤖 Automation & AI
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• Intelligent workflow automation</li>
                <li>• AI-powered sales assistant</li>
                <li>• Automated task assignments</li>
                <li>• Predictive analytics</li>
                <li>• Smart agent matching</li>
              </ul>
            </div>

            {/* Integration & Platform */}
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1.5rem' : '2rem',
                transition: 'all 0.3s ease',
              }}
              className="hover:scale-105"
            >
              <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                🔗 Integration & Platform
              </h3>
              <ul style={{ color: '#e5e7eb', lineHeight: 1.8, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <li>• Enterprise DMS integration</li>
                <li>• Financial system connections</li>
                <li>• Mobile-first responsive design</li>
                <li>• API-first architecture</li>
                <li>• Third-party app ecosystem</li>
              </ul>
            </div>
          </div>

          {/* Why Choose Us */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '1.5rem',
              padding: isMobile ? '2rem' : '3rem',
              textAlign: 'center',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: isMobile ? '1.5rem' : '2rem',
              }}
            >
              Why Choose GhostCRM?
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: isMobile ? '1.5rem' : '2rem',
                marginBottom: isMobile ? '1.5rem' : '2rem',
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <h4 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.125rem' }}>
                  Built for Automotive
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  Designed specifically for car dealerships with industry-specific workflows and requirements
                </p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <h4 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.125rem' }}>
                  Revolutionary Innovation
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  QR code systems, tenant isolation, and AI features you won't find anywhere else
                </p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                <h4 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.125rem' }}>
                  Enterprise-Grade
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  Scalable architecture supporting multiple dealerships with complete data isolation
                </p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                <h4 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.125rem' }}>
                  Rapid Implementation
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  Get up and running in minutes with intuitive setup and comprehensive onboarding
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Back to Top Button */}
      {isMobile && (
        <div
          className="mobile-floating-nav"
          onClick={() => scrollToSection('hero')}
        >
          <ArrowRight style={{ width: '1.5rem', height: '1.5rem', transform: 'rotate(-90deg)', color: '#ffffff' }} />
        </div>
      )}

      {/* Epic CTA */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '4rem 0',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div
            className="animate-pulse morph-shape"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '24rem',
              height: '24rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              borderRadius: '50%',
              filter: 'blur(60px)',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2
              className="animate-fade-in-up"
              style={{
                fontSize: isMobile ? '2.5rem' : '3.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '2rem',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                lineHeight: 1.1,
              }}
            >
              Ready to Be
              <br />
              <span
                className="animate-gradient-x"
                style={{
                  background: 'linear-gradient(90deg, #e9d5ff, #fbcfe8, #ddd6fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 900,
                }}
              >
                Legendary?
              </span>
            </h2>

            <p
              className="animate-fade-in-up animation-delay-200"
              style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                color: '#f9fafb',
                marginBottom: '3rem',
                maxWidth: '32rem',
                marginInline: 'auto',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                fontWeight: 500,
                padding: isMobile ? '0 1rem' : '0',
              }}
            >
              Join the revolution. Transform your dealership. Become the competition&apos;s worst nightmare.
            </p>

            <Link
              href="/register"
              className="group magnetic-button glow-button epic-entrance animate-bounce-subtle"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                padding: isMobile ? '1.25rem 2.5rem' : '1.5rem 3rem',
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: isMobile ? '1rem' : '1.125rem',
                borderRadius: '1rem',
                boxShadow: '0 20px 50px rgba(139, 92, 246, 0.4)',
                textDecoration: 'none',
                transition: 'all 0.5s ease',
                border: 'none',
                cursor: 'pointer',
                justifyContent: 'center',
                minWidth: isMobile ? '280px' : '320px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(139, 92, 246, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)'
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(139, 92, 246, 0.4)'
              }}
            >
              <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                <Rocket className="mr-3" style={{ width: '1.5rem', height: '1.5rem' }} />
                Launch Your Empire
                <ArrowRight className="ml-3 transition-transform group-hover:translate-x-2" style={{ width: '1.5rem', height: '1.5rem' }} />
              </span>

              {/* Hover layers */}
              <div
                className="group-hover:opacity-100"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, #7c3aed, #db2777, #2563eb)',
                  borderRadius: '1rem',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
              <div
                className="group-hover:opacity-60"
                style={{
                  position: 'absolute',
                  inset: -1,
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)',
                  borderRadius: '1rem',
                  filter: 'blur(4px)',
                  opacity: 0.3,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </Link>

            <p
              className="animate-fade-in-up animation-delay-400"
              style={{ 
                color: '#a78bfa', 
                marginTop: '2rem', 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                padding: isMobile ? '0 1rem' : '0',
              }}
            >
              🚀 14-day free trial • ⚡ Setup in 5 minutes • 💎 No credit card required
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
