
import React from "react";

interface Prompt {
  name: string;
  model: string;
  template?: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  parameters?: { temperature?: number; maxTokens?: number; system?: string };
  usageStats?: { count?: number; success?: number; failure?: number; avgResponseTime?: number };
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
// End Prompt interface
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
  newPromptTemplate?: string;
  setNewPromptTemplate?: (template: string) => void;
  newPromptTags?: string[];
  setNewPromptTags?: (tags: string[]) => void;
  newPromptParameters?: { temperature?: number; maxTokens?: number; system?: string };
  setNewPromptParameters?: (params: { temperature?: number; maxTokens?: number; system?: string }) => void;
  addPrompt: () => void;
  removePromptAsync: (idx: number) => void;
  userRole?: string;
// End PromptsProps interface
}

const MODEL_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "azure", label: "Azure" },
  { value: "custom", label: "Custom Endpoint" }
];

const Prompts: React.FC<PromptsProps> = ({
  prompts,
  setPrompts,
  showPromptModal,
  setShowPromptModal,
  newPromptName,
  setNewPromptName,
  newPromptModel,
  setNewPromptModel,
  newPromptTemplate = "",
  setNewPromptTemplate = () => {},
  newPromptTags = [],
  setNewPromptTags = () => {},
  newPromptParameters = {},
  setNewPromptParameters = () => {},
  addPrompt,
  removePromptAsync,
  userRole
}) => {
  const [search, setSearch] = React.useState("");
  const [testResult, setTestResult] = React.useState<string>("");
  const [importExportVisible, setImportExportVisible] = React.useState(false);
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // Test prompt stub
  const testPrompt = (prompt: Prompt) => {
    setTestResult("Testing...");
    setTimeout(() => {
      setTestResult(`Result for '${prompt.name}' on ${prompt.model}: Success`);
    }, 1000);
  };

  // Export prompts
  const exportPrompts = () => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import prompts
  const importPrompts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setPrompts(data);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // Filtered prompts
  const filteredPrompts = prompts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.model.toLowerCase().includes(search.toLowerCase()) ||
    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  if (!showPromptModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl">Manage Prompts/Models</h3>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-gray-100 rounded text-xs" onClick={exportPrompts}>Export</button>
            <label className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer">
              Import
              <input type="file" accept="application/json" className="hidden" onChange={importPrompts} />
            </label>
          </div>
        </div>
        <div className="mb-2 text-sm text-gray-600">Configure custom prompts, select AI models, and manage advanced settings for automation.</div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prompts..." className="border rounded px-2 py-1 mb-2 w-full" />
        <ul className="text-sm mb-2 max-h-48 overflow-auto">
          {filteredPrompts.map((prompt, idx) => (
            <li key={idx} className="mb-2 flex flex-col md:flex-row md:items-center justify-between border-b pb-2">
              <div>
                <span className="font-semibold">{prompt.name}</span>
                <span className="text-xs text-gray-500 ml-2">({prompt.model})</span>
                {prompt.tags && prompt.tags.length > 0 && <span className="text-xs text-blue-700 ml-2">Tags: {prompt.tags.join(", ")}</span>}
                {prompt.version && <span className="text-xs text-purple-700 ml-2">v{prompt.version}</span>}
                {prompt.parameters && <span className="text-xs text-gray-700 ml-2">Params: {Object.entries(prompt.parameters).map(([k, v]) => `${k}: ${v}`).join(", ")}</span>}
                {prompt.usageStats && <span className="text-xs text-green-700 ml-2">Used: {prompt.usageStats.count ?? 0}, Success: {prompt.usageStats.success ?? 0}, Fail: {prompt.usageStats.failure ?? 0}</span>}
                {prompt.auditHistory && prompt.auditHistory.length > 0 && <span className="text-xs text-gray-400 ml-2">Audit: {prompt.auditHistory.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join(" | ")}</span>}
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testPrompt(prompt)}>Test</button>
                {isAdmin && <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removePromptAsync(idx)}>Delete</button>}
              </div>
              {prompt.template && <div className="text-xs text-gray-700 mt-1">Template: {prompt.template}</div>}
            </li>
          ))}
        </ul>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={newPromptName}
            onChange={e => setNewPromptName(e.target.value)}
            placeholder="Prompt Name"
            className="border rounded px-2 py-1"
          />
          <select value={newPromptModel} onChange={e => setNewPromptModel(e.target.value)} className="border rounded px-2 py-1">
            {MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input
            type="text"
            value={newPromptTemplate}
            onChange={e => setNewPromptTemplate(e.target.value)}
            placeholder="Template (optional)"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={newPromptTags.join(",")}
            onChange={e => setNewPromptTags(e.target.value.split(",").map(t => t.trim()))}
            placeholder="Tags (comma separated)"
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            value={newPromptParameters.temperature ?? ""}
            onChange={e => setNewPromptParameters({ ...newPromptParameters, temperature: Number(e.target.value) })}
            placeholder="Temperature"
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            value={newPromptParameters.maxTokens ?? ""}
            onChange={e => setNewPromptParameters({ ...newPromptParameters, maxTokens: Number(e.target.value) })}
            placeholder="Max Tokens"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={newPromptParameters.system ?? ""}
            onChange={e => setNewPromptParameters({ ...newPromptParameters, system: e.target.value })}
            placeholder="System Instruction"
            className="border rounded px-2 py-1"
          />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addPrompt}>Add Prompt</button>
        </div>
        {testResult && <div className={`mb-2 text-xs ${testResult.includes("Success") ? "text-green-700" : "text-red-700"}`}>Test Result: {testResult}</div>}
        <div className="mb-4 text-xs text-gray-700">API Docs: <a href="https://platform.openai.com/docs/api-reference" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenAI API Docs</a></div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowPromptModal(false)}>Close</button>
        {!isAdmin && <div className="mt-4 text-xs text-red-700">Only admins can delete prompts or view advanced settings.</div>}
      </div>
    </div>
  );
};

export default Prompts;
