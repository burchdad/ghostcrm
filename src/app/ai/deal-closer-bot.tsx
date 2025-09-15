import React, { useState } from "react";

const mockLeads = [
  { id: 1, name: "John Doe", status: "engaged", lastAction: "Bot sent follow-up" },
  { id: 2, name: "Jane Smith", status: "negotiating", lastAction: "Bot sent offer" },
  { id: 3, name: "Acme Corp", status: "closed", lastAction: "Bot confirmed deal" },
];

export default function AIDealCloserBot() {
  const [leads, setLeads] = useState(mockLeads);
  const [botStatus, setBotStatus] = useState("");

  function handleBotAction(id: number) {
    setBotStatus(`Bot engaged lead ${id}!`);
    alert("AI Deal Closer Bot logic executed.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧠 AI Deal Closer Bot</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Leads</h2>
        <ul>
          {leads.map(lead => (
            <li key={lead.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{lead.name}</span>
              <span className={`text-xs ${lead.status === "closed" ? "text-green-700" : "text-blue-700"}`}>{lead.status}</span>
              <span className="text-xs text-gray-500">{lead.lastAction}</span>
              <button className="px-2 py-1 bg-purple-500 text-white rounded text-xs" onClick={() => handleBotAction(lead.id)}>Engage Bot</button>
            </li>
          ))}
        </ul>
        {botStatus && <div className="text-xs text-purple-700 mt-2">{botStatus}</div>}
      </div>
    </div>
  );
}
