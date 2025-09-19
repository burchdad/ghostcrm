import React from "react";

interface AIChartGeneratorProps {
  aiInput: string;
  setAiInput: (val: string) => void;
  aiLoading: boolean;
  aiError: string | null;
  onGenerate: () => void;
  onPredictiveAnalytics: (query: string) => void;
}

const AIChartGenerator: React.FC<AIChartGeneratorProps> = ({ aiInput, setAiInput, aiLoading, aiError, onGenerate, onPredictiveAnalytics }) => (
  <div className="mb-4 flex gap-2 items-center">
    <input
      type="text"
      value={aiInput}
      onChange={e => setAiInput(e.target.value)}
      placeholder="Describe your chart (e.g. 'Show sales by rep last month')"
      className="border rounded px-2 py-1 text-xs w-64"
      aria-label="AI chart description"
    />
    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={onGenerate} disabled={aiLoading}>Build with AI</button>
    <button className="px-2 py-1 bg-orange-600 text-white rounded text-xs" onClick={() => onPredictiveAnalytics(aiInput)} disabled={aiLoading || !aiInput}>Predictive Analytics</button>
    {aiLoading && <span className="text-xs text-gray-500 ml-2">Loading...</span>}
    {aiError && <span className="text-xs text-red-500 ml-2">{aiError}</span>}
  </div>
);

export default AIChartGenerator;
