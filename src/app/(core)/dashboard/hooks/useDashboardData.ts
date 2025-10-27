import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Centralized dashboard data fetching, subscriptions, and AI logic
export function useDashboardData() {
  // Example: state for messages, audit log, AI alerts, etc.
  const [messages, setMessages] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [aiAlerts, setAiAlerts] = useState<any[]>([]);
  // ...other state...

  useEffect(() => {
    async function fetchMessages(limit = 10) {
      const res = await fetch(`/api/messages?limit=${limit}`, { cache: "no-store" });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : (data.records ?? []));
    }

    async function fetchAudit() {
      const res = await fetch("/api/auditlog", { cache: "no-store" });
      const data = await res.json();
      setAuditLog(Array.isArray(data) ? data : (data.records ?? []));
    }

    async function fetchAlerts() {
      const res = await fetch("/api/ai/alerts?user_id=demo", { cache: "no-store" });
      const data = await res.json();
      setAiAlerts(data.alerts ?? []);
    }

    fetchMessages();
    fetchAudit();
    fetchAlerts();

    // Supabase Realtime subscription for messages
    const supa = createClient();
    const channel = supa
      .channel("messages-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    auditLog,
    aiAlerts,
    // ...other state/handlers...
  };
}
