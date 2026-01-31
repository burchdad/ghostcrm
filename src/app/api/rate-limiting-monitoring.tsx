import React, { useState } from "react";

const mockIntegrations = [
  { id: 1, name: "Salesforce API", usage: 1200, limit: 2000 },
  { id: 2, name: "Google Sheets API", usage: 500, limit: 1000 },
];

export default function APIRateLimitingMonitoring() {
  const [integrations] = useState(mockIntegrations);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🚦 API Rate Limiting & Monitoring</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Integrations</h2>
        <ul>
          {integrations.map(api => (
            <li key={api.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{api.name}</span>
              <span className="text-xs text-gray-500">Usage: {api.usage}/{api.limit}</span>
              <span className={`text-xs ${api.usage > api.limit * 0.8 ? "text-red-700" : "text-green-700"}`}>{api.usage > api.limit * 0.8 ? "Near Limit" : "OK"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
