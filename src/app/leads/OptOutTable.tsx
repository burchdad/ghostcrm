import { useState } from "react";

interface OptOutTableProps {
  optedOutLeads: any[];
}

export default function OptOutTable({ optedOutLeads }: OptOutTableProps) {
  const [filter, setFilter] = useState("");

  const filtered = optedOutLeads.filter(l =>
    l["Full Name"]?.toLowerCase().includes(filter.toLowerCase()) ||
    l["Phone Number"]?.toLowerCase().includes(filter.toLowerCase()) ||
    l["Email Address"]?.toLowerCase().includes(filter.toLowerCase())
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
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {optedOutLeads.length === 0 ? "No opted-out leads" : "No opted-out leads match your search"}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Opted Out At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium text-red-600">{lead["Full Name"]}</td>
                <td className="p-2">{lead["Phone Number"] || "-"}</td>
                <td className="p-2">{lead["Email Address"] || "-"}</td>
                <td className="p-2">{lead["Company"] || "-"}</td>
                <td className="p-2">{lead["Created Date"] ? new Date(lead["Created Date"]).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
