import React, { useState } from "react";

const mockVault = [
  { id: 1, name: "Credit App.pdf", status: "available" },
  { id: 2, name: "Trade-In.jpg", status: "available" },
  { id: 3, name: "DL.png", status: "pending" },
];

export default function ClientFileVault() {
  const [vault] = useState(mockVault);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📁 Client File Vault</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Your Documents</h2>
        <ul>
          {vault.map(doc => (
            <li key={doc.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{doc.name}</span>
              <span className={`text-xs ${doc.status === "available" ? "text-green-700" : "text-yellow-700"}`}>{doc.status}</span>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Download</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
