import React, { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { usePathname } from "next/navigation";

interface ChartSuggestion {
  id: string;
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  category: string;
  config: any;
  sampleData: any;
  confidence: number;
}

interface AIMessage {
  sender: 'user' | 'assistant';
  text: string;
  chartSuggestions?: ChartSuggestion[];
  timestamp?: string;
}

interface SidebarAIAssistantProps {
  onBuildChart?: (suggestion: ChartSuggestion) => void;
}

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

// Detect if user message is requesting a chart
function detectChartRequest(message: string): boolean {
  const chartKeywords = ['chart', 'graph', 'plot', 'visualization', 'dashboard', 'show', 'display', 'analyze', 'compare', 'trend'];
  const dataKeywords = ['sales', 'revenue', 'performance', 'conversion', 'leads', 'customers', 'inventory', 'metrics'];
  
  const lowerMessage = message.toLowerCase();
  const hasChartKeyword = chartKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasDataKeyword = dataKeywords.some(keyword => lowerMessage.includes(keyword));
  
  return hasChartKeyword || hasDataKeyword;
}

// Generate chart suggestions based on user request
function generateChartSuggestions(message: string): ChartSuggestion[] {
  const lowerMessage = message.toLowerCase();
  const suggestions: ChartSuggestion[] = [];

  // Revenue/Sales trends
  if (lowerMessage.includes('revenue') || lowerMessage.includes('sales') || lowerMessage.includes('trend')) {
    suggestions.push({
      id: 'revenue-trend',
      title: 'Revenue Trend Analysis',
      description: 'Track sales revenue over time with growth indicators',
      chartType: 'line',
      category: 'sales',
      confidence: 0.9,
      config: {
        type: 'line',
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Revenue Trend' } },
          scales: { y: { beginAtZero: true } }
        }
      },
      sampleData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [50000, 65000, 72000, 68000, 81000, 95000],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)'
        }]
      }
    });
  }

  // Conversion/Funnel analysis
  if (lowerMessage.includes('conversion') || lowerMessage.includes('funnel') || lowerMessage.includes('pipeline')) {
    suggestions.push({
      id: 'conversion-funnel',
      title: 'Conversion Funnel',
      description: 'Visualize lead conversion through pipeline stages',
      chartType: 'bar',
      category: 'sales',
      confidence: 0.85,
      config: {
        type: 'bar',
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Sales Funnel' } }
        }
      },
      sampleData: {
        labels: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
        datasets: [{
          label: 'Count',
          data: [1000, 650, 420, 280, 150],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']
        }]
      }
    });
  }

  // Team/Performance comparison
  if (lowerMessage.includes('team') || lowerMessage.includes('performance') || lowerMessage.includes('compare')) {
    suggestions.push({
      id: 'team-performance',
      title: 'Team Performance Radar',
      description: 'Compare team member performance across metrics',
      chartType: 'radar',
      category: 'analytics',
      confidence: 0.8,
      config: {
        type: 'radar',
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Team Performance' } },
          scales: { r: { beginAtZero: true, max: 100 } }
        }
      },
      sampleData: {
        labels: ['Calls', 'Emails', 'Deals', 'Revenue', 'Satisfaction'],
        datasets: [{
          label: 'Team Average',
          data: [85, 92, 78, 88, 94],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)'
        }]
      }
    });
  }

  // Customer segments
  if (lowerMessage.includes('customer') || lowerMessage.includes('segment') || lowerMessage.includes('distribution')) {
    suggestions.push({
      id: 'customer-segments',
      title: 'Customer Segmentation',
      description: 'Analyze customer distribution by segments',
      chartType: 'pie',
      category: 'marketing',
      confidence: 0.75,
      config: {
        type: 'pie',
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Customer Segments' } }
        }
      },
      sampleData: {
        labels: ['Enterprise', 'Mid-Market', 'SMB', 'Startup'],
        datasets: [{
          data: [35, 28, 25, 12],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }]
      }
    });
  }

  return suggestions;
}

function SidebarAIAssistant({ onBuildChart }: SidebarAIAssistantProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    { sender: "assistant", text: "How can I help? I can suggest charts, analyze data, or provide CRM recommendations." }
  ]);
  const [tab, setTab] = useState("Recommended");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const pathname = usePathname();

  // Send user message and get AI response
  async function handleSendMessage() {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    // Check if this is a chart request
    const isChartRequest = detectChartRequest(userMessage);
    let chartSuggestions: ChartSuggestion[] = [];

    if (isChartRequest) {
      chartSuggestions = generateChartSuggestions(userMessage);
    }

    try {
      const systemPrompt = isChartRequest 
        ? "You are GhostCRM's AI assistant. The user is asking about charts or data visualization. Provide helpful context about the data they want to visualize, and mention that you've prepared some chart suggestions they can build with one click."
        : "You are GhostCRM's sidebar assistant. Help with CRM, sales, analytics, and org-specific tasks.";

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.filter(m => m.sender === "user").map(m => ({ role: "user", content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        setMessages(prev => [...prev, { 
          sender: "assistant", 
          text: `Error: ${res.status} - ${errorText}`,
          timestamp: new Date().toISOString()
        }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        setMessages(prev => [...prev, { 
          sender: "assistant", 
          text: "No response returned by OpenAI.",
          timestamp: new Date().toISOString()
        }]);
        setLoading(false);
        return;
      }

      const aiText = data.choices[0].message.content || "Sorry, no response.";
      
      setMessages(prev => [...prev, { 
        sender: "assistant", 
        text: aiText,
        chartSuggestions: chartSuggestions.length > 0 ? chartSuggestions : undefined,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: "assistant", 
        text: "Error connecting to OpenAI.",
        timestamp: new Date().toISOString()
      }]);
    }
    setLoading(false);
  }

  // Trigger recommendation as a message
  async function handleSendRec(rec: string) {
    setInput(rec);
    await handleSendMessage();
  }
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
    <div className="bg-white border rounded-lg p-3 mb-4 shadow-sm relative">
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
      <div className="mt-4 text-xs space-y-4" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: messages.length > 3 ? 'auto' : 'visible' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.sender === "assistant" ? (
              <div className="text-blue-700">
                <div className="whitespace-pre-line">{formatAIResponse(msg.text)}</div>
                {msg.chartSuggestions && msg.chartSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-blue-200 pt-2">
                    <div className="font-semibold text-blue-800">📊 Chart Suggestions:</div>
                    {msg.chartSuggestions.map((suggestion, suggIdx) => (
                      <div key={suggIdx} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-blue-900">{suggestion.title}</div>
                          <span className="text-xs bg-blue-200 text-blue-700 px-1 rounded">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        <div className="text-blue-700 text-xs mb-2">{suggestion.description}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600">
                            {suggestion.chartType.charAt(0).toUpperCase() + suggestion.chartType.slice(1)} Chart
                          </span>
                          {(onBuildChart || window.buildChartFromAI) && (
                            <button
                              onClick={() => {
                                if (window.buildChartFromAI) {
                                  window.buildChartFromAI(suggestion);
                                } else if (onBuildChart) {
                                  onBuildChart(suggestion);
                                }
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              🔨 Build Chart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-700 text-right">{msg.text}</div>
            )}
          </div>
        ))}
        {loading && <div className="text-center text-gray-400">...</div>}
      </div>
      <input
        className="border rounded px-2 py-1 w-full text-xs mt-2"
        placeholder="Ask or build anything..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSendMessage()}
        disabled={loading}
        style={{ marginTop: 'auto' }}
      />
    </div>
  );
}

export default SidebarAIAssistant;
