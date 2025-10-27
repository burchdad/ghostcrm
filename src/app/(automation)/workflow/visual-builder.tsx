import React, { useState } from "react";

const mockWorkflows = [
  { id: 1, name: "Lead Assignment", steps: ["New Lead", "Assign Rep", "Send Welcome Email"] },
  { id: 2, name: "Contract Approval", steps: ["Draft Contract", "Manager Review", "E-Signature"] },
];

export default function VisualWorkflowBuilder() {
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [newWorkflow, setNewWorkflow] = useState("");
  const [newStep, setNewStep] = useState("");
  const [steps, setSteps] = useState<string[]>([]);

  function addStep() {
    if (newStep) {
      setSteps([...steps, newStep]);
      setNewStep("");
    }
  }

  function saveWorkflow() {
    if (newWorkflow && steps.length) {
      setWorkflows([...workflows, { id: workflows.length + 1, name: newWorkflow, steps }]);
      setNewWorkflow("");
      setSteps([]);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Visual Workflow Builder</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Workflows</h2>
        <ul>
          {workflows.map(wf => (
            <li key={wf.id} className="mb-2">
              <span className="font-semibold">{wf.name}</span>: <span className="text-xs text-gray-500">{wf.steps.join(" → ")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <input
            type="text"
            value={newWorkflow}
            onChange={e => setNewWorkflow(e.target.value)}
            placeholder="Workflow Name"
            className="border rounded px-2 py-1 mb-2 w-full"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newStep}
              onChange={e => setNewStep(e.target.value)}
              placeholder="Add Step"
              className="border rounded px-2 py-1 w-full"
            />
            <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={addStep}>Add Step</button>
          </div>
          <div className="mb-2 text-xs text-gray-600">Steps: {steps.join(" → ")}</div>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={saveWorkflow}>Save Workflow</button>
        </div>
      </div>
    </div>
  );
}
