"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Bot, Lightbulb, TrendingUp, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { authenticatedFetch, isAuthenticated } from '@/lib/auth/client';
import './PageAIAssistant.css';

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
  const [currentPage, setCurrentPage] = useState(0);
  
  // Display 4 insights per page in card layout
  const INSIGHTS_PER_PAGE = 4;
  const totalPages = Math.ceil(insights.length / INSIGHTS_PER_PAGE);
  const currentInsights = insights.slice(
    currentPage * INSIGHTS_PER_PAGE,
    (currentPage + 1) * INSIGHTS_PER_PAGE
  );
  
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  // Reset pagination when insights change
  useEffect(() => {
    setCurrentPage(0);
  }, [insights.length]);

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
          <div>
            {/* Navigation Header */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {insights.length} insights total
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrevPage}
                    disabled={totalPages <= 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous insights"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={totalPages <= 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next insights"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* 4-Column Insights Grid */}
            <div className="ai-insights-grid">
              {currentInsights.map((insight) => {
                const IconComponent = getTypeIcon(insight.type);
                
                return (
                  <div 
                    key={insight.id} 
                    className="ai-insight-card"
                  >
                    <div className="ai-insight-header">
                      <div className={`ai-insight-icon ${insight.impact}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h4 className="ai-insight-title">
                        {insight.title}
                      </h4>
                    </div>
                    <p className="ai-insight-description">
                      {insight.description}
                    </p>
                    <div className="ai-insight-recommendation">
                      💡 {insight.recommendation}
                    </div>
                    <div className="ai-insight-footer">
                      <span className={`ai-insight-impact ${insight.impact}`}>
                        {insight.impact}
                      </span>
                      <span className="ai-insight-confidence">
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Fill empty slots if less than 4 insights */}
              {currentInsights.length < INSIGHTS_PER_PAGE && (
                [...Array(INSIGHTS_PER_PAGE - currentInsights.length)].map((_, index) => (
                  <div key={`empty-${index}`} className="ai-insight-card-placeholder">
                    <div className="ai-insight-placeholder-content">
                      <Bot className="h-6 w-6 text-gray-300" />
                      <p className="text-xs text-gray-400">More insights coming</p>
                    </div>
                  </div>
                ))
              )}
            </div>
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