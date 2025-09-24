import React, { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { usePathname } from "next/navigation";

function getSectionPrompt(pathname: string) {
  if (pathname.includes("leads")) {
    return "Give 3 actionable recommendations for a CRM user working in the Leads section. Focus on lead management, follow-up, and conversion.";
  }
  if (pathname.includes("dashboard")) {
    return "Give 3 actionable recommendations for a CRM user working in the Dashboard section. Focus on analytics, performance, and insights.";
  }
  if (pathname.includes("inventory")) {
    return "Give 3 actionable recommendations for a CRM user working in the Inventory section. Focus on stock, trends, and optimization.";
  }
  return "Give 3 actionable recommendations for a CRM user in this section.";
}

// Format AI response for better readability
function formatAIResponse(text: string) {
  if (!text) return "";
  // Replace numbered points with bullet points and add line breaks
  return text.replace(/\d+\.\s+/g, '\n• ').replace(/\n{2,}/g, '\n');
}

function SidebarAIAssistant() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "How can I help?" }
  ]);
  const [tab, setTab] = useState("Recommended");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const pathname = usePathname();

  // Trigger recommendation as a message
  async function handleSendRec(rec: string) {
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: rec }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are GhostCRM's sidebar assistant. Help with CRM, sales, analytics, and org-specific tasks." },
            ...messages.filter(m => m.sender === "user").map(m => ({ role: "user", content: m.text })),
            { role: "user", content: rec }
          ]
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        setMessages(prev => [...prev, { sender: "assistant", text: `Error: ${res.status} - ${errorText}` }]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        setMessages(prev => [...prev, { sender: "assistant", text: "No response returned by OpenAI." }]);
        setLoading(false);
        return;
      }
      const aiText = data.choices[0].message.content || "Sorry, no response.";
      setMessages(prev => [...prev, { sender: "assistant", text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "assistant", text: "Error connecting to OpenAI." }]);
    }
    setLoading(false);
  }

  // Analyze current page context
  async function handleAnalyze() {
    setLoading(true);
    setMessages(prev => [...prev, { sender: "user", text: "Analyze this page" }]);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `You are GhostCRM's sidebar assistant. Analyze the current CRM page and provide actionable insights. The user is on the '${pathname}' page.` },
            ...messages.filter(m => m.sender === "user").map(m => ({ role: "user", content: m.text })),
            { role: "user", content: `Analyze the current page: ${pathname}` }
          ]
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        setMessages(prev => [...prev, { sender: "assistant", text: `Error: ${res.status} - ${errorText}` }]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        setMessages(prev => [...prev, { sender: "assistant", text: "No response returned by OpenAI." }]);
        setLoading(false);
        return;
      }
      const aiText = data.choices[0].message.content || "Sorry, no response.";
      setMessages(prev => [...prev, { sender: "assistant", text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "assistant", text: "Error connecting to OpenAI." }]);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are GhostCRM's sidebar assistant. Give actionable recommendations for the current CRM section." },
              { role: "user", content: getSectionPrompt(pathname) }
            ]
          })
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("OpenAI API error:", res.status, errorText);
          setRecommendations([`Error: ${res.status} - ${errorText}`]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error("OpenAI API response missing choices:", data);
          setRecommendations(["No recommendations returned by OpenAI."]);
          setLoading(false);
          return;
        }
        const aiText = data.choices[0].message.content || "No recommendations.";
        // Split into list if possible
        const recs = aiText.split(/\d+\.\s+/).filter(r => r.trim()).map(r => r.trim());
        setRecommendations(recs.length > 0 ? recs : [aiText]);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setRecommendations(["Error fetching recommendations."]);
      }
      setLoading(false);
    }
    fetchRecommendations();
  }, [pathname]);

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are GhostCRM's sidebar assistant. Help with CRM, sales, analytics, and org-specific tasks." },
            ...messages.filter(m => m.sender === "user").map(m => ({ role: "user", content: m.text })),
            { role: "user", content: input }
          ]
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("OpenAI API error:", res.status, errorText);
        setMessages(prev => [...prev, { sender: "assistant", text: `Error: ${res.status} - ${errorText}` }]);
        setLoading(false);
        setInput("");
        return;
      }
      const data = await res.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("OpenAI API response missing choices:", data);
        setMessages(prev => [...prev, { sender: "assistant", text: "No response returned by OpenAI." }]);
        setLoading(false);
        setInput("");
        return;
      }
      const aiText = data.choices[0].message.content || "Sorry, no response.";
      setMessages(prev => [...prev, { sender: "assistant", text: aiText }]);
    } catch (err) {
      console.error("Error connecting to OpenAI:", err);
      setMessages(prev => [...prev, { sender: "assistant", text: "Error connecting to OpenAI." }]);
    }
    setLoading(false);
    setInput("");
  }

  function handleReset() {
    setMessages([{ sender: "assistant", text: "How can I help?" }]);
    setInput("");
  }

  return (
    <div className="bg-white border rounded-lg p-3 mb-4 shadow-sm relative" style={{ maxHeight: '420px', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">How can I help?</span>
        <button
          className="text-gray-400 hover:text-blue-600 p-1 rounded-full focus:outline-none"
          title="Reset chat"
          aria-label="Reset chat"
          onClick={handleReset}
        >
          <FiRefreshCw size={16} />
        </button>
      </div>      
      <div className="flex gap-2 mb-2 text-xs">
        {["Recommended", "Ask", "Analyze", "Build"].map(tabName => (
          <button
            key={tabName}
            className={`px-2 py-1 rounded ${tab === tabName ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setTab(tabName)}
          >
            {tabName}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-purple-100 text-purple-700 ml-auto"
          onClick={handleAnalyze}
          disabled={loading}
          title="Analyze current page"
        >
          Analyze Page
        </button>
      </div>
      <div className="text-xs mb-2">
        {tab === "Recommended" && (
          <ul className="space-y-2">
            {loading ? (
              <li className="text-gray-400">Loading recommendations...</li>
            ) : (
              recommendations.map((rec, idx) => (
                <li key={idx} className="border-b pb-2 cursor-pointer hover:bg-blue-50 transition" onClick={() => handleSendRec(rec)}>
                  <button className="w-full text-left px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs">
                    {rec}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
        {tab !== "Recommended" && (
          <div className="text-gray-400">Type your request above and press Enter.</div>
        )}
      </div>
      <div className="mt-4 max-h-48 overflow-y-auto text-xs space-y-4">
        {messages.map((msg, idx) => (
          msg.sender === "assistant"
            ? <div key={idx} className="text-blue-700 whitespace-pre-line">{formatAIResponse(msg.text)}</div>
            : <div key={idx} className="text-gray-700 text-right">{msg.text}</div>
        ))}
        {loading && <div className="text-center text-gray-400">...</div>}
      </div>
      <input
        className="border rounded px-2 py-1 w-full text-xs mt-2"
        placeholder="Ask or build anything..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        disabled={loading}
        style={{ marginTop: 'auto' }}
      />
    </div>
  );
}

export default SidebarAIAssistant;
