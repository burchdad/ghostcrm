import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRotateRight, faUser, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import Image from "next/image";

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

function SidebarAIAssistant() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hi! I'm your Ghost CRM AI assistant. How can I help you today?" }
  ]);
  const [tab, setTab] = useState("Recommended");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch recommendations on mount and pathname change
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
          console.error("OpenAI API error:", res.status);
          setRecommendations(["Unable to load recommendations at this time."]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const aiText = data.choices?.[0]?.message?.content || "No recommendations.";
        const recs = aiText.split(/\d+\.\s+/).filter(r => r.trim()).map(r => r.trim());
        setRecommendations(recs.length > 0 ? recs : [aiText]);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setRecommendations(["Unable to load recommendations."]);
      }
      setLoading(false);
    }
    fetchRecommendations();
  }, [pathname]);


  async function handleSend() {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
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
            { role: "system", content: "You are GhostCRM's AI assistant. Help with CRM, sales, analytics, and business tasks. Be concise and actionable." },
            ...messages.map(m => ({ 
              role: m.sender === "user" ? "user" : "assistant", 
              content: m.text 
            })),
            { role: "user", content: userMessage }
          ]
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        setMessages(prev => [...prev, { 
          sender: "assistant", 
          text: "Sorry, I'm having trouble connecting. Please try again." 
        }]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { sender: "assistant", text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: "assistant", 
        text: "Error connecting to AI service. Please try again." 
      }]);
    }
    
    setLoading(false);
  }

  function handleReset() {
    setMessages([{ sender: "assistant", text: "Hi! I'm your Ghost CRM AI assistant. How can I help you today?" }]);
    setInput("");
  }

  return (
    <div className="ai-chatbot">
      <div className="ai-chatbot-header">
        <div className="ai-chatbot-header-content">
          <div className="ai-chatbot-icon">
            <Image 
              src="/images/ghost-favicon.png" 
              alt="Ghost AI" 
              width={28} 
              height={28}
              className="ai-chatbot-ghost-icon"
            />
          </div>
          <div className="ai-chatbot-title">
            <div className="ai-chatbot-name">AI Assistant</div>
            <div className="ai-chatbot-status">
              <span className="ai-chatbot-status-dot"></span>
              Online
            </div>
          </div>
        </div>
        <button 
          className="ai-chatbot-reset-btn" 
          onClick={handleReset}
          title="Reset conversation"
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="ai-chatbot-tabs">
        <button 
          className={`ai-chatbot-tab ${tab === "chat" ? "active" : ""}`}
          onClick={() => setTab("chat")}
        >
          Chat
        </button>
        <button 
          className={`ai-chatbot-tab ${tab === "recommendations" ? "active" : ""}`}
          onClick={() => setTab("recommendations")}
        >
          <FontAwesomeIcon icon={faLightbulb} /> Tips
        </button>
      </div>

      {/* Messages Area */}
      {tab === "chat" ? (
        <>
          <div className="ai-chatbot-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`ai-message ${msg.sender === "user" ? "ai-message-user" : "ai-message-assistant"}`}
              >
                <div className="ai-message-avatar">
                  {msg.sender === "user" ? (
                    <FontAwesomeIcon icon={faUser} />
                  ) : (
                    <Image 
                      src="/images/ghost-favicon.png" 
                      alt="AI" 
                      width={20} 
                      height={20}
                      className="ai-message-ghost-avatar"
                    />
                  )}
                </div>
                <div className="ai-message-content">
                  <div className="ai-message-text">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {loading && tab === "chat" && (
              <div className="ai-message ai-message-assistant">
                <div className="ai-message-avatar">
                  <Image 
                    src="/images/ghost-favicon.png" 
                    alt="AI" 
                    width={20} 
                    height={20}
                    className="ai-message-ghost-avatar"
                  />
                </div>
                <div className="ai-message-content">
                  <div className="ai-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-chatbot-input-area">
            <input
              type="text"
              className="ai-chatbot-input"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button 
              className="ai-chatbot-send-btn" 
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </>
      ) : (
        <div className="ai-chatbot-recommendations">
          {loading ? (
            <div className="ai-recommendations-loading">
              <div className="ai-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Loading recommendations...</p>
            </div>
          ) : (
            <div className="ai-recommendations-list">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="ai-recommendation-item">
                  <div className="ai-recommendation-icon">
                    <FontAwesomeIcon icon={faLightbulb} />
                  </div>
                  <div className="ai-recommendation-text">{rec}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SidebarAIAssistant;
