"use client";

import { useEffect, useState, useRef } from "react";
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
import { Search, Plus, Phone, MessageSquare, Mail, Download, X, Trash2, Target, Users, TrendingUp } from "lucide-react";
import OptOutTable from "../../leads/OptOutTable";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";

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

export default function TenantSalesRepLeads() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  
  // Redirect non-sales reps to appropriate tenant page
  useEffect(() => {
    if (user && !['sales_rep', 'user'].includes(user.role)) {
      if (user.role === 'owner') {
        router.push('/tenant-owner/leads');
      } else if (['admin', 'manager'].includes(user.role)) {
        router.push('/tenant-salesmanager/leads');
      }
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "leads",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing", "bulkOps"] // Limited permissions for sales reps
  });

  // State management
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLead, setEmailLead] = useState<any>(null);
  const [emailType, setEmailType] = useState(emailTypes[0]);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const emailMessageRef = useRef<HTMLTextAreaElement>(null);

  // Check if user is sales rep
  if (user && !['sales_rep', 'user'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // Load leads data (filtered for current user)
  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const response = await fetch('/api/leads?assignedTo=' + user?.id);
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error('Error loading leads:', error);
        toast({
          title: "Error",
          description: "Failed to load leads data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      loadLeads();
    }
  }, [toast, user?.id]);

  async function handleAction(lead: any, action: "call" | "message" | "email") {
    if (action === "email") {
      setEmailLead(lead);
      setEmailType(emailTypes[0]);
      setEmailMessage(getDefaultEmailMessage(emailTypes[0], lead));
      setShowEmailModal(true);
      return;
    }
    
    if (action === "call") {
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
        payload.action = "sms";
        payload.phone = lead["Phone Number"];
        payload.message = `Hello ${lead["Full Name"]}, this is ${user?.email || 'your sales representative'} from ${user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Ghost Auto CRM'} regarding your vehicle inquiry. Please let us know if you have any questions!`;
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
        throw new Error(data.message || `Failed to ${action}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} lead`,
        variant: "destructive"
      });
    }
  }

  async function handleEmailSend() {
    if (!emailLead || !emailMessage.trim()) return;
    
    setEmailSending(true);
    try {
      const response = await fetch("/api/leads/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "email",
          leadId: emailLead.id,
          email: emailLead.Email,
          subject: `${emailType} from ${user?.email || 'Sales Representative'} at ${user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Ghost Auto CRM'}`,
          message: emailMessage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Email Sent!",
          description: `Email sent to ${emailLead["Full Name"]} successfully!`,
          variant: "success"
        });
        setShowEmailModal(false);
        setEmailLead(null);
        setEmailMessage("");
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

  function handleEmailTypeChange(newType: string) {
    setEmailType(newType);
    if (emailLead) {
      setEmailMessage(getDefaultEmailMessage(newType, emailLead));
    }
  }

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead["Full Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead["Email"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead["Phone Number"]?.includes(searchTerm);
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500 mr-3 drop-shadow-lg" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Tenant'} - My Leads
                </h1>
                <p className="text-sm text-gray-600">Sales Representative Dashboard - Personal Leads</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm font-semibold">{filteredLeads.length} My Leads</span>
              </div>
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-semibold">Rep View</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search my leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLeads.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">24%</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading your leads...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <EmptyStateComponent
              type="leads"
              title="No leads assigned"
              description="You don't have any leads assigned yet. Contact your manager for lead assignment."
              actionLabel="Contact Manager"
              onAction={() => {}}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead, idx) => (
                  <TableRow key={lead.id || idx}>
                    <TableCell className="font-medium">{lead["Full Name"]}</TableCell>
                    <TableCell>{lead["Email"]}</TableCell>
                    <TableCell>{lead["Phone Number"]}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">Vehicle Inquiry</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Follow-up
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(lead, "call")}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(lead, "message")}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(lead, "email")}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Email Modal */}
        <Modal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title={`Send Email to ${emailLead?.["Full Name"]}`}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-type">Email Type</Label>
              <Select value={emailType} onValueChange={handleEmailTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                ref={emailMessageRef}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
                placeholder="Enter your email message..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEmailSend}
                disabled={emailSending || !emailMessage.trim()}
              >
                {emailSending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}