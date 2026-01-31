import React from "react";

type BulkAction = {
  label: string;
  onClick: () => void;
  color: string;
};

interface BulkOperationsProps {
  actions: BulkAction[];
  onCancel: () => void;
}

export default function BulkOperations({ actions, onCancel }: BulkOperationsProps) {
  return (
    <div className="mb-2 flex gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          className={`px-2 py-1 ${action.color} text-white rounded text-xs`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
      <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={onCancel}>Cancel</button>
    </div>
  );
}
