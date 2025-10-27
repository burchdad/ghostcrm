import React, { useState } from "react";

const mockBIReports = [
  { id: 1, name: "PowerBI Sales Dashboard", type: "PowerBI", url: "https://powerbi.com/view?id=123" },
  { id: 2, name: "Tableau Pipeline Trends", type: "Tableau", url: "https://tableau.com/view?id=456" },
  { id: 3, name: "Looker Rep Leaderboard", type: "Looker", url: "https://looker.com/view?id=789" },
];

export default function EmbeddedBITools() {
  const [reports] = useState(mockBIReports);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Embedded BI Tools</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">BI Reports</h2>
        <ul>
          {reports.map(report => (
            <li key={report.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{report.name}</span>
              <span className="text-xs text-gray-500">{report.type}</span>
              <a href={report.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blue-500 text-white rounded text-xs">View</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
