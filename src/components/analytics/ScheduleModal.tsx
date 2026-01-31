"use client";
import React from "react";

interface Props {
  reportName: string;
  email: string;
  frequency: string;
  onClose: () => void;
  onSave: () => void;
  onEmailChange: (email: string) => void;
  onFreqChange: (freq: string) => void;
}

export default function ScheduleModal({
  reportName,
  email,
  frequency,
  onClose,
  onSave,
  onEmailChange,
  onFreqChange
}: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h3 className="font-bold mb-2">Schedule Analytics Report</h3>
        <input type="email" placeholder="Recipient Email" value={email} onChange={e => onEmailChange(e.target.value)} className="border rounded px-2 py-1 w-full mb-2" />
        <select value={frequency} onChange={e => onFreqChange(e.target.value)} className="border rounded px-2 py-1 w-full mb-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={onSave}>Save</button>
          <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
