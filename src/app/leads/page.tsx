"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { LucidePhone, LucideMessageSquare, LucideMail } from "lucide-react";

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
      {/* Lucide icon test at top of page */}
      <div className="flex items-center gap-2">
        <span>Lucide Test:</span>
        <LucidePhone style={{ width: 32, height: 32, color: "blue" }} />
      </div>
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Filter by name, rep, source..."
          className="w-1/3"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
  <Button variant={sortKey === "Current Stage" ? "ghost" : "outline"} onClick={() => setSortKey("Current Stage")}>Stage</Button>
  <Button variant={sortKey === "Source" ? "ghost" : "outline"} onClick={() => setSortKey("Source")}>Source</Button>
  <Button variant={sortKey === "Lead Priority (AI)" ? "ghost" : "outline"} onClick={() => setSortKey("Lead Priority (AI)")}>Priority</Button>
        <Button variant="ghost" onClick={() => setSortAsc(a => !a)}>{sortAsc ? "↑" : "↓"}</Button>
      </div>
      <Card className="p-4">
        {loading ? (
          <div>Loading leads...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Priority (AI)</TableHead>
                <TableHead>Summary (AI)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads
                .filter(lead => {
                  const search = filter.toLowerCase();
                  return (
                    (lead["Full Name"] || "").toLowerCase().includes(search) ||
                    (lead["Assigned Rep"] ? Array.isArray(lead["Assigned Rep"]) ? lead["Assigned Rep"].join(", ").toLowerCase().includes(search) : String(lead["Assigned Rep"]).toLowerCase().includes(search) : false) ||
                    (lead["Source"] || "").toLowerCase().includes(search)
                  );
                })
                .sort((a, b) => {
                  const aVal = a[sortKey];
                  const bVal = b[sortKey];
                  if (typeof aVal === "string" && typeof bVal === "string") {
                    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                  }
                  return 0;
                })
                .map((lead, index) => (
                  <TableRow key={lead.id || index}>
                    <TableCell>
                      {/* Test: Static image */}
                      <img src="https://placekitten.com/40/40" alt="Test" className="w-8 h-8 rounded-full object-cover mb-1" />
                      {/* Test: Dynamic photo */}
                      {lead["Lead Photo"] && Array.isArray(lead["Lead Photo"]) && lead["Lead Photo"].length > 0 ? (
                        <img src={lead["Lead Photo"][0].url} alt="Lead" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <span className="text-xs">No Photo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{lead["Full Name"]}</TableCell>
                    <TableCell>{lead["Phone Number"]}</TableCell>
                    <TableCell>{lead["Email Address"]}</TableCell>
                    <TableCell>{lead["Source"]}</TableCell>
                    <TableCell>{lead["Current Stage"]}</TableCell>
                    <TableCell>{Array.isArray(lead["Assigned Rep"]) ? lead["Assigned Rep"].join(", ") : lead["Assigned Rep"]}</TableCell>
                    <TableCell>{Array.isArray(lead["Deal"]) ? lead["Deal"].join(", ") : lead["Deal"]}</TableCell>
                    <TableCell>{Array.isArray(lead["Campaign"]) ? lead["Campaign"].join(", ") : lead["Campaign"]}</TableCell>
                    <TableCell>{lead["Created Date"]}</TableCell>
                    <TableCell>{lead["Last Contacted"]}</TableCell>
                    <TableCell>{lead["Notes"]}</TableCell>
                    <TableCell>{Array.isArray(lead["Appointment"]) ? lead["Appointment"].join(", ") : lead["Appointment"]}</TableCell>
                    <TableCell>{lead["Lead Priority (AI)"] && typeof lead["Lead Priority (AI)"] === "object" ? lead["Lead Priority (AI)"].value : lead["Lead Priority (AI)"]}</TableCell>
                    <TableCell>{lead["Lead Summary (AI)"] && typeof lead["Lead Summary (AI)"] === "object" ? lead["Lead Summary (AI)"].value : lead["Lead Summary (AI)"]}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center" style={{ minWidth: 120 }}>
                        <button
                          type="button"
                          aria-label="Call"
                          className="p-2 rounded hover:bg-blue-100 focus:outline-none"
                          onClick={() => handleAction(lead, "call")}
                        >
                          <LucidePhone style={{ width: 24, height: 24, color: "#2563eb" }} />
                        </button>
                        <button
                          type="button"
                          aria-label="Message"
                          className="p-2 rounded hover:bg-green-100 focus:outline-none"
                          onClick={() => handleAction(lead, "message")}
                        >
                          <LucideMessageSquare style={{ width: 24, height: 24, color: "#22c55e" }} />
                        </button>
                        <button
                          type="button"
                          aria-label="Email"
                          className="p-2 rounded hover:bg-purple-100 focus:outline-none"
                          onClick={() => handleAction(lead, "email")}
                        >
                          <LucideMail style={{ width: 24, height: 24, color: "#a21caf" }} />
                        </button>
      {/* Email Modal */}
      {showEmailModal && emailLead && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Send Email to {emailLead["Full Name"]}</h2>
            <label className="block mb-2">Email Type:</label>
            <select
              className="mb-4 p-2 border rounded w-full"
              value={emailType}
              onChange={e => {
                setEmailType(e.target.value);
                setEmailMessage(getDefaultEmailMessage(e.target.value, emailLead));
              }}
            >
              {emailTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label className="block mb-2">Message:</label>
            <textarea
              ref={emailMessageRef}
              className="mb-4 p-2 border rounded w-full h-32"
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
              <Button variant="ghost" onClick={sendEmailAction}>Send Email</Button>
            </div>
          </div>
        </div>
      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
