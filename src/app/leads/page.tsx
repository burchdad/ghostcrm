"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { LucidePhone, LucideMessageSquare, LucideMail } from "lucide-react";
import OptOutTable from "./OptOutTable";

const emailTypes = ["Marketing", "Follow-up", "Appointment"];

function getDefaultEmailMessage(type: string, lead: any) {
  switch (type) {
    case "Marketing":
      return `Hi ${lead["Full Name"]},\n\nCheck out our latest offers and promotions!`;
    case "Follow-up":
      return `Hi ${lead["Full Name"]},\n\nJust following up regarding your recent inquiry.`;
    case "Appointment":
      return `Hi ${lead["Full Name"]},\n\nThis is a reminder for your upcoming appointment.`;
    default:
      return `Hi ${lead["Full Name"]},`;
  }
}

export default function Leads() {
  // ...existing state...
  const [selectedOrg, setSelectedOrg] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLead, setEmailLead] = useState<any>(null);
  const [emailType, setEmailType] = useState(emailTypes[0]);
  const [emailMessage, setEmailMessage] = useState("");
  const emailMessageRef = useRef<HTMLTextAreaElement>(null);

  async function handleAction(lead: any, action: "call" | "message" | "email") {
    if (action === "email") {
      setEmailLead(lead);
      setEmailType(emailTypes[0]);
      setEmailMessage(getDefaultEmailMessage(emailTypes[0], lead));
      setShowEmailModal(true);
      return;
    }
    try {
      let payload: any = { leadId: lead.id, action };
      if (action === "message") {
        payload.phone = lead["Phone Number"];
        payload.message = `CRM SMS for ${lead["Full Name"]}`;
      }
      // You can add more logic for "call" if needed
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Action '${action}' sent for lead ${lead["Full Name"]}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function sendEmailAction() {
    if (!emailLead) return;
    let payload = {
      leadId: emailLead.id,
      action: "email",
      email: emailLead["Email Address"],
      message: emailMessage,
      type: emailType
    };
    try {
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Email sent to ${emailLead["Full Name"]}`);
        setShowEmailModal(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }
  const [leads, setLeads] = useState<any[]>([]);
  const [optOutLoading, setOptOutLoading] = useState<string|null>(null);
  async function handleOptOutToggle(lead: any) {
    setOptOutLoading(lead.id);
    try {
      const res = await fetch("/api/leads/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, optOut: !lead.opted_out })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads => leads.map(l => l.id === lead.id ? { ...l, opted_out: !lead.opted_out } : l));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
    setOptOutLoading(null);
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<string>("Created Date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => {
        if (data.records) setLeads(data.records);
        else setError(data.error || "Unknown error");
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      {/* ...existing code... */}
      <OptOutTable />
    </div>
  );
}
