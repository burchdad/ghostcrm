import React, { useState } from "react";

const mockLeaderboard = [
  { id: 1, name: "Alice", points: 1200, badges: ["Closer", "Demo Master"] },
  { id: 2, name: "Bob", points: 950, badges: ["Follow-up Pro"] },
  { id: 3, name: "Carol", points: 800, badges: ["Pipeline Builder"] },
];

export default function GamificationLeaderboards() {
  const [leaderboard] = useState(mockLeaderboard);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🏆 Gamification & Leaderboards</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Leaderboard</h2>
        <ul>
          {leaderboard.map(user => (
            <li key={user.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{user.name}</span>
              <span className="text-xs text-blue-700">Points: {user.points}</span>
              <span className="text-xs text-green-700">Badges: {user.badges.join(", ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
