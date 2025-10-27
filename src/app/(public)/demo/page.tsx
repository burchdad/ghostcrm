'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Pause, RotateCcw, CheckCircle, TrendingUp, Users, Zap, BarChart3, MessageSquare, Calendar } from 'lucide-react'
import MarketingHeader from '@/components/marketing/MarketingHeader'

const demoSteps = [
  {
    id: 'lead-capture',
    title: 'AI Lead Capture',
    description: 'Watch as our AI instantly captures and analyzes a new lead',
    icon: Users,
    color: '#8b5cf6',
    duration: 3000,
    features: [
      'Auto-detects lead source',
      'Scores lead quality (A-F)',
      'Routes to best salesperson',
      'Creates follow-up tasks'
    ]
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics',
    description: 'Live dashboard updates with instant insights',
    icon: BarChart3,
    color: '#ec4899',
    duration: 2500,
    features: [
      'Sales performance metrics',
      'Lead conversion rates',
      'Revenue projections',
      'Team productivity'
    ]
  },
  {
    id: 'smart-automation',
    title: 'Smart Automation',
    description: 'Intelligent workflows that adapt and learn',
    icon: Zap,
    color: '#3b82f6',
    duration: 3500,
    features: [
      'Automated follow-ups',
      'Personalized messaging',
      'Task scheduling',
      'Performance optimization'
    ]
  },
  {
    id: 'communication-hub',
    title: 'Communication Hub',
    description: 'Unified messaging across all channels',
    icon: MessageSquare,
    color: '#10b981',
    duration: 2000,
    features: [
      'Email integration',
      'SMS automation',
      'Call logging',
      'Chat management'
    ]
  }
]

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && currentStep < demoSteps.length) {
      const step = demoSteps[currentStep]
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / (step.duration / 100))
          if (newProgress >= 100) {
            setCompletedSteps(prev => [...prev, currentStep])
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(currentStep + 1)
              return 0
            } else {
              setIsPlaying(false)
              return 100
            }
          }
          return newProgress
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentStep])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setProgress(0)
    setCompletedSteps([])
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setProgress(0)
    setIsPlaying(false)
  }

  const currentStepData = demoSteps[currentStep]

  return (
    <>
      <MarketingHeader />
      
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Orbs */}
        <div className="pricing-orb pricing-orb-1"></div>
        <div className="pricing-orb pricing-orb-2"></div>
        <div className="pricing-orb pricing-orb-3"></div>

        <div className="relative z-10 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Live Demo Experience
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Watch GhostCRM transform a real dealership scenario in real-time. 
                See the power of AI-driven automation and analytics.
              </p>
              
              {/* Demo Controls */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause Demo' : 'Start Demo'}
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Demo Container */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Left: Demo Visualization */}
              <div className="relative">
                <div 
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 min-h-[500px]"
                  style={{ borderColor: currentStepData?.color + '40' }}
                >
                  {/* Current Step Display */}
                  <div className="text-center mb-8">
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${currentStepData?.color}80, ${currentStepData?.color}40)` 
                      }}
                    >
                      <currentStepData.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {currentStepData?.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-6">
                      {currentStepData?.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                      <div 
                        className="h-2 rounded-full transition-all duration-100 ease-linear"
                        style={{ 
                          width: `${progress}%`,
                          background: currentStepData?.color 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Demo Features List */}
                  <div className="space-y-3">
                    {currentStepData?.features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                          progress > (index + 1) * 25 
                            ? 'bg-green-500 bg-opacity-20 text-green-300' 
                            : 'bg-white bg-opacity-5 text-gray-400'
                        }`}
                      >
                        <CheckCircle 
                          className={`w-5 h-5 ${
                            progress > (index + 1) * 25 ? 'text-green-400' : 'text-gray-500'
                          }`} 
                        />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Metrics Simulation */}
                  {isPlaying && (
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {Math.floor(progress * 2)}%
                        </div>
                        <div className="text-sm text-gray-400">Efficiency</div>
                      </div>
                      <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          ${Math.floor(progress * 50 + 1000)}
                        </div>
                        <div className="text-sm text-gray-400">Revenue</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Step Navigation */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-6">Demo Steps</h3>
                
                {demoSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                      currentStep === index
                        ? 'bg-white bg-opacity-15 border-white border-opacity-30 shadow-lg'
                        : 'bg-white bg-opacity-5 border-white border-opacity-10 hover:bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div 
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            completedSteps.includes(index) 
                              ? 'bg-green-500' 
                              : currentStep === index 
                                ? 'bg-opacity-80' 
                                : 'bg-opacity-40'
                          }`}
                          style={{ 
                            backgroundColor: completedSteps.includes(index) 
                              ? '#10b981' 
                              : step.color + (currentStep === index ? '80' : '40')
                          }}
                        >
                          {completedSteps.includes(index) ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <step.icon className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-2">{step.title}</h4>
                        <p className="text-gray-300 text-sm">{step.description}</p>
                        
                        {currentStep === index && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full transition-all duration-100"
                                style={{ 
                                  width: `${progress}%`,
                                  background: step.color 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Experience This for Your Dealership?
                </h3>
                <p className="text-gray-300 mb-6">
                  Start your free trial and see these features transform your business in real-time.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  
                  <Link
                    href="/marketing/pricing"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-xl hover:bg-opacity-30 transition-all duration-200"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
