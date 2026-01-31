import React, { useState } from "react";

const mockDocs = [
  { id: 1, name: "Sales Agreement", status: "sent", provider: "DocuSign" },
  { id: 2, name: "NDA", status: "signed", provider: "HelloSign" },
];

export default function ESignatureIntegration() {
  const [docs, setDocs] = useState(mockDocs);
  const [integrationStatus, setIntegrationStatus] = useState("");

  function sendForSignature(id: number, provider: string) {
    setIntegrationStatus(`Document ${id} sent via ${provider}!`);
    alert(`Integration logic for ${provider} executed.`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🔒 eSignature Integration (DocuSign / HelloSign)</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Documents</h2>
        <ul>
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{doc.name}</span>
              <span className="text-xs text-gray-500">{doc.provider}</span>
              <span className={`text-xs ${doc.status === "signed" ? "text-green-700" : "text-yellow-700"}`}>{doc.status}</span>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => sendForSignature(doc.id, doc.provider)}>Send for Signature</button>
            </li>
          ))}
        </ul>
        {integrationStatus && <div className="text-xs text-blue-700 mt-2">{integrationStatus}</div>}
      </div>
    </div>
  );
}
