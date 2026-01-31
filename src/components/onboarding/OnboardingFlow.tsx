'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Circle, 
  Users, 
  TrendingUp, 
  Calendar, 
  Settings,
  FileText,
  Zap,
  Car,
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  completed: boolean
  estimatedTime: string
  priority: 'high' | 'medium' | 'low'
}

interface OnboardingFlowProps {
  className?: string
  onDismiss?: () => void
  showDismiss?: boolean
}

export default function OnboardingFlow({ 
  className = "",
  onDismiss,
  showDismiss = true 
}: OnboardingFlowProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'organization',
      title: 'Set Up Organization',
      description: 'Create your company profile and workspace settings',
      icon: Settings,
      href: '/onboarding/organization',
      completed: false,
      estimatedTime: '3 min',
      priority: 'high'
    },
    {
      id: 'first-lead',
      title: 'Add Your First Lead',
      description: 'Import leads or add one manually to get started',
      icon: Users,
      href: '/leads',
      completed: false,
      estimatedTime: '3 min',
      priority: 'high'
    },
    {
      id: 'first-deal',
      title: 'Create Your First Deal',
      description: 'Turn a lead into a sales opportunity',
      icon: TrendingUp,
      href: '/deals',
      completed: false,
      estimatedTime: '5 min',
      priority: 'medium'
    },
    {
      id: 'schedule-appointment',
      title: 'Schedule an Appointment',
      description: 'Book a meeting or call with a lead',
      icon: Calendar,
      href: '/appointments',
      completed: false,
      estimatedTime: '2 min',
      priority: 'medium'
    },
    {
      id: 'integrations',
      title: 'Connect Integrations',
      description: 'Link your email, calendar, and other tools',
      icon: Zap,
      href: '/settings/integrations',
      completed: false,
      estimatedTime: '10 min',
      priority: 'low'
    },
    {
      id: 'customize-dashboard',
      title: 'Customize Your Dashboard',
      description: 'Add charts and widgets that matter to you',
      icon: Car,
      href: '/dashboard/chart-marketplace',
      completed: false,
      estimatedTime: '5 min',
      priority: 'low'
    }
  ])

  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const highPrioritySteps = steps.filter(step => step.priority === 'high' && !step.completed)
  const nextStep = steps.find(step => !step.completed)

  useEffect(() => {
    // Check localStorage for completed steps
    const savedProgress = localStorage.getItem('onboarding-progress')
    const orgSetupComplete = localStorage.getItem('organization-setup-complete')
    
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setSteps(prevSteps => 
          prevSteps.map(step => ({
            ...step,
            completed: progress.includes(step.id)
          }))
        )
      } catch (e) {
        console.warn('Failed to parse onboarding progress')
      }
    }

    // Auto-complete organization step if setup was done
    if (orgSetupComplete === 'true') {
      setSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === 'organization' ? { ...step, completed: true } : step
        )
      )
    }
  }, [])

  const markStepComplete = (stepId: string) => {
    setSteps(prevSteps => {
      const updatedSteps = prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
      
      // Save to localStorage
      const completedIds = updatedSteps.filter(s => s.completed).map(s => s.id)
      localStorage.setItem('onboarding-progress', JSON.stringify(completedIds))
      
      return updatedSteps
    })
  }

  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', 'true')
    if (onDismiss) onDismiss()
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Welcome to GhostCRM!</h3>
              <p className="text-sm text-gray-600">Get started with these essential steps</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Minimize"
            >
              <Circle className="w-5 h-5" />
            </button>
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {completedSteps} of {totalSteps} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions for High Priority */}
      {highPrioritySteps.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">🚀 Quick Start (Essential)</h4>
          <div className="space-y-2">
            {highPrioritySteps.slice(0, 2).map((step) => (
              <Link
                key={step.id}
                href={step.href}
                onClick={() => markStepComplete(step.id)}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <step.icon className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-700">
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-600">{step.estimatedTime}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Steps */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">All Setup Steps</h4>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.completed ? CheckCircle2 : Circle
            const iconColor = step.completed ? 'text-green-600' : 'text-gray-400'
            const priorityColor = step.priority === 'high' ? 'border-l-orange-400' : 
                                step.priority === 'medium' ? 'border-l-blue-400' : 'border-l-gray-300'
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${priorityColor} ${
                  step.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                } transition-all duration-200`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className={`font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                      {step.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                      {step.priority === 'high' && !step.completed && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                          Essential
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.description}
                  </div>
                </div>

                {!step.completed && (
                  <Link
                    href={step.href}
                    onClick={() => markStepComplete(step.id)}
                    className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                  >
                    Start
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Completion Message */}
        {completedSteps === totalSteps && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Congratulations! 🎉</div>
                <div className="text-sm text-green-700">
                  You've completed the initial setup. Your CRM is ready to help you grow your business!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple progress indicator for other components
export function OnboardingProgress() {
  const [completedCount, setCompletedCount] = useState(0)
  const totalSteps = 6

  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding-progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setCompletedCount(progress.length)
      } catch (e) {
        setCompletedCount(0)
      }
    }
  }, [])

  if (completedCount === totalSteps) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg">
      <div className="flex items-center justify-between text-sm">
        <span>Setup Progress: {completedCount}/{totalSteps}</span>
        <span>{Math.round((completedCount / totalSteps) * 100)}%</span>
      </div>
      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1">
        <div 
          className="bg-white h-1 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}