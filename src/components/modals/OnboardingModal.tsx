'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface OnboardingModalProps {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  allowClose?: boolean
  className?: string
}

export default function OnboardingModal({ 
  isOpen, 
  onClose, 
  children, 
  allowClose = false,
  className = '' 
}: OnboardingModalProps) {
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowClose && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, allowClose, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Enhanced Backdrop with stronger blur effect - covers everything */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xl backdrop-saturate-150"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            onClick={allowClose ? onClose : () => {
              // Gentle bounce animation when clicking backdrop during required onboarding
              const modal = document.querySelector('[data-modal-content]')
              if (modal) {
                modal.classList.add('animate-pulse')
                setTimeout(() => modal.classList.remove('animate-pulse'), 200)
              }
            }}
          />
          
          {/* Modal Container with enhanced styling */}
          <motion.div
            data-modal-content
            initial={{ 
              opacity: 0, 
              scale: 0.9,
              y: 40
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              y: 40
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] // Custom easing for smooth animation
            }}
            className={`
              relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/10
              max-w-5xl w-full max-h-[85vh] overflow-hidden
              ${className}
            `}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Close button (only if allowed) */}
            {allowClose && onClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 text-gray-400 hover:text-gray-600 
                          hover:bg-gray-100 rounded-xl transition-all duration-200
                          hover:scale-105 active:scale-95"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
            
            {/* Modal Content with better scrolling */}
            <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}