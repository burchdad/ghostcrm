"use client";
export default function DataSourcePanel() {
  return (
    <div className="mb-4 flex gap-2 items-center flex-wrap">
      <span className="font-bold">Data Sources:</span>
      <button className="btn px-2 py-1 bg-green-700 text-white rounded">Google Sheets</button>
      <button className="btn px-2 py-1 text-white rounded">Salesforce</button>
      <button className="btn px-2 py-1 bg-gray-600 text-white rounded">CSV</button>
      <button className="btn px-2 py-1 bg-red-600 text-white rounded">Disconnect All</button>
    </div>
  );
}
