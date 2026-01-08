"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import ChartPlaceholder from "@/components/charts/ChartPlaceholder";
import BulkOperations from "@/components/charts/BulkOperations";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";

export default function Deals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

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
