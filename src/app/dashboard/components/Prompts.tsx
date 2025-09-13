
import React from "react";

interface Prompt {
  name: string;
  model: string;
}

interface PromptsProps {
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
  showPromptModal: boolean;
  setShowPromptModal: (show: boolean) => void;
  newPromptName: string;
  setNewPromptName: (name: string) => void;
  newPromptModel: string;
  setNewPromptModel: (model: string) => void;
  addPrompt: () => void;
  removePromptAsync: (idx: number) => void;
}

const Prompts: React.FC<PromptsProps> = ({
  prompts,
  setPrompts,
  showPromptModal,
  setShowPromptModal,
  newPromptName,
  setNewPromptName,
  newPromptModel,
  setNewPromptModel,
  addPrompt,
  removePromptAsync
}) => {
  if (!showPromptModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h3 className="font-bold mb-2">Manage Prompts/Models</h3>
        <div className="mb-2 text-sm text-gray-600">Configure custom prompts and select AI models for automation.</div>
        <ul className="text-sm mb-2">
          {prompts.map((prompt, idx) => (
            <li key={idx} className="mb-1 flex items-center justify-between">
              <span>{prompt.name} <span className="text-xs text-gray-500">({prompt.model})</span></span>
              <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removePromptAsync(idx)}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newPromptName}
            onChange={e => setNewPromptName(e.target.value)}
            placeholder="Prompt Name"
            className="border rounded px-2 py-1"
          />
          <select value={newPromptModel} onChange={e => setNewPromptModel(e.target.value)} className="border rounded px-2 py-1">
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
          </select>
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addPrompt}>Add Prompt</button>
        </div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowPromptModal(false)}>Close</button>
      </div>
    </div>
  );
};

export default Prompts;
