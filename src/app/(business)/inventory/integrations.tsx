import React, { useState } from "react";

const mockInventory = [
  { id: 1, name: "2025 Tesla Model S", source: "CSV Upload", status: "available" },
  { id: 2, name: "2024 Ford F-150", source: "External Tracker", status: "pending" },
  { id: 3, name: "2023 BMW X5", source: "CSV Upload", status: "sold" },
];

const integrationOptions = [
  { value: "csv", label: "CSV Upload" },
  { value: "external", label: "Connect External Tracker" },
  { value: "realestate", label: "Real Estate Listings" },
  { value: "insurance", label: "Insurance Programs" },
];

export default function InventoryIntegrations() {
  const [inventory, setInventory] = useState(mockInventory);
  const [integrationType, setIntegrationType] = useState("csv");
  const [uploaded, setUploaded] = useState(false);

  function handleIntegrationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIntegrationType(e.target.value);
  }
  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploaded(true);
    alert(`Inventory integrated via ${integrationType}!`);
    // Here, you would trigger backend logic for CSV upload or external integration
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📦 Inventory Integrations</h1>
      <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleUpload}>
        <div className="mb-2">
          <label className="font-bold">Integration Type</label>
          <select value={integrationType} onChange={handleIntegrationChange} className="border rounded px-2 py-1 ml-2">
            {integrationOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {integrationType === "csv" && (
          <div className="mb-2">
            <label className="font-bold">CSV File Upload</label>
            <input type="file" className="border rounded px-2 py-1 ml-2 w-full" />
          </div>
        )}
        <button className="px-2 py-1 bg-green-500 text-white rounded" type="submit">Integrate Inventory</button>
        {uploaded && <div className="text-xs text-green-700 mt-2">Inventory integrated via {integrationType}!</div>}
      </form>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Current Inventory</h2>
        <ul>
          {inventory.map(item => (
            <li key={item.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{item.name}</span>
              <span className="text-xs text-gray-500">{item.source}</span>
              <span className={`text-xs ${item.status === "available" ? "text-green-700" : item.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
