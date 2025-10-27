"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Plus, 
  Settings, 
  Save, 
  Play, 
  Pause, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Upload,
  Database,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react";

interface MappingRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired: boolean;
  dataType: string;
  defaultValue?: string;
}

interface DataMapping {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;
  status: 'active' | 'inactive' | 'draft';
  lastRun?: string;
  recordsProcessed: number;
  errorCount: number;
  rules: MappingRule[];
  createdAt: string;
  updatedAt: string;
}

const mockMappings: DataMapping[] = [
  {
    id: '1',
    name: 'CRM to Email Marketing',
    description: 'Sync lead data from CRM to email marketing platform',
    sourceSystem: 'GhostCRM',
    targetSystem: 'Mailchimp',
    status: 'active',
    lastRun: '2024-01-15T14:30:00Z',
    recordsProcessed: 1250,
    errorCount: 3,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    rules: [
      {
        id: 'r1',
        sourceField: 'full_name',
        targetField: 'FNAME',
        isRequired: true,
        dataType: 'string',
        transformation: 'split_first_name'
      },
      {
        id: 'r2',
        sourceField: 'email_address',
        targetField: 'EMAIL',
        isRequired: true,
        dataType: 'email'
      },
      {
        id: 'r3',
        sourceField: 'phone_number',
        targetField: 'PHONE',
        isRequired: false,
        dataType: 'phone',
        transformation: 'format_us_phone'
      }
    ]
  },
  {
    id: '2',
    name: 'Sales Data Export',
    description: 'Export deal data to business intelligence system',
    sourceSystem: 'GhostCRM',
    targetSystem: 'Tableau',
    status: 'active',
    lastRun: '2024-01-15T12:00:00Z',
    recordsProcessed: 890,
    errorCount: 0,
    createdAt: '2024-01-08T15:20:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    rules: [
      {
        id: 'r4',
        sourceField: 'deal_value',
        targetField: 'revenue',
        isRequired: true,
        dataType: 'decimal',
        transformation: 'currency_to_decimal'
      },
      {
        id: 'r5',
        sourceField: 'close_date',
        targetField: 'closed_date',
        isRequired: true,
        dataType: 'date',
        transformation: 'format_iso_date'
      }
    ]
  },
  {
    id: '3',
    name: 'Customer Support Integration',
    description: 'Import support tickets into CRM',
    sourceSystem: 'Zendesk',
    targetSystem: 'GhostCRM',
    status: 'draft',
    recordsProcessed: 0,
    errorCount: 0,
    createdAt: '2024-01-14T11:15:00Z',
    updatedAt: '2024-01-14T11:15:00Z',
    rules: [
      {
        id: 'r6',
        sourceField: 'ticket_id',
        targetField: 'external_id',
        isRequired: true,
        dataType: 'string'
      },
      {
        id: 'r7',
        sourceField: 'requester_email',
        targetField: 'customer_email',
        isRequired: true,
        dataType: 'email'
      }
    ]
  }
];

export default function MappingPage() {
  const [mappings, setMappings] = useState<DataMapping[]>(mockMappings);
  const [selectedMapping, setSelectedMapping] = useState<DataMapping | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNewMappingForm, setShowNewMappingForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <Pause className="w-4 h-4 text-red-600" />;
      case 'draft': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleRunMapping = (mappingId: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, lastRun: new Date().toISOString(), status: 'active' as const }
        : mapping
    ));
  };

  const handleToggleStatus = (mappingId: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { 
            ...mapping, 
            status: mapping.status === 'active' ? 'inactive' as const : 'active' as const 
          }
        : mapping
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Mapping</h1>
            <p className="text-gray-600">Configure and manage data transformations between systems</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export Config
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import Config
            </button>
            <button 
              onClick={() => setShowNewMappingForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Mapping
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Mappings</p>
                <p className="text-2xl font-bold text-blue-900">{mappings.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {mappings.filter(m => m.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Records Processed</p>
                <p className="text-2xl font-bold text-orange-900">
                  {mappings.reduce((sum, m) => sum + m.recordsProcessed, 0).toLocaleString()}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Errors</p>
                <p className="text-2xl font-bold text-red-900">
                  {mappings.reduce((sum, m) => sum + m.errorCount, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mappings List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Data Mappings</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {mappings.map(mapping => (
              <div 
                key={mapping.id} 
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMapping?.id === mapping.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedMapping(mapping)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{mapping.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(mapping.status)}`}>
                        {getStatusIcon(mapping.status)}
                        {mapping.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{mapping.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{mapping.sourceSystem} → {mapping.targetSystem}</span>
                      {mapping.lastRun && (
                        <span>Last run: {new Date(mapping.lastRun).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Records: {mapping.recordsProcessed.toLocaleString()}</span>
                      {mapping.errorCount > 0 && (
                        <span className="text-red-600">Errors: {mapping.errorCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunMapping(mapping.id);
                      }}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded"
                      title="Run mapping"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(mapping.id);
                      }}
                      className="p-1 text-gray-600 hover:text-orange-600 rounded"
                      title={mapping.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {mapping.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMapping(mapping);
                        setIsEditMode(true);
                      }}
                      className="p-1 text-gray-600 hover:text-green-600 rounded"
                      title="Edit mapping"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapping Details */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedMapping ? 'Mapping Details' : 'Select a Mapping'}
              </h2>
              {selectedMapping && (
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

          {selectedMapping ? (
            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={selectedMapping.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedMapping.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedMapping.status)}
                      <span className="capitalize">{selectedMapping.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {isEditMode ? (
                    <textarea
                      value={selectedMapping.description}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedMapping.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source System</label>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>{selectedMapping.sourceSystem}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target System</label>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-green-600" />
                      <span>{selectedMapping.targetSystem}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Mapping Rules */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">Field Mapping Rules</h3>
                  {isEditMode && (
                    <button className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedMapping.rules.map(rule => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Source Field</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={rule.sourceField}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="bg-blue-50 px-2 py-1 rounded text-sm font-mono">
                              {rule.sourceField}
                            </div>
                          )}
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Target Field</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={rule.targetField}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="bg-green-50 px-2 py-1 rounded text-sm font-mono">
                              {rule.targetField}
                            </div>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {rule.dataType}
                          </span>
                        </div>

                        <div className="col-span-1 flex justify-center">
                          {rule.isRequired && (
                            <span className="text-red-500 text-xs font-medium">*</span>
                          )}
                          {isEditMode && (
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {rule.transformation && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Transformation</label>
                          <div className="bg-yellow-50 px-2 py-1 rounded text-sm font-mono text-yellow-800">
                            {rule.transformation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  <p>Last updated: {new Date(selectedMapping.updatedAt).toLocaleString()}</p>
                  {selectedMapping.lastRun && (
                    <p>Last run: {new Date(selectedMapping.lastRun).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunMapping(selectedMapping.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run Now
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    Test Run
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mapping selected</h3>
              <p className="text-gray-600">Select a mapping from the list to view and edit its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
