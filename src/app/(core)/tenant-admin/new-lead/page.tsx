"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
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

export default function TenantAdminNewLeadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    timeframe: "",
    financingNeeds: "",
    tradeinVehicle: "",
  });

  // Check authentication and role
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user has permission to create leads (sales manager level)
    if (!['owner', 'admin', 'manager', 'sales_rep'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create leads.",
        variant: "destructive",
      });
      router.push('/dashboard');
      return;
    }
  }, [user, router, toast]);

  const sources = ["Website", "Phone Call", "Email", "Referral", "Social Media", "Trade Show", "Cold Call", "Other"];
  const statuses = ["New", "Contacted", "Qualified", "Unqualified", "Lost"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const budgetRanges = ["$0-$25k", "$25k-$50k", "$50k-$75k", "$75k-$100k", "$100k+"];
  const timeframes = ["Immediate", "1-3 months", "3-6 months", "6-12 months", "12+ months"];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tenantId: user?.tenantId,
          created_by: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lead");
      }

      const newLead = await response.json();

      toast({
        title: "Success!",
        description: "Lead created successfully.",
      });

      router.push("/tenant-admin/leads");
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tenant-new-lead-page">
      <div className="new-lead-form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                Create New Lead
              </h1>
              <p className="page-subtitle">
                Add a new potential customer to your sales pipeline
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="back-button"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="form-section">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Basic Information</h3>
              </div>
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Lead Details</h3>
              </div>
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {sources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Value</label>
                    <input
                      type="text"
                      name="estimatedValue"
                      value={formData.estimatedValue}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="$0.00"
                    />
                  </div>
                </div>

                <div className="form-group-full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={4}
                    placeholder="Additional notes about this lead..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Lead..." : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}