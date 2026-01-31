import React, { useState } from "react";

const mockActivity = [
  { id: 1, user: "Alice", action: "commented on Deal #123", time: "2025-09-15 10:01" },
  { id: 2, user: "Bob", action: "edited Lead #456", time: "2025-09-15 10:03" },
  { id: 3, user: "Carol", action: "viewed Document #789", time: "2025-09-15 10:05" },
];

export default function RealTimeCollaboration() {
  const [activity, setActivity] = useState(mockActivity);
  const [comment, setComment] = useState("");

  function handleComment() {
    setActivity([
      ...activity,
      { id: activity.length + 1, user: "You", action: `commented: ${comment}`, time: new Date().toISOString() }
    ]);
    setComment("");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🤝 Real-Time Collaboration</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Activity Feed</h2>
        <ul>
          {activity.map(act => (
            <li key={act.id} className="mb-2 text-sm">
              <span className="font-semibold text-blue-700">{act.user}</span> {act.action} <span className="text-xs text-gray-500">{act.time}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="border rounded px-2 py-1 w-full"
          />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={handleComment}>Comment</button>
        </div>
      </div>
    </div>
  );
}
