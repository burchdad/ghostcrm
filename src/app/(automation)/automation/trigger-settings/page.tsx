"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Database, 
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from "lucide-react";

interface Trigger {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'time' | 'condition';
  category: string;
  status: 'active' | 'inactive';
  event: string;
  conditions: any[];
  actions: string[];
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
  createdAt: string;
}

interface TriggerTemplate {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'time' | 'condition';
  category: string;
  icon: any;
  defaultConfig: any;
}

const triggerTemplates: TriggerTemplate[] = [
  {
    id: 'new-lead',
    name: 'New Lead Created',
    description: 'Triggers when a new lead is added to the system',
    type: 'event',
    category: 'Lead Management',
    icon: User,
    defaultConfig: {
      event: 'lead.created',
      conditions: []
    }
  },
  {
    id: 'email-opened',
    name: 'Email Opened',
    description: 'Triggers when a prospect opens an email',
    type: 'event',
    category: 'Email Marketing',
    icon: Mail,
    defaultConfig: {
      event: 'email.opened',
      conditions: [
        { field: 'campaign_id', operator: 'exists' }
      ]
    }
  },
  {
    id: 'demo-scheduled',
    name: 'Demo Scheduled',
    description: 'Triggers when a demo appointment is scheduled',
    type: 'event',
    category: 'Sales Process',
    icon: Calendar,
    defaultConfig: {
      event: 'appointment.scheduled',
      conditions: [
        { field: 'appointment_type', operator: 'equals', value: 'demo' }
      ]
    }
  },
  {
    id: 'lead-score-threshold',
    name: 'Lead Score Threshold',
    description: 'Triggers when lead score reaches a specific value',
    type: 'condition',
    category: 'Lead Scoring',
    icon: Filter,
    defaultConfig: {
      event: 'lead.score_updated',
      conditions: [
        { field: 'lead_score', operator: 'greater_than', value: 80 }
      ]
    }
  },
  {
    id: 'daily-report',
    name: 'Daily Report',
    description: 'Triggers at a specific time each day',
    type: 'time',
    category: 'Reporting',
    icon: Clock,
    defaultConfig: {
      schedule: {
        type: 'daily',
        time: '09:00',
        timezone: 'UTC'
      }
    }
  },
  {
    id: 'inactivity-trigger',
    name: 'Lead Inactivity',
    description: 'Triggers when a lead has been inactive for a period',
    type: 'condition',
    category: 'Lead Nurturing',
    icon: Activity,
    defaultConfig: {
      event: 'lead.inactivity_check',
      conditions: [
        { field: 'last_activity', operator: 'older_than', value: '7 days' }
      ]
    }
  }
];

export default function TriggerSettingsPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      name: 'New Lead Welcome Sequence',
      description: 'Automatically start nurturing sequence for new leads',
      type: 'event',
      category: 'Lead Management',
      status: 'active',
      event: 'lead.created',
      conditions: [
        { field: 'source', operator: 'not_equals', value: 'referral' }
      ],
      actions: ['send_welcome_email', 'assign_to_rep'],
      lastTriggered: '2024-01-15T14:30:00Z',
      triggerCount: 127,
      successRate: 0.89,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2', 
      name: 'High-Value Lead Alert',
      description: 'Notify sales team when high-value lead is identified',
      type: 'condition',
      category: 'Lead Scoring',
      status: 'active',
      event: 'lead.score_updated',
      conditions: [
        { field: 'lead_score', operator: 'greater_than', value: 85 },
        { field: 'company_size', operator: 'greater_than', value: 100 }
      ],
      actions: ['send_slack_notification', 'create_priority_task'],
      lastTriggered: '2024-01-15T16:15:00Z',
      triggerCount: 23,
      successRate: 0.96,
      createdAt: '2024-01-12T14:00:00Z'
    },
    {
      id: '3',
      name: 'Weekly Performance Report',
      description: 'Send weekly performance summary to managers',
      type: 'time',
      category: 'Reporting',
      status: 'active',
      event: 'schedule.weekly',
      conditions: [],
      actions: ['generate_report', 'email_managers'],
      lastTriggered: '2024-01-14T09:00:00Z',
      triggerCount: 8,
      successRate: 1.0,
      createdAt: '2024-01-01T12:00:00Z'
    },
    {
      id: '4',
      name: 'Dormant Lead Reactivation',
      description: 'Re-engage leads that have been inactive for 30 days',
      type: 'condition',
      category: 'Lead Nurturing',
      status: 'inactive',
      event: 'lead.inactivity_check',
      conditions: [
        { field: 'last_activity', operator: 'older_than', value: '30 days' },
        { field: 'status', operator: 'equals', value: 'open' }
      ],
      actions: ['send_reengagement_email', 'update_lead_status'],
      lastTriggered: '2024-01-13T12:00:00Z',
      triggerCount: 15,
      successRate: 0.73,
      createdAt: '2024-01-05T16:30:00Z'
    }
  ]);

  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = Array.from(new Set(triggers.map(t => t.category)));
  const filteredTriggers = triggers.filter(trigger => {
    if (filterCategory !== 'all' && trigger.category !== filterCategory) return false;
    if (filterStatus !== 'all' && trigger.status !== filterStatus) return false;
    return true;
  });

  const toggleTriggerStatus = (triggerId: string) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === triggerId 
        ? { ...trigger, status: trigger.status === 'active' ? 'inactive' : 'active' }
        : trigger
    ));
  };

  const deleteTrigger = (triggerId: string) => {
    setTriggers(prev => prev.filter(t => t.id !== triggerId));
    setSelectedTrigger(null);
  };

  const createTriggerFromTemplate = (template: TriggerTemplate) => {
    const newTrigger: Trigger = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      status: 'inactive',
      event: template.defaultConfig.event || 'custom.event',
      conditions: template.defaultConfig.conditions || [],
      actions: [],
      triggerCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    };
    
    setTriggers(prev => [...prev, newTrigger]);
    setShowCreateModal(false);
    setSelectedTrigger(newTrigger.id);
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const formatLastTriggered = (date?: string) => {
    if (!date) return 'Never';
    const now = new Date();
    const triggered = new Date(date);
    const diffHours = Math.floor((now.getTime() - triggered.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trigger Settings</h1>
            <p className="text-gray-600">Configure automated triggers and conditions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Trigger
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Active Triggers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {triggers.filter(t => t.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Executions</p>
                <p className="text-2xl font-bold text-green-900">
                  {triggers.reduce((sum, t) => sum + t.triggerCount, 0)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(triggers.reduce((sum, t) => sum + t.successRate, 0) / triggers.length * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold text-orange-900">{categories.length}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Trigger List */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b flex items-center gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Trigger List */}
          <div className="divide-y">
            {filteredTriggers.map(trigger => (
              <div
                key={trigger.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTrigger === trigger.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTrigger(trigger.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(trigger.status)}
                      <h3 className="font-semibold text-gray-900">{trigger.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {trigger.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{trigger.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Type: {trigger.type}</span>
                      <span>Executions: {trigger.triggerCount}</span>
                      <span>Success: {Math.round(trigger.successRate * 100)}%</span>
                      <span>Last: {formatLastTriggered(trigger.lastTriggered)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTriggerStatus(trigger.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        trigger.status === 'active' 
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {trigger.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTrigger(trigger);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrigger(trigger.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger Details */}
        <div className="col-span-4 bg-white rounded-lg shadow-sm p-4">
          {selectedTrigger ? (
            <TriggerDetails trigger={triggers.find(t => t.id === selectedTrigger)!} />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a trigger to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Trigger Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Trigger</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {triggerTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => createTriggerFromTemplate(template)}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.type === 'event' ? 'bg-blue-100 text-blue-600' :
                      template.type === 'time' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <template.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {template.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.type === 'event' ? 'bg-blue-100 text-blue-700' :
                          template.type === 'time' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {template.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TriggerDetails({ trigger }: { trigger: Trigger }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{trigger.name}</h3>
        <p className="text-sm text-gray-600">{trigger.description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="capitalize">{trigger.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-mono text-xs">{trigger.event}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`capitalize ${
                trigger.status === 'active' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {trigger.status}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Conditions</h4>
          <div className="space-y-2">
            {trigger.conditions.length > 0 ? (
              trigger.conditions.map((condition, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <span className="font-mono">
                    {condition.field} {condition.operator} {condition.value}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No conditions set</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
          <div className="space-y-2">
            {trigger.actions.length > 0 ? (
              trigger.actions.map((action, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                  <span className="font-mono">{action}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No actions configured</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Executions:</span>
              <span>{trigger.triggerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span>{Math.round(trigger.successRate * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Triggered:</span>
              <span>{trigger.lastTriggered ? new Date(trigger.lastTriggered).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
