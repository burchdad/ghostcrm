import React, { useState } from "react";

const mockJourneys = [
  { id: 1, customer: "Acme Corp", stages: ["Lead", "Demo", "Proposal", "Closed Won"] },
  { id: 2, customer: "Beta LLC", stages: ["Lead", "Nurture", "Lost"] },
];

export default function CustomerJourneyMapping() {
  const [journeys] = useState(mockJourneys);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🗺️ Customer Journey Mapping</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Journeys</h2>
        <ul>
          {journeys.map(journey => (
            <li key={journey.id} className="mb-2">
              <span className="font-semibold">{journey.customer}</span>: <span className="text-xs text-gray-500">{journey.stages.join(" → ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
