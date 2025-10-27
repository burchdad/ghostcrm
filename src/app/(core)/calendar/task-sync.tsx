import React, { useState } from "react";

const mockTasks = [
  { id: 1, title: "Call John Doe", source: "Google Calendar", time: "2025-09-16 10:00" },
  { id: 2, title: "Demo with Acme Corp", source: "Outlook", time: "2025-09-16 13:00" },
  { id: 3, title: "Send Proposal", source: "CRM Task", time: "2025-09-16 15:00" },
];

export default function CalendarTaskSync() {
  const [tasks] = useState(mockTasks);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📅 Calendar & Task Sync</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Synced Tasks</h2>
        <ul>
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{task.title}</span>
              <span className="text-xs text-gray-500">{task.source}</span>
              <span className="text-xs text-blue-700">{task.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
