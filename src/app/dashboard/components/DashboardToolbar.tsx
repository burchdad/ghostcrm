import React from "react";

interface DashboardToolbarProps {
  onAddChart: () => void;
  onAddTable: () => void;
  onShowTemplates: () => void;
  onSaveLayout: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
  online: boolean;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  onAddChart,
  onAddTable,
  onShowTemplates,
  onSaveLayout,
  onShare,
  onUndo,
  onRedo,
  online
}) => (
  <div className="flex gap-2 items-center py-2 px-4 bg-white border-b sticky top-0 z-40">
    <button className="px-3 py-1 bg-blue-500 text-white rounded font-semibold" onClick={onAddChart}>Add Chart Widget</button>
    <button className="px-3 py-1 bg-green-500 text-white rounded font-semibold" onClick={onAddTable}>Add Table Widget</button>
    <button className="px-3 py-1 bg-purple-400 text-white rounded font-semibold" onClick={onShowTemplates}>Templates</button>
    <button className="px-3 py-1 bg-gray-800 text-white rounded font-semibold" onClick={onSaveLayout}>Save Layout</button>
    <button className="px-3 py-1 bg-indigo-400 text-white rounded font-semibold" onClick={onShare}>Share</button>
    <button className="px-3 py-1 bg-yellow-400 text-black rounded font-semibold" onClick={onUndo}>Undo</button>
    <button className="px-3 py-1 bg-yellow-600 text-white rounded font-semibold" onClick={onRedo}>Redo</button>
    <span className="ml-4 text-xs text-gray-500">Online: <span className={online ? "text-green-600" : "text-red-600"}>{online ? "●" : "○"}</span></span>
  </div>
);

export default DashboardToolbar;
