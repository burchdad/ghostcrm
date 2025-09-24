"use client";
export default function DataSourcePanel() {
  return (
    <div className="mb-4 flex gap-2 items-center flex-wrap">
      <span className="font-bold">Data Sources:</span>
      <button className="px-2 py-1 bg-green-500 text-white rounded">Google Sheets</button>
      <button className="px-2 py-1 bg-blue-600 text-white rounded">Salesforce</button>
      <button className="px-2 py-1 bg-gray-500 text-white rounded">CSV</button>
      <button className="px-2 py-1 bg-red-500 text-white rounded">Disconnect All</button>
    </div>
  );
}
