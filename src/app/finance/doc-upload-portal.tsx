import React, { useRef, useState } from "react";

const mockDocs = [
  { id: 1, type: "Credit App", name: "credit-app-john.pdf", status: "uploaded" },
  { id: 2, type: "Trade-In Doc", name: "tradein-acme.jpg", status: "pending" },
  { id: 3, type: "Driver's License", name: "dl-jane.png", status: "uploaded" },
];

export default function FinanceDocUploadPortal() {
  const [docs, setDocs] = useState(mockDocs);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUpload(type: string) {
    setUploadStatus(`${type} uploaded!`);
    alert(`${type} upload logic executed.`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">💳 Finance & Doc Upload Portal</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Upload Documents</h2>
        <ul>
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{doc.type}</span>
              <span className="text-xs text-gray-500">{doc.name}</span>
              <span className={`text-xs ${doc.status === "uploaded" ? "text-green-700" : "text-yellow-700"}`}>{doc.status}</span>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                onClick={() => handleUpload(doc.type)}
              >Upload</button>
            </li>
          ))}
        </ul>
        <input ref={fileInputRef} type="file" className="hidden" />
        {uploadStatus && <div className="text-xs text-green-700 mt-2">{uploadStatus}</div>}
      </div>
    </div>
  );
}
