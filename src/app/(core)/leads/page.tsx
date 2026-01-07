"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { createClient } from '@/utils/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Phone, MessageSquare, Mail, Download, X, Trash2, Brain, TrendingUp, Clock, Target } from "lucide-react";
import OptOutTable from "./OptOutTable";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import NewLeadModal from "@/components/modals/NewLeadModal";
import { useAuth } from "@/context/SupabaseAuthContext";

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
  const supabase = createClient();

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
  const [aiInsights, setAiInsights] = useState<Record<string, any>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});
  const emailMessageRef = useRef<HTMLTextAreaElement>(null);

  async function generateAIInsight(lead: any) {
    if (aiInsights[lead.id] || loadingInsights[lead.id]) return;
    
    setLoadingInsights(prev => ({ ...prev, [lead.id]: true }));
    
    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this lead and provide actionable insights: Name: ${lead["Full Name"]}, Company: ${lead["Company"] || 'Not provided'}, Phone: ${lead["Phone Number"] || 'Not provided'}, Email: ${lead["Email Address"] || 'Not provided'}, Lead Score: ${lead.lead_score || 0}. Provide a brief insight about engagement strategy, priority level, and next best action.`,
          context: 'lead_analysis',
          leadData: lead
        })
      });
      
      const data = await response.json();
      
      if (data.response) {
        // Parse AI response for structured insights
        const insight = {
          priority: lead.lead_score >= 80 ? 'High' : lead.lead_score >= 60 ? 'Medium' : 'Low',
          nextAction: extractNextAction(data.response),
          engagement: extractEngagementStrategy(data.response),
          timeframe: extractTimeframe(data.response),
          summary: data.response.substring(0, 150) + '...'
        };
        
        setAiInsights(prev => ({ ...prev, [lead.id]: insight }));
      }
    } catch (error) {
      console.error('AI insight generation failed:', error);
    } finally {
      setLoadingInsights(prev => ({ ...prev, [lead.id]: false }));
    }
  }
  
  function extractNextAction(aiResponse: string): string {
    const actionKeywords = {
      'call': '📞 Call Now',
      'email': '📧 Send Email', 
      'follow': '🔄 Follow Up',
      'meeting': '🤝 Schedule Meeting',
      'nurture': '🌱 Nurture Lead'
    };
    
    for (const [key, action] of Object.entries(actionKeywords)) {
      if (aiResponse.toLowerCase().includes(key)) {
        return action;
      }
    }
    return '👋 Reach Out';
  }
  
  function extractEngagementStrategy(aiResponse: string): string {
    if (aiResponse.toLowerCase().includes('urgent') || aiResponse.toLowerCase().includes('hot')) return 'Immediate';
    if (aiResponse.toLowerCase().includes('warm') || aiResponse.toLowerCase().includes('interested')) return 'Active';
    if (aiResponse.toLowerCase().includes('cold') || aiResponse.toLowerCase().includes('low')) return 'Nurture';
    return 'Standard';
  }
  
  function extractTimeframe(aiResponse: string): string {
    if (aiResponse.toLowerCase().includes('today') || aiResponse.toLowerCase().includes('now')) return 'Today';
    if (aiResponse.toLowerCase().includes('week')) return 'This Week';
    if (aiResponse.toLowerCase().includes('month')) return 'This Month';
    return 'Soon';
  }

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

      // Bulk delete API call
      try {
        const response = await fetch('/api/leads/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadIds: selectedLeads.map(lead => lead.id) })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Remove deleted leads from state
          const deletedIds = selectedLeads.map(lead => lead.id);
          setLeads(leads => leads.filter(lead => !deletedIds.includes(lead.id)));
          
          toast({
            title: "Success",
            description: `Successfully deleted ${selectedLeads.length} leads.`,
            variant: "success"
          });
          
          setSelectedIdxs([]);
          setBulkMode(false);
        } else {
          toast({
            title: "Error", 
            description: data.error || "Failed to delete leads",
            variant: "destructive"
          });
        }
      } catch (deleteError) {
        toast({
          title: "Error",
          description: "Failed to delete leads",
          variant: "destructive"
        });
      }
      setBulkLoading(false);

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
      
      const res = await fetch("/api/leads");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch leads: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.records) {
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
    <div className="space-y-6 min-h-full max-w-full px-2">
      <Card className="p-4 sm:p-6 mx-auto max-w-[98%]">
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

        <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full">
          <div className="relative flex-1 max-w-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('general.search_leads_placeholder', 'common')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 w-full"
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
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
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
                  <TableHead className="hidden xl:table-cell min-w-[200px]">🤖 AI Insights</TableHead>
                  <TableHead className="hidden md:table-cell">{t('general.created', 'common')}</TableHead>
                  <TableHead className="min-w-[140px]">{t('general.actions', 'common')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No leads found. {filter ? t('general.try_adjusting_search', 'common') : t('general.create_first_lead', 'common')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLeads.map((lead, idx) => {
                    const insight = aiInsights[lead.id];
                    const isLoadingInsight = loadingInsights[lead.id];
                    
                    return (
                      <TableRow key={lead.id} className="group hover:bg-gray-50">
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
                        <TableCell className="hidden xl:table-cell">
                          {!insight && !isLoadingInsight ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateAIInsight(lead)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1"
                            >
                              <Brain className="h-3 w-3" />
                              Get AI Insight
                            </Button>
                          ) : isLoadingInsight ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              Analyzing...
                            </div>
                          ) : insight ? (
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-blue-600" />
                                <span className={`font-medium ${
                                  insight.priority === 'High' ? 'text-red-600' :
                                  insight.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {insight.priority} Priority
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <TrendingUp className="h-3 w-3" />
                                <span>{insight.nextAction}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{insight.timeframe}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateAIInsight(lead)}
                                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                              >
                                Refresh
                              </Button>
                            </div>
                          ) : null}
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
                    );
                  })
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
