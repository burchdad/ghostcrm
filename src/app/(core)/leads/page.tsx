"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { createClient } from '@supabase/supabase-js';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Phone, MessageSquare, Mail, Download, X, Trash2 } from "lucide-react";
import OptOutTable from "./OptOutTable";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import NewLeadModal from "@/components/modals/NewLeadModal";
import { useAuth } from "@/context/AuthContext";

const emailTypes = ["Marketing", "Follow-up", "Appointment"];

// Helper function to get tenant-aware route based on user role
function getTenantRoute(user: any, basePath: string): string {
  if (!user || !user.role) return basePath;
  
  // Map user roles to their tenant directories
  const roleMapping: Record<string, string> = {
    'owner': 'tenant-owner',
    'admin': 'tenant-owner', // Tenant admin has same access as owner except billing/creation
    'manager': 'tenant-salesmanager',
    'sales_rep': 'tenant-salesrep',
    'user': 'tenant-salesrep' // Default users to sales rep level
  };
  
  const tenantDir = roleMapping[user.role] || 'tenant-salesrep';
  return `/${tenantDir}${basePath}`;
}

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
  const { toast } = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  
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
  const [emailSending, setEmailSending] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
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
      toast({
        title: "Call Initiated",
        description: `Calling ${lead["Full Name"]} at ${lead["Phone Number"]}...`,
        variant: "info"
      });
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
        toast({
          title: "Success!",
          description: `${action === "message" ? "SMS" : action} sent to ${lead["Full Name"]} successfully!`,
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Error: ${err}`,
        variant: "destructive"
      });
    }
  }

  async function sendEmailAction() {
    if (!emailLead) return;
    
    setEmailSending(true);

    if (emailLead.bulk) {
      // Handle bulk email
      const leads = emailLead.leads;
      const totalCount = leads.length;
      let successCount = 0;
      let errorCount = 0;

      toast({
        title: "Sending Bulk Emails",
        description: `Sending ${totalCount} emails...`,
        variant: "default"
      });

      for (const lead of leads) {
        const payload = {
          leadId: lead.id,
          action: "email",
          email: lead["Email Address"], 
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
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      // Show final result
      if (successCount === totalCount) {
        toast({
          title: "Bulk Email Completed!",
          description: `Successfully sent ${successCount} emails.`,
          variant: "success"
        });
      } else if (successCount > 0) {
        toast({
          title: "Bulk Email Partially Completed",
          description: `Sent ${successCount} emails successfully. ${errorCount} failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Bulk Email Failed",
          description: "All email sending attempts failed.",
          variant: "destructive"
        });
      }

      // Clear bulk selection
      setSelectedIdxs([]);
      setBulkMode(false);
      setShowEmailModal(false);
      setEmailSending(false);
      return;
    }

    // Handle single email (existing logic)
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
        toast({
          title: "Email Sent!",
          description: `${emailType} email sent to ${emailLead["Full Name"]} successfully!`,
          variant: "success"
        });
        setShowEmailModal(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send email",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error", 
        description: `Error: ${err}`,
        variant: "destructive"
      });
    }
    setEmailSending(false);
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
        toast({
          title: "Success!",
          description: `Lead ${!lead.opted_out ? 'opted out' : 'opted back in'} successfully`,
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to update opt-out status',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Error: ${err}`,
        variant: "destructive"
      });
    }
    setOptOutLoading(null);
  }

  // Bulk action functions
  const handleBulkEmail = async () => {
    if (bulkLoading) return;
    
    const selectedLeads = selectedIdxs.map(idx => sortedLeads[idx]);
    const leadsWithEmail = selectedLeads.filter(lead => lead["Email Address"]);
    
    if (leadsWithEmail.length === 0) {
      toast({
        title: "No Email Addresses",
        description: "None of the selected leads have email addresses.",
        variant: "destructive"
      });
      return;
    }

    if (leadsWithEmail.length < selectedLeads.length) {
      const message = `${selectedLeads.length - leadsWithEmail.length} leads don't have email addresses and will be skipped.`;
      toast({
        title: "Warning",
        description: message,
        variant: "default"
      });
    }

    // Open email modal for bulk email
    setEmailLead({ 
      "Full Name": `${leadsWithEmail.length} Selected Leads`,
      "Email Address": leadsWithEmail.map(l => l["Email Address"]).join(", "),
      bulk: true,
      leads: leadsWithEmail
    });
    setEmailType(emailTypes[0]);
    setEmailMessage(getDefaultEmailMessage(emailTypes[0], { "Full Name": "valued customer" }));
    setShowEmailModal(true);
  };

  const handleBulkSMS = async () => {
    if (bulkLoading) return;
    setBulkLoading(true);
    
    const selectedLeads = selectedIdxs.map(idx => sortedLeads[idx]);
    const leadsWithPhone = selectedLeads.filter(lead => lead["Phone Number"]);
    
    if (leadsWithPhone.length === 0) {
      toast({
        title: "No Phone Numbers",
        description: "None of the selected leads have phone numbers.",
        variant: "destructive"
      });
      setBulkLoading(false);
      return;
    }

    if (leadsWithPhone.length < selectedLeads.length) {
      const message = `${selectedLeads.length - leadsWithPhone.length} leads don't have phone numbers and will be skipped.`;
      toast({
        title: "Warning", 
        description: message,
        variant: "default"
      });
    }

    // Simulate SMS sending process
    toast({
      title: "Sending Bulk SMS",
      description: `Sending SMS to ${leadsWithPhone.length} leads...`,
      variant: "default"
    });

    setTimeout(() => {
      toast({
        title: "Bulk SMS",
        description: `Would send SMS to ${leadsWithPhone.length} leads. SMS functionality coming soon!`,
        variant: "default"
      });
      setBulkLoading(false);
    }, 1500);
  };

  const handleBulkDelete = async () => {
    if (bulkLoading) return;
    
    const selectedLeads = selectedIdxs.map(idx => sortedLeads[idx]);
    
    if (selectedLeads.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedLeads.length} lead${selectedLeads.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBulkLoading(true);

    try {
      toast({
        title: "Deleting Leads",
        description: `Deleting ${selectedLeads.length} leads...`,
        variant: "default"
      });

      // TODO: Implement actual bulk delete API call
      // For now, just show success message after delay
      setTimeout(() => {
        toast({
          title: "Bulk Delete",
          description: `Successfully deleted ${selectedLeads.length} leads. (Demo mode - no actual deletion performed)`,
          variant: "success"
        });
        setSelectedIdxs([]);
        setBulkMode(false);
        setBulkLoading(false);
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leads. Please try again.",
        variant: "destructive"
      });
      setBulkLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<string>("Created Date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const retryLoadLeads = async () => {
    setRetryCount(prev => prev + 1);
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/leads");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch leads: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.records) {
        setLeads(data.records);
        setRetryCount(0);
        // No need to show success notification for basic page load
      } else {
        throw new Error(data.error || "No data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to Load Leads",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [FRONTEND] Loading leads...');
      const res = await fetch("/api/leads");
      console.log('📊 [FRONTEND] Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch leads: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('📦 [FRONTEND] API response:', data);
      
      if (data.records) {
        console.log('✅ [FRONTEND] Setting leads with', data.records.length, 'records');
        console.log('📋 [FRONTEND] Sample lead:', data.records[0]);
        setLeads(data.records);
        // No need to show success notification for basic page load
      } else {
        console.warn('⚠️ [FRONTEND] No data.records in response');
        throw new Error(data.error || "No data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to Load Leads",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    // Only show opted-in leads in the main table (if opted_out field exists)
    if (lead.opted_out === true) return false;
    
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      lead["Full Name"]?.toLowerCase().includes(searchTerm) ||
      lead["Phone Number"]?.toLowerCase().includes(searchTerm) ||
      lead["Email Address"]?.toLowerCase().includes(searchTerm) ||
      lead["Company"]?.toLowerCase().includes(searchTerm)
    );
  });

  console.log('🔍 [FRONTEND] Debug filter chain:');
  console.log('  - Total leads in state:', leads.length);
  console.log('  - After filtering (no opted_out):', filteredLeads.length);
  console.log('  - Current filter:', filter || 'none');
  
  if (leads.length > 0) {
    console.log('📋 [FRONTEND] Sample lead from state:', leads[0]);
    console.log('  - opted_out value:', leads[0].opted_out);
  }

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
    <div className="space-y-6 min-h-full">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">{t('leads.title', 'features')} {t('general.management', 'common')}</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setBulkMode(!bulkMode)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>{bulkMode ? t('general.exit_bulk_mode', 'common') : t('general.bulk_operations', 'common')}</span>
            </Button>
            <Button 
              onClick={() => setShowNewLeadModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('leads.new_lead', 'features')}</span>
              <span className="sm:hidden">{t('leads.new_lead', 'features')}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('general.search_leads_placeholder', 'common')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortKey} onValueChange={setSortKey}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full Name">{t('general.name', 'common')}</SelectItem>
                <SelectItem value="Created Date">{t('general.created_date', 'common')}</SelectItem>
                <SelectItem value="Phone Number">{t('contacts.phone_number', 'features')}</SelectItem>
                <SelectItem value="Email Address">{t('contacts.email_address', 'features')}</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1"
            >
              <span className="text-xs">{sortAsc ? "↑" : "↓"}</span>
              <span className="hidden sm:inline text-xs">{sortAsc ? t('general.asc', 'common') : t('general.desc', 'common')}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">{t('general.loading_leads', 'common')}</p>
              {retryCount > 0 && (
                <p className="text-xs text-gray-500">Retry attempt: {retryCount}</p>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <h3 className="font-semibold mb-2">Failed to Load Leads</h3>
              <p className="text-sm">{error}</p>
              {retryCount > 0 && (
                <p className="text-xs mt-1 text-gray-500">Retry attempt: {retryCount}</p>
              )}
            </div>
            <Button 
              onClick={retryLoadLeads}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        ) : filteredLeads.length === 0 && !filter ? (
          // Show empty state component when no leads exist
          <EmptyStateComponent 
            type="leads"
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {bulkMode && (
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedIdxs.length === sortedLeads.length && sortedLeads.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIdxs(sortedLeads.map((_, idx) => idx));
                          } else {
                            setSelectedIdxs([]);
                          }
                        }}
                        className="rounded border-gray-300"
                        title={selectedIdxs.length === sortedLeads.length ? "Deselect All" : "Select All"}
                      />
                    </TableHead>
                  )}
                  <TableHead className="min-w-[150px]">{t('general.name', 'common')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('contacts.phone_number', 'features')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('contacts.email_address', 'features')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('contacts.company', 'features')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('general.status', 'common')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('general.created', 'common')}</TableHead>
                  <TableHead className="min-w-[120px]">{t('general.actions', 'common')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No leads found. {filter ? t('general.try_adjusting_search', 'common') : t('general.create_first_lead', 'common')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLeads.map((lead, idx) => (
                    <TableRow key={lead.id} className="group">
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
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{lead["Full Name"]}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {lead["Phone Number"] && (
                              <div>{lead["Phone Number"]}</div>
                            )}
                            {lead["Email Address"] && (
                              <div className="truncate max-w-[150px]">{lead["Email Address"]}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{lead["Phone Number"] || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[200px]">{lead["Email Address"] || "-"}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{lead["Company"] || "-"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.lead_score >= 80 ? "bg-green-100 text-green-700" :
                          lead.lead_score >= 60 ? "bg-yellow-100 text-yellow-700" :
                          lead.lead_score >= 40 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {lead.lead_score || 0}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead["Created Date"] ? new Date(lead["Created Date"]).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="outline"
                            onClick={() => handleAction(lead, "call")}
                            disabled={!lead["Phone Number"]}
                            title="Call Lead"
                            className="flex items-center gap-1 text-xs px-2 py-1"
                          >
                            <Phone className="h-3 w-3" />
                            <span className="hidden xl:inline">{t('leads.call', 'features')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleAction(lead, "message")}
                            disabled={!lead["Phone Number"]}
                            title="Send SMS"
                            className="flex items-center gap-1 text-xs px-2 py-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span className="hidden xl:inline">{t('general.sms', 'common')}</span>
                          </Button>
                          <Button
                            variant="outline" 
                            onClick={() => handleAction(lead, "email")}
                            disabled={!lead["Email Address"]}
                            title="Send Email"
                            className="flex items-center gap-1 text-xs px-2 py-1"
                          >
                            <Mail className="h-3 w-3" />
                            <span className="hidden xl:inline">{t('general.email', 'common')}</span>
                          </Button>
                          <Button
                            variant={lead.opted_out ? "outline" : "ghost"}
                            onClick={() => handleOptOutToggle(lead)}
                            disabled={optOutLoading === lead.id}
                            className={`text-xs px-2 py-1 ${lead.opted_out ? "text-green-600" : "text-red-600"}`}
                            title={lead.opted_out ? "Opt back in" : "Opt out"}
                          >
                            {optOutLoading === lead.id ? "..." : lead.opted_out ? "✓" : "✕"}
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
          <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-sm font-medium text-blue-700">
                {selectedIdxs.length} of {sortedLeads.length} lead{selectedIdxs.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleBulkEmail()}
                  className="flex items-center gap-2 text-sm"
                  disabled={bulkLoading || emailSending}
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </Button>
                <Button
                  onClick={() => handleBulkSMS()}
                  className="flex items-center gap-2 text-sm"
                  variant="outline"
                  disabled={bulkLoading}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{bulkLoading ? "Sending..." : "Send SMS"}</span>
                </Button>
                <Button
                  onClick={() => handleBulkDelete()}
                  className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                  variant="outline"
                  disabled={bulkLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{bulkLoading ? "Deleting..." : "Delete"}</span>
                </Button>
                <Button
                  onClick={() => {
                    setSelectedIdxs([]);
                  }}
                  variant="ghost"
                  className="text-xs"
                  disabled={bulkLoading}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {/* Email Modal */}
      <Modal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title={`Send Email to ${emailLead?.["Full Name"]}`}
      >
        <div className="space-y-6 p-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailType" className="block text-sm font-medium mb-2">Email Type</Label>
              <Select
                value={emailType}
                onValueChange={(value) => {
                  setEmailType(value);
                  if (emailLead) {
                    setEmailMessage(getDefaultEmailMessage(value, emailLead));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="emailMessage" className="block text-sm font-medium mb-2">Message</Label>
              <Textarea
                id="emailMessage"
                ref={emailMessageRef}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                placeholder="Enter your email message..."
                className="w-full"
              />
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Email will be sent to:</p>
              <p>{emailLead?.["Email Address"]}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button onClick={sendEmailAction} disabled={!emailMessage.trim() || emailSending}>
              <Mail className="h-4 w-4 mr-2" />
              {emailSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        onLeadCreated={async () => {
          setShowNewLeadModal(false);
          await loadLeads(); // Refresh the leads list
        }}
      />

      {/* Opted-Out Leads Section */}
      <OptOutTable optedOutLeads={leads.filter(lead => lead.opted_out)} />
    </div>
  );
}
