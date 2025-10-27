import React, { useState } from "react";

const mockContracts = [
  { id: 1, name: "Sales Agreement", status: "signed", signedBy: "Alice", date: "2025-09-14" },
  { id: 2, name: "NDA", status: "pending", signedBy: "", date: "" },
];

export default function ESignatureManagement() {
  const [contracts, setContracts] = useState(mockContracts);
  const [signStatus, setSignStatus] = useState("");

  function handleSign(id: number) {
    setContracts(contracts.map(c => c.id === id ? { ...c, status: "signed", signedBy: "You", date: new Date().toISOString().slice(0,10) } : c));
    setSignStatus(`Contract ${id} signed!`);
    alert("E-signature logic executed.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📝 Contract & E-Signature Management</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Contracts</h2>
        <ul>
          {contracts.map(contract => (
            <li key={contract.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{contract.name}</span>
              <span className={`text-xs ${contract.status === "signed" ? "text-green-700" : "text-yellow-700"}`}>{contract.status}</span>
              {contract.status !== "signed" && (
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => handleSign(contract.id)}>Sign</button>
              )}
              {contract.status === "signed" && (
                <span className="text-xs text-gray-500">Signed by {contract.signedBy} on {contract.date}</span>
              )}
            </li>
          ))}
        </ul>
        {signStatus && <div className="text-xs text-green-700 mt-2">{signStatus}</div>}
      </div>
    </div>
  );
}
