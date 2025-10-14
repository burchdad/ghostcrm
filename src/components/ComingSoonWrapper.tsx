"use client";
import React from 'react';
import Link from 'next/link';

interface ComingSoonWrapperProps {
  feature: string;
  children: React.ReactNode;
  enabled?: boolean;
  comingSoonDate?: string;
  description?: string;
}

const featureRoadmap = {
  'calendar': {
    title: 'Smart Calendar & Scheduling',
    date: 'November 2025', 
    description: 'AI-powered appointment scheduling with conflict resolution',
    icon: '📅',
    priority: 'high'
  },
  'inventory': {
    title: 'Inventory Management Suite',
    date: 'December 2025',
    description: 'Complete stock tracking, alerts, and optimization',
    icon: '📦', 
    priority: 'medium'
  },
  'finance': {
    title: 'Financial Reporting & Analytics',
    date: 'December 2025',
    description: 'Advanced financial dashboards and forecasting',
    icon: '💰',
    priority: 'high'
  },
  'marketing': {
    title: 'Marketing Automation Engine',
    date: 'January 2026',
    description: 'Email campaigns, lead nurturing, and attribution',
    icon: '📧',
    priority: 'medium'
  },
  'compliance': {
    title: 'Compliance & Security Suite',
    date: 'Q1 2026',
    description: 'GDPR, HIPAA, and enterprise security features',
    icon: '🛡️',
    priority: 'low'
  },
  'bi': {
    title: 'Business Intelligence Platform', 
    date: 'Q1 2026',
    description: 'Advanced analytics and custom reporting',
    icon: '📊',
    priority: 'medium'
  }
};

export default function ComingSoonWrapper({
  feature,
  children,
  enabled = false,
  comingSoonDate,
  description
}: ComingSoonWrapperProps) {
  
  if (enabled) {
    return <>{children}</>;
  }

  const featureInfo = featureRoadmap[feature as keyof typeof featureRoadmap];
  const displayDate = comingSoonDate || featureInfo?.date || 'Coming Soon';
  const displayDescription = description || featureInfo?.description || 'This feature is under development';
  const icon = featureInfo?.icon || '🚀';
  const priority = featureInfo?.priority || 'medium';

  const priorityColors = {
    high: 'from-green-500 to-emerald-600 border-green-200',
    medium: 'from-blue-500 to-cyan-600 border-blue-200', 
    low: 'from-gray-500 to-slate-600 border-gray-200'
  };

  const priorityLabels = {
    high: 'High Priority',
    medium: 'Planned',
    low: 'Future Release'
  };

  return (
    <div className="relative">
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-dashed border-blue-300">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          
          {/* Feature Preview (Blurred Background) */}
          <div className="absolute inset-4 -z-10 opacity-30 blur-sm pointer-events-none">
            {children}
          </div>

          {/* Coming Soon Content */}
          <div className={`bg-gradient-to-r ${priorityColors[priority]} text-white rounded-xl p-6 max-w-md shadow-lg`}>
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-xl font-bold mb-2">
              {featureInfo?.title || `${feature.charAt(0).toUpperCase() + feature.slice(1)} Module`}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {displayDescription}
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                {priorityLabels[priority]}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                {displayDate}
              </span>
            </div>

            <div className="space-y-2">
              <Link 
                href="/roadmap" 
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                📋 View Full Roadmap
              </Link>
              
              <div className="text-xs text-white/80">
                Want early access? Contact sales for beta testing!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Content (Blurred) */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}  
      </div>
    </div>
  );
}

// Convenient hook for feature gating
export function useFeatureGating() {
  // Phase 1 enabled features
  const enabledFeatures = new Set([
    'dashboard',
    'leads', 
    'deals',
    'ai',
    'chart-marketplace',
    'analytics'
  ]);

  const isEnabled = (feature: string) => enabledFeatures.has(feature);
  
  const wrapFeature = (feature: string, children: React.ReactNode) => (
    <ComingSoonWrapper feature={feature} enabled={isEnabled(feature)}>
      {children}
    </ComingSoonWrapper>
  );

  return { isEnabled, wrapFeature };
}