"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'beta' | 'development' | 'planned';
  quarter: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  features: string[];
  estimatedDate: string;
}

const roadmapData: RoadmapItem[] = [
  {
    id: 'mvp-launch',
    title: 'Core CRM Platform',
    description: 'Essential CRM functionality with AI-powered analytics',
    status: 'live',
    quarter: 'Q4 2025',
    priority: 'high',
    icon: '🚀',
    estimatedDate: 'October 2025',
    features: [
      'Dashboard & Analytics',
      'AI Chart Marketplace',
      'Lead Management',
      'Contact Management', 
      'Basic Deal Pipeline',
      'AI Assistant'
    ]
  },
  {
    id: 'calendar-scheduling',
    title: 'Smart Calendar & Scheduling',
    description: 'AI-powered appointment scheduling with conflict resolution',
    status: 'beta',
    quarter: 'Q4 2025', 
    priority: 'high',
    icon: '📅',
    estimatedDate: 'November 2025',
    features: [
      'Calendar Integration',
      'Smart Scheduling',
      'Conflict Resolution',
      'Meeting Automation',
      'Timezone Management',
      'Appointment Reminders'
    ]
  },
  {
    id: 'advanced-ai',
    title: 'Advanced AI Agents',
    description: 'Sophisticated AI agents for sales, marketing, and operations',
    status: 'development',
    quarter: 'Q4 2025',
    priority: 'high', 
    icon: '🤖',
    estimatedDate: 'December 2025',
    features: [
      'Sales Automation Agent',
      'Churn Prevention AI',
      'Lead Scoring 2.0',
      'Content Generation',
      'Predictive Analytics',
      'Smart Recommendations'
    ]
  },
  {
    id: 'finance-suite',
    title: 'Financial Management',
    description: 'Complete financial reporting and forecasting tools',
    status: 'development',
    quarter: 'Q1 2026',
    priority: 'high',
    icon: '💰', 
    estimatedDate: 'January 2026',
    features: [
      'Financial Dashboards',
      'Revenue Forecasting',
      'Expense Tracking',
      'Profit Analysis',
      'Budget Management',
      'Financial Reporting'
    ]
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management',
    description: 'Smart inventory tracking with predictive restocking',
    status: 'planned',
    quarter: 'Q1 2026',
    priority: 'medium',
    icon: '📦',
    estimatedDate: 'February 2026',
    features: [
      'Stock Tracking',
      'Low Stock Alerts',
      'Predictive Restocking',
      'Supplier Management',
      'Inventory Analytics',
      'Barcode Scanning'
    ]
  },
  {
    id: 'marketing-automation',
    title: 'Marketing Automation',
    description: 'Email campaigns, lead nurturing, and attribution tracking',
    status: 'planned',
    quarter: 'Q1 2026',
    priority: 'medium',
    icon: '📧',
    estimatedDate: 'March 2026',
    features: [
      'Email Campaigns',
      'Lead Nurturing',
      'Marketing Attribution',
      'A/B Testing',
      'Campaign Analytics',
      'Social Media Integration'
    ]
  }
];

export default function RoadmapPage() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const statusColors = {
    live: 'bg-green-100 text-green-800 border-green-200',
    beta: 'bg-blue-100 text-blue-800 border-blue-200',
    development: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    planned: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    live: '✅',
    beta: '🧪', 
    development: '🔧',
    planned: '📋'
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-gray-400'
  };

  const filteredRoadmap = roadmapData.filter(item => {
    const quarterMatch = selectedQuarter === 'all' || item.quarter === selectedQuarter;
    const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
    return quarterMatch && priorityMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Product Roadmap
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            See what's coming next to GhostCRM - your AI-powered business platform
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <select 
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Quarters</option>
              <option value="Q4 2025">Q4 2025</option>
              <option value="Q1 2026">Q1 2026</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {filteredRoadmap.map((item, index) => (
            <div 
              key={item.id}
              className={`bg-white rounded-xl shadow-lg border-l-4 ${priorityColors[item.priority]} p-6 hover:shadow-xl transition-shadow`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Icon & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[item.status]}`}>
                      {statusIcons[item.status]} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.estimatedDate}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {item.quarter}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {item.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-blue-500">•</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  {item.status === 'live' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🚀 Try Now
                      </Link>
                    </div>
                  )}
                  
                  {item.status === 'beta' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        🧪 Join Beta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Want to Influence Our Roadmap?</h2>
          <p className="text-blue-100 mb-6">
            Your feedback shapes what we build next. Join our community and help prioritize features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/feedback"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📝 Submit Feedback
            </Link>
            <Link 
              href="/beta"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
            >
              🧪 Join Beta Program
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
