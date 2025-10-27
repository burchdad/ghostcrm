'use client'

import { X, Check } from 'lucide-react'
import { useEffect } from 'react'

interface FeatureModalProps {
  isOpen: boolean
  onClose: () => void
  feature: {
    id: string
    Icon: any
    title: string
    description: string
    benefits: string[]
    details: string[]
    bgColor: string
  }
}

export default function FeatureModal({ isOpen, onClose, feature }: FeatureModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const Icon = feature.Icon

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="feature-modal-header">
          <div className="flex items-center gap-4">
            <div className={`feature-modal-icon ${feature.bgColor}`}>
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="feature-modal-title">{feature.title}</h2>
              <p className="feature-modal-subtitle">{feature.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="feature-modal-close"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="feature-modal-content">
          {/* Key Benefits */}
          <div className="feature-modal-section">
            <h3 className="feature-modal-section-title">Key Benefits</h3>
            <div className="feature-benefits-grid">
              {feature.benefits.map((benefit, index) => (
                <div key={index} className="feature-benefit-item">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Features */}
          <div className="feature-modal-section">
            <h3 className="feature-modal-section-title">What's Included</h3>
            <div className="feature-details-list">
              {feature.details.map((detail, index) => (
                <div key={index} className="feature-detail-item">
                  <div className="feature-detail-bullet"></div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="feature-modal-cta">
            <div className="feature-modal-cta-content">
              <h4 className="feature-modal-cta-title">Ready to get started?</h4>
              <p className="feature-modal-cta-subtitle">
                See how {feature.title.toLowerCase()} can transform your sales process.
              </p>
            </div>
            <div className="feature-modal-cta-buttons">
              <button className="btn btn-primary">
                Start Free Trial
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}