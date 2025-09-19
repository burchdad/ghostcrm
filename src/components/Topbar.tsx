"use client";
// Cleaned up duplicate and misplaced code. Only one set of imports and component definition remains.
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { UserProfileDropdown } from "./UserProfileDropdown";

        const suggestions = ["Dashboard", "Leads", "Deals", "Inventory", "Appointments", "Performance", "Admin"];

        export function Topbar() {
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(["Welcome to GhostCRM!"]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<'all'|'unread'|'archived'>('all');
  // Real-time notifications (polling, replace with Supabase Realtime for prod)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.records) {
          setNotifications(["Welcome to GhostCRM!", `You have ${data.records.length} leads.`]);
          setUnreadNotifications([`You have ${data.records.length} leads.`]);
        }
      } catch {}
    }, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  // Notification actions
  function markAsRead(note: string) {
    setUnreadNotifications(unreadNotifications.filter(n => n !== note));
  }
  function archiveNotification(note: string) {
    setArchivedNotifications([...archivedNotifications, note]);
    setNotifications(notifications.filter(n => n !== note));
  }

  // ...existing code...
  const [leadCount, setLeadCount] = useState<number | null>(null);
  // ...existing code...
  // ...other state declarations...
  // (leadCount and all other states above)

  // Removed duplicate leadCount state declaration

  // Removed duplicate leadCount declaration

  // Customizable widgets (MUST be after leadCount)
  // ...existing code...
  const [widgets, setWidgets] = useState([
    { id: 'kpi', label: 'Leads KPI', content: <span>Loading...</span>, pinned: false },
    { id: 'compliance', label: 'Compliance', content: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">GDPR ✅</span>, pinned: false }
  ]);
  useEffect(() => {
    setWidgets(widgets => {
      return widgets.map(w => w.id === 'kpi'
        ? { ...w, content: <span>{leadCount !== null ? `${leadCount} leads` : 'Loading...'}</span> }
        : w
      );
    });
  }, [leadCount]);
  function pinWidget(id: string) {
    setWidgets(widgets => widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w));
  }

  // Voice input/output for AI Assistant
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  function startVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = language;
      recognition.onresult = (event: any) => {
        setAiInput(event.results[0][0].transcript);
      };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      recognition.onend = () => setListening(false);
    }
  }
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = language;
      window.speechSynthesis.speak(utter);
    }
  }
  // Removed duplicate leadCount declaration
  const [org, setOrg] = useState("All");
  const [userRole, setUserRole] = useState("admin"); // Example: could be dynamic
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [themeMode, setThemeMode] = useState('system');
  const [language, setLanguage] = useState('en');
  // Advanced: Notification grouping/filtering
  const groupedNotifications = notifications.reduce((acc: Record<string, string[]>, n) => {
    const type = n.includes("lead") ? "Leads" : n.includes("Welcome") ? "System" : "Other";
    acc[type] = acc[type] ? [...acc[type], n] : [n];
    return acc;
  }, {});
  // Advanced: Notification filtering
  const filteredNotifications = notificationFilter === 'all'
    ? notifications
    : notificationFilter === 'unread'
      ? unreadNotifications
      : archivedNotifications;
  // Advanced: Org/team switcher UI
  const orgs = ["All", "Org 1", "Org 2", "Org 3"];
  // Advanced: Theme/language switcher UI
  const themes = ["light", "dark", "system", "high-contrast"];
  const languages = ["en", "es", "fr", "de"];
  // Fetch lead count for notifications
  useEffect(() => {
    async function fetchLeadCount() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.records) {
          setLeadCount(data.records.length);
          setNotifications(["Welcome to GhostCRM!", `You have ${data.records.length} leads.`]);
        } else {
          setNotifications(["Welcome to GhostCRM!", "Unable to fetch leads."]);
        }
      } catch (err) {
        setNotifications(["Welcome to GhostCRM!", "Unable to fetch leads."]);
      }
    }
    fetchLeadCount();
    // Simulate online users (replace with realtime logic)
    setOnlineUsers(["Alice", "Bob", "Carol"]);
  }, []);
  // Global search handler
  async function handleGlobalSearch(query: string) {
    setSearchLoading(true);
    // Example: search leads, inventory, deals
    try {
      const [leadsRes, invRes] = await Promise.all([
        fetch(`/api/leads?search=${encodeURIComponent(query)}`),
        fetch(`/api/inventory?search=${encodeURIComponent(query)}`)
      ]);
      const leads = await leadsRes.json();
      const inventory = await invRes.json();
      setSearchResults([
        ...(leads.records || []).map((r: any) => ({ type: "Lead", ...r })),
        ...(inventory.records || []).map((r: any) => ({ type: "Inventory", ...r }))
      ]);
    } catch (err) {
      setSearchResults([]);
    }
    setSearchLoading(false);
  }

  // Role-based quick actions
  const quickActions = userRole === "admin"
    ? [
        { label: "Add Lead", onClick: () => window.location.href = "/leads/new" },
        { label: "Export Data", onClick: () => alert("Exporting data...") },
        { label: "Reset Inventory", onClick: () => alert("Inventory reset!") }
      ]
    : [
        { label: "Schedule Appointment", onClick: () => window.location.href = "/appointments/new" },
        { label: "Contact Support", onClick: () => alert("Contacting support...") }
      ];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // notifications
  const [showProfile, setShowProfile] = useState(false); // profile dropdown
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: "assistant", text: "Hi! How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [aiMessages, aiModalOpen]);

          async function handleAiSend() {
            if (!aiInput.trim()) return;
            const userMessage = { sender: "user", text: aiInput };
  const [inventory, setInventory] = useState([]);
            setAiMessages(prev => [...prev, userMessage]);
  // Fetch inventory from API route
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        setInventory(data.records || []);
      } catch (err) {
        setInventory([]);
      }
    }
    fetchInventory();
  }, []);
            setAiInput("");
            setLoading(true);
            try {
              const response = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [
                  ...aiMessages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
                  { role: "user", content: aiInput }
                ] })
              });
              const data = await response.json();
              if (data.message) {
                setAiMessages(prev => [...prev, { sender: "assistant", text: data.message }]);
              }
            } catch (err) {
              setAiMessages(prev => [...prev, { sender: "assistant", text: "Sorry, something went wrong." }]);
            }
            setLoading(false);
          }

          return (
            <>
              <header className={`p-4 border-b flex flex-col md:flex-row items-center justify-between ${themeMode === 'dark' ? 'bg-gray-900 text-white' : themeMode === 'high-contrast' ? 'bg-black text-yellow-300' : 'bg-white'}`} aria-label="Topbar Navigation">
                <div className="flex items-center gap-4 w-full" role="navigation" aria-label="Main Topbar">
                  {/* Org/team switcher */}
                  <select value={org} onChange={e => setOrg(e.target.value)} className="border rounded px-2 py-1 text-xs" aria-label="Organization Switcher">
                    {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {/* Theme switcher */}
                  <select value={themeMode} onChange={e => setThemeMode(e.target.value)} className="border rounded px-2 py-1 text-xs" aria-label="Theme Switcher">
                    {themes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {/* Language switcher */}
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-2 py-1 text-xs" aria-label="Language Switcher">
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <span className="font-bold text-xl text-gradient bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Ghost Auto CRM</span>
                  {/* Online user presence */}
                  <div className="flex gap-1 items-center" aria-label="Online Users">
                    {onlineUsers.map(u => <span key={u} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{u}</span>)}
                  </div>
                  {/* Customizable widgets */}
                  <div className="flex gap-2" aria-label="Pinned Widgets">
                    {widgets.map(w => (
                      <div key={w.id} className="flex flex-col items-center">
                        <span className="text-xs font-bold">{w.label}</span>
                        <div>{w.content}</div>
                        <button className="text-xs underline" onClick={() => pinWidget(w.id)}>{w.pinned ? 'Unpin' : 'Pin'}</button>
                      </div>
                    ))}
                  </div>
                  {/* Global search */}
                  <div className="flex-1 flex items-center gap-2" aria-label="Global Search">
                    <input
                      id="global-search"
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="border rounded px-3 py-1 w-full max-w-xs"
                      placeholder="Global Search (Ctrl+K)"
                      aria-label="Global Search"
                      onKeyDown={e => { if (e.key === 'Enter') handleGlobalSearch(search); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {searchLoading && <span className="text-xs text-blue-500">Searching...</span>}
                    {showSuggestions && searchResults.length > 0 && (
                      <div className="absolute mt-12 bg-white border rounded shadow-lg z-50 w-64">
                        <ul>
                          {searchResults.map((r, idx) => (
                            <li key={idx} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => setSearch(r.type + ': ' + (r.name || r.model || r.id))}>{r.type}: {r.name || r.model || r.id}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* Quick actions */}
                  <div className="flex gap-2" aria-label="Quick Actions">
                    {quickActions.map(a => <button key={a.label} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={a.onClick}>{a.label}</button>)}
                  </div>
                  {/* Notification bell and dropdown */}
                  <button
                    className="relative"
                    aria-label="Notifications"
                    onClick={() => {
                      setShowDropdown(!showDropdown);
                      if (!showDropdown) setShowProfile(false); // close profile if opening notifications
                    }}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 text-xl">🔔</span>
                    {filteredNotifications.length > 0 && <span className="absolute top-0 right-0 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{filteredNotifications.length}</span>}
                  </button>
                  {showDropdown && (
                    <div className="absolute mt-72 right-0 bg-white border rounded-xl shadow-2xl z-50 w-80 animate-fade-in" role="menu" aria-label="Notifications Dropdown">
                      <button
                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 transition z-50"
                        aria-label="Close notifications"
                        onClick={() => setShowDropdown(false)}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <span className="text-lg font-bold">&times;</span>
                      </button>
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-blue-600">🔔</span>
                          <span className="font-bold text-base">Notifications</span>
                        </div>
                        <button className="text-xs text-red-500 hover:underline" onClick={()=>setNotifications([])}>Clear All</button>
                      </div>
                      <div className="flex gap-2 p-3 border-b bg-gray-50">
                        <button className={`text-xs px-2 py-1 rounded ${notificationFilter==='all'?'bg-blue-100':''}`} onClick={()=>setNotificationFilter('all')}>All</button>
                        <button className={`text-xs px-2 py-1 rounded ${notificationFilter==='unread'?'bg-green-100':''}`} onClick={()=>setNotificationFilter('unread')}>Unread</button>
                        <button className={`text-xs px-2 py-1 rounded ${notificationFilter==='archived'?'bg-gray-200':''}`} onClick={()=>setNotificationFilter('archived')}>Archived</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-3">
                        {Object.entries(groupedNotifications).map(([type, notes]) => (
                          <div key={type} className="mb-4">
                            <div className="font-bold text-xs text-blue-700 mb-2 flex items-center gap-2">
                              {type === 'System' && <span className="text-blue-400">ℹ️</span>}
                              {type === 'Leads' && <span className="text-green-500">👤</span>}
                              {type === 'Other' && <span className="text-gray-400">🔔</span>}
                              {type}
                            </div>
                            <ul className="space-y-2">
                              {notes.map((n, idx) => (
                                <li key={idx} className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center border border-gray-100">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{n}</span>
                                    <span className="text-xs text-gray-400 mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    {unreadNotifications.includes(n) && <button className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition" onClick={()=>markAsRead(n)}>Mark as read</button>}
                                    <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition" onClick={()=>archiveNotification(n)}>Archive</button>
                                    <button className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition" onClick={()=>setNotifications(notifications.filter(x=>x!==n))}>Snooze</button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="text-center text-gray-400 py-8">No notifications</div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Profile dropdown trigger (replace with your avatar/profile button) */}
                  <button
                    className="ml-2"
                    aria-label="Profile"
                    onClick={() => {
                      setShowProfile(!showProfile);
                      if (!showProfile) setShowDropdown(false); // close notifications if opening profile
                    }}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-purple-600 text-xl">👤</span>
                  </button>
                  {showProfile && (
                    <div className="absolute mt-12 right-0 bg-white border rounded-xl shadow-2xl z-50 w-72 animate-fade-in" role="menu" aria-label="Profile Dropdown">
                      <UserProfileDropdown />
                    </div>
                  )}
                </div>
              </header>
              <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)} title="AI Assistant">
                <div className="flex flex-col gap-2 h-80" aria-label="AI Assistant Modal">
                  <div ref={chatRef} className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2" aria-live="polite">
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-3 py-2 rounded-xl text-sm max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{msg.text}</div>
                        {msg.sender === 'assistant' && <button className="ml-2 text-xs text-blue-600" onClick={()=>speak(msg.text)}>🔊</button>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Type your question..."
                      aria-label="AI Assistant Input"
                      onKeyDown={e => { if (e.key === 'Enter') handleAiSend(); }}
                    />
                    <button className="px-4 py-1 bg-blue-500 text-white rounded" onClick={handleAiSend}>Send</button>
                    <button className={`px-2 py-1 rounded ${listening?'bg-green-200':'bg-gray-200'}`} onClick={startVoiceInput} aria-label="Voice Input">🎤</button>
                  </div>
                </div>
              </Modal>
            </>
          );
        }
