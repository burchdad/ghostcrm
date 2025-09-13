import React from "react";

interface AnalyticsView {
  name: string;
  chartType: string;
  groupBy: string;
  metric: string;
  reps: any[];
  status: any[];
}

interface AnalyticsProps {
  customAnalyticsViews: AnalyticsView[];
  setCustomAnalyticsViews: (views: AnalyticsView[]) => void;
  showAnalyticsBuilder: boolean;
  setShowAnalyticsBuilder: (show: boolean) => void;
  newCardTitle: string;
  setNewCardTitle: (title: string) => void;
  newCardType: string;
  setNewCardType: (type: string) => void;
  newCardData: string;
  setNewCardData: (data: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  customAnalyticsViews,
  setCustomAnalyticsViews,
  showAnalyticsBuilder,
  setShowAnalyticsBuilder,
  newCardTitle,
  setNewCardTitle,
  newCardType,
  setNewCardType,
  newCardData,
  setNewCardData
}) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
        Analytics & Insights
      </h2>
      <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={() => setShowAnalyticsBuilder(true)}>
        + Add Analytics Card
      </button>
      {/* Modal for Analytics Builder */}
      {showAnalyticsBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="font-bold mb-2">Create Custom Analytics Card</h3>
            <div className="mb-2 flex gap-2 flex-wrap">
              <input type="text" placeholder="Card Title" value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} className="border rounded px-2 py-1" />
              <select value={newCardType} onChange={e => setNewCardType(e.target.value)} className="border rounded px-2 py-1">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="doughnut">Doughnut</option>
                <option value="pie">Pie</option>
              </select>
              <textarea placeholder="Data Query (JS/SQL)" value={newCardData} onChange={e => setNewCardData(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                setCustomAnalyticsViews([...customAnalyticsViews, {
                  name: newCardTitle,
                  chartType: newCardType,
                  groupBy: "",
                  metric: "",
                  reps: [],
                  status: [],
                }]);
                setShowAnalyticsBuilder(false);
                setNewCardTitle("");
                setNewCardType("bar");
                setNewCardData("");
              }}>Save</button>
              <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowAnalyticsBuilder(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Render custom analytics views */}
      <ul className="text-sm mt-4">
        {customAnalyticsViews.map((view, idx) => (
          <li key={idx} className="mb-2">
            <span className="font-bold mr-2">{view.name}</span>
            <span className="text-xs text-gray-500">{view.chartType}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Analytics;
