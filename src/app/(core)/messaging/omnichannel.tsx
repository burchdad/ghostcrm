import React, { useState } from "react";

const mockMessages = [
  { id: 1, channel: "WhatsApp", content: "WhatsApp message from John", time: "2025-09-15 09:00" },
  { id: 2, channel: "Messenger", content: "Messenger ping from Jane", time: "2025-09-15 09:30" },
  { id: 3, channel: "SMS", content: "SMS from Acme Corp", time: "2025-09-15 10:00" },
];

const channelIcons: Record<string, string> = {
  WhatsApp: "🟢",
  Messenger: "🔵",
  SMS: "📱",
};

export default function OmnichannelMessaging() {
  const [messages] = useState(mockMessages);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">💬 Omnichannel Messaging</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Unified Messages</h2>
        <ul>
          {messages.map(msg => (
            <li key={msg.id} className="flex items-center gap-2 mb-2">
              <span className="text-xl">{channelIcons[msg.channel]}</span>
              <span>{msg.content}</span>
              <span className="text-xs text-gray-500 ml-auto">{msg.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
