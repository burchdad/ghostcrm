"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function NewDealPage() {
  const router = useRouter();
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

  const stages = ["Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const sources = ["Existing Customer", "New Lead", "Referral", "Website", "Cold Call", "Trade Show", "Partner"];
  const types = ["New Business", "Existing Business", "Upsell", "Cross-sell", "Renewal"];
  const teamMembers = ["John Smith", "Sarah Johnson", "Mike Wilson", "Lisa Chen", "David Brown"];
  const availableProducts = ["CRM Pro", "CRM Enterprise", "Marketing Suite", "Sales Analytics", "Custom Integration"];
  const commonCompetitors = ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Microsoft Dynamics"];

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Creating deal:", formData);
      
      // Success - redirect to deals page
      router.push("/deals");
    } catch (error) {
      console.error("Error creating deal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                Create New Deal
              </h1>
              <p className="text-slate-600 mt-2">Add a new sales opportunity to your pipeline</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Deal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>📋</span>
              Deal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deal Name *
                </label>
                <input
                  type="text"
                  name="dealName"
                  value={formData.dealName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Acme Corp - CRM Implementation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Acme Corporation"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>💵</span>
              Financial Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deal Value *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    name="dealValue"
                    value={formData.dealValue}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Probability (%)
                </label>
                <select
                  name="probability"
                  value={formData.probability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="10">10% - Initial Contact</option>
                  <option value="25">25% - Qualification</option>
                  <option value="50">50% - Needs Analysis</option>
                  <option value="75">75% - Proposal Submitted</option>
                  <option value="90">90% - Negotiation</option>
                  <option value="100">100% - Verbal Commitment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Close Date *
                </label>
                <input
                  type="date"
                  name="expectedCloseDate"
                  value={formData.expectedCloseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Deal Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>🎯</span>
              Deal Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deal Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products & Competition */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>🛍️</span>
              Products & Competition
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Products/Services
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.products.map((product, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {product}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('products', product)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {availableProducts.map(product => (
                    <button
                      key={product}
                      type="button"
                      onClick={() => handleArrayAdd('products', product)}
                      className="mr-2 mb-2 px-3 py-1 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {product}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Competitors
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.competitors.map((competitor, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {competitor}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('competitors', competitor)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {commonCompetitors.map(competitor => (
                    <button
                      key={competitor}
                      type="button"
                      onClick={() => handleArrayAdd('competitors', competitor)}
                      className="mr-2 mb-2 px-3 py-1 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {competitor}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>📝</span>
              Additional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any additional notes about this deal, customer requirements, special considerations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('tags', tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleArrayAdd('tags', target.value.trim());
                        target.value = "";
                      }
                    }}
                  />
                  {["Hot Deal", "Enterprise", "Q4 Target", "Urgent"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleArrayAdd('tags', tag)}
                      className="px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
