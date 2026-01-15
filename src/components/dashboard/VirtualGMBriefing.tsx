"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Lightbulb, CheckSquare, Target } from 'lucide-react';

interface BriefingItem {
  level: 'critical' | 'high' | 'medium' | 'low' | 'success';
  message: string;
  action: string;
  impact?: string;
}

interface AIBriefing {
  alerts: BriefingItem[];
  opportunities: BriefingItem[];
  insights: BriefingItem[];
  actionItems: BriefingItem[];
  recommendations: BriefingItem[];
}

interface VirtualGMBriefingProps {
  organizationId?: string;
}

export default function VirtualGMBriefing({ organizationId }: VirtualGMBriefingProps) {
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (organizationId) {
      fetchBriefing();
    }
  }, [organizationId]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/virtual-gm/briefing');
      if (!response.ok) {
        throw new Error('Failed to fetch briefing');
      }
      
      const data = await response.json();
      setBriefing(data.briefing);
      setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
    } catch (err) {
      console.error('Virtual GM briefing error:', err);
      setError('Failed to load AI briefing');
      // Fallback to basic briefing
      setBriefing(generateFallbackBriefing());
      setLastUpdate(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackBriefing = (): AIBriefing => {
    return {
      alerts: [
        {
          level: 'high',
          message: '🔴 Response time monitoring active - no critical issues detected',
          action: 'Continue monitoring lead response times'
        }
      ],
      opportunities: [
        {
          level: 'medium',
          message: '💰 Finance opportunities available for review',
          action: 'Check pending deals in finance department'
        }
      ],
      insights: [
        {
          level: 'low',
          message: '📊 Real-time data analysis in progress',
          action: 'AI insights will update as data becomes available'
        }
      ],
      actionItems: [
        {
          level: 'medium',
          message: '✅ Review daily metrics and performance indicators',
          action: 'Monitor dashboard for real-time updates'
        }
      ],
      recommendations: [
        {
          level: 'low',
          message: '🎯 Optimize lead assignment for better response times',
          action: 'Implement automated lead routing'
        }
      ]
    };
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckSquare className="w-4 h-4 text-green-500" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const renderBriefingSection = (title: string, items: BriefingItem[], icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="virtual-gm-briefing-section mb-4">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h5 className="font-semibold text-gray-200">{title}</h5>
        </div>
        <div className="space-y-2">
          {items.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className={`virtual-gm-briefing-item border-l-4 p-3 rounded-r ${getLevelClass(item.level)}`}
            >
              <div className="flex items-start gap-2">
                {getLevelIcon(item.level)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">{item.message}</p>
                  <p className="text-xs text-gray-600 mb-1">{item.action}</p>
                  {item.impact && (
                    <p className="text-xs text-gray-500 italic">{item.impact}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="virtual-gm-briefing-loading">
        <div className="flex items-center gap-3 text-gray-300">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-white rounded-full"></div>
          <span>Generating AI briefing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="virtual-gm-briefing-error">
        <div className="flex items-center gap-3 text-red-300">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchBriefing}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="virtual-gm-briefing-empty">
        <p className="text-gray-300">No briefing data available</p>
      </div>
    );
  }

  return (
    <div className="virtual-gm-briefing-content">
      <div className="virtual-gm-briefing-header mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">AI Analysis Complete</span>
          <span className="text-xs text-gray-400">Updated: {lastUpdate}</span>
        </div>
      </div>

      {renderBriefingSection(
        'Critical Alerts',
        briefing.alerts,
        <AlertTriangle className="w-4 h-4 text-red-400" />
      )}

      {renderBriefingSection(
        'Opportunities',
        briefing.opportunities,
        <TrendingUp className="w-4 h-4 text-green-400" />
      )}

      {renderBriefingSection(
        'Insights',
        briefing.insights,
        <Lightbulb className="w-4 h-4 text-yellow-400" />
      )}

      {renderBriefingSection(
        'Action Items',
        briefing.actionItems,
        <CheckSquare className="w-4 h-4 text-blue-400" />
      )}

      {renderBriefingSection(
        'Recommendations',
        briefing.recommendations,
        <Target className="w-4 h-4 text-purple-400" />
      )}

      <div className="virtual-gm-briefing-footer mt-4 pt-3 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Powered by AI • Real-time data analysis
          </span>
          <button 
            onClick={fetchBriefing}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}