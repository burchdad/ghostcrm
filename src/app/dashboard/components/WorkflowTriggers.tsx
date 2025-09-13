
import React from "react";

interface WorkflowTrigger {
  name: string;
  type: string;
}

interface WorkflowTriggersProps {
  workflowTriggers: WorkflowTrigger[];
  setWorkflowTriggers: (triggers: WorkflowTrigger[]) => void;
  showWorkflowModal: boolean;
  setShowWorkflowModal: (show: boolean) => void;
  newTriggerName: string;
  setNewTriggerName: (name: string) => void;
  newTriggerType: string;
  setNewTriggerType: (type: string) => void;
  addWorkflowTrigger: () => void;
  removeWorkflowTrigger: (idx: number) => void;
}

const WorkflowTriggers: React.FC<WorkflowTriggersProps> = ({
  workflowTriggers,
  setWorkflowTriggers,
  showWorkflowModal,
  setShowWorkflowModal,
  newTriggerName,
  setNewTriggerName,
  newTriggerType,
  setNewTriggerType,
  addWorkflowTrigger,
  removeWorkflowTrigger
}) => {
  if (!showWorkflowModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="font-bold mb-2">Manage Workflow Triggers</h3>
        <div className="mb-2 text-sm text-gray-600">Automate actions and assignments using workflow triggers.</div>
        <ul className="text-sm mb-2">
          {workflowTriggers.map((trigger, idx) => (
            <li key={idx} className="mb-1 flex items-center justify-between">
              <span>{trigger.name} <span className="text-xs text-gray-500">({trigger.type})</span></span>
              <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWorkflowTrigger(idx)}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTriggerName}
            onChange={e => setNewTriggerName(e.target.value)}
            placeholder="Trigger Name"
            className="border rounded px-2 py-1"
          />
          <select value={newTriggerType} onChange={e => setNewTriggerType(e.target.value)} className="border rounded px-2 py-1">
            <option value="auto-assign">Auto-Assign</option>
            <option value="notify">Notify</option>
            <option value="update-status">Update Status</option>
          </select>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addWorkflowTrigger}>Add Trigger</button>
        </div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWorkflowModal(false)}>Close</button>
      </div>
    </div>
  );
};

export default WorkflowTriggers;
