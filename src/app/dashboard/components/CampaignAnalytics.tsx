import { useEffect, useState } from "react";

export default function CampaignAnalytics({ orgId = "1" }) {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/analytics?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        // Ensure analytics is always an array
        const analyticsData = Array.isArray(data.analytics) ? data.analytics : [];
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [orgId]);

  if (loading) return (
    <div className="dashboard-card">
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
    <div className="dashboard-card" style={{ borderLeft: '4px solid #ef4444' }}>
      <div style={{ color: '#dc2626', fontWeight: 600 }}>Error loading analytics</div>
      <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>
    </div>
  );
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Campaign Analytics</h3>
      </div>
      <table className="data-table">
        <thead className="data-table-header">
          <tr>
            <th>Campaign</th>
            <th>Sent</th>
            <th>Opened</th>
            <th>Clicked</th>
            <th>Called</th>
            <th>Converted</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody className="data-table-body">
          {analytics.map((row) => (
            <tr key={row.campaign_id}>
              <td style={{ fontWeight: 600 }}>{row.campaign_name}</td>
              <td>{row.sent_count.toLocaleString()}</td>
              <td style={{ color: '#10b981', fontWeight: 600 }}>{row.opened_count.toLocaleString()}</td>
              <td style={{ color: '#3b82f6', fontWeight: 600 }}>{row.clicked_count.toLocaleString()}</td>
              <td style={{ color: '#8b5cf6', fontWeight: 600 }}>{row.called_count.toLocaleString()}</td>
              <td style={{ color: '#059669', fontWeight: 600 }}>{row.converted_count.toLocaleString()}</td>
              <td style={{ color: '#ef4444', fontWeight: 600 }}>{row.error_count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
