"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import ChartPlaceholder from "@/components/charts/ChartPlaceholder";
import BulkOperations from "@/components/charts/BulkOperations";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { Brain, Target, TrendingUp, Calculator, Lightbulb } from "lucide-react";

export default function Deals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<Record<string, any>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch deals data
  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/deals');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.deals) {
        setDeals(data.deals);
      } else {
        console.warn('⚠️ [DEALS] No data.deals in response');
        throw new Error(data.error || "No data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to Load Deals",
        description: errorMessage,
        variant: "destructive"
      });
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  // Real-time analytics (calculated from actual data)
  const analytics = {
    totalValue: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
    winRate: deals.length > 0 ? (deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100 : 0,
    avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length : 0,
    pipelineStage: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length,
  };

  // Error retry function
  const retryFetch = () => {
    fetchDeals();
  };

  // AI Functions
  async function generateDealInsight(deal: any) {
    if (aiInsights[deal.id] || loadingInsights[deal.id]) return;
    
    setLoadingInsights(prev => ({ ...prev, [deal.id]: true }));
    
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this deal and provide actionable insights: Customer: ${deal.customer_name || 'Not provided'}, Vehicle: ${deal.vehicle || 'Not specified'}, Amount: $${deal.amount || 0}, Stage: ${deal.stage || 'unknown'}, Days in pipeline: ${calculateDaysInPipeline(deal)}. Provide insights about deal progression, closing probability, and next best actions.`,
          context: 'deal_analysis',
          dealData: deal
        })
      });
      
      const data = await response.json();
      
      if (data.response) {
        const insight = {
          priority: deal.amount >= 50000 ? 'High Value' : deal.amount >= 25000 ? 'Medium Value' : 'Standard',
          closingProbability: calculateClosingProbability(deal),
          nextAction: extractNextAction(data.response),
          timeframe: extractTimeframe(data.response),
          summary: data.response.substring(0, 200) + '...'
        };
        
        setAiInsights(prev => ({ ...prev, [deal.id]: insight }));
      }
    } catch (error) {
      console.error('AI insight generation failed:', error);
    } finally {
      setLoadingInsights(prev => ({ ...prev, [deal.id]: false }));
    }
  }

  async function fetchAISuggestions() {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/deals/ai-suggestions');
      const data = await response.json();
      
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  }

  function calculateDaysInPipeline(deal: any): number {
    if (!deal.created_at) return 0;
    const created = new Date(deal.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  function calculateClosingProbability(deal: any): string {
    const stage = deal.stage || 'unknown';
    const stageProbabilities = {
      'prospect': '20%',
      'qualified': '35%',
      'proposal': '50%',
      'negotiation': '70%',
      'financing': '85%',
      'paperwork': '95%',
      'closed_won': '100%',
      'closed_lost': '0%'
    };
    return stageProbabilities[stage as keyof typeof stageProbabilities] || '25%';
  }

  function extractNextAction(aiResponse: string): string {
    const actionKeywords = {
      'call': '📞 Call Customer',
      'follow': '🔄 Follow Up',
      'finance': '💰 Review Financing',
      'negotiate': '🤝 Negotiate Terms',
      'close': '✅ Prepare Closing',
      'paperwork': '📄 Complete Paperwork'
    };
    
    for (const [key, action] of Object.entries(actionKeywords)) {
      if (aiResponse.toLowerCase().includes(key)) {
        return action;
      }
    }
    return '👋 Contact Customer';
  }

  function extractTimeframe(aiResponse: string): string {
    if (aiResponse.toLowerCase().includes('urgent') || aiResponse.toLowerCase().includes('today')) return 'Today';
    if (aiResponse.toLowerCase().includes('week')) return 'This Week';
    if (aiResponse.toLowerCase().includes('month')) return 'This Month';
    return 'Soon';
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Deals</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={retryFetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no deals
  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyStateComponent 
            type="deals"
            className="bg-white rounded-lg shadow-sm"
          />
        </div>
      </div>
    );
  }
  // Bulk operations with real API calls
  async function handleBulkExport() {
    if (bulkLoading) return;
    
    const selectedDeals = selectedIdxs.map(idx => deals[idx]).filter(Boolean);
    
    if (selectedDeals.length === 0) {
      toast({
        title: "No Deals Selected",
        description: "Please select deals to export.",
        variant: "destructive"
      });
      return;
    }

    setBulkLoading(true);
    
    try {
      // Create CSV content
      const csvHeaders = ['ID', 'Title', 'Customer', 'Stage', 'Amount', 'Vehicle', 'Sales Rep', 'Expected Close'];
      const csvRows = selectedDeals.map(deal => [
        deal.id,
        deal.title,
        deal.customer_name,
        deal.stage,
        deal.amount,
        deal.vehicle,
        deal.sales_rep,
        deal.expected_close_date || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${selectedDeals.length} deals to CSV`,
        variant: "success"
      });

      setBulkMode(false);
      setSelectedIdxs([]);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export deals",
        variant: "destructive"
      });
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkUpdate() {
    if (bulkLoading) return;
    
    const selectedDeals = selectedIdxs.map(idx => deals[idx]).filter(Boolean);
    
    if (selectedDeals.length === 0) {
      toast({
        title: "No Deals Selected",
        description: "Please select deals to update.",
        variant: "destructive"
      });
      return;
    }

    // For now, show available update options
    // In a full implementation, this would open a modal with update options
    toast({
      title: "Bulk Update Available",
      description: `${selectedDeals.length} deals selected. Bulk update functionality can be expanded based on requirements.`,
      variant: "default"
    });
  }

  async function handleBulkDelete() {
    if (bulkLoading) return;
    
    const selectedDeals = selectedIdxs.map(idx => deals[idx]).filter(Boolean);
    
    if (selectedDeals.length === 0) {
      toast({
        title: "No Deals Selected", 
        description: "Please select deals to delete.",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDeals.length} deal${selectedDeals.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBulkLoading(true);

    try {
      toast({
        title: "Deleting Deals",
        description: `Deleting ${selectedDeals.length} deals...`,
        variant: "default"
      });

      // Create bulk delete API endpoint similar to leads
      const response = await fetch('/api/deals/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealIds: selectedDeals.map(deal => deal.id) })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove deleted deals from state
        const deletedIds = selectedDeals.map(deal => deal.id);
        setDeals(deals => deals.filter(deal => !deletedIds.includes(deal.id)));
        
        toast({
          title: "Success",
          description: `Successfully deleted ${selectedDeals.length} deals.`,
          variant: "success"
        });
        
        setSelectedIdxs([]);
        setBulkMode(false);
      } else {
        toast({
          title: "Error", 
          description: data.error || "Failed to delete deals",
          variant: "destructive"
        });
      }
    } catch (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete deals",
        variant: "destructive"
      });
    } finally {
      setBulkLoading(false);
    }
  }
  return (
    <div className="space-y-4">
      {/* Search and Actions Bar - Matching Leads Page */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search deals by customer, vehicle, or amount..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAIPanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                AI Assistant
              </button>
              
              <button 
                onClick={() => setBulkMode(!bulkMode)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {bulkMode ? "Cancel Bulk" : "Bulk Actions"}
              </button>
              
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Deal
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Bulk Operations UI */}
      {bulkMode && (
        <BulkOperations
          actions={[
            { label: "Export Selected", onClick: handleBulkExport, color: "bg-blue-500" },
            { label: "Bulk Update", onClick: handleBulkUpdate, color: "bg-yellow-500" },
            { label: "Delete Selected", onClick: handleBulkDelete, color: "bg-red-500" },
          ]}
          onCancel={() => setBulkMode(false)}
        />
      )}
      {/* AI Assistant Panel - Matching Leads Page Style */}
      {showAIPanel && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
                <span className="text-sm text-gray-500">• Deal Management</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowAIPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No insights available</p>
                <button 
                  onClick={() => deals.forEach(deal => generateDealInsight(deal))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={Object.keys(loadingInsights).length > 0}
                >
                  {Object.keys(loadingInsights).length > 0 ? 'Analyzing...' : 'Generate Insights'}
                </button>
              </div>
            </div>
            
            {aiSuggestions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">AI Suggestions</h4>
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">{suggestion.leadName}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-green-600">{suggestion.vehicleDesc}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {suggestion.score}% match
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{suggestion.factors.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Metrics Cards - Horizontal Layout like Leads Page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TOTAL PIPELINE VALUE</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalValue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+0.0% this month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">WIN RATE</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.winRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Needs improvement</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">ACTIVE DEALS</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.pipelineStage}</p>
              <p className="text-sm text-blue-600">{deals.length} total deals</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">AVG DEAL SIZE</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.avgDealSize.toLocaleString()}</p>
              <p className="text-sm text-green-600">Steady pipeline</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ChartPlaceholder title="Deal Value Over Time" />
      <ChartPlaceholder title="Win Rate Trends" />
      <ChartPlaceholder title="Pipeline Stage Distribution" />
      <ChartPlaceholder title="Org Comparison" />
      
      {/* Deals Table - Matching Leads Page Layout */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">CUSTOMER</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">VEHICLE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">AMOUNT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">STAGE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">AI INSIGHTS</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-xs tracking-wide">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900 mb-1">No deals found</p>
                      <p className="text-gray-500 mb-4">Get started by creating your first deal</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Create Deal
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                deals.map((deal, index) => (
                  <tr key={deal.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {deal.customer_name || 'Customer Name'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {calculateDaysInPipeline(deal)} days in pipeline
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {deal.vehicle || 'Vehicle Details'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        ${deal.amount?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        deal.stage === 'closed_won' ? 'bg-green-100 text-green-800' :
                        deal.stage === 'closed_lost' ? 'bg-red-100 text-red-800' :
                        deal.stage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
                        deal.stage === 'financing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deal.stage?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {aiInsights[deal.id] ? (
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {aiInsights[deal.id].priority}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateDealInsight(deal)}
                          disabled={loadingInsights[deal.id]}
                          className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                        >
                          {loadingInsights[deal.id] ? (
                            <div className="w-3 h-3 animate-spin border border-purple-600 border-t-transparent rounded-full mr-1"></div>
                          ) : (
                            <Brain className="w-3 h-3 mr-1" />
                          )}
                          Analyze
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V18a2 2 0 01-2 2H9a2 2 0 01-2-2V8m5 0V3" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Audit/versioning history */}
      <div className="mt-4">
        <div className="font-bold mb-1">Audit History</div>
        <ul className="text-xs text-gray-600">
          {/* Audit history removed */}
        </ul>
      </div>
      
    </div>
  );
}
