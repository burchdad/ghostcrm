"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Bot, Lightbulb, TrendingUp, AlertCircle, RefreshCw, X } from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth/client';

interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

interface PageAIAssistantProps {
  agentId: 'leads' | 'deals' | 'inventory' | 'calendar' | 'collaboration' | 'workflow' | 'dashboard';
  pageTitle: string;
  entityId?: string;
  entityData?: any;
  className?: string;
}

const getImpactColor = (impact: string) => {
  const colors = {
    'low': 'border-l-blue-500 bg-blue-50',
    'medium': 'border-l-yellow-500 bg-yellow-50',
    'high': 'border-l-orange-500 bg-orange-50',
    'critical': 'border-l-red-500 bg-red-50',
  };
  return colors[impact as keyof typeof colors] || 'border-l-gray-500 bg-gray-50';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'optimization':
    case 'efficiency':
      return TrendingUp;
    case 'risk':
    case 'warning':
      return AlertCircle;
    default:
      return Lightbulb;
  }
};

function PageAIAssistant({ 
  agentId, 
  pageTitle, 
  entityId, 
  entityData,
  className = ""
}: PageAIAssistantProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      // Handle dashboard endpoint differently
      if (agentId === 'dashboard') {
        const response = await authenticatedFetch(`/api/ai/agents/dashboard`, {
          method: 'POST',
          body: JSON.stringify({
            action: 'get-insights',
            pageTitle,
            entityId,
            entityData,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setInsights(data.data?.insights || []);
          setLastUpdate(new Date());
        }
      } else {
        // Handle individual agent endpoints
        const response = await authenticatedFetch(`/api/ai/agents/${agentId}`, {
          method: 'POST',
          body: JSON.stringify({
            operation: 'get-insights',
            data: entityId ? { 
              [`${agentId.slice(0, -1)}Id`]: entityId, // Remove 's' from agentId
              [`${agentId.slice(0, -1)}Data`]: entityData 
            } : {},
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setInsights(data.data || []);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error(`Failed to load ${agentId} insights:`, error);
    } finally {
      setLoading(false);
    }
  }, [agentId, entityId, entityData, pageTitle]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const analyzeEntity = useCallback(async () => {
    if (!entityId || !entityData) {
      await loadInsights();
      return;
    }

    setLoading(true);
    try {
      // Handle dashboard endpoint differently
      if (agentId === 'dashboard') {
        const response = await authenticatedFetch(`/api/ai/agents/dashboard`, {
          method: 'POST',
          body: JSON.stringify({
            action: 'analyze',
            pageTitle,
            entityId,
            entityData,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setInsights(data.data?.insights || []);
          setLastUpdate(new Date());
        }
      } else {
        // Handle individual agent endpoints
        const response = await authenticatedFetch(`/api/ai/agents/${agentId}`, {
          method: 'POST',
          body: JSON.stringify({
            operation: 'analyze',
            data: {
              [`${agentId.slice(0, -1)}Id`]: entityId,
              [`${agentId.slice(0, -1)}Data`]: entityData,
            },
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setInsights(data.data || []);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error(`Failed to analyze with ${agentId}:`, error);
    } finally {
      setLoading(false);
    }
  }, [agentId, entityId, entityData, loadInsights, pageTitle]);

  if (collapsed) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        <button
          onClick={() => setCollapsed(false)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">AI Assistant</span>
            {insights.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {insights.length}
              </span>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <span className="text-sm text-gray-500">• {pageTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={analyzeEntity}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Collapse"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="p-4">
        {loading && insights.length === 0 ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Analyzing...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => {
              const IconComponent = getTypeIcon(insight.type);
              
              return (
                <div 
                  key={insight.id} 
                  className={`border-l-4 pl-4 py-3 rounded-r ${getImpactColor(insight.impact)}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {insight.description}
                      </p>
                      <p className="text-xs font-medium text-gray-800">
                        💡 {insight.recommendation}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          insight.impact === 'critical' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.impact} impact
                        </span>
                        <span className="text-xs text-gray-500">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {insights.length > 5 && (
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-gray-500">
                  +{insights.length - 5} more insights available
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bot className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-2">No insights available</p>
            <button
              onClick={analyzeEntity}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {entityId ? 'Analyze this record' : 'Generate insights'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export with memo to prevent unnecessary re-renders
export default memo(PageAIAssistant);