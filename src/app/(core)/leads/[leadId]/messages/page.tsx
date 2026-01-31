"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { UserCircle2, Mail, MessageSquare, Search } from "lucide-react";
// @ts-ignore
import jsPDF from "jspdf";

const supabase = createClient();

const ACTION_TYPES = ["all", "sms", "email"];
const STATUS_TYPES = ["all", "Delivered", "Failed", "Pending"];

function getChannelIcon(type: string) {
  if (type === "sms") return <MessageSquare className="inline w-4 h-4 mr-1 text-blue-500" />;
  if (type === "email") return <Mail className="inline w-4 h-4 mr-1 text-green-500" />;
  return null;
}

export default function LeadMessagesPage({ params }: { params: { leadId: string } }) {
  // AI Message Summary state
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  async function generateSummary() {
    setSummaryLoading(true);
    // Placeholder: Replace with actual API call to OpenAI or similar
    // For now, just summarize the first 3 messages
    const text = messages.slice(0, 3).map(m => m.content).join(" ");
    setTimeout(() => {
      setSummary(text ? `Summary: ${text.slice(0, 200)}...` : "No messages to summarize.");
      setSummaryLoading(false);
    }, 1200);
  }

  // Move summary generation effect below messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [rep, setRep] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  // Remove unused page/setPage state
  const [pageSize] = useState(10);
  // Rep Chat Interface state
  const [chatFile, setChatFile] = useState<File|null>(null);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  const [chatType, setChatType] = useState("sms");
  const [chatAttachment, setChatAttachment] = useState("");
  const leadId = params.leadId;

  useEffect(() => {
    generateSummary();
    // eslint-disable-next-line
  }, [messages]);

  // Get unique reps and types for dropdowns
  const repOptions = Array.from(new Set(messages.map(m => m.rep_name).filter(Boolean)));
  const typeOptions = Array.from(new Set(messages.map(m => m.email_type).filter(Boolean)));

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      let { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) {
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    }
    fetchMessages();
  }, [leadId]);

  const [resendStatus, setResendStatus] = useState<string>("");

  // MessageCard component
  const MAX_LENGTH = 300;
  function MessageCard({ msg }: { msg: any }) {
    const [expanded, setExpanded] = useState(false);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [resendStatus, setResendStatus] = useState<string>("");
    const [aiSuggestion, setAiSuggestion] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const replyInputRef = useRef<HTMLInputElement>(null);
    const isLong = msg.content && msg.content.length > MAX_LENGTH;

    async function handleResend() {
      setResendStatus("Sending...");
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: msg.lead_id,
          action: msg.action_type,
          message: msg.content,
          phone: msg.phone,
        }),
      });
      setResendStatus(res.ok ? "Sent!" : "Error");
      setTimeout(() => setResendStatus(""), 2000);
    }

    async function handleReply() {
      setSending(true);
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: msg.lead_id,
          action: msg.action_type,
          message: replyText,
        }),
      });
      setSending(false);
      setReplyText("");
      setShowReply(false);
    }

    async function fetchAiSuggestion() {
      setAiLoading(true);
      try {
        const res = await fetch("/api/ai/leadscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: [{ id: msg.lead_id, name: msg.rep_name }], messages: [msg] }),
        });
        const data = await res.json();
        setAiSuggestion(data[0]?.suggestion || "");
        if (replyInputRef.current && data[0]?.suggestion) {
          replyInputRef.current.value = data[0].suggestion;
        }
      } catch {
        setAiSuggestion("");
      }
      setAiLoading(false);
    }

    return (
      <div className="border p-3 rounded bg-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {getChannelIcon(msg.action_type)}
            {msg.action_type?.toUpperCase()} • {new Date(msg.created_at).toLocaleString()}
          </span>
          {msg.status && (
            <span className={`text-xs px-2 py-1 rounded ${msg.status === "Delivered" ? "bg-green-100 text-green-700" : msg.status === "Failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>Status: {msg.status}</span>
          )}
        </div>
        <div className="font-medium mb-1">
          {isLong && !expanded ? (
            <span>
              {msg.content.slice(0, MAX_LENGTH)}...
              <button className="text-blue-500 ml-2 text-xs underline" onClick={() => setExpanded(true)}>Show more</button>
            </span>
          ) : (
            <span>
              {msg.content}
              {isLong && expanded && (
                <button className="text-blue-500 ml-2 text-xs underline" onClick={() => setExpanded(false)}>Show less</button>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          {msg.rep_name && (
            <span className="flex items-center gap-1"><UserCircle2 className="w-4 h-4" />{msg.rep_name}</span>
          )}
          {msg.email_type && (
            <span>Type: {msg.email_type}</span>
          )}
          {msg.attachments && (
            <span className="text-blue-400">Attachments: <a href={msg.attachments} target="_blank" rel="noopener noreferrer">{msg.attachments}</a></span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 text-xs border rounded" onClick={() => setShowReply((v) => !v)}>
            Reply
          </button>
          <button className="px-2 py-1 text-xs border rounded" onClick={handleResend} disabled={!!resendStatus}>
            Resend
          </button>
          {resendStatus && <span className="text-xs ml-2">{resendStatus}</span>}
        </div>
        {showReply && (
          <form
            className="mt-2 flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              handleReply();
            }}
          >
            <input
              ref={replyInputRef}
              className="border rounded px-2 py-1 text-xs flex-1"
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              disabled={sending}
              required
            />
            <button className="px-2 py-1 text-xs border rounded bg-blue-500 text-white" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
            <button
              className="px-2 py-1 text-xs border rounded bg-green-500 text-white"
              type="button"
              disabled={aiLoading}
              onClick={fetchAiSuggestion}
            >
              {aiLoading ? "AI..." : "Suggest"}
            </button>
          </form>
        )}
      </div>
    );
  }

// Removed duplicate misplaced MessageCard logic

  // Filter messages by search term
  const filteredMessages = messages.filter(
    (msg: any) =>
      msg.content?.toLowerCase().includes(search.toLowerCase()) ||
      msg.rep_name?.toLowerCase().includes(search.toLowerCase()) ||
      msg.email_type?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic for Load More
  const [visibleCount, setVisibleCount] = useState(pageSize);
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filter, status, rep, type, search]);

  // CSV Export
  function exportCSV() {
    const headers = ["Date", "Type", "Status", "Rep", "Content"];
    const rows = filteredMessages.map(m => [
      new Date(m.created_at).toLocaleString(),
      m.action_type,
      m.status,
      m.rep_name,
      '"' + (m.content?.replace(/"/g, '""') ?? "") + '"',
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lead_${leadId}_messages.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // PDF Export
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Lead ${leadId} Messages`, 10, 10);
    let y = 20;
    filteredMessages.forEach((m, idx) => {
      doc.text(`Date: ${new Date(m.created_at).toLocaleString()}`, 10, y);
      y += 6;
      doc.text(`Type: ${m.action_type} | Status: ${m.status || ""} | Rep: ${m.rep_name || ""}`, 10, y);
      y += 6;
      doc.text(`Content: ${m.content || ""}`, 10, y);
      y += 10;
      if (y > 270 && idx < filteredMessages.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`lead_${leadId}_messages.pdf`);
  }

  const defaultTemplates = [
    {
      label: "Initial Outreach",
      value: "Hi {{leadName}}, this is {{repName}} from {{dealership}}. Let me know if you have any questions!"
    },
    {
      label: "Follow-Up",
      value: "Just checking in, {{leadName}}. Are you still interested in the vehicle?"
    },
    {
      label: "Appointment Confirmation",
      value: "Hi {{leadName}}, confirming your appointment at {{dealership}} on {{appointmentDate}}. See you soon!"
    }
  ];
  const [messageTemplates, setMessageTemplates] = useState(defaultTemplates);
  const [newTemplateLabel, setNewTemplateLabel] = useState("");
  const [newTemplateValue, setNewTemplateValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");

  const quickActions = [
    {
      label: "Send Follow-Up",
      action: () => setChatText(`Just checking in, {{leadName}}. Are you still interested in the vehicle?`)
    },
    {
      label: "Schedule Appointment",
      action: () => setChatText(`Hi {{leadName}}, would you like to schedule an appointment at {{dealership}}? Let me know your preferred date and time.`)
    },
    {
      label: "Mark as Hot Lead",
      action: () => alert("Lead marked as hot! (MVP: add backend logic later)")
    }
  ];

  return (
    <div>
      {/* AI Message Summary Card */}
      <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 flex items-center justify-between">
        <div>
          <div className="font-semibold text-yellow-900 mb-1">AI Message Summary</div>
          <div className="text-sm text-yellow-800">
            {summaryLoading ? "Generating summary..." : summary}
          </div>
        </div>
        <button
          className="ml-4 px-2 py-1 text-xs rounded bg-yellow-200 text-yellow-900 border"
          onClick={generateSummary}
          disabled={summaryLoading}
        >
          {summaryLoading ? "Please wait" : "Refresh"}
        </button>
      </div>
      {/* Rep Chat Interface: persistent reply box */}
      <form
        className="flex flex-col md:flex-row gap-2 mb-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setChatSending(true);
          setChatStatus("");
          let attachmentUrl = chatAttachment;
          if (chatFile) {
            // Upload file to Supabase Storage
            const filePath = `lead_${leadId}/${Date.now()}_${chatFile.name}`;
            const { data, error } = await supabase.storage.from('attachments').upload(filePath, chatFile);
            if (error) {
              setChatStatus('Error uploading file');
              setChatSending(false);
              return;
            }
            // Get public URL
            const { publicUrl } = supabase.storage.from('attachments').getPublicUrl(filePath).data;
            attachmentUrl = publicUrl;
          }
          const res = await fetch("/api/leads/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leadId,
              action: chatType,
              message: chatText,
              attachment: attachmentUrl || undefined,
            }),
          });
          setChatSending(false);
          setChatText("");
          setChatAttachment("");
          setChatFile(null);
          setChatStatus(res.ok ? "Sent!" : "Error sending");
          setTimeout(() => setChatStatus(""), 2000);
        }}
      >
        <div className="flex gap-2 flex-1">
          <select
            className="border rounded px-2 py-1"
            value={chatType}
            onChange={e => setChatType(e.target.value)}
            disabled={chatSending}
          >
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
          <input
            className="border rounded px-2 py-1 flex-1"
            type="text"
            value={chatText}
            onChange={e => setChatText(e.target.value)}
            placeholder={`Type a ${chatType.toUpperCase()} message...`}
            disabled={chatSending}
            required
          />
          <input
            className="border rounded px-2 py-1 w-48"
            type="text"
            value={chatAttachment}
            onChange={e => setChatAttachment(e.target.value)}
            placeholder="Attachment URL (optional)"
            disabled={chatSending}
          />
          <input
            className="border rounded px-2 py-1 w-48"
            type="file"
            accept="image/*,application/pdf"
            onChange={e => setChatFile(e.target.files?.[0] || null)}
            disabled={chatSending}
          />
        </div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white" type="submit" disabled={chatSending || !chatText}>
          {chatSending ? "Sending..." : "Send"}
        </button>
        {chatStatus && <span className="ml-2 text-xs text-green-600">{chatStatus}</span>}
      </form>
      {/* Quick Actions */}
      <div className="flex gap-2 mb-2">
        {quickActions.map((qa, idx) => (
          <button
            key={qa.label}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
            onClick={qa.action}
            type="button"
          >
            {qa.label}
          </button>
        ))}
      </div>
      {/* Template Management UI */}
      <div className="border rounded p-3 mb-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Manage Message Templates</h3>
        <ul className="mb-2">
          {messageTemplates.map((t, idx) => (
            <li key={idx} className="flex items-center gap-2 mb-1">
              {editIndex === idx ? (
                <>
                  <input
                    className="border rounded px-1 mr-1"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    placeholder="Label"
                  />
                  <input
                    className="border rounded px-1 mr-1 w-1/2"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    placeholder="Template text"
                  />
                  <button className="text-green-600" onClick={() => {
                    const updated = [...messageTemplates];
                    updated[idx] = { label: editLabel, value: editValue };
                    setMessageTemplates(updated);
                    setEditIndex(null);
                  }}>Save</button>
                  <button className="text-gray-500" onClick={() => setEditIndex(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="font-medium">{t.label}:</span>
                  <span className="text-xs text-gray-700">{t.value}</span>
                  <button className="text-blue-600 ml-2" onClick={() => {
                    setEditIndex(idx);
                    setEditLabel(t.label);
                    setEditValue(t.value);
                  }}>Edit</button>
                  <button className="text-red-600 ml-1" onClick={() => {
                    setMessageTemplates(messageTemplates.filter((_, i) => i !== idx));
                  }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2 items-center">
          <input
            className="border rounded px-1"
            value={newTemplateLabel}
            onChange={e => setNewTemplateLabel(e.target.value)}
            placeholder="New label"
          />
          <input
            className="border rounded px-1 w-1/2"
            value={newTemplateValue}
            onChange={e => setNewTemplateValue(e.target.value)}
            placeholder="New template text"
          />
          <button className="text-green-600" onClick={() => {
            if (newTemplateLabel && newTemplateValue) {
              setMessageTemplates([...messageTemplates, { label: newTemplateLabel, value: newTemplateValue }]);
              setNewTemplateLabel("");
              setNewTemplateValue("");
            }
          }}>Add</button>
        </div>
      </div>
      {/* Template Selector (uses managed templates) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Quick Templates:</label>
        <select
          className="border rounded px-2 py-1"
          onChange={e => setChatText(e.target.value)}
          defaultValue=""
        >
          <option value="">Select a template...</option>
          {messageTemplates.map((t, idx) => (
            <option key={t.label + idx} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {/* Filter and Export controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Export buttons */}
        <button className="px-2 py-1 border rounded text-xs bg-gray-100" onClick={exportCSV}>
          Export CSV
        </button>
        <button className="px-2 py-1 border rounded text-xs bg-gray-100" onClick={exportPDF}>
          Export PDF
        </button>
        {/* Filter buttons */}
        {ACTION_TYPES.map((actionType) => (
          <button
            key={actionType}
            className={`border rounded px-2 py-1 text-sm ${filter === actionType ? "bg-blue-100" : ""}`}
            onClick={() => setFilter(actionType)}
          >
            {actionType === "all" ? "All" : actionType.toUpperCase()}
          </button>
        ))}
        <select className="border rounded px-2 py-1 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={rep} onChange={e => setRep(e.target.value)}>
          <option value="all">All Reps</option>
          {repOptions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All Types</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex items-center border rounded px-2 py-1 text-sm">
          <Search className="w-4 h-4 mr-1 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            className="outline-none bg-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Messages list */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-gray-500">No messages found for this lead.</div>
      ) : (
        <>
          <div className="space-y-2">
            {filteredMessages.slice(0, visibleCount).map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
          </div>
          {visibleCount < filteredMessages.length && (
            <div className="text-center py-4">
              <button
                className="px-4 py-2 bg-blue-100 rounded text-blue-700"
                onClick={() => setVisibleCount((prev) => Math.min(prev + pageSize, filteredMessages.length))}
              >Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
