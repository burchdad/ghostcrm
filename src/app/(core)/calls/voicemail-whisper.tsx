import React, { useState } from "react";

const mockLeads = [
  { id: 1, name: "John Doe", phone: "555-1234", info: "Interested in SUV" },
  { id: 2, name: "Jane Smith", phone: "555-5678", info: "Requested financing options" },
];

export default function VoicemailWhisper() {
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [vmStatus, setVmStatus] = useState<string>("");
  const [whisperStatus, setWhisperStatus] = useState<string>("");

  function sendVoicemailDrop(leadId: number) {
    setVmStatus(`Voicemail dropped for lead ${leadId}`);
    alert("Voicemail sent!");
  }
  function whisperLeadInfo(leadId: number) {
    const lead = mockLeads.find(l => l.id === leadId);
    setWhisperStatus(`Whispered info: ${lead?.info}`);
    alert(`Whispered: ${lead?.info}`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📞 Voicemail Drop + Call Whisper</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Auto-send Voicemail Drop</h2>
        <ul>
          {mockLeads.map(lead => (
            <li key={lead.id} className="flex items-center gap-2 mb-2">
              <span>{lead.name} ({lead.phone})</span>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => sendVoicemailDrop(lead.id)}>Send VM Drop</button>
            </li>
          ))}
        </ul>
        {vmStatus && <div className="text-xs text-green-700 mt-2">{vmStatus}</div>}
      </div>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Call Whisper (Inbound)</h2>
        <ul>
          {mockLeads.map(lead => (
            <li key={lead.id} className="flex items-center gap-2 mb-2">
              <span>{lead.name} ({lead.phone})</span>
              <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => whisperLeadInfo(lead.id)}>Whisper Lead Info</button>
            </li>
          ))}
        </ul>
        {whisperStatus && <div className="text-xs text-blue-700 mt-2">{whisperStatus}</div>}
      </div>
    </div>
  );
}
