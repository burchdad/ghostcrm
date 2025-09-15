import React, { useState } from "react";

const mockCustomers = [
  { id: 1, name: "Acme Corp", churnRisk: 0.8, upsellScore: 0.6 },
  { id: 2, name: "Beta LLC", churnRisk: 0.3, upsellScore: 0.9 },
  { id: 3, name: "Gamma Inc", churnRisk: 0.5, upsellScore: 0.4 },
];

export default function PredictiveAIChurnUpsell() {
  const [customers] = useState(mockCustomers);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🔮 Predictive AI: Churn & Upsell</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Customer Insights</h2>
        <ul>
          {customers.map(cust => (
            <li key={cust.id} className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{cust.name}</span>
              <span className={`text-xs ${cust.churnRisk > 0.7 ? "text-red-700" : "text-yellow-700"}`}>Churn Risk: {(cust.churnRisk * 100).toFixed(0)}%</span>
              <span className={`text-xs ${cust.upsellScore > 0.7 ? "text-green-700" : "text-blue-700"}`}>Upsell: {(cust.upsellScore * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
