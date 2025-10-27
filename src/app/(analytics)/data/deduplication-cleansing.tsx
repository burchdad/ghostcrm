import React, { useState } from "react";

const mockRecords = [
  { id: 1, name: "John Doe", status: "duplicate" },
  { id: 2, name: "Jane Smith", status: "clean" },
  { id: 3, name: "John Doe", status: "duplicate" },
];

export default function DataDeduplicationCleansing() {
  const [records, setRecords] = useState(mockRecords);
  const [mergeStatus, setMergeStatus] = useState("");

  function handleMerge(id: number) {
    setRecords(records.map(r => r.id === id ? { ...r, status: "clean" } : r));
    setMergeStatus(`Record ${id} merged and cleaned!`);
    alert("Deduplication logic executed.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🧹 Data Deduplication & Cleansing</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Records</h2>
        <ul>
          {records.map(record => (
            <li key={record.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{record.name}</span>
              <span className={`text-xs ${record.status === "duplicate" ? "text-red-700" : "text-green-700"}`}>{record.status}</span>
              {record.status === "duplicate" && (
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => handleMerge(record.id)}>Merge</button>
              )}
            </li>
          ))}
        </ul>
        {mergeStatus && <div className="text-xs text-green-700 mt-2">{mergeStatus}</div>}
      </div>
    </div>
  );
}
