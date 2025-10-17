"use client";

import { useEffect, useState, useRef } from "react";
import useRibbonPage from "@/components/ribbon/useRibbonPage";
import { createClient } from '@supabase/supabase-js';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Phone, MessageSquare, Mail } from "lucide-react";
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
  useRibbonPage({
    context: "leads",
    enable: ["bulkOps", "quickActions", "export", "share"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

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
    
    if (action === "call") {
      // For call action, we'll just show a notification since we can't actually make calls from web
      alert(`Calling ${lead["Full Name"]} at ${lead["Phone Number"]}...\n\nThis would normally initiate a call through your phone system.`);
      return;
    }
    
    try {
      let payload: any = { leadId: lead.id };
      if (action === "message") {
        payload.action = "sms"; // API expects 'sms' not 'message'
        payload.phone = lead["Phone Number"];
        payload.message = `Hello ${lead["Full Name"]}, this is a message from Ghost Auto CRM regarding your vehicle inquiry. Please let us know if you have any questions!`;
      }
      
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`${action === "message" ? "SMS" : action} sent to ${lead["Full Name"]} successfully!`);
      } else {
        alert(`Error: ${data.error || "Failed to send message"}`);
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
      message: emailMessage
    };
    try {
      const res = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`${emailType} email sent to ${emailLead["Full Name"]} successfully!`);
        setShowEmailModal(false);
      } else {
        alert(`Error: ${data.error || "Failed to send email"}`);
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
        body: JSON.stringify({ lead_id: lead.id, opt_out: !lead.opted_out })
      });
      const data = await res.json();
      if (data.ok || res.ok) {
        // Update the lead in state and show success message
        setLeads(leads => leads.map(l => l.id === lead.id ? { ...l, opted_out: !lead.opted_out } : l));
        alert(`Lead ${!lead.opted_out ? 'opted out' : 'opted back in'} successfully`);
      } else {
        alert(`Error: ${data.error || 'Failed to update opt-out status'}`);
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

  const filteredLeads = leads.filter(lead => {
    // Only show opted-in leads in the main table
    if (lead.opted_out) return false;
    
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      lead["Full Name"]?.toLowerCase().includes(searchTerm) ||
      lead["Phone Number"]?.toLowerCase().includes(searchTerm) ||
      lead["Email Address"]?.toLowerCase().includes(searchTerm) ||
      lead["Company"]?.toLowerCase().includes(searchTerm)
    );
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortKey] || "";
    const bVal = b[sortKey] || "";
    if (sortAsc) {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => setBulkMode(!bulkMode)}>
              {bulkMode ? "Exit Bulk Mode" : "Bulk Operations"}
            </Button>
            <Button onClick={() => window.location.href = "/leads/create"}>
              Add New Lead
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search leads by name, phone, email, or company..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1"
          />
          <select 
            value={sortKey} 
            onChange={(e) => setSortKey(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="Full Name">Name</option>
            <option value="Created Date">Created Date</option>
            <option value="Phone Number">Phone</option>
            <option value="Email Address">Email</option>
          </select>
          <Button 
            variant="outline" 
            onClick={() => setSortAsc(!sortAsc)}
          >
            {sortAsc ? "↑" : "↓"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading leads...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">Error: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
              <TableRow>
                {bulkMode && <TableHead>Select</TableHead>}
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={bulkMode ? 8 : 7} className="text-center py-8 text-gray-500">
                    No leads found. {filter ? "Try adjusting your search." : "Create your first lead to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                sortedLeads.map((lead, idx) => (
                  <TableRow key={lead.id}>
                    {bulkMode && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIdxs.includes(idx)}
                          onChange={() => {
                            if (selectedIdxs.includes(idx)) {
                              setSelectedIdxs(selectedIdxs.filter(i => i !== idx));
                            } else {
                              setSelectedIdxs([...selectedIdxs, idx]);
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {lead["Full Name"]}
                    </TableCell>
                    <TableCell>{lead["Phone Number"] || "-"}</TableCell>
                    <TableCell>{lead["Email Address"] || "-"}</TableCell>
                    <TableCell>{lead["Company"] || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        lead.lead_score >= 80 ? "bg-green-100 text-green-600" :
                        lead.lead_score >= 60 ? "bg-yellow-100 text-yellow-600" :
                        lead.lead_score >= 40 ? "bg-orange-100 text-orange-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        Score: {lead.lead_score || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead["Created Date"] ? new Date(lead["Created Date"]).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          onClick={() => handleAction(lead, "call")}
                          disabled={!lead["Phone Number"]}
                          title="Call Lead"
                          className="flex items-center gap-1 text-xs px-2 py-1 min-w-fit"
                        >
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>Call</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAction(lead, "message")}
                          disabled={!lead["Phone Number"]}
                          title="Send SMS"
                          className="flex items-center gap-1 text-xs px-2 py-1 min-w-fit"
                        >
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <span>SMS</span>
                        </Button>
                        <Button
                          variant="outline" 
                          onClick={() => handleAction(lead, "email")}
                          disabled={!lead["Email Address"]}
                          title="Send Email"
                          className="flex items-center gap-1 text-xs px-2 py-1 min-w-fit"
                        >
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span>Email</span>
                        </Button>
                        <Button
                          variant={lead.opted_out ? "outline" : "ghost"}
                          onClick={() => handleOptOutToggle(lead)}
                          disabled={optOutLoading === lead.id}
                          className={lead.opted_out ? "text-green-600" : "text-red-600"}
                        >
                          {optOutLoading === lead.id ? "..." : lead.opted_out ? "Opt In" : "Opt Out"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        )}

        {bulkMode && selectedIdxs.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="mb-2">{selectedIdxs.length} leads selected</p>
            <div className="flex gap-2">
              <Button variant="outline">Bulk Email</Button>
              <Button variant="outline">Bulk SMS</Button>
              <Button variant="ghost" className="text-red-600">Bulk Delete</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Email Modal */}
      {showEmailModal && emailLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Email to {emailLead["Full Name"]}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Type</label>
                <select
                  value={emailType}
                  onChange={(e) => {
                    setEmailType(e.target.value);
                    setEmailMessage(getDefaultEmailMessage(e.target.value, emailLead));
                  }}
                  className="w-full border rounded px-2 py-1"
                >
                  {emailTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  ref={emailMessageRef}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </Button>
                <Button onClick={sendEmailAction}>
                  Send Email
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Opted-Out Leads Section */}
      <OptOutTable optedOutLeads={leads.filter(lead => lead.opted_out)} />
    </div>
  );
}
