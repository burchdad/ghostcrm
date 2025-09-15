import React, { useState } from "react";

const mockTours = [
  { id: 1, name: "Getting Started", steps: ["Welcome", "Add Lead", "Schedule Demo"] },
  { id: 2, name: "Advanced Features", steps: ["Bulk Ops", "AI Insights", "Marketplace"] },
];

export default function GuidedToursOnboarding() {
  const [tours] = useState(mockTours);
  const [activeTour, setActiveTour] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  function startTour(id: number) {
    setActiveTour(id);
    setStepIdx(0);
  }
  function nextStep() {
    if (activeTour !== null && stepIdx < tours.find(t => t.id === activeTour)!.steps.length - 1) {
      setStepIdx(stepIdx + 1);
    }
  }
  function endTour() {
    setActiveTour(null);
    setStepIdx(0);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Guided Tours & Onboarding</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Tours</h2>
        <ul>
          {tours.map(tour => (
            <li key={tour.id} className="mb-2">
              <span className="font-semibold">{tour.name}</span>
              <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => startTour(tour.id)}>Start</button>
            </li>
          ))}
        </ul>
        {activeTour !== null && (
          <div className="mt-4">
            <div className="text-lg font-bold mb-2">Step {stepIdx + 1}: {tours.find(t => t.id === activeTour)!.steps[stepIdx]}</div>
            <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={nextStep}>Next</button>
            <button className="px-2 py-1 bg-gray-500 text-white rounded" onClick={endTour}>End Tour</button>
          </div>
        )}
      </div>
    </div>
  );
}
