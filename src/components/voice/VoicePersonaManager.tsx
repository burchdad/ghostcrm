'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiSettings, FiPlay, FiPause, FiEdit3, FiTrash2, FiPlus, FiBarChart } from 'react-icons/fi';
import { VoicePersona, VoicePersonaEngine, VoiceHealthAnalyzer } from '@/lib/voice/VoicePersonaEngine';

interface VoicePersonaManagerProps {
  tenantId: string;
  onPersonaUpdate?: (personas: VoicePersona[]) => void;
}

export default function VoicePersonaManager({ tenantId, onPersonaUpdate }: VoicePersonaManagerProps) {
  const [personas, setPersonas] = useState<VoicePersona[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'personas' | 'analytics' | 'rules'>('overview');
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockPersonas: VoicePersona[] = [
      {
        id: 'owner_primary',
        name: 'Owner - John Smith',
        description: 'Authoritative, trustworthy voice for VIP customers and key moments',
        voiceId: 'voice_001',
        tenantId,
        label: 'Owner Voice',
        tonePreset: 'authoritative',
        emotionalRange: { warmth: 70, authority: 95, empathy: 60, energy: 75 },
        useCases: ['vip_calls', 'collections', 'emergency'],
        contextRules: {
          callType: ['warm_follow_up', 'sales_close'],
          customerSegment: ['vip', 'existing_customer'],
          department: ['sales']
        },
        healthScore: {
          clarity: 92,
          consistency: 88,
          emotionalRange: 85,
          noiseLevel: 94,
          overall: 90,
          lastAnalyzed: new Date().toISOString(),
          recommendations: ['Excellent voice quality! Production ready.']
        },
        analytics: {
          totalCalls: 234,
          completionRate: 87,
          avgCallDuration: 145,
          customerSatisfactionScore: 4.6,
          conversionRate: 23,
          hangupRate: 13
        },
        brandSafety: {
          approved: true,
          approvedBy: 'John Smith',
          approvedAt: new Date().toISOString(),
          contentFilters: [],
          lastReview: new Date().toISOString()
        },
        training: {
          phoneticCoverage: 95,
          sampleCount: 3,
          suggestedImprovements: [],
          nextTrainingRecommended: ''
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sales_friendly',
        name: 'Sales Rep - Sarah',
        description: 'Warm, approachable voice for lead nurturing and follow-ups',
        voiceId: 'voice_002',
        tenantId,
        label: 'Friendly Sales Voice',
        tonePreset: 'friendly',
        emotionalRange: { warmth: 90, authority: 60, empathy: 85, energy: 80 },
        useCases: ['outbound_reminder', 'post_sale_checkin', 'onboarding'],
        contextRules: {
          callType: ['cold_outbound', 'warm_follow_up'],
          customerSegment: ['new_lead'],
          department: ['sales']
        },
        healthScore: {
          clarity: 88,
          consistency: 92,
          emotionalRange: 94,
          noiseLevel: 87,
          overall: 90,
          lastAnalyzed: new Date().toISOString(),
          recommendations: ['Great emotional range!']
        },
        analytics: {
          totalCalls: 456,
          completionRate: 92,
          avgCallDuration: 128,
          customerSatisfactionScore: 4.8,
          conversionRate: 18,
          hangupRate: 8
        },
        brandSafety: {
          approved: true,
          approvedBy: 'John Smith',
          approvedAt: new Date().toISOString(),
          contentFilters: [],
          lastReview: new Date().toISOString()
        },
        training: {
          phoneticCoverage: 88,
          sampleCount: 2,
          suggestedImprovements: ['Consider adding more authoritative samples'],
          nextTrainingRecommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setPersonas(mockPersonas);
    setInsights(VoiceHealthAnalyzer.generateVoiceInsights(mockPersonas));
  }, [tenantId]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Very Good';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FiTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Voice Performance Insights
        </h4>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-sm text-gray-700">
              • {insight}
            </p>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Personas</p>
              <p className="text-2xl font-bold text-gray-900">{personas.filter(p => p.isActive).length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(personas.reduce((sum, p) => sum + p.analytics.completionRate, 0) / personas.length)}%
              </p>
            </div>
            <FiBarChart className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total AI Calls</p>
              <p className="text-2xl font-bold text-purple-600">
                {personas.reduce((sum, p) => sum + p.analytics.totalCalls, 0).toLocaleString()}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonas = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-900">Voice Personas Library</h4>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Create Persona
        </button>
      </div>

      {personas.map((persona) => (
        <div key={persona.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h5 className="font-medium text-gray-900 mr-3">{persona.name}</h5>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {persona.label}
                </span>
                {persona.isActive && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Live
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Health Score</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${getHealthScoreColor(persona.healthScore.overall)}`}>
                      {persona.healthScore.overall}%
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {getHealthScoreLabel(persona.healthScore.overall)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Completion Rate</span>
                  <div className="font-medium text-green-600">{persona.analytics.completionRate}%</div>
                </div>
                
                <div>
                  <span className="text-gray-500">Total Calls</span>
                  <div className="font-medium text-gray-900">{persona.analytics.totalCalls.toLocaleString()}</div>
                </div>
                
                <div>
                  <span className="text-gray-500">Conversion Rate</span>
                  <div className="font-medium text-blue-600">{persona.analytics.conversionRate}%</div>
                </div>
              </div>

              {/* Tone & Use Cases */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {persona.tonePreset}
                </span>
                {persona.useCases.slice(0, 3).map((useCase) => (
                  <span key={useCase} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {useCase.replace('_', ' ')}
                  </span>
                ))}
                {persona.useCases.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{persona.useCases.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button 
                onClick={() => setSelectedPersona(persona)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Edit persona"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Delete persona"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-900">Performance Analytics</h4>
      
      {/* Conversion Rate Comparison */}
      <div className="bg-white border rounded-lg p-6">
        <h5 className="font-medium text-gray-900 mb-4">Conversion Rate by Persona</h5>
        <div className="space-y-3">
          {personas.map((persona) => (
            <div key={persona.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{persona.name}</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div 
                    className="h-2 bg-blue-600 rounded-full" 
                    style={{ width: `${Math.min(100, (persona.analytics.conversionRate / 30) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{persona.analytics.conversionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Satisfaction */}
      <div className="bg-white border rounded-lg p-6">
        <h5 className="font-medium text-gray-900 mb-4">Customer Satisfaction Scores</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((persona) => (
            <div key={persona.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{persona.name}</span>
              <div className="flex items-center">
                <span className="text-lg font-bold text-yellow-500 mr-1">★</span>
                <span className="font-medium">{persona.analytics.customerSatisfactionScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Voice Persona Management</h3>
            <p className="text-sm text-gray-600">Advanced voice identity system with context-aware selection</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              Voice OS™
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <nav className="flex space-x-6">
          {[
            { id: 'overview', label: 'Overview', icon: FiBarChart },
            { id: 'personas', label: 'Personas', icon: FiUsers },
            { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
            { id: 'rules', label: 'Smart Rules', icon: FiSettings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'personas' && renderPersonas()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'rules' && (
          <div className="text-center py-12 text-gray-500">
            <FiSettings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">Smart Rules Coming Soon</h4>
            <p>Context-aware voice switching and automated persona selection</p>
          </div>
        )}
      </div>

      {/* Premium Features Notice */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Voice OS Premium:</span> Unlock emotional range analysis, A/B testing, and advanced analytics
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}