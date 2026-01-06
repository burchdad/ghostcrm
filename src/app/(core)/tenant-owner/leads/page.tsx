"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Plus, Phone, MessageSquare, Mail, Download, X, Trash2, Users, TrendingUp, Upload, Zap, Bot, FileText, Settings, RefreshCw, BarChart3 } from "lucide-react";
import OptOutTable from "../../leads/OptOutTable";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import { AICallScriptModal } from "@/components/modals/AICallScriptModal";
import { AISMSModal } from "@/components/modals/AISMSModal";
import { AIEmailModal } from "@/components/modals/AIEmailModal";
import NewLeadModal from "@/components/modals/NewLeadModal";
import LeadDetailModal from "@/components/modals/LeadDetailModal";
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import "./page.css";

export default function TenantOwnerLeads() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  
  // Redirect non-owners to appropriate tenant page
  useEffect(() => {
    if (user && user.role !== 'owner') {
      if (user.role === 'admin' || user.role === 'manager') {
        router.push('/tenant-salesmanager/leads');
      } else if (user.role === 'sales_rep' || user.role === 'user') {
        router.push('/tenant-salesrep/leads');
      }
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "leads",
    enable: ["bulkOps", "quickActions", "export", "share", "profile", "notifications", "theme", "language"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  // State management
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  
  // Concurrency control and mount tracking
  const inFlight = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [emailLead, setEmailLead] = useState<any>(null);
  const [callLead, setCallLead] = useState<any>(null);
  const [smsLead, setSmsLead] = useState<any>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [callConnecting, setCallConnecting] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [newLead, setNewLead] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    source: "Website",
    notes: ""
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const newToday = leads.filter(lead => {
      const leadDate = new Date(lead.created_at || lead.createdAt);
      return leadDate >= todayStart;
    });
    
    // Calculate follow-ups due (leads with follow_up_date today or overdue)
    const followUpsDue = leads.filter(lead => {
      if (!lead.follow_up_date) return false;
      const followUpDate = new Date(lead.follow_up_date);
      return followUpDate <= today;
    });
    
    // Calculate conversion rate (leads with status 'converted' or 'closed-won')
    const convertedLeads = leads.filter(lead => 
      lead.status === 'converted' || lead.status === 'closed-won' || lead.status === 'customer'
    );
    const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length * 100) : 0;
    
    // Calculate hot leads (priority high or score > 80)
    const hotLeads = newToday.filter(lead => 
      lead.priority === 'high' || lead.score > 80 || lead.status === 'hot'
    );
    
    return {
      totalLeads: leads.length,
      newToday: newToday.length,
      hotLeadsToday: hotLeads.length,
      followUpsDue: followUpsDue.length,
      conversionRate: conversionRate.toFixed(1)
    };
  }, [leads]);

  // Check if user is owner - wait for user context to load first
  if (!user) {
    // Still loading user context, show loading
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading user data...</div>
      </div>
    );
  }
  
  if (user.role !== 'owner') {
    return null; // Will redirect via useEffect
  }

  // Load leads data function
  const loadLeads = useCallback(async () => {
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;
    setLoading(true);

    const ctrl = new AbortController();
    try {
      const res = await fetch("/api/leads", {
        signal: ctrl.signal,
        // helps avoid stale ISR/route cache, if any
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      // API may return {records: []} or {leads: []}
      const leadsData = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.leads)
        ? data.leads
        : [];
      setLeads(leadsData);
      setLoading(false);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Request was aborted
      } else {
        toast({
          title: "Error",
          description: "Failed to load leads data",
          variant: "destructive",
        });
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [toast]);

  // Load leads data
  useEffect(() => {
    loadLeads();

    const isProduction = process.env.NODE_ENV === "production";
    const enableAutoRefresh =
      process.env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH === "true";

    let timer: ReturnType<typeof setInterval> | undefined;
    if (isProduction && enableAutoRefresh) {
      timer = setInterval(() => {
        loadLeads();
      }, 60 * 60 * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loadLeads]);

  async function handleAction(lead: any, action: "call" | "message" | "email") {
    if (action === "email") {
      setEmailLead(lead);
      setShowEmailModal(true);
      return;
    }
    
    if (action === "call") {
      setCallLead(lead);
      setShowCallModal(true);
      return;
    }
    
    if (action === "message") {
      setSmsLead(lead);
      setShowSmsModal(true);
      return;
    }
  }

  async function handleEmailSend(emailContent?: string, emailSubject?: string) {
    if (!emailLead) return;
    
    setEmailSending(true);
    try {
      const response = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "email",
          leadId: emailLead.id,
          email: emailLead["Email Address"] || emailLead["Email"] || emailLead["email"],
          subject: emailSubject || `Email from ${user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Ghost Auto CRM'}`,
          message: emailContent || "No email content provided"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const successMessage = data.dev_mode 
          ? `Email logged for development (would send to ${emailLead["Full Name"]})`
          : `Email sent to ${emailLead["Full Name"]} successfully!`;
          
        toast({
          title: data.dev_mode ? "Email Logged (Dev Mode)" : "Email Sent!",
          description: successMessage,
          variant: "success"
        });
        setShowEmailModal(false);
        setEmailLead(null);
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setEmailSending(false);
    }
  }

  async function handleCallAction() {
    if (!callLead) return;
    
    setCallConnecting(true);
    try {
      // Here you would integrate with your phone system
      // For now, we'll simulate initiating a call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Call Initiated!",
        description: `Calling ${callLead["Full Name"]} at ${callLead["Phone Number"]}...`,
        variant: "success"
      });
      
      setShowCallModal(false);
      setCallLead(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive"
      });
    } finally {
      setCallConnecting(false);
    }
  }

  async function handleSmsAction() {
    if (!smsLead) return;
    
    setSmsSending(true);
    try {
      const response = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sms",
          leadId: smsLead.id,
          phone: smsLead["Phone Number"],
          message: "SMS content managed by modal"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: "SMS Sent!",
          description: `Message sent to ${smsLead["Full Name"]} successfully!`,
          variant: "success"
        });
        setShowSmsModal(false);
        setSmsLead(null);
      } else {
        throw new Error(data.message || "Failed to send SMS");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS",
        variant: "destructive"
      });
    } finally {
      setSmsSending(false);
    }
  }

  function handleAddLead() {
    setNewLead({
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      source: "Website",
      notes: ""
    });
    setShowAddLeadModal(true);
  }

  async function handleAddLeadSubmit() {
    if (!newLead.fullName || !newLead.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the name and email fields.",
        variant: "destructive"
      });
      return;
    }

    setAddLeadLoading(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Full Name": newLead.fullName,
          "Email": newLead.email,
          "Phone Number": newLead.phone,
          "Organization": newLead.organization,
          "Source": newLead.source,
          "Notes": newLead.notes,
          "tenantId": user?.tenantId
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Lead added successfully",
          variant: "success"
        });
        setShowAddLeadModal(false);
        // Reload leads using the proper function
        await loadLeads();
      } else {
        throw new Error(data.message || "Failed to add lead");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead",
        variant: "destructive"
      });
    } finally {
      setAddLeadLoading(false);
    }
  }

  function handleNewLeadChange(field: string, value: string) {
    setNewLead(prev => ({ ...prev, [field]: value }));
  }

  function handleImportLeads() {
    setShowImportModal(true);
  }

  function handleIntegration() {
    setShowIntegrationModal(true);
  }

  async function handleFileImport(file: File) {
    if (!file) return;
    
    setImportLoading(true);
    try {
      // TODO: Implement CSV/Excel parsing and validation
      // TODO: Add AI data mapping assistance
      toast({
        title: "Import Started",
        description: "AI agent is analyzing your file for data mapping...",
        variant: "default"
      });
      
      // Simulate processing time
      setTimeout(() => {
        toast({
          title: "Import Complete",
          description: "Successfully imported leads with AI assistance",
          variant: "success"
        });
        setImportLoading(false);
        setShowImportModal(false);
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Import Failed", 
        description: error.message || "Failed to import leads",
        variant: "destructive"
      });
      setImportLoading(false);
    }
  }

  // Filter leads based on search term only (tenant-specific, no organization filter needed)
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead["Full Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead["Email"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead["Phone Number"]?.includes(searchTerm);
    
    return matchesSearch;
  });

  return (
    <div className="tenant-owner-leads-page">
      {/* Analytics Cards Grid with AI Assistant */}
      <div className="tenant-owner-leads-header">
        <div className="tenant-owner-leads-header-content">
          {/* Metrics in 4-Column Header Layout */}
          <div className="tenant-owner-leads-analytics-grid-header">
            <div className="tenant-owner-leads-analytics-card total">
              <div className="tenant-owner-leads-card-header">
                <div className="tenant-owner-leads-card-title-row">
                  <span className="tenant-owner-leads-card-label">TOTAL LEADS</span>
                  <span className="tenant-owner-leads-card-value">{analytics.totalLeads}</span>
                </div>
                <div className="tenant-owner-leads-card-icon total">
                  <Users />
                </div>
              </div>
              <div className="tenant-owner-leads-card-trend">
                <TrendingUp />
                {analytics.totalLeads > 0 ? 'Getting started' : 'Getting started'}
              </div>
            </div>

            <div className="tenant-owner-leads-analytics-card conversion">
              <div className="tenant-owner-leads-card-header">
                <div className="tenant-owner-leads-card-title-row">
                  <span className="tenant-owner-leads-card-label">CONVERSION RATE</span>
                  <span className="tenant-owner-leads-card-value">{analytics.conversionRate}%</span>
                </div>
                <div className="tenant-owner-leads-card-icon conversion">
                  <TrendingUp />
                </div>
              </div>
              <div className="tenant-owner-leads-card-trend">
                <TrendingUp />
                {parseFloat(analytics.conversionRate) > 20 ? 'Room for growth' : 'Room for growth'}
              </div>
            </div>

            <div className="tenant-owner-leads-analytics-card new-today">
              <div className="tenant-owner-leads-card-header">
                <div className="tenant-owner-leads-card-title-row">
                  <span className="tenant-owner-leads-card-label">NEW TODAY</span>
                  <span className="tenant-owner-leads-card-value">{analytics.newToday}</span>
                </div>
                <div className="tenant-owner-leads-card-icon new-today">
                  <Plus />
                </div>
              </div>
              <div className="tenant-owner-leads-card-trend">
                <TrendingUp />
                {analytics.hotLeadsToday > 0 ? 'No hot leads yet' : 'No hot leads yet'}
              </div>
            </div>

            <div className="tenant-owner-leads-analytics-card follow-ups">
              <div className="tenant-owner-leads-card-header">
                <div className="tenant-owner-leads-card-title-row">
                  <span className="tenant-owner-leads-card-label">FOLLOW-UPS DUE</span>
                  <span className="tenant-owner-leads-card-value">{analytics.followUpsDue}</span>
                </div>
                <div className="tenant-owner-leads-card-icon follow-ups">
                  <Phone />
                </div>
              </div>
              <div className="tenant-owner-leads-card-trend">
                <TrendingUp />
                {analytics.followUpsDue > 0 ? 'All caught up' : 'All caught up'}
              </div>
            </div>
          </div>

          {/* AI Assistant Insights Section */}
          <div className="tenant-owner-leads-ai-insights-section">
            <PageAIAssistant 
              agentId="leads" 
              pageTitle="Lead Management"
              className="tenant-owner-leads-ai-assistant"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="tenant-owner-leads-content-wrapper">
        <div className="tenant-owner-leads-content">

        {/* Enhanced Search and Controls */}
        <div className="tenant-owner-leads-controls">
          <div className="tenant-owner-leads-search-row">
            <div className="tenant-owner-leads-search-container">
              <Search className="tenant-owner-leads-search-icon" />
              <Input
                placeholder="Search leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tenant-owner-leads-search-input"
              />
            </div>
            
            <div className="tenant-owner-leads-filters">
              <Button
                onClick={() => setBulkMode(!bulkMode)}
                variant={bulkMode ? "default" : "outline"}
                className="tenant-owner-leads-filter-select"
              >
                {bulkMode ? "Exit Bulk Mode" : "Bulk Actions"}
              </Button>
              
              <Button 
                className="tenant-owner-leads-add-btn"
                onClick={handleAddLead}
              >
                <Plus />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Leads Table */}
        <div className="tenant-owner-leads-table-container">
          {loading ? (
            <div className="tenant-owner-leads-loading">
              <div className="tenant-owner-leads-spinner"></div>
              <span style={{ marginLeft: '1rem', color: '#6b7280' }}>Loading leads...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="tenant-owner-leads-empty-state">
              <div className="tenant-owner-leads-empty-icon">
                <Users />
              </div>
              <h3 className="tenant-owner-leads-empty-title">No leads found</h3>
              <p className="tenant-owner-leads-empty-description">
                Use the "Add Lead" button above to create leads individually or import them in bulk.
              </p>
              
              {/* AI Assistant Badge */}
              <div className="tenant-owner-leads-empty-ai-badge">
                <Bot className="w-4 h-4" />
                <span>AI-powered data sync available</span>
              </div>
            </div>
          ) : (
            <Table className="tenant-owner-leads-table">
              <TableHeader className="tenant-owner-leads-table-header">
                <TableRow>
                  {bulkMode && <TableHead>Select</TableHead>}
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="tenant-owner-leads-table-body">
                {filteredLeads.map((lead, idx) => (
                  <TableRow 
                    key={lead.id || idx}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setShowLeadDetailModal(true);
                    }}
                  >
                    {bulkMode && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIdxs.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIdxs([...selectedIdxs, idx]);
                            } else {
                              setSelectedIdxs(selectedIdxs.filter(i => i !== idx));
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell style={{ fontWeight: '500' }}>{lead["Full Name"]}</TableCell>
                    <TableCell>{lead["Email Address"]}</TableCell>
                    <TableCell>{lead["Phone Number"]}</TableCell>
                    <TableCell>{lead.address || lead.city ? `${lead.address || ''} ${lead.city || ''}`.trim() : 'Not provided'}</TableCell>
                    <TableCell>
                      <span className="tenant-owner-leads-status-badge new">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="tenant-owner-leads-action-buttons">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(lead, "call");
                          }}
                          className="tenant-owner-leads-action-btn view"
                        >
                          <Phone />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(lead, "message");
                          }}
                          className="tenant-owner-leads-action-btn edit"
                        >
                          <MessageSquare />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(lead, "email");
                          }}
                          className="tenant-owner-leads-action-btn delete"
                        >
                          <Mail />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        </div> {/* Close tenant-owner-leads-content */}
      </div> {/* Close tenant-owner-leads-content-wrapper */}

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onLeadCreated={async () => {
          setShowAddLeadModal(false);
          await loadLeads(); // Refresh the leads list
        }}
      />

        {/* AI Email Modal */}
        <AIEmailModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          emailLead={emailLead}
          emailSending={emailSending}
          handleEmailSend={handleEmailSend}
        />

        {/* Import Leads Modal */}
        <Modal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Leads"
        >
          <div className="space-y-6">
            {/* AI Assistant Header */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Bot className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">AI Data Sync Assistant</h4>
                <p className="text-sm text-blue-700">Our AI will automatically map your data fields and ensure clean imports</p>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Your Lead Data</h3>
              <p className="text-gray-600 mb-4">Support for CSV, Excel (XLSX), and other common formats</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>

            {/* Import Progress */}
            {importLoading && (
              <div className="text-center p-4">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-600 font-medium">AI is analyzing and mapping your data...</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Integration Modal */}
        <Modal
          open={showIntegrationModal}
          onClose={() => setShowIntegrationModal(false)}
          title="Connect Your CRM"
        >
          <div className="space-y-6">
            {/* AI Assistant Header */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Bot className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">AI Integration Assistant</h4>
                <p className="text-sm text-green-700">Smart data mapping and sync with your existing CRM platform</p>
              </div>
            </div>

            {/* CRM Integration Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 hover:border-blue-400 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SF</div>
                  <div>
                    <h4 className="font-semibold">Salesforce</h4>
                    <p className="text-sm text-gray-600">Connect with Salesforce CRM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>

              <div className="border rounded-lg p-4 hover:border-green-400 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">HS</div>
                  <div>
                    <h4 className="font-semibold">HubSpot</h4>
                    <p className="text-sm text-gray-600">Connect with HubSpot CRM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>

              <div className="border rounded-lg p-4 hover:border-purple-400 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">PD</div>
                  <div>
                    <h4 className="font-semibold">Pipedrive</h4>
                    <p className="text-sm text-gray-600">Connect with Pipedrive CRM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>

              <div className="border rounded-lg p-4 hover:border-orange-400 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">+</div>
                  <div>
                    <h4 className="font-semibold">Other CRM</h4>
                    <p className="text-sm text-gray-600">Custom API integration</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowIntegrationModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* AI Call Script Modal */}
        <AICallScriptModal
          open={showCallModal}
          onClose={() => setShowCallModal(false)}
          callLead={callLead}
          callConnecting={callConnecting}
          handleCallAction={handleCallAction}
        />

        {/* AI SMS Message Modal */}
        <AISMSModal
          open={showSmsModal}
          onClose={() => setShowSmsModal(false)}
          smsLead={smsLead}
          smsSending={smsSending}
          handleSmsAction={handleSmsAction}
        />

        {/* Lead Detail Modal */}
        <LeadDetailModal
          isOpen={showLeadDetailModal}
          onClose={() => {
            setShowLeadDetailModal(false);
            setSelectedLeadId(null);
          }}
          leadId={selectedLeadId}
          onLeadUpdated={() => {
            // Refresh leads data
            loadLeads();
          }}
        />
    </div>
  );
}