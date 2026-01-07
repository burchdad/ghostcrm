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
      <div className="flex gap-2 items-center mb-2">
        <button className="btn btn-sm bg-purple-100 text-purple-700" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
        <button 
          className="btn btn-sm bg-blue-100 text-blue-700 flex items-center gap-2"
          onClick={() => setShowAIPanel(!showAIPanel)}
        >
          <Brain className="w-4 h-4" />
          {showAIPanel ? "Hide AI" : "AI Assistant"}
        </button>
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
      {/* AI Panel */}
      {showAIPanel && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">AI Deal Assistant</h3>
            </div>
            <button 
              onClick={() => setShowAIPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Deal Insights</span>
              </div>
              <button 
                onClick={() => deals.forEach(deal => generateDealInsight(deal))}
                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                disabled={Object.keys(loadingInsights).length > 0}
              >
                {Object.keys(loadingInsights).length > 0 ? 'Analyzing...' : 'Generate Insights'}
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Lead Matching</span>
              </div>
              <button 
                onClick={fetchAISuggestions}
                className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                disabled={loadingAI}
              >
                {loadingAI ? 'Finding Matches...' : 'Find Lead Matches'}
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Financing AI</span>
              </div>
              <button 
                onClick={() => toast({ title: "Coming Soon", description: "AI-powered financing optimization" })}
                className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors"
              >
                Optimize Terms
              </button>
            </div>
          </div>
          
          {aiSuggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">AI Suggestions:</h4>
              <div className="space-y-2">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="bg-white rounded p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-blue-800">{suggestion.leadName}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-green-800">{suggestion.vehicleDesc}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {suggestion.score}% match
                      </span>
                    </div>
                    <div className="text-gray-600 mt-1">{suggestion.factors.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
        <div className="card bg-green-100">
          <div className="font-bold text-green-800">Total Deal Value</div>
          <div className="text-2xl">${analytics.totalValue.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="card bg-blue-100">
          <div className="font-bold text-blue-800">Win Rate</div>
          <div className="text-2xl">{analytics.winRate}%</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="card bg-yellow-100">
          <div className="font-bold text-yellow-800">Avg Deal Size</div>
          <div className="text-2xl">${analytics.avgDealSize.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="card bg-purple-100">
          <div className="font-bold text-purple-800">Pipeline Stage</div>
          <div className="text-2xl">{analytics.pipelineStage}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(3)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
            }} />
          )}
        </div>
      </div>
      <ChartPlaceholder title="Deal Value Over Time" />
      <ChartPlaceholder title="Win Rate Trends" />
      <ChartPlaceholder title="Pipeline Stage Distribution" />
      <ChartPlaceholder title="Org Comparison" />
      
      {/* Deals List with AI Insights */}
      {deals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Active Deals</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {deals.slice(0, 10).map((deal, index) => (
              <div key={deal.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {deal.customer_name || 'Customer Name'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {deal.vehicle || 'Vehicle Details'}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        ${deal.amount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        deal.stage === 'closed_won' ? 'bg-green-100 text-green-800' :
                        deal.stage === 'closed_lost' ? 'bg-red-100 text-red-800' :
                        deal.stage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {deal.stage || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {calculateDaysInPipeline(deal)} days in pipeline
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* AI Insight Button */}
                    <button
                      onClick={() => generateDealInsight(deal)}
                      disabled={loadingInsights[deal.id]}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="Generate AI Insight"
                    >
                      {loadingInsights[deal.id] ? (
                        <div className="w-4 h-4 animate-spin border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                    </button>
                    
                    {bulkMode && (
                      <input
                        type="checkbox"
                        checked={selectedIdxs.includes(index)}
                        onChange={(e) => {
                          setSelectedIdxs(e.target.checked 
                            ? [...selectedIdxs, index] 
                            : selectedIdxs.filter(i => i !== index)
                          );
                        }}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </div>
                
                {/* AI Insights Display */}
                {aiInsights[deal.id] && (
                  <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-sm">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {aiInsights[deal.id].priority}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {aiInsights[deal.id].closingProbability} close rate
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {aiInsights[deal.id].nextAction}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            Act {aiInsights[deal.id].timeframe}
                          </span>
                        </div>
                        <p className="text-gray-700">{aiInsights[deal.id].summary}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {deals.length > 10 && (
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
              Showing 10 of {deals.length} deals. Use bulk operations or filters to manage more deals.
            </div>
          )}
        </div>
      )}
      
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
