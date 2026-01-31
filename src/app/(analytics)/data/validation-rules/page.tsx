"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Save,
  X,
  Code,
  Database,
  FileText
} from "lucide-react";

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  field: string;
  dataType: string;
  ruleType: 'required' | 'format' | 'range' | 'custom' | 'unique' | 'dependency';
  condition: string;
  errorMessage: string;
  isActive: boolean;
  priority: number;
  appliesTo: string[];
  createdAt: string;
  updatedAt: string;
  violationCount: number;
  lastViolation?: string;
}

const mockValidationRules: ValidationRule[] = [
  {
    id: '1',
    name: 'Email Format Validation',
    description: 'Ensures all email addresses follow proper format',
    field: 'email',
    dataType: 'email',
    ruleType: 'format',
    condition: 'REGEX_MATCH(email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")',
    errorMessage: 'Please enter a valid email address',
    isActive: true,
    priority: 1,
    appliesTo: ['leads', 'contacts', 'users'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    violationCount: 12,
    lastViolation: '2024-01-15T11:20:00Z'
  },
  {
    id: '2',
    name: 'Phone Number Required',
    description: 'Phone number is required for all high-value leads',
    field: 'phone',
    dataType: 'phone',
    ruleType: 'required',
    condition: 'IF(lead_value > 10000, NOT_EMPTY(phone), TRUE)',
    errorMessage: 'Phone number is required for leads over $10,000',
    isActive: true,
    priority: 2,
    appliesTo: ['leads'],
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-10T16:45:00Z',
    violationCount: 5,
    lastViolation: '2024-01-14T09:30:00Z'
  },
  {
    id: '3',
    name: 'Deal Value Range',
    description: 'Deal values must be between $100 and $1,000,000',
    field: 'deal_value',
    dataType: 'currency',
    ruleType: 'range',
    condition: 'deal_value BETWEEN 100 AND 1000000',
    errorMessage: 'Deal value must be between $100 and $1,000,000',
    isActive: true,
    priority: 1,
    appliesTo: ['deals'],
    createdAt: '2024-01-03T14:20:00Z',
    updatedAt: '2024-01-12T10:15:00Z',
    violationCount: 3,
    lastViolation: '2024-01-13T15:45:00Z'
  },
  {
    id: '4',
    name: 'Unique Lead Email',
    description: 'Email addresses must be unique across all leads',
    field: 'email',
    dataType: 'email',
    ruleType: 'unique',
    condition: 'UNIQUE(email) WHERE record_type = "lead"',
    errorMessage: 'A lead with this email address already exists',
    isActive: false,
    priority: 3,
    appliesTo: ['leads'],
    createdAt: '2024-01-08T11:30:00Z',
    updatedAt: '2024-01-14T13:20:00Z',
    violationCount: 8,
    lastViolation: '2024-01-12T16:10:00Z'
  },
  {
    id: '5',
    name: 'Close Date Dependency',
    description: 'Close date must be in the future for open deals',
    field: 'close_date',
    dataType: 'date',
    ruleType: 'dependency',
    condition: 'IF(stage != "closed", close_date > TODAY(), TRUE)',
    errorMessage: 'Close date must be in the future for open deals',
    isActive: true,
    priority: 2,
    appliesTo: ['deals'],
    createdAt: '2024-01-07T16:45:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    violationCount: 2,
    lastViolation: '2024-01-15T08:15:00Z'
  }
];

export default function ValidationRulesPage() {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>(mockValidationRules);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
      case 'required': return 'bg-red-100 text-red-800';
      case 'format': return 'bg-blue-100 text-blue-800';
      case 'range': return 'bg-green-100 text-green-800';
      case 'unique': return 'bg-purple-100 text-purple-800';
      case 'dependency': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuleTypeIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'required': return <AlertTriangle className="w-4 h-4" />;
      case 'format': return <FileText className="w-4 h-4" />;
      case 'range': return <Settings className="w-4 h-4" />;
      case 'unique': return <Shield className="w-4 h-4" />;
      case 'dependency': return <Database className="w-4 h-4" />;
      case 'custom': return <Code className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setValidationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    ));
  };

  const handleRunValidation = (ruleId: string) => {
    // Simulate running validation
    console.log('Running validation for rule:', ruleId);
    // In a real app, this would trigger validation and update violation counts
  };

  const filteredRules = validationRules.filter(rule => {
    if (filterType !== 'all' && rule.ruleType !== filterType) return false;
    if (filterStatus === 'active' && !rule.isActive) return false;
    if (filterStatus === 'inactive' && rule.isActive) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validation Rules</h1>
            <p className="text-gray-600">Ensure data quality and consistency across your CRM</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Run All Validations
            </button>
            <button 
              onClick={() => setShowNewRuleForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Rules</p>
                <p className="text-2xl font-bold text-blue-900">{validationRules.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Rules</p>
                <p className="text-2xl font-bold text-green-900">
                  {validationRules.filter(r => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Violations</p>
                <p className="text-2xl font-bold text-red-900">
                  {validationRules.reduce((sum, r) => sum + r.violationCount, 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">High Priority</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {validationRules.filter(r => r.priority === 1).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Data Types</p>
                <p className="text-2xl font-bold text-purple-900">
                  {new Set(validationRules.map(r => r.dataType)).size}
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="required">Required</option>
            <option value="format">Format</option>
            <option value="range">Range</option>
            <option value="unique">Unique</option>
            <option value="dependency">Dependency</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Validation Rules</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredRules.map(rule => (
              <div 
                key={rule.id} 
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRule?.id === rule.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getRuleTypeColor(rule.ruleType)}`}>
                        {getRuleTypeIcon(rule.ruleType)}
                        {rule.ruleType}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rule.priority)}`}>
                        P{rule.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Field: {rule.field}</span>
                      <span>Applies to: {rule.appliesTo.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-1">
                      <span className={rule.isActive ? 'text-green-600' : 'text-red-600'}>
                        {rule.isActive ? '● Active' : '● Inactive'}
                      </span>
                      {rule.violationCount > 0 && (
                        <span className="text-red-600">
                          {rule.violationCount} violations
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunValidation(rule.id);
                      }}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded"
                      title="Run validation"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRule(rule.id);
                      }}
                      className="p-1 text-gray-600 hover:text-orange-600 rounded"
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRule(rule);
                        setIsEditMode(true);
                      }}
                      className="p-1 text-gray-600 hover:text-green-600 rounded"
                      title="Edit rule"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Details */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedRule ? 'Rule Details' : 'Select a Rule'}
              </h2>
              {selectedRule && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      isEditMode 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isEditMode ? 'View Mode' : 'Edit Mode'}
                  </button>
                  {isEditMode && (
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Save className="w-4 h-4 inline mr-1" />
                      Save
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedRule ? (
            <div className="p-6">
              {/* Basic Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={selectedRule.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedRule.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {isEditMode ? (
                    <textarea
                      value={selectedRule.description}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedRule.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                      {selectedRule.field}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                    <p className="text-gray-900">{selectedRule.dataType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                    <div className="flex items-center gap-2">
                      {getRuleTypeIcon(selectedRule.ruleType)}
                      <span className="capitalize">{selectedRule.ruleType}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`px-2 py-1 text-sm rounded ${getPriorityColor(selectedRule.priority)}`}>
                      Priority {selectedRule.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Validation Condition</label>
                {isEditMode ? (
                  <textarea
                    value={selectedRule.condition}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-sm text-gray-800">{selectedRule.condition}</code>
                  </div>
                )}
              </div>

              {/* Error Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Error Message</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedRule.errorMessage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-800 text-sm">{selectedRule.errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Applies To */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Applies To</label>
                <div className="flex flex-wrap gap-2">
                  {selectedRule.appliesTo.map(entity => (
                    <span key={entity} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Violation Stats */}
              <div className="border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Violation Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">Total Violations</p>
                        <p className="text-2xl font-bold text-red-900">{selectedRule.violationCount}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Last Violation</p>
                      <p className="text-gray-900">
                        {selectedRule.lastViolation 
                          ? new Date(selectedRule.lastViolation).toLocaleString()
                          : 'None'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  <p>Last updated: {new Date(selectedRule.updatedAt).toLocaleString()}</p>
                  <p>Created: {new Date(selectedRule.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunValidation(selectedRule.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run Validation
                  </button>
                  <button
                    onClick={() => handleToggleRule(selectedRule.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedRule.isActive 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedRule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {selectedRule.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rule selected</h3>
              <p className="text-gray-600">Select a validation rule from the list to view and edit its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
