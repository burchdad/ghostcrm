import React, { useState } from "react";

const mockApps = [
  { id: 1, name: "John Doe", status: "approved", amount: 12000 },
  { id: 2, name: "Jane Smith", status: "pending", amount: 8000 },
  { id: 3, name: "Acme Corp", status: "declined", amount: 15000 },
];

export default function GhostUnderwriterIntegration() {
  const [apps, setApps] = useState(mockApps);
  const [underwriterStatus, setUnderwriterStatus] = useState("");

  function handleUnderwrite(id: number) {
    setUnderwriterStatus(`Underwriting processed for app ${id}!`);
    alert("GhostUnderwriter logic executed.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">💰 GhostUnderwriter Integration</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Applications</h2>
        <ul>
          {apps.map(app => (
            <li key={app.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{app.name}</span>
              <span className={`text-xs ${app.status === "approved" ? "text-green-700" : app.status === "declined" ? "text-red-700" : "text-yellow-700"}`}>{app.status}</span>
              <span className="text-xs text-blue-700">${app.amount.toLocaleString()}</span>
              <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => handleUnderwrite(app.id)}>Process</button>
            </li>
          ))}
        </ul>
        {underwriterStatus && <div className="text-xs text-yellow-700 mt-2">{underwriterStatus}</div>}
      </div>
    </div>
  );
}
