"use client";
import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  Users, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Star, 
  Clock, 
  Download,
  Trash2,
  Plus,
  Zap,
  Bot,
  Check,
  ExternalLink,
  Settings
} from "lucide-react";
import "./NewLeadModal.css";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
}

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  status: string;
  priority: string;
  leadScore: string;
  vehicleInterest: string;
  budget: string;
  timeframe: string;
  notes: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  socialMedia: string;
  referredBy: string;
  campaignSource: string;
  tags: string[];
}

interface BulkLeadData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  notes: string;
}

export default function NewLeadModal({ isOpen, onClose, onLeadCreated }: NewLeadModalProps) {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkLeads, setBulkLeads] = useState<BulkLeadData[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState("");
  
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    source: "Website",
    status: "New",
    priority: "Medium",
    leadScore: "50",
    vehicleInterest: "",
    budget: "",
    timeframe: "1-3 months",
    notes: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    socialMedia: "",
    referredBy: "",
    campaignSource: "",
    tags: []
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        source: "Website",
        status: "New",
        priority: "Medium",
        leadScore: "50",
        vehicleInterest: "",
        budget: "",
        timeframe: "1-3 months",
        notes: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        website: "",
        socialMedia: "",
        referredBy: "",
        campaignSource: "",
        tags: []
      });
      setIsBulkMode(false);
      setUploadedFile(null);
      setBulkLeads([]);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Parse CSV file for bulk import
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        const leads: BulkLeadData[] = rows.slice(1).map(row => {
          const values = row.split(',');
          return {
            fullName: values[headers.indexOf('name')] || values[headers.indexOf('full name')] || values[0] || "",
            email: values[headers.indexOf('email')] || values[1] || "",
            phone: values[headers.indexOf('phone')] || values[headers.indexOf('telephone')] || values[2] || "",
            company: values[headers.indexOf('company')] || values[headers.indexOf('organization')] || values[3] || "",
            source: values[headers.indexOf('source')] || "Import",
            notes: values[headers.indexOf('notes')] || values[headers.indexOf('comments')] || ""
          };
        }).filter(lead => lead.fullName.trim() || lead.email.trim());
        
        setBulkLeads(leads);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isBulkMode && bulkLeads.length > 0) {
        // Handle bulk import
        const response = await fetch('/api/leads/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leads: bulkLeads,
            organizationId: user?.tenantId || tenant?.id,
            tenantId: tenant?.id
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to import leads");
        }
        
        toast({
          title: "Success!",
          description: `Successfully imported ${bulkLeads.length} leads`,
        });
      } else {
        // Handle single lead creation
        // Transform form data to match API expectations
        const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');
        
        const apiPayload = {
          first_name: firstName,
          last_name: lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          stage: formData.status.toLowerCase().replace(/\s+/g, '_') as any,
          source: formData.source.toLowerCase().replace(/\s+/g, '_') as any,
          priority: formData.priority.toLowerCase() as any,
          vehicle_interest: formData.vehicleInterest ? {
            type: undefined,
            budget_min: parseInt(formData.budget.split('-')[0]?.replace(/\D/g, '')) || undefined,
            budget_max: parseInt(formData.budget.split('-')[1]?.replace(/\D/g, '')) || undefined,
          } : undefined,
          lead_score: parseInt(formData.leadScore) || undefined,
          campaign: formData.campaignSource || undefined,
          meta: {
            company: formData.company,
            position: formData.position,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            website: formData.website,
            socialMedia: formData.socialMedia,
            referredBy: formData.referredBy,
            timeframe: formData.timeframe,
            notes: formData.notes,
            tags: formData.tags
          },
          est_value: parseInt(formData.budget.replace(/\D/g, '')) || undefined,
        };
        
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Lead creation failed:', error);
          throw new Error(error.message || `Server error: ${response.status} ${response.statusText}`);
        }
        
        toast({
          title: "Success!",
          description: "Lead created successfully",
        });
      }
      
      onLeadCreated?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title={isBulkMode ? "Import Leads" : "Create New Lead"}
      >
      <div className="new-lead-modal-content">
        {/* Mode Toggle */}
        <div className="new-lead-mode-toggle">
          <div className="mode-toggle-container">
            <Button 
              type="button"
              variant={!isBulkMode ? "default" : "outline"}
              onClick={() => setIsBulkMode(false)}
              className="mode-toggle-btn"
            >
              <Users className="w-4 h-4" />
              Single Lead
            </Button>
            <Button 
              type="button"
              variant={isBulkMode ? "default" : "outline"}
              onClick={() => setIsBulkMode(true)}
              className="mode-toggle-btn"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </Button>
          </div>
          
          {/* Connect Integration Button */}
          <div className="integration-section">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setShowIntegrationModal(true)}
              className="connect-integration-btn"
            >
              <Zap className="w-4 h-4" />
              Connect CRM
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="new-lead-form">
          {isBulkMode ? (
            /* Bulk Import Section */
            <div className="bulk-import-section">
              <Card className="upload-area">
                <div className="upload-content">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden-file-input"
                  />
                  <div className="upload-icon-container">
                    <Upload className="upload-icon" />
                  </div>
                  <h3 className="upload-title">Upload CSV File</h3>
                  <p className="upload-description">
                    Select a CSV file with lead information. Expected columns: Name, Email, Phone, Company, Source, Notes
                  </p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-btn"
                  >
                    Choose File
                  </Button>
                  {uploadedFile && (
                    <div className="uploaded-file-info">
                      <FileText className="w-4 h-4" />
                      <span>{uploadedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setBulkLeads([]);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Preview Bulk Leads */}
              {bulkLeads.length > 0 && (
                <div className="bulk-preview">
                  <h4 className="preview-title">Preview ({bulkLeads.length} leads)</h4>
                  <div className="preview-table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkLeads.slice(0, 5).map((lead, index) => (
                          <tr key={index}>
                            <td>{lead.fullName}</td>
                            <td>{lead.email}</td>
                            <td>{lead.phone}</td>
                            <td>{lead.company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkLeads.length > 5 && (
                      <p className="preview-more">
                        +{bulkLeads.length - 5} more leads...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Lead Form */
            <div className="single-lead-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <Users className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Classification */}
                <div className="form-section">
                  <h3 className="section-title">
                    <Star className="w-5 h-5" />
                    Lead Classification
                  </h3>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="source">Source</Label>
                      <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                          <SelectItem value="Cold Call">Cold Call</SelectItem>
                          <SelectItem value="Trade Show">Trade Show</SelectItem>
                          <SelectItem value="Advertisement">Advertisement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FileText className="w-5 h-5" />
                    Tags
                  </h3>
                  <div className="tag-input-container">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="tags-display">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-chip">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="tag-remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="form-section full-width">
                  <h3 className="section-title">
                    <FileText className="w-5 h-5" />
                    Additional Notes
                  </h3>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional information about this lead..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (isBulkMode && bulkLeads.length === 0)}
              className="submit-btn"
            >
              {isSubmitting ? (
                "Creating..."
              ) : isBulkMode ? (
                `Import ${bulkLeads.length} Leads`
              ) : (
                "Create Lead"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    {/* CRM Integration Modal */}
    <Modal
      open={showIntegrationModal}
      onClose={() => setShowIntegrationModal(false)}
      title="Connect Your CRM"
    >
      <div className="integration-modal-content">
        {/* AI Assistant Header */}
        <div className="ai-assistant-banner">
          <Bot className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">AI Data Sync Assistant</h4>
            <p className="text-sm text-blue-700">Our AI will automatically map your data fields and ensure seamless lead import</p>
          </div>
        </div>

        {/* Integration Options */}
        <div className="integration-options">
          <h3 className="section-title">
            <Settings className="w-5 h-5" />
            Choose Your CRM Platform
          </h3>
          
          <div className="integration-grid">
            {[
              {
                id: 'salesforce',
                name: 'Salesforce',
                description: 'Connect with the world\'s #1 CRM platform',
                icon: '☁️',
                popular: true,
                features: ['Lead sync', 'Contact management', 'Opportunity tracking']
              },
              {
                id: 'hubspot',
                name: 'HubSpot',
                description: 'Integrate with HubSpot\'s marketing and sales tools',
                icon: '🔶',
                popular: true,
                features: ['Marketing automation', 'Pipeline management', 'Email tracking']
              },
              {
                id: 'pipedrive',
                name: 'Pipedrive',
                description: 'Simple and effective sales pipeline management',
                icon: '📊',
                popular: false,
                features: ['Pipeline tracking', 'Activity management', 'Sales reporting']
              },
              {
                id: 'zoho',
                name: 'Zoho CRM',
                description: 'Comprehensive business management suite',
                icon: '🏢',
                popular: false,
                features: ['Multi-channel support', 'Workflow automation', 'Analytics']
              },
              {
                id: 'monday',
                name: 'Monday.com',
                description: 'Work management platform with CRM capabilities',
                icon: '📅',
                popular: false,
                features: ['Project management', 'Team collaboration', 'Custom workflows']
              },
              {
                id: 'csv',
                name: 'CSV Import',
                description: 'Import from any system via CSV file',
                icon: '📄',
                popular: false,
                features: ['Universal compatibility', 'Bulk import', 'Custom field mapping']
              }
            ].map((integration) => (
              <div
                key={integration.id}
                className={`integration-card ${selectedIntegration === integration.id ? 'selected' : ''} ${integration.popular ? 'popular' : ''}`}
                onClick={() => setSelectedIntegration(integration.id)}
              >
                {integration.popular && (
                  <div className="popular-badge">
                    <Star className="w-3 h-3" />
                    Popular
                  </div>
                )}
                
                <div className="integration-header">
                  <span className="integration-icon">{integration.icon}</span>
                  <div>
                    <h4 className="integration-name">{integration.name}</h4>
                    <p className="integration-description">{integration.description}</p>
                  </div>
                </div>
                
                <div className="integration-features">
                  {integration.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {selectedIntegration === integration.id && (
                  <div className="selected-indicator">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Mapping Preview */}
        {selectedIntegration && (
          <div className="ai-mapping-preview">
            <div className="ai-preview-header">
              <Bot className="w-5 h-5 text-purple-600" />
              <h4>AI Field Mapping Preview</h4>
            </div>
            <div className="mapping-sample">
              <div className="mapping-row">
                <span className="source-field">{selectedIntegration} Field</span>
                <span className="mapping-arrow">→</span>
                <span className="target-field">GhostCRM Field</span>
              </div>
              <div className="mapping-row">
                <span className="source-field">First Name</span>
                <span className="mapping-arrow">→</span>
                <span className="target-field">Full Name</span>
              </div>
              <div className="mapping-row">
                <span className="source-field">Email Address</span>
                <span className="mapping-arrow">→</span>
                <span className="target-field">Email</span>
              </div>
              <div className="mapping-row">
                <span className="source-field">Phone Number</span>
                <span className="mapping-arrow">→</span>
                <span className="target-field">Phone</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="integration-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowIntegrationModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedIntegration}
            onClick={() => {
              // Handle integration setup
              toast({
                title: "Integration Setup",
                description: `Setting up ${selectedIntegration} integration with AI data sync...`,
              });
              setShowIntegrationModal(false);
              // Here you would normally redirect to the integration setup flow
            }}
            className="connect-btn"
          >
            <ExternalLink className="w-4 h-4" />
            Connect {selectedIntegration ? selectedIntegration.charAt(0).toUpperCase() + selectedIntegration.slice(1) : 'CRM'}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}