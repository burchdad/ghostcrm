import React, { useState } from "react";

const mockActions = [
  { id: 1, label: "GPS Route to Lead", icon: "🗺️" },
  { id: 2, label: "Upload Document (Camera)", icon: "📷" },
  { id: 3, label: "Quick Call", icon: "📞" },
  { id: 4, label: "Send SMS", icon: "📱" },
  { id: 5, label: "Check-In (Location)", icon: "📍" },
];

export default function NativeMobileControls() {
  const [status, setStatus] = useState<string>("");

  function handleAction(label: string) {
    setStatus(`${label} triggered!`);
    alert(`${label} logic executed.`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📱 Native Mobile Controls</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {mockActions.map(action => (
            <button
              key={action.id}
              className="flex flex-col items-center justify-center bg-blue-500 text-white rounded p-4 shadow hover:bg-blue-600"
              onClick={() => handleAction(action.label)}
            >
              <span className="text-3xl mb-2">{action.icon}</span>
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
        {status && <div className="text-xs text-green-700 mt-4">{status}</div>}
      </div>
    </div>
  );
}
