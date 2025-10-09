"use client";
import { useEffect, useState } from "react";

export default function CampaignAnalytics({ orgId = "1" }) {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate connection status
    setConnectionStatus('syncing');
    
    fetch(`/api/campaigns/analytics?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        // Ensure analytics is always an array
        const analyticsData = Array.isArray(data.analytics) ? data.analytics : [];
        setAnalytics(analyticsData);
        setLoading(false);
        setConnectionStatus('online');
        setLastUpdate(new Date());
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
        setConnectionStatus('offline');
      });

    // Simulate periodic updates
    const interval = setInterval(() => {
      setConnectionStatus('syncing');
      setTimeout(() => {
        setConnectionStatus('online');
        setLastUpdate(new Date());
      }, 1200);
    }, 30000);

    return () => clearInterval(interval);
  }, [orgId]);

  if (loading) return (
    <div className="bg-orange-50 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-orange-500 p-6 hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 border-t-4 border-t-red-500 rounded-xl shadow-lg p-6 h-full">
      <div className="text-red-600 font-medium">Error loading analytics</div>
      <div className="text-red-500 text-sm mt-1">{error}</div>
    </div>
  );
  
  return (
    <div className="bg-orange-50 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-orange-500 p-6 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-black">
            📧 Campaign Analytics
          </h2>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-green-500' :
              connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className={`text-xs ${
              connectionStatus === 'online' ? 'text-green-600' :
              connectionStatus === 'syncing' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {connectionStatus === 'online' ? 'Live' :
               connectionStatus === 'syncing' ? 'Sync' :
               'Offline'}
            </span>
            <span className="text-xs text-gray-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0">
            <tr className="bg-gradient-to-r from-orange-100 to-orange-200 border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-700">Campaign</th>
              <th className="text-left p-3 font-semibold text-gray-700">Sent</th>
              <th className="text-left p-3 font-semibold text-gray-700">Opened</th>
              <th className="text-left p-3 font-semibold text-gray-700">Clicked</th>
              <th className="text-left p-3 font-semibold text-gray-700">Called</th>
              <th className="text-left p-3 font-semibold text-gray-700">Converted</th>
              <th className="text-left p-3 font-semibold text-gray-700">Error</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((row, index) => (
              <tr 
                key={row.campaign_id}
                className={`border-b border-gray-100 hover:bg-orange-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="p-3 font-medium text-gray-900 max-w-24 truncate" title={row.campaign_name}>
                  {row.campaign_name}
                </td>
                <td className="p-3 text-gray-700 font-medium">{row.sent_count.toLocaleString()}</td>
                <td className="p-3 text-green-600 font-medium">{row.opened_count.toLocaleString()}</td>
                <td className="p-3 text-blue-600 font-medium">{row.clicked_count.toLocaleString()}</td>
                <td className="p-3 text-purple-600 font-medium">{row.called_count.toLocaleString()}</td>
                <td className="p-3 text-emerald-600 font-medium">{row.converted_count.toLocaleString()}</td>
                <td className="p-3 text-red-600 font-semibold">{row.error_count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
