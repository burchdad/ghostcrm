'use client'

import { useState } from 'react'
import { Users, Workflow, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import FeatureModal from '../FeatureModal'

const features = [
  {
    id: 'lead-management',
    Icon: Users,
    bgColor: 'bg-blue-100',
    hoverColor: 'group-hover:bg-blue-200',
    title: 'Lead Management',
    description: 'Capture, qualify, and convert leads with intelligent automation and personalized follow-ups.',
    benefits: [
      'Automated lead scoring and qualification',
      'Multi-channel lead capture (web, social, referrals)',
      'Intelligent lead distribution and routing',
      'Personalized follow-up campaigns',
      'Lead source tracking and analytics'
    ],
    details: [
      'Import leads from multiple sources including your website, social media, and third-party platforms',
      'Use AI-powered lead scoring to prioritize high-value prospects automatically',
      'Set up automated workflows for immediate lead response and nurturing',
      'Track lead interactions across all touchpoints for complete visibility',
      'Create custom lead qualification criteria tailored to your business'
    ]
  },
  {
    id: 'workflow-automation',
    Icon: Workflow,
    bgColor: 'bg-purple-100',
    hoverColor: 'group-hover:bg-purple-200',
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks and create powerful workflows with our visual builder.',
    benefits: [
      'Visual drag-and-drop workflow designer',
      'Pre-built templates for common processes',
      'Custom triggers and conditional logic',
      'Integration with external tools and services',
      'Real-time workflow monitoring and optimization'
    ],
    details: [
      'Design complex workflows using our intuitive visual builder interface',
      'Set up automated tasks like sending emails, updating records, and scheduling follow-ups',
      'Create conditional branches based on customer behavior and data',
      'Connect with popular tools like email platforms, calendars, and marketing automation',
      'Monitor workflow performance with detailed analytics and optimization suggestions'
    ]
  },
  {
    id: 'sales-analytics',
    Icon: BarChart3,
    bgColor: 'bg-green-100',
    hoverColor: 'group-hover:bg-green-200',
    title: 'Sales Analytics',
    description: 'Real-time insights and performance tracking to optimize your sales process.',
    benefits: [
      'Real-time sales performance dashboards',
      'Customizable reports and KPI tracking',
      'Sales forecasting and trend analysis',
      'Team performance comparisons',
      'Revenue attribution and source analysis'
    ],
    details: [
      'Access comprehensive dashboards showing your sales metrics in real-time',
      'Generate custom reports for any time period or specific criteria',
      'Use predictive analytics to forecast sales and identify trends',
      'Compare individual and team performance with detailed breakdowns',
      'Track revenue sources and attribution to optimize your marketing spend'
    ]
  }
];

export default function FeaturesGrid() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null)

  return (
    <>
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Everything You Need to Dominate Auto Sales
            </h2>
            <p className="features-subtitle">
              From lead capture to deal closing, our platform handles every aspect of your sales process.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.Icon
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className={`feature-icon ${feature.bgColor}`}>
                      {Icon ? <Icon className="w-6 h-6 text-blue-600" /> : null}
                    </div>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">
                    {feature.description}
                  </p>
                  <button 
                    onClick={() => setSelectedFeature(feature)}
                    className="feature-link"
                  >
                    Learn more →
                  </button>
                </div>
              )
            })}
          </div>

          <div className="features-cta">
            <Link href="/marketing/features" className="btn features-btn">
              View All Features
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {selectedFeature && (
        <FeatureModal
          isOpen={!!selectedFeature}
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </>
  );
}