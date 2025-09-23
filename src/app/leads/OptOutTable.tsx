import { useEffect, useState } from "react";

export default function OptOutTable() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/leads/opt-outs")
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const filtered = leads.filter(l =>
    l.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    l.phone_number?.toLowerCase().includes(filter.toLowerCase()) ||
    l.email_address?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">Opted-Out Leads</h2>
      <input
        className="border rounded px-2 py-1 mb-4 w-full"
        placeholder="Search by name, phone, email..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Opted Out At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id}>
                <td>{lead.full_name}</td>
                <td>{lead.phone_number}</td>
                <td>{lead.email_address}</td>
                <td>{lead.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
