import React, { useState } from "react";

const mockInventory = [
  { id: 1, name: "2025 Tesla Model S", status: "available" },
  { id: 2, name: "2024 Ford F-150", status: "pending" },
  { id: 3, name: "2023 BMW X5", status: "sold" },
];

export default function PluginAPIClientPortalEmbed() {
  const [inventory] = useState(mockInventory);
  const [requestStatus, setRequestStatus] = useState<string>("");

  function handleRequest(id: number) {
    setRequestStatus(`Request submitted for item ${id}`);
    alert(`Request logic for inventory item ${id} executed.`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🔌 Plugin API / Client Portal Embed</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Inventory</h2>
        <ul>
          {inventory.map(item => (
            <li key={item.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{item.name}</span>
              <span className={`text-xs ${item.status === "available" ? "text-green-700" : item.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{item.status}</span>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                onClick={() => handleRequest(item.id)}
              >Submit Request</button>
            </li>
          ))}
        </ul>
        {requestStatus && <div className="text-xs text-green-700 mt-2">{requestStatus}</div>}
      </div>
    </div>
  );
}
