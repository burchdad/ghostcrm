import React, { useState } from "react";

interface SidebarAIAssistantProps {
  org: string;
  t: (key: string) => React.ReactNode;
}

const recommended = [
  "Create an interface page for Communications to streamline message review and follow-up tasks",
  "Find the communications related to the deal '2024 Ford F-150 XLT - Mike Chen'",
  "What are the main topics in the notes for leads assigned to Stephen Burch?"
];

const SidebarAIAssistant: React.FC<SidebarAIAssistantProps> = ({ org, t }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "How can I help?" }
  ]);
  const [tab, setTab] = useState("Recommended");

  const handleSend = () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { sender: "user", text: input }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages([...messages, { sender: "user", text: input }, { sender: "assistant", text: `AI response for: ${input}` }]);
      setLoading(false);
      setInput("");
    }, 1200);
  };

  return (
    <div className="bg-white border rounded-lg p-3 mb-4 shadow-sm">
      <div className="font-semibold text-sm mb-2">{t("How can I help?")}</div>
      <input
        className="border rounded px-2 py-1 w-full text-xs mb-2"
        placeholder={t("Ask or build anything...") as string}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        disabled={loading}
      />
      <div className="flex gap-2 mb-2 text-xs">
        {["Recommended", "Ask", "Analyze", "Build"].map(tabName => (
          <button
            key={tabName}
            className={`px-2 py-1 rounded ${tab === tabName ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setTab(tabName)}
          >
            {t(tabName)}
          </button>
        ))}
      </div>
      <div className="text-xs">
        {tab === "Recommended" && (
          <ul className="space-y-1">
            {recommended.map((rec, idx) => (
              <li key={idx} className="border-b pb-1 cursor-pointer hover:bg-gray-50" onClick={() => setInput(rec)}>{rec}</li>
            ))}
          </ul>
        )}
        {tab !== "Recommended" && (
          <div className="text-gray-400">{t("Type your request above and press Enter.")}</div>
        )}
      </div>
      <div className="mt-2 max-h-32 overflow-y-auto text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "assistant" ? "text-blue-700" : "text-gray-700 text-right"}>{msg.text}</div>
        ))}
        {loading && <div className="text-center text-gray-400">...</div>}
      </div>
    </div>
  );
};

export default SidebarAIAssistant;
