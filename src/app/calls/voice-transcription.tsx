import React, { useState } from "react";

const mockCalls = [
  { id: 1, contact: "John Doe", transcript: "Discussed pricing and next steps.", actions: ["Send proposal"] },
  { id: 2, contact: "Jane Smith", transcript: "Requested demo and timeline.", actions: ["Schedule demo"] },
];

export default function VoiceToCRMTranscription() {
  const [calls] = useState(mockCalls);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🎤 Voice-to-CRM & Call Transcription</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Call Logs</h2>
        <ul>
          {calls.map(call => (
            <li key={call.id} className="mb-4">
              <div className="font-semibold">{call.contact}</div>
              <div className="text-xs text-gray-500 mb-1">Transcript: {call.transcript}</div>
              <div className="text-xs text-blue-700">Actions: {call.actions.join(", ")}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
