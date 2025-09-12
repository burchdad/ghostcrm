
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { UserCircle2, Mail, MessageSquare, Search } from "lucide-react";
// @ts-ignore
import jsPDF from "jspdf";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACTION_TYPES = ["all", "sms", "email"];
const STATUS_TYPES = ["all", "Delivered", "Failed", "Pending"];

function getChannelIcon(type: string) {
  if (type === "sms") return <MessageSquare className="inline w-4 h-4 mr-1 text-blue-500" />;
  if (type === "email") return <Mail className="inline w-4 h-4 mr-1 text-green-500" />;
  return null;
}

export default function LeadMessagesPage({ params }: { params: { leadId: string } }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [rep, setRep] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  // Remove unused page/setPage state
  const [pageSize] = useState(10);
  const leadId = params.leadId;

  // Get unique reps and types for dropdowns
  const repOptions = Array.from(new Set(messages.map(m => m.rep_name).filter(Boolean)));
  const typeOptions = Array.from(new Set(messages.map(m => m.email_type).filter(Boolean)));

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      let query = supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("action_type", filter);
      if (status !== "all") query = query.eq("status", status);
      if (rep !== "all") query = query.eq("rep_name", rep);
      if (type !== "all") query = query.eq("email_type", type);
      const { data, error } = await query;
      if (!error && data) setMessages(data);
      setLoading(false);
    }
    fetchMessages();
  }, [leadId, filter, status, rep, type, search]);

function MessageCard({ msg }: { msg: any }) {
  const [expanded, setExpanded] = React.useState(false);
  const MAX_LENGTH = 180;
  const isLong = msg.content && msg.content.length > MAX_LENGTH;
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState("");

  async function handleReply() {
    setSending(true);
    // Example: POST to /api/leads/action (customize as needed)
    const res = await fetch("/api/leads/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: msg.lead_id,
        action: msg.action_type,
        message: replyText,
        phone: msg.phone,
      }),
    });
    setSending(false);
    setShowReply(false);
    setReplyText("");
  }

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
        </form>
      )}
    </div>
  );
  }

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Export buttons */}
        <button className="px-2 py-1 border rounded text-xs bg-gray-100" onClick={exportCSV}>
          Export CSV
        </button>
        <button className="px-2 py-1 border rounded text-xs bg-gray-100" onClick={exportPDF}>
          Export PDF
        </button>
        {/* ...existing code... */}
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
      {/* ...existing code... */}
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
