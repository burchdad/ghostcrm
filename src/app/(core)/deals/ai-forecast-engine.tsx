import React, { useState, useEffect } from "react";
import { useAuth } from '@/contexts/auth-context';

interface Deal {
  id: string;
  customer_name: string;
  amount: number;
  stage: string;
  created_at: string;
  updated_at: string;
  probability?: number;
}

// Calculate deal probability based on stage and time in pipeline
function calculateDealProbability(deal: Deal): number {
  const stageProbabilities = {
    'prospect': 0.15,
    'qualified': 0.25,
    'proposal': 0.45,
    'negotiation': 0.65,
    'financing': 0.80,
    'paperwork': 0.90,
    'closed_won': 1.0,
    'closed_lost': 0.0
  };
  
  const baseProb = stageProbabilities[deal.stage as keyof typeof stageProbabilities] || 0.20;
  
  // Adjust based on time in pipeline (deals that move quickly are more likely to close)
  const daysInPipeline = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
  
  // Deals that have been in pipeline too long lose probability
  let timeAdjustment = 1.0;
  if (daysInPipeline > 60) timeAdjustment = 0.8;
  else if (daysInPipeline > 30) timeAdjustment = 0.9;
  else if (daysInPipeline < 7) timeAdjustment = 1.1;
  
  return Math.min(1.0, baseProb * timeAdjustment);
}

function getLikelyToClose(deals: Deal[], days: number = 7): Deal[] {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  return deals
    .filter(deal => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost')
    .map(deal => ({
      ...deal,
      probability: calculateDealProbability(deal)
    }))
    .filter(deal => deal.probability > 0.5)
    .sort((a, b) => (b.probability || 0) - (a.probability || 0))
    .slice(0, 10); // Top 10 most likely
}

export default function AIDealForecastEngine() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/deals');
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }
      
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchDeals}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const likelyDeals = getLikelyToClose(deals);
  const totalPipeline = deals
    .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + (deal.amount || 0), 0);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🤖 AI Deal Forecast Engine</h1>
      
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Pipeline Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Pipeline: </span>
            <span className="font-semibold">${totalPipeline.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Active Deals: </span>
            <span className="font-semibold">{deals.length}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Deals Likely to Close (Next 7 Days)</h2>
        {likelyDeals.length === 0 ? (
          <p className="text-gray-500">No high-probability deals identified.</p>
        ) : (
          <ul className="space-y-3">
            {likelyDeals.map(deal => (
              <li key={deal.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="font-semibold">{deal.customer_name || 'Customer'}</span>
                  <div className="text-xs text-gray-500 space-x-2">
                    <span>${deal.amount?.toLocaleString() || '0'}</span>
                    <span>• Stage: {deal.stage}</span>
                    <span>• AI Probability: {((deal.probability || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  (deal.probability || 0) > 0.8 ? 'bg-green-500' :
                  (deal.probability || 0) > 0.6 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
