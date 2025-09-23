import { useEffect, useState } from "react";

export default function CampaignAnalytics({ orgId = "1" }) {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/analytics?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.analytics || []);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [orgId]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">Campaign Analytics</h2>
      <table className="w-full text-sm">
        <thead>
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
        <tbody>
          {analytics.map(row => (
            <tr key={row.campaign_id}>
              <td>{row.campaign_name}</td>
              <td>{row.sent_count}</td>
              <td>{row.opened_count}</td>
              <td>{row.clicked_count}</td>
              <td>{row.called_count}</td>
              <td>{row.converted_count}</td>
              <td>{row.error_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
