'use client'

import React from 'react'
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  CreditCardIcon, 
  CogIcon 
} from '@heroicons/react/24/outline'

interface StepIconProps {
  type: 'organization' | 'team' | 'billing' | 'integrations'
  className?: string
}

const StepIcon: React.FC<StepIconProps> = ({ type, className = '' }) => {
  const getIconStyles = () => {
    const baseStyles = {
      width: '4rem',
      height: '4rem',
      borderRadius: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    switch (type) {
      case 'organization':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
        }
      case 'team':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #10b981, #047857)',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
        }
      case 'billing':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
        }
      case 'integrations':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
        }
    }
  }

  const getIcon = () => {
    const iconStyles = {
      width: type === 'organization' ? '2rem' : '2.5rem',
      height: type === 'organization' ? '2rem' : '2.5rem',
      color: 'white',
    }

    switch (type) {
      case 'organization':
        return <BuildingOfficeIcon style={iconStyles} />
      case 'team':
        return <UsersIcon style={iconStyles} />
      case 'billing':
        return <CreditCardIcon style={iconStyles} />
      case 'integrations':
        return <CogIcon style={iconStyles} />
    }
  }

  return (
    <div style={getIconStyles()} className={className}>
      {getIcon()}
    </div>
  )
}

export default StepIcon