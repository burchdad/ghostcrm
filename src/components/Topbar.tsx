"use client";
import React, { useEffect, useRef, useState } from "react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { Modal } from "./Modal";

type NoteFilter = "all" | "unread" | "archived";

export default function Topbar() {
  // KPIs/widgets
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [widgets, setWidgets] = useState([
    { id: "kpi", label: "Leads KPI", content: <span>Loading...</span>, pinned: false },
    { id: "compliance", label: "Compliance", content: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">GDPR ✅</span>, pinned: false },
  ]);
  useEffect(() => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === "kpi" ? { ...w, content: <span>{leadCount !== null ? `${leadCount} leads` : "Loading..."}</span> } : w
      )
    );
  }, [leadCount]);
  const pinWidget = (id: string) =>
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w)));

  // Shell state
  const [org, setOrg] = useState("All");
  const [userRole] = useState("admin");
  // Removed Org/Theme/Language selects and quick action buttons from function body. All rendering is handled in the return statement below.

  // Notifications
  const [notifications, setNotifications] = useState<string[]>(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<NoteFilter>("all");
  const markAsRead = (n: string) => setUnreadNotifications((x) => x.filter((v) => v !== n));
  const archiveNotification = (n: string) => {
    setArchivedNotifications((x) => [...x, n]);
    setNotifications((x) => x.filter((v) => v !== n));
  };
  const groupedNotifications = notifications.reduce((acc: Record<string, string[]>, n) => {
    const type = n.includes("lead") ? "Leads" : n.includes("Welcome") ? "System" : "Other";
    (acc[type] ||= []).push(n);
    return acc;
  }, {});
  const filteredNotifications =
    notificationFilter === "all" ? notifications : notificationFilter === "unread" ? unreadNotifications : archivedNotifications;

  // Search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  async function handleGlobalSearch(query: string) {
    setSearchLoading(true);
    try {
      const [leadsRes, invRes] = await Promise.all([
        fetch(`/api/leads?search=${encodeURIComponent(query)}`),
        fetch(`/api/inventory?search=${encodeURIComponent(query)}`),
      ]);
      const leads = await leadsRes.json();
      const inventory = await invRes.json();
      setSearchResults([
        ...(leads.records || []).map((r: any) => ({ type: "Lead", ...r })),
        ...(inventory.records || []).map((r: any) => ({ type: "Inventory", ...r })),
      ]);
    } catch {
      setSearchResults([]);
    }
    setSearchLoading(false);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Quick actions
  const quickActions =
    userRole === "admin"
      ? [
          { label: "Add Lead", onClick: () => (window.location.href = "/leads/new") },
          { label: "Export Data", onClick: () => alert("Exporting data...") },
          { label: "Reset Inventory", onClick: () => alert("Inventory reset!") },
        ]
      : [
          { label: "Schedule Appointment", onClick: () => (window.location.href = "/appointments/new") },
          { label: "Contact Support", onClick: () => alert("Contacting support...") },
        ];

  // Initial fetches
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.records) {
          setLeadCount(data.records.length);
          setNotifications(["Welcome to GhostCRM!", `You have ${data.records.length} leads.`]);
        } else {
          setNotifications(["Welcome to GhostCRM!", "Unable to fetch leads."]);
        }
      } catch {
        setNotifications(["Welcome to GhostCRM!", "Unable to fetch leads."]);
      }
    })();
  // Removed setOnlineUsers (not used)
  }, []);

  // AI assistant
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ sender: "assistant", text: "Hi! How can I help you today?" }]);
  const [aiInput, setAiInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiMessages, aiModalOpen]);
  async function handleAiSend() {
    if (!aiInput.trim()) return;
    const userMessage = { sender: "user", text: aiInput };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...aiMessages.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
            { role: "user", content: userMessage.text },
          ],
        }),
      });
      const data = await res.json();
      setAiMessages((prev) => [...prev, { sender: "assistant", text: data.message || "…" }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { sender: "assistant", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  }

  // Voice I/O (guarded for SSR)
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  function startVoiceInput() {
  if (typeof window === "undefined") return;
  const win: any = window as any;
  const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SR) return;
  const recognition = new SR();
  recognition.lang = "en";
  recognition.onresult = (e: any) => setAiInput(e.results?.[0]?.[0]?.transcript ?? "");
  recognition.onend = () => setListening(false);
  recognitionRef.current = recognition;
  recognition.start();
  setListening(true);
  }
  function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new (window as any).SpeechSynthesisUtterance(text);
  utter.lang = "en";
  window.speechSynthesis.speak(utter);
  }

  // UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ONE ROW, content-only toolbar. Positioned menus use top-full to avoid weird offsets.
  return (
  <div className="w-full h-16 flex items-center gap-3 px-2 md:px-4 overflow-x-auto relative">
      {/* left cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-bold text-lg text-blue-700 whitespace-nowrap">Ghost Auto CRM</span>
      </div>

      {/* widgets (hide on small) */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {widgets.map((w) => (
          <div key={w.id} className="flex items-center gap-1">
            <span className="text-xs font-bold">{w.label}</span>
            <div>{w.content}</div>
            <button className="text-[11px] underline" onClick={() => pinWidget(w.id)}>{w.pinned ? "Unpin" : "Pin"}</button>
          </div>
        ))}
      </div>

      {/* search (grows) */}
      <div className="relative flex items-center gap-2 flex-1 min-w-[180px]">
        <input
          ref={searchInputRef}
          id="global-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 h-8 w-full max-w-xs"
          placeholder="Global Search (Ctrl+K)"
          onKeyDown={(e) => { if (e.key === "Enter") handleGlobalSearch(search); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchLoading && <span className="text-xs text-blue-500">Searching...</span>}
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg z-50 w-72 max-h-80 overflow-y-auto">
            <ul>
              {searchResults.map((r, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => setSearch(`${r.type}: ${r.name || r.model || r.id}`)}
                >
                  {r.type}: {r.name || r.model || r.id}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* quick actions (hide on very small) */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        {quickActions.map((a) => (
          <button key={a.label} className="px-2 h-8 bg-purple-100 text-purple-700 rounded text-xs" onClick={a.onClick}>
            {a.label}
          </button>
        ))}
      </div>

      {/* notifications */}
      <div className="relative shrink-0">
        <button
          className="relative"
          aria-label="Notifications"
          onClick={() => { setShowDropdown((s) => !s); if (!showDropdown) setShowProfile(false); }}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl">🔔</span>
          {filteredNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{filteredNotifications.length}</span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xl text-blue-600">🔔</span>
                <span className="font-bold text-base">Notifications</span>
              </div>
              <button className="text-xs text-red-500 hover:underline" onClick={() => setNotifications([])}>Clear All</button>
            </div>
            <div className="flex gap-2 p-3 border-b bg-gray-50">
              <button className={`text-xs px-2 py-1 rounded ${notificationFilter === "all" ? "bg-blue-100" : ""}`} onClick={() => setNotificationFilter("all")}>All</button>
              <button className={`text-xs px-2 py-1 rounded ${notificationFilter === "unread" ? "bg-green-100" : ""}`} onClick={() => setNotificationFilter("unread")}>Unread</button>
              <button className={`text-xs px-2 py-1 rounded ${notificationFilter === "archived" ? "bg-gray-200" : ""}`} onClick={() => setNotificationFilter("archived")}>Archived</button>
            </div>
            <div className="max-h-96 overflow-y-auto p-3">
              {Object.entries(groupedNotifications).map(([type, notes]) => (
                <div key={type} className="mb-4">
                  <div className="font-bold text-xs text-blue-700 mb-2">{type}</div>
                  <ul className="space-y-2">
                    {notes.map((n, idx) => (
                      <li key={idx} className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{n}</span>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {unreadNotifications.includes(n) && (
                            <button className="text-xs px-2 py-1 rounded bg-green-100 text-green-700" onClick={() => markAsRead(n)}>Mark as read</button>
                          )}
                          <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700" onClick={() => archiveNotification(n)}>Archive</button>
                          <button className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700" onClick={() => setNotifications((x) => x.filter((v) => v !== n))}>Snooze</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {notifications.length === 0 && <div className="text-center text-gray-400 py-8">No notifications</div>}
            </div>
          </div>
        )}
      </div>

      {/* profile */}
      <div className="relative shrink-0">
        <button
          className="ml-1"
          aria-label="Profile"
          onClick={() => { setShowProfile((s) => !s); if (!showProfile) setShowDropdown(false); }}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-purple-600 text-xl">👤</span>
        </button>
        {showProfile && (
          <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-2xl z-50 w-72">
            <UserProfileDropdown />
          </div>
        )}
      </div>

        {/* AI modal */}
        <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)} title="AI Assistant">
          <div className="flex flex-col gap-2 h-80" aria-label="AI Assistant Modal">
            <div ref={chatRef} className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2" aria-live="polite">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`mb-2 flex ${msg.sender === "assistant" ? "justify-start" : "justify-end"}`}>
                  <span className={`px-3 py-2 rounded-lg ${msg.sender === "assistant" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="border rounded px-3 h-8 flex-1"
                placeholder="Type your question..."
                disabled={loading}
              />
              <button
                className="px-3 h-8 bg-blue-600 text-white rounded"
                onClick={handleAiSend}
                disabled={loading || !aiInput.trim()}
              >
                Send
              </button>
              <button
                className={`px-3 h-8 rounded ${listening ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={startVoiceInput}
                disabled={loading}
                aria-label="Voice input"
              >
                🎤
              </button>
              <button
                className="px-3 h-8 bg-yellow-200 text-yellow-800 rounded"
                onClick={() => speak(aiMessages[aiMessages.length - 1]?.text || "")}
                disabled={loading}
                aria-label="Speak response"
              >
                🔊
              </button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
