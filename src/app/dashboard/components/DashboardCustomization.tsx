import React, { useRef, useState } from "react";

interface DashboardCustomizationProps {
  widgets: any[];
  layoutTemplate: string;
  handleAddWidget: (type: string) => void;
  handleRemoveWidget: (id: number) => void;
  handleEditWidget: (id: number, updates: any) => void;
  showTemplateModal: boolean;
  setShowTemplateModal: (show: boolean) => void;
  showWidgetSettings: number | null;
  setShowWidgetSettings: (id: number | null) => void;
  savedTemplates: any[];
  exampleTemplates: any[];
  handleSaveTemplate: () => void;
  handleLoadTemplate: (name: string) => void;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  shareLink: string;
  handleShareDashboard: () => void;
  t: (key: string) => React.ReactNode;
  presence?: string[]; // Real-time presence
  onWidgetOrderChange?: (widgets: any[]) => void; // For drag-and-drop
}

const colorPalette = ["#22c55e", "#3b82f6", "#facc15", "#a78bfa", "#f472b6", "#f59e42", "#10b981"];

function WidgetErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Widget Error: {error.message}</div>;
  return children;
}

const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({
  widgets,
  layoutTemplate,
  handleAddWidget,
  handleRemoveWidget,
  handleEditWidget,
  showTemplateModal,
  setShowTemplateModal,
  showWidgetSettings,
  setShowWidgetSettings,
  savedTemplates,
  exampleTemplates,
  handleSaveTemplate,
  handleLoadTemplate,
  showShareModal,
  setShowShareModal,
  shareLink,
  handleShareDashboard,
  t,
  presence = [],
  onWidgetOrderChange,
}) => {
  // Undo/redo stack
  const [history, setHistory] = useState([widgets]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Undo/redo handlers
  function pushHistory(newWidgets: any[]) {
    const newHist = history.slice(0, historyIdx + 1);
    setHistory([...newHist, newWidgets]);
    setHistoryIdx(newHist.length);
  }
  function undo() {
    if (historyIdx > 0) setHistoryIdx(historyIdx - 1);
  }
  function redo() {
    if (historyIdx < history.length - 1) setHistoryIdx(historyIdx + 1);
  }

  // Widget duplication
  function handleDuplicateWidget(id: number) {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      const newWidget = { ...widget, id: Date.now() };
      handleAddWidget(newWidget.type);
      pushHistory([...widgets, newWidget]);
    }
  }

  // Drag-and-drop logic
  function handleDragStart(idx: number) {
    setDragOverIdx(idx);
  }
  function handleDragEnter(idx: number) {
    setDragOverIdx(idx);
  }
  function handleDrop(idx: number) {
    setDragOverIdx(null);
    if (dragOverIdx !== null && dragOverIdx !== idx) {
      const newWidgets = [...widgets];
      const [moved] = newWidgets.splice(dragOverIdx, 1);
      newWidgets.splice(idx, 0, moved);
      pushHistory(newWidgets);
      if (onWidgetOrderChange) onWidgetOrderChange(newWidgets);
    }
  }

  // Widget type rendering
  function renderWidgetContent(widget: any) {
    switch (widget.type) {
      case "chart":
        return <div className="h-24 flex items-center justify-center text-gray-400">[Chart Widget]</div>;
      case "table":
        return <div className="h-24 flex items-center justify-center text-gray-400">[Table Widget]</div>;
      case "kanban":
        return <div className="h-24 flex items-center justify-center text-gray-400">[Kanban Board]</div>;
      default:
        return <div className="h-24 flex items-center justify-center text-gray-400">[Unknown Widget]</div>;
    }
  }

  // Accessibility: keyboard navigation, ARIA labels
  // ...add tabIndex, aria-labels, etc. as needed...

  return (
    <div className="p-6" ref={gridRef}>
      <div className="flex items-center gap-4 mb-4">
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => handleAddWidget('chart')}>Add Chart Widget</button>
        <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => handleAddWidget('table')}>Add Table Widget</button>
        <button className="px-3 py-1 bg-purple-500 text-white rounded" onClick={() => setShowTemplateModal(true)}>Templates</button>
        <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={handleSaveTemplate}>Save Layout</button>
        <button className="px-3 py-1 bg-indigo-500 text-white rounded" onClick={handleShareDashboard}>Share</button>
        <button className="px-3 py-1 bg-yellow-500 text-black rounded" onClick={undo} disabled={historyIdx === 0}>Undo</button>
        <button className="px-3 py-1 bg-yellow-500 text-black rounded" onClick={redo} disabled={historyIdx === history.length - 1}>Redo</button>
        <span className="ml-4 text-xs text-gray-500">Online: {presence.join(", ")}</span>
      </div>
      {/* Layout template selection modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="font-bold text-lg mb-4">Template Library</h2>
            <div className="flex flex-col gap-2">
              {[...exampleTemplates, ...savedTemplates].map(tpl => (
                <button key={tpl.name} className="px-3 py-2 bg-gray-100 rounded flex flex-col items-start"
                  onClick={() => { handleLoadTemplate(tpl.name); setShowTemplateModal(false); }}>
                  <span className="font-bold">{tpl.name}</span>
                  <span className="text-xs text-gray-500">{tpl.description || 'Custom template'}</span>
                </button>
              ))}
            </div>
            <button className="mt-4 px-3 py-1 bg-red-500 text-white rounded" onClick={() => setShowTemplateModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="font-bold text-lg mb-4">Share Dashboard</h2>
            <div className="mb-2">Share this link with your team:</div>
            <input className="border rounded px-2 py-1 w-full mb-2" value={shareLink} readOnly />
            <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Dashboard grid (drag-and-drop, settings modal) */}
      <div className={`grid ${layoutTemplate === 'grid' ? 'grid-cols-2 gap-6' : layoutTemplate === 'single' ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-4'} mt-4`}>
        {history[historyIdx].map((widget, idx) => (
          <WidgetErrorBoundary key={widget.id}>
            <div
              className={`bg-white rounded-lg shadow p-4 relative group ${dragOverIdx === idx ? 'ring-4 ring-blue-400' : ''}`}
              draggable
              tabIndex={0}
              aria-label={widget.title}
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDrop={() => handleDrop(idx)}
              onDragOver={e => e.preventDefault()}
              style={{ borderLeft: `6px solid ${widget.color || '#a78bfa'}` }}
            >
              <span className="font-bold text-lg">{widget.title}</span>
              <button className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveWidget(widget.id)} title="Remove">&times;</button>
              <button className="absolute top-2 left-10 text-blue-500 hover:text-blue-700" onClick={() => setShowWidgetSettings(widget.id)} title="Settings">⚙️</button>
              <button className="absolute top-2 left-20 text-green-500 hover:text-green-700" onClick={() => handleDuplicateWidget(widget.id)} title="Duplicate">⧉</button>
              {/* Widget content */}
              {renderWidgetContent(widget)}
              {/* Color palette picker */}
              <div className="mt-2 flex gap-1">
                {colorPalette.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ background: color }}
                    aria-label={`Set color ${color}`}
                    onClick={() => handleEditWidget(widget.id, { color })}
                  />
                ))}
              </div>
              {/* Drag handle */}
              <div className="absolute left-2 top-2 cursor-move text-gray-400 opacity-0 group-hover:opacity-100">↕</div>
            </div>
          </WidgetErrorBoundary>
        ))}
      </div>
      {/* Widget Settings Modal */}
      {showWidgetSettings !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="font-bold text-lg mb-4">Edit Widget</h2>
            {(() => {
              const widget = widgets.find(w => w.id === showWidgetSettings);
              if (!widget) return null;
              return (
                <form onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                  const type = (form.elements.namedItem('type') as HTMLSelectElement).value;
                  const color = (form.elements.namedItem('color') as HTMLInputElement).value;
                  handleEditWidget(widget.id, { title, type, color });
                }}>
                  <div className="mb-2">
                    <label className="block text-sm">Title</label>
                    <input name="title" defaultValue={widget.title} className="border rounded px-2 py-1 w-full" />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Type</label>
                    <select name="type" defaultValue={widget.type} className="border rounded px-2 py-1 w-full">
                      <option value="chart">Chart</option>
                      <option value="table">Table</option>
                      <option value="kanban">Kanban</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Color</label>
                    <input name="color" type="color" defaultValue={widget.color || '#a78bfa'} className="w-12 h-8 border rounded" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                    <button type="button" className="px-3 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setShowWidgetSettings(null)}>Cancel</button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCustomization;
