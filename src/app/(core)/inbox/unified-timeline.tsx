import React, { useState } from "react";

const mockTimeline = [
  { id: 1, type: "sms", content: "SMS from John Doe", time: "2025-09-16 09:00" },
  { id: 2, type: "call", content: "Call with Jane Smith", time: "2025-09-16 09:30" },
  { id: 3, type: "email", content: "Email from Acme Corp", time: "2025-09-16 10:00" },
  { id: 4, type: "slack", content: "Slack ping from Support", time: "2025-09-16 10:15" },
  { id: 5, type: "task", content: "Task: Follow up with lead", time: "2025-09-16 11:00" },
];

const typeIcons: Record<string, string> = {
  sms: "📱",
  call: "📞",
  email: "✉️",
  slack: "💬",
  task: "✅",
};

export default function UnifiedInboxTimeline() {
  const [timeline] = useState(mockTimeline);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📬 Inbox Unification Timeline</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Unified Timeline</h2>
        <ul>
          {timeline.map(item => (
            <li key={item.id} className="flex items-center gap-2 mb-2">
              <span className="text-xl">{typeIcons[item.type]}</span>
              <span>{item.content}</span>
              <span className="text-xs text-gray-500 ml-auto">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
