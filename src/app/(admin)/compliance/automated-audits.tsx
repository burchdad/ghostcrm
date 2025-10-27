import React, { useState } from "react";

const mockAudits = [
  { id: 1, type: "GDPR", status: "passed", date: "2025-09-10" },
  { id: 2, type: "CCPA", status: "pending", date: "2025-09-12" },
  { id: 3, type: "HIPAA", status: "failed", date: "2025-09-13" },
];

export default function AutomatedComplianceAudits() {
  const [audits, setAudits] = useState(mockAudits);
  const [auditStatus, setAuditStatus] = useState("");

  function runAudit(type: string) {
    setAuditStatus(`${type} audit executed!`);
    alert(`${type} audit logic executed.`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🛡️ Automated Compliance Audits</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Audit Results</h2>
        <ul>
          {audits.map(audit => (
            <li key={audit.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{audit.type}</span>
              <span className={`text-xs ${audit.status === "passed" ? "text-green-700" : audit.status === "failed" ? "text-red-700" : "text-yellow-700"}`}>{audit.status}</span>
              <span className="text-xs text-gray-500">{audit.date}</span>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => runAudit(audit.type)}>Run Audit</button>
            </li>
          ))}
        </ul>
        {auditStatus && <div className="text-xs text-blue-700 mt-2">{auditStatus}</div>}
      </div>
    </div>
  );
}
