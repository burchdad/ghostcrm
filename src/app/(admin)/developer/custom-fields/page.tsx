"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomFieldsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("fields");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const customFields = [
    {
      id: "cf_001",
      name: "Lead Source Channel",
      key: "lead_source_channel",
      type: "select",
      entity: "leads",
      required: false,
      options: ["Website", "Social Media", "Email Campaign", "Referral", "Cold Call"],
      createdAt: "2024-12-15",
      usageCount: 1247,
      status: "active"
    },
    {
      id: "cf_002",
      name: "Customer Satisfaction Score",
      key: "customer_satisfaction",
      type: "number",
      entity: "contacts",
      required: false,
      validation: { min: 1, max: 10 },
      createdAt: "2024-12-10",
      usageCount: 892,
      status: "active"
    },
    {
      id: "cf_003",
      name: "Deal Priority Level",
      key: "deal_priority",
      type: "radio",
      entity: "deals",
      required: true,
      options: ["Low", "Medium", "High", "Critical"],
      createdAt: "2024-12-08",
      usageCount: 456,
      status: "active"
    },
    {
      id: "cf_004",
      name: "Company Industry Tags",
      key: "industry_tags",
      type: "multiselect",
      entity: "companies",
      required: false,
      options: ["Technology", "Healthcare", "Finance", "Education", "Manufacturing"],
      createdAt: "2024-12-05",
      usageCount: 234,
      status: "draft"
    }
  ];

  const fieldTypes = [
    {
      type: "text",
      name: "Text Field",
      icon: "📝",
      description: "Single line text input",
      validation: ["Required", "Min/Max Length", "Pattern/Regex"]
    },
    {
      type: "textarea",
      name: "Text Area", 
      icon: "📄",
      description: "Multi-line text input",
      validation: ["Required", "Min/Max Length"]
    },
    {
      type: "number",
      name: "Number",
      icon: "🔢",
      description: "Numeric input with validation",
      validation: ["Required", "Min/Max Value", "Decimal Places"]
    },
    {
      type: "select",
      name: "Dropdown",
      icon: "📋",
      description: "Single selection from options",
      validation: ["Required", "Custom Options"]
    },
    {
      type: "multiselect",
      name: "Multi-Select",
      icon: "☑️",
      description: "Multiple selections from options",
      validation: ["Required", "Min/Max Selections"]
    },
    {
      type: "radio",
      name: "Radio Buttons",
      icon: "🔘",
      description: "Single choice from radio options",
      validation: ["Required", "Custom Options"]
    },
    {
      type: "checkbox",
      name: "Checkbox",
      icon: "✅",
      description: "Boolean true/false value",
      validation: ["Required"]
    },
    {
      type: "date",
      name: "Date Picker",
      icon: "📅",
      description: "Date selection input",
      validation: ["Required", "Min/Max Date"]
    },
    {
      type: "datetime",
      name: "Date & Time",
      icon: "🕒",
      description: "Date and time selection",
      validation: ["Required", "Min/Max DateTime"]
    },
    {
      type: "url",
      name: "URL Field",
      icon: "🔗",
      description: "URL input with validation",
      validation: ["Required", "URL Format"]
    },
    {
      type: "email",
      name: "Email Field",
      icon: "📧",
      description: "Email input with validation",
      validation: ["Required", "Email Format"]
    },
    {
      type: "phone",
      name: "Phone Number",
      icon: "📞",
      description: "Phone number with formatting",
      validation: ["Required", "Phone Format"]
    }
  ];

  const entities = [
    { key: "leads", name: "Leads", icon: "👤", count: 2543 },
    { key: "contacts", name: "Contacts", icon: "📞", count: 1876 },
    { key: "companies", name: "Companies", icon: "🏢", count: 432 },
    { key: "deals", name: "Deals", icon: "💰", count: 891 },
    { key: "tasks", name: "Tasks", icon: "✅", count: 3210 },
    { key: "activities", name: "Activities", icon: "📋", count: 5678 }
  ];

  const fieldUsage = [
    { field: "Lead Source Channel", entity: "leads", usage: 95.2, records: 1184 },
    { field: "Customer Satisfaction Score", entity: "contacts", usage: 78.4, records: 1471 },
    { field: "Deal Priority Level", entity: "deals", usage: 100.0, records: 891 },
    { field: "Company Industry Tags", entity: "companies", usage: 54.2, records: 234 }
  ];

  const renderFieldsTab = () => (
    <div className="space-y-6">
      {/* Fields List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Custom Fields</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Create Field
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Field Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Key</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Entity</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Required</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Usage</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customFields.map((field) => (
                <tr key={field.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{field.name}</div>
                    <div className="text-sm text-slate-500">{field.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm">
                      {field.key}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {field.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                      {field.entity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      field.required 
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-slate-800">
                      {field.usageCount.toLocaleString()} records
                    </div>
                    <div className="text-xs text-slate-500">
                      Created {new Date(field.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      field.status === "active" 
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {field.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedField(field.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Clone
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Fields", value: "4", icon: "📝", color: "blue" },
          { label: "Active Fields", value: "3", icon: "✅", color: "green" },
          { label: "Draft Fields", value: "1", icon: "📄", color: "yellow" },
          { label: "Total Usage", value: "2,829", icon: "📊", color: "purple" }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTypesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Available Field Types</h3>
        <p className="text-slate-600 mb-6">
          Choose from these field types to create custom fields for your CRM entities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fieldTypes.map((type, index) => (
            <div key={index} className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{type.name}</div>
                  <div className="text-sm text-slate-600">{type.description}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-700 mb-2">Validation Options:</div>
                <div className="flex flex-wrap gap-1">
                  {type.validation.map((option, optionIndex) => (
                    <span key={optionIndex} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {option}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Create {type.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Field Type Examples */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Example Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Lead Qualification",
              description: "Use dropdown and radio fields to capture lead quality scores and qualification criteria.",
              fields: ["Lead Score (Number)", "Source Quality (Radio)", "Interest Level (Select)"]
            },
            {
              title: "Customer Information",
              description: "Gather additional customer details with various field types.",
              fields: ["Industry (Multi-select)", "Company Size (Select)", "Website (URL)"]
            },
            {
              title: "Deal Management",
              description: "Track deal-specific information and requirements.",
              fields: ["Priority Level (Radio)", "Requirements (Text Area)", "Decision Date (Date)"]
            },
            {
              title: "Contact Preferences",
              description: "Capture communication and preference information.",
              fields: ["Contact Method (Checkbox)", "Phone (Phone)", "Email Updates (Checkbox)"]
            }
          ].map((useCase, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="font-semibold text-slate-800 mb-2">{useCase.title}</div>
              <div className="text-sm text-slate-600 mb-3">{useCase.description}</div>
              <div className="space-y-1">
                {useCase.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="text-sm text-blue-600">• {field}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Field Usage Analytics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Field Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Entity</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Usage Rate</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Records with Data</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Completion Trend</th>
              </tr>
            </thead>
            <tbody>
              {fieldUsage.map((usage, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">{usage.field}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                      {usage.entity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            usage.usage >= 90 ? "bg-green-500" :
                            usage.usage >= 70 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${usage.usage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 min-w-[60px]">
                        {usage.usage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {usage.records.toLocaleString()} records
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">📈</span>
                      <span className="text-sm text-slate-600">+12% this month</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{entity.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{entity.name}</div>
                  <div className="text-sm text-slate-600">{entity.count.toLocaleString()} records</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Custom Fields:</span>
                <span className="text-slate-800 font-medium">
                  {customFields.filter(f => f.entity === entity.key).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg. Completion:</span>
                <span className="text-slate-800 font-medium">
                  {Math.round(Math.random() * 30 + 60)}%
                </span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
              View Fields
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Custom Field Settings</h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="allowDuplicateKeys" className="w-4 h-4 text-blue-600" />
              <label htmlFor="allowDuplicateKeys" className="text-sm text-slate-700">
                Allow duplicate field keys across entities
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="requireFieldValidation" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="requireFieldValidation" className="text-sm text-slate-700">
                Require field validation rules
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enableFieldHistory" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="enableFieldHistory" className="text-sm text-slate-700">
                Track field value history
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="autoGenerateKeys" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="autoGenerateKeys" className="text-sm text-slate-700">
                Auto-generate field keys from names
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Field Type</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="text">Text Field</option>
                <option value="textarea">Text Area</option>
                <option value="number">Number</option>
                <option value="select">Dropdown</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Fields per Entity</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="10">10 fields</option>
                <option value="25">25 fields</option>
                <option value="50">50 fields</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Field Naming Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Field Naming Rules</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Key Format</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="snake_case">snake_case (recommended)</option>
              <option value="camelCase">camelCase</option>
              <option value="kebab-case">kebab-case</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reserved Keywords</label>
            <textarea 
              placeholder="Enter reserved keywords that cannot be used as field keys"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              defaultValue="id, created_at, updated_at, deleted_at, user_id, tenant_id"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="enforcePrefix" className="w-4 h-4 text-blue-600" />
              <label htmlFor="enforcePrefix" className="text-sm text-slate-700">
                Enforce field key prefix (e.g., "custom_")
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="validateKeyUniqueness" className="w-4 h-4 text-blue-600" defaultChecked />
              <label htmlFor="validateKeyUniqueness" className="text-sm text-slate-700">
                Validate key uniqueness globally
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🔧</span>
            Custom Fields
          </h1>
          <p className="text-slate-600 mt-2">Design and manage custom fields for your CRM entities</p>
        </div>

        {/* Quick Overview */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold">4 Active Fields</div>
              <div className="text-orange-100">Across 4 different entities</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12 Field Types</div>
              <div className="text-orange-100">Available for creation</div>
            </div>
            <div>
              <div className="text-2xl font-bold">84.5% Avg Usage</div>
              <div className="text-orange-100">Field completion rate</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "fields", label: "Manage Fields", icon: "📝" },
                { id: "types", label: "Field Types", icon: "🔧" },
                { id: "usage", label: "Usage Analytics", icon: "📊" },
                { id: "settings", label: "Settings", icon: "⚙️" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "fields" && renderFieldsTab()}
          {activeTab === "types" && renderTypesTab()}
          {activeTab === "usage" && renderUsageTab()}
          {activeTab === "settings" && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}
