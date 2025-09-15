import React, { useState } from "react";

const mockDeals = [
  { id: 1, name: "Acme Corp", value: 50000, closeDate: "2025-09-20", probability: 0.85 },
  { id: 2, name: "Beta LLC", value: 12000, closeDate: "2025-09-18", probability: 0.65 },
  { id: 3, name: "Gamma Inc", value: 30000, closeDate: "2025-09-25", probability: 0.40 },
];

function getLikelyToClose(deals: typeof mockDeals) {
  // AI logic placeholder: filter deals with probability > 0.6 and closeDate within 7 days
  const today = new Date("2025-09-15");
  return deals.filter(deal => {
    const close = new Date(deal.closeDate);
    const days = (close.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return deal.probability > 0.6 && days >= 0 && days <= 7;
  });
}

export default function AIDealForecastEngine() {
  const [deals] = useState(mockDeals);
  const likelyDeals = getLikelyToClose(deals);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🤖 AI Deal Forecast Engine</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Deals Likely to Close (Next 7 Days)</h2>
        <ul>
          {likelyDeals.length === 0 ? (
            <li className="text-gray-500">No deals predicted to close soon.</li>
          ) : (
            likelyDeals.map(deal => (
              <li key={deal.id} className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{deal.name}</span>
                <span className="text-xs text-gray-500">${deal.value.toLocaleString()}</span>
                <span className="text-xs text-blue-700">Close: {deal.closeDate}</span>
                <span className="text-xs text-green-700">AI Probability: {(deal.probability * 100).toFixed(0)}%</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
