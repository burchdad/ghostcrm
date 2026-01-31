"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import "./page.css";

interface DealFormData {
  dealName: string;
  contactName: string;
  companyName: string;
  dealValue: string;
  probability: string;
  stage: string;
  priority: string;
  assignedTo: string;
  expectedCloseDate: string;
  source: string;
  type: string;
  description: string;
  competitors: string[];
  products: string[];
  tags: string[];
}

export default function TenantNewDealPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DealFormData>({
    dealName: "",
    contactName: "",
    companyName: "",
    dealValue: "",
    probability: "25",
    stage: "Qualification",
    priority: "Medium",
    assignedTo: "",
    expectedCloseDate: "",
    source: "Existing Customer", 
    type: "New Business",
    description: "",
    competitors: [],
    products: [],
    tags: []
  });

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_NEW_DEAL] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  const stages = ["Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const sources = ["Existing Customer", "New Lead", "Referral", "Website", "Cold Call", "Trade Show", "Partner"];
  const types = ["New Business", "Existing Business", "Upsell", "Cross-sell", "Renewal"];
  const teamMembers = ["John Smith", "Sarah Johnson", "Mike Wilson", "Lisa Chen", "David Brown"];
  const availableProducts = ["Vehicle A", "Vehicle B", "Vehicle C", "Service Package", "Extended Warranty"];
  const commonCompetitors = ["Competitor A", "Competitor B", "Competitor C", "Local Dealer", "Online Platform"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field: keyof Pick<DealFormData, 'competitors' | 'products' | 'tags'>, item: string) => {
    if (item && !formData[field].includes(item)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
    }
  };

  const handleArrayRemove = (field: keyof Pick<DealFormData, 'competitors' | 'products' | 'tags'>, itemToRemove: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(item => item !== itemToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create deal via API
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.dealName,
          amount: parseFloat(formData.dealValue) || 0,
          probability: parseInt(formData.probability) || 25,
          close_date: formData.expectedCloseDate || null,
          stage: formData.stage,
          priority: formData.priority,
          contact_name: formData.contactName,
          company_name: formData.companyName,
          assigned_to: formData.assignedTo,
          source: formData.source,
          deal_type: formData.type,
          description: formData.description,
          competitors: formData.competitors,
          products: formData.products,
          tags: formData.tags
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deal created successfully!",
        });
        router.push("/tenant-owner/deals");
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create deal');
      }
    } catch (error: any) {
      console.error("Error creating deal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create deal. Please try again.",
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
    <div className="tenant-new-deal-page">
      <div className="new-deal-form-container">
        {/* Header */}
        <div className="deal-page-header">
          <div className="deal-page-title">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                Create New Deal
              </h1>
              <p className="deal-page-subtitle">Add a new sales opportunity to your pipeline</p>
            </div>
          </div>
          <div className="deal-header-actions">
            <button
              onClick={handleCancel}
              className="deal-btn deal-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="deal-btn deal-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="deal-spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Deal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Deal Information */}
          <div className="deal-form-section">
            <h2 className="deal-section-header">
              <span>📋</span>
              Deal Information
            </h2>
            <div className="deal-form-grid">
              <div className="full-width">
                <label className="deal-form-label">
                  Deal Name *
                </label>
                <input
                  type="text"
                  name="dealName"
                  value={formData.dealName}
                  onChange={handleInputChange}
                  required
                  className="deal-form-input"
                  placeholder="e.g., 2024 Honda Civic - John Smith"
                />
              </div>
              <div>
                <label className="deal-form-label">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="deal-form-input"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="deal-form-label">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="deal-form-input"
                  placeholder="Customer Company (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="deal-form-section">
            <h2 className="deal-section-header">
              <span>💵</span>
              Financial Information
            </h2>
            <div className="deal-form-grid grid-3">
              <div>
                <label className="deal-form-label">
                  Deal Value *
                </label>
                <div className="deal-financial-input">
                  <span className="deal-currency-symbol">$</span>
                  <input
                    type="number"
                    name="dealValue"
                    value={formData.dealValue}
                    onChange={handleInputChange}
                    required
                    className="deal-form-input"
                    placeholder="25000"
                  />
                </div>
              </div>
              <div>
                <label className="deal-form-label">
                  Probability (%)
                </label>
                <select
                  name="probability"
                  value={formData.probability}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  <option value="10">10% - Prospecting</option>
                  <option value="25">25% - Qualification</option>
                  <option value="50">50% - Proposal</option>
                  <option value="75">75% - Negotiation</option>
                  <option value="90">90% - Ready to Close</option>
                  <option value="100">100% - Closed Won</option>
                </select>
              </div>
              <div>
                <label className="deal-form-label">
                  Expected Close Date *
                </label>
                <input
                  type="date"
                  name="expectedCloseDate"
                  value={formData.expectedCloseDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                  className="deal-form-input"
                />
              </div>
            </div>
          </div>

          {/* Deal Management */}
          <div className="deal-form-section">
            <h2 className="deal-section-header">
              <span>🎯</span>
              Deal Management
            </h2>
            <div className="deal-form-grid grid-3">
              <div>
                <label className="deal-form-label">
                  Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="deal-form-label">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="deal-form-label">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="deal-form-label">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="deal-form-label">
                  Deal Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="deal-form-input"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products & Competition */}
          <div className="deal-form-section">
            <h2 className="deal-section-header">
              <span>🚗</span>
              Products & Competition
            </h2>
            <div className="deal-form-grid">
              <div>
                <label className="deal-form-label">
                  Products/Vehicles
                </label>
                <div className="deal-array-container">
                  <div className="deal-array-tags">
                    {formData.products.map((product, index) => (
                      <span key={index} className="deal-array-tag products">
                        {product}
                        <button
                          type="button"
                          onClick={() => handleArrayRemove('products', product)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="deal-array-input-row">
                    <input
                      type="text"
                      placeholder="Add a product and press Enter"
                      className="deal-array-input deal-form-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          handleArrayAdd('products', target.value.trim());
                          target.value = "";
                        }
                      }}
                    />
                    {availableProducts.map(product => (
                      <button
                        key={product}
                        type="button"
                        onClick={() => handleArrayAdd('products', product)}
                        className="deal-quick-add-btn"
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="deal-form-label">
                  Competition
                </label>
                <div className="deal-array-container">
                  <div className="deal-array-tags">
                    {formData.competitors.map((competitor, index) => (
                      <span key={index} className="deal-array-tag competitors">
                        {competitor}
                        <button
                          type="button"
                          onClick={() => handleArrayRemove('competitors', competitor)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="deal-array-input-row">
                    <input
                      type="text"
                      placeholder="Add a competitor and press Enter"
                      className="deal-array-input deal-form-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          handleArrayAdd('competitors', target.value.trim());
                          target.value = "";
                        }
                      }}
                    />
                    {commonCompetitors.map(competitor => (
                      <button
                        key={competitor}
                        type="button"
                        onClick={() => handleArrayAdd('competitors', competitor)}
                        className="deal-quick-add-btn"
                      >
                        {competitor}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="deal-form-section">
            <h2 className="deal-section-header">
              <span>📝</span>
              Additional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="deal-form-label">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="deal-form-input"
                  placeholder="Add any additional notes about this deal, customer requirements, special considerations..."
                />
              </div>
              <div>
                <label className="deal-form-label">
                  Tags
                </label>
                <div className="deal-array-container">
                  <div className="deal-array-tags">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="deal-array-tag tags">
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
                  <div className="deal-array-input-row">
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      className="deal-array-input deal-form-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          handleArrayAdd('tags', target.value.trim());
                          target.value = "";
                        }
                      }}
                    />
                    {["Hot Deal", "Fleet Sale", "Q4 Target", "Urgent", "Financing"].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleArrayAdd('tags', tag)}
                        className="deal-quick-add-btn"
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
          <div className="deal-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="deal-btn deal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="deal-btn deal-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="deal-spinner"></div>
                  Creating Deal...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Create Deal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}