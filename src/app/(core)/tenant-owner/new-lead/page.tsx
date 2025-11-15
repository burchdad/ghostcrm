"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import "./page.css";

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: string;
  status: string;
  assignedTo: string;
  description: string;
  tags: string[];
  estimatedValue: string;
  priority: string;
  expectedCloseDate: string;
  vehicleInterest: string;
  budgetRange: string;
  timeframe: string;
  financingNeeds: string;
  tradeinVehicle: string;
}

export default function TenantNewLeadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkImportMode, setBulkImportMode] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    source: "Website",
    status: "New",
    assignedTo: "",
    description: "",
    tags: [],
    estimatedValue: "",
    priority: "Medium",
    expectedCloseDate: "",
    vehicleInterest: "",
    budgetRange: "",
    timeframe: "This Month",
    financingNeeds: "Unknown",
    tradeinVehicle: ""
  });

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_NEW_LEAD] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  const sources = ["Website", "Email Campaign", "Social Media", "Referral", "Cold Call", "Trade Show", "Advertisement", "Walk-in", "Phone Inquiry", "Online Form"];
  const statuses = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost", "Nurturing"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  const teamMembers = ["John Smith", "Sarah Johnson", "Mike Wilson", "Lisa Chen", "David Brown"];
  const vehicleTypes = ["Sedan", "SUV", "Truck", "Convertible", "Hatchback", "Coupe", "Minivan", "Electric", "Hybrid"];
  const budgetRanges = ["Under $20k", "$20k-$30k", "$30k-$50k", "$50k-$75k", "$75k-$100k", "Over $100k"];
  const timeframes = ["This Week", "This Month", "Next 3 Months", "Next 6 Months", "Next Year", "Just Browsing"];
  const financingOptions = ["Cash", "Finance", "Lease", "Trade + Finance", "Unknown"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field: keyof Pick<LeadFormData, 'tags'>, item: string) => {
    if (item && !formData[field].includes(item)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
    }
  };

  const handleArrayRemove = (field: keyof Pick<LeadFormData, 'tags'>, itemToRemove: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(item => item !== itemToRemove) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      // TODO: Validate file type (CSV, Excel, etc.)
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'leads');

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import Successful",
          description: `Imported ${result.count} leads successfully!`,
        });
        router.push("/tenant-owner/leads");
      } else {
        throw new Error('Import failed');
      }
    } catch (error: any) {
      console.error("Error importing leads:", error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to import leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create lead via API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          title: formData.title,
          source: formData.source,
          status: formData.status,
          assigned_to: formData.assignedTo,
          description: formData.description,
          tags: formData.tags,
          estimated_value: parseFloat(formData.estimatedValue) || 0,
          priority: formData.priority,
          expected_close_date: formData.expectedCloseDate || null,
          vehicle_interest: formData.vehicleInterest,
          budget_range: formData.budgetRange,
          timeframe: formData.timeframe,
          financing_needs: formData.financingNeeds,
          tradein_vehicle: formData.tradeinVehicle
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead created successfully!",
        });
        router.push("/tenant-owner/leads");
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lead');
      }
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="tenant-new-lead-page">
      <div className="new-lead-form-container">
        {/* Header */}
        <div className="lead-page-header">
          <div className="lead-page-title">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Create New Lead
              </h1>
              <p className="lead-page-subtitle">Add a new prospect to your sales pipeline</p>
            </div>
          </div>
          <div className="lead-header-actions">
            <button
              onClick={() => setBulkImportMode(!bulkImportMode)}
              className="lead-btn lead-btn-secondary"
            >
              <span>📊</span>
              {bulkImportMode ? 'Single Entry' : 'Bulk Import'}
            </button>
            <button
              onClick={handleCancel}
              className="lead-btn lead-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={bulkImportMode ? handleBulkImport : handleSubmit}
              disabled={isSubmitting}
              className="lead-btn lead-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="lead-spinner"></div>
                  {bulkImportMode ? 'Importing...' : 'Creating...'}
                </>
              ) : (
                <>
                  <span>{bulkImportMode ? '📥' : '💾'}</span>
                  {bulkImportMode ? 'Import Leads' : 'Save Lead'}
                </>
              )}
            </button>
          </div>
        </div>

        {bulkImportMode ? (
          /* Bulk Import Section */
          <div className="lead-form-section">
            <h2 className="lead-section-header">
              <span>📊</span>
              Bulk Import Leads
            </h2>
            <div className="bulk-import-container">
              <div className="import-instructions">
                <h3>Import Instructions:</h3>
                <ul>
                  <li>• Upload CSV or Excel files</li>
                  <li>• Required columns: first_name, last_name, email</li>
                  <li>• Optional columns: phone, company, source, vehicle_interest, budget_range</li>
                  <li>• Maximum 1000 leads per import</li>
                </ul>
              </div>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="lead-file-upload"
                />
                <label htmlFor="lead-file-upload" className="file-upload-label">
                  <span>📁</span>
                  {importFile ? importFile.name : 'Choose file to upload'}
                </label>
              </div>
              <div className="integration-options">
                <h3>Available Integrations:</h3>
                <div className="integration-buttons">
                  <button className="integration-btn" disabled>
                    <span>📧</span>
                    Mailchimp
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>📱</span>
                    Facebook Leads
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>🔗</span>
                    Google Ads
                    <small>Coming Soon</small>
                  </button>
                  <button className="integration-btn" disabled>
                    <span>💼</span>
                    CRM Import
                    <small>Coming Soon</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single Lead Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="lead-form-section">
              <h2 className="lead-section-header">
                <span>👤</span>
                Contact Information
              </h2>
              <div className="lead-form-grid">
                <div>
                  <label className="lead-form-label">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="lead-form-input"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="lead-form-input"
                    placeholder="Smith"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="lead-form-input"
                    placeholder="john.smith@email.com"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="lead-form-input"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="lead-form-input"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="lead-form-input"
                    placeholder="Manager"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Interest */}
            <div className="lead-form-section">
              <h2 className="lead-section-header">
                <span>🚗</span>
                Vehicle Interest
              </h2>
              <div className="lead-form-grid grid-3">
                <div>
                  <label className="lead-form-label">
                    Vehicle Type Interest
                  </label>
                  <select
                    name="vehicleInterest"
                    value={formData.vehicleInterest}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Budget Range
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Purchase Timeframe
                  </label>
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    {timeframes.map(timeframe => (
                      <option key={timeframe} value={timeframe}>{timeframe}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Financing Needs
                  </label>
                  <select
                    name="financingNeeds"
                    value={formData.financingNeeds}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    {financingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Trade-in Vehicle
                  </label>
                  <input
                    type="text"
                    name="tradeinVehicle"
                    value={formData.tradeinVehicle}
                    onChange={handleInputChange}
                    className="lead-form-input"
                    placeholder="2018 Honda Civic"
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Estimated Deal Value
                  </label>
                  <div className="lead-financial-input">
                    <span className="lead-currency-symbol">$</span>
                    <input
                      type="number"
                      name="estimatedValue"
                      value={formData.estimatedValue}
                      onChange={handleInputChange}
                      className="lead-form-input"
                      placeholder="35000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Management */}
            <div className="lead-form-section">
              <h2 className="lead-section-header">
                <span>📊</span>
                Lead Management
              </h2>
              <div className="lead-form-grid grid-3">
                <div>
                  <label className="lead-form-label">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Assigned To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="lead-form-input"
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lead-form-label">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    name="expectedCloseDate"
                    value={formData.expectedCloseDate}
                    onChange={handleInputChange}
                    min={today}
                    className="lead-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="lead-form-section">
              <h2 className="lead-section-header">
                <span>📝</span>
                Additional Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="lead-form-label">
                    Description / Notes
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="lead-form-input"
                    placeholder="Add any additional notes about this lead, their interests, requirements..."
                  />
                </div>
                <div>
                  <label className="lead-form-label">
                    Tags
                  </label>
                  <div className="lead-array-container">
                    <div className="lead-array-tags">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="lead-array-tag tags">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('tags', tag)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="lead-array-input-row">
                      <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        className="lead-array-input lead-form-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            handleArrayAdd('tags', target.value.trim());
                            target.value = "";
                          }
                        }}
                      />
                      {["Hot Lead", "Referral", "Qualified", "First Time Buyer", "Returning Customer"].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleArrayAdd('tags', tag)}
                          className="lead-quick-add-btn"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="lead-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="lead-btn lead-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="lead-btn lead-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="lead-spinner"></div>
                    Creating Lead...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Create Lead
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}