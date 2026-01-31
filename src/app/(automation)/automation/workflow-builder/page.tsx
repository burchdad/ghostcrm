"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { 
  Play, 
  Square, 
  Save, 
  Settings, 
  Plus, 
  Trash2, 
  GitBranch,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Filter,
  Zap,
  Database,
  User,
  Calendar,
  Eye,
  Copy,
  Download,
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Edit3,
  X,
  Check,
  AlertCircle,
  FileText,
  Target
} from "lucide-react";

interface Connection {
  from: string;
  to: string;
  type: 'success' | 'failure' | 'default';
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'code' | 'integration';
  title: string;
  description: string;
  icon: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
  connections: string[];
  status?: 'pending' | 'running' | 'success' | 'error';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'testing';
  nodes: WorkflowNode[];
  connections: Connection[];
  lastModified: string;
  createdAt: string;
  executionCount: number;
  successRate: number;
}

const nodeTypes = {
  trigger: [
    // CRM Triggers
    { type: 'new_lead', title: 'New Lead', description: 'When a new lead is created', icon: User, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'lead_updated', title: 'Lead Updated', description: 'When lead information changes', icon: User, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'deal_created', title: 'Deal Created', description: 'When a new deal is created', icon: Target, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'deal_stage', title: 'Deal Stage Change', description: 'When deal stage changes', icon: Target, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'deal_won', title: 'Deal Won', description: 'When a deal is closed won', icon: Target, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'deal_lost', title: 'Deal Lost', description: 'When a deal is closed lost', icon: Target, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    
    // Form & Web Triggers
    { type: 'form_submit', title: 'Form Submission', description: 'When a form is submitted', icon: Database, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'page_visit', title: 'Page Visit', description: 'When someone visits a page', icon: Eye, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'chat_started', title: 'Chat Started', description: 'When a chat session begins', icon: MessageCircle, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    
    // Communication Triggers
    { type: 'email_open', title: 'Email Opened', description: 'When an email is opened', icon: Mail, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'email_click', title: 'Email Clicked', description: 'When an email link is clicked', icon: Mail, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'email_reply', title: 'Email Reply', description: 'When someone replies to email', icon: Mail, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'sms_received', title: 'SMS Received', description: 'When SMS message is received', icon: Phone, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'call_completed', title: 'Call Completed', description: 'When a phone call ends', icon: Phone, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    
    // Time & Schedule Triggers
    { type: 'date_trigger', title: 'Scheduled Date', description: 'At a specific date/time', icon: Calendar, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'recurring_trigger', title: 'Recurring Schedule', description: 'On a recurring schedule', icon: Calendar, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'webhook_trigger', title: 'Webhook', description: 'When webhook is received', icon: Zap, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    
    // Task & Activity Triggers
    { type: 'task_created', title: 'Task Created', description: 'When a task is created', icon: Plus, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'task_completed', title: 'Task Completed', description: 'When a task is completed', icon: Check, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'appointment_scheduled', title: 'Appointment Scheduled', description: 'When appointment is booked', icon: Calendar, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' },
    { type: 'document_uploaded', title: 'Document Uploaded', description: 'When document is uploaded', icon: FileText, category: 'trigger', color: 'bg-green-100 border-green-300 text-green-700' }
  ],
  
  action: [
    // Communication Actions
    { type: 'send_email', title: 'Send Email', description: 'Send automated email', icon: Mail, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'send_sms', title: 'Send SMS', description: 'Send text message', icon: Phone, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'make_call', title: 'Make Call', description: 'Initiate phone call', icon: Phone, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'send_notification', title: 'Send Notification', description: 'Send team notification', icon: MessageCircle, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'send_slack', title: 'Send Slack Message', description: 'Send message to Slack', icon: MessageCircle, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    
    // CRM Actions
    { type: 'create_lead', title: 'Create Lead', description: 'Create new lead', icon: User, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'update_lead', title: 'Update Lead', description: 'Modify lead information', icon: User, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'create_deal', title: 'Create Deal', description: 'Create new deal', icon: Target, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'update_deal', title: 'Update Deal', description: 'Update deal information', icon: Target, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'assign_lead', title: 'Assign Lead', description: 'Assign lead to team member', icon: User, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'add_tag', title: 'Add Tag', description: 'Add tags to record', icon: Plus, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'remove_tag', title: 'Remove Tag', description: 'Remove tags from record', icon: X, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    
    // Task & Activity Actions
    { type: 'create_task', title: 'Create Task', description: 'Create follow-up task', icon: Plus, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'schedule_appointment', title: 'Schedule Appointment', description: 'Book an appointment', icon: Calendar, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'create_reminder', title: 'Create Reminder', description: 'Set up reminder', icon: Clock, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    
    // Data Actions
    { type: 'update_field', title: 'Update Field', description: 'Update custom field', icon: Database, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'calculate_score', title: 'Calculate Score', description: 'Calculate lead score', icon: Target, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'log_activity', title: 'Log Activity', description: 'Log custom activity', icon: FileText, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    
    // Integration Actions
    { type: 'webhook_post', title: 'Send Webhook', description: 'Send HTTP POST request', icon: Zap, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'api_request', title: 'API Request', description: 'Make API call', icon: Zap, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'export_data', title: 'Export Data', description: 'Export to external system', icon: Download, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { type: 'import_data', title: 'Import Data', description: 'Import from external system', icon: Upload, category: 'action', color: 'bg-blue-100 border-blue-300 text-blue-700' }
  ],
  
  condition: [
    // Lead & Deal Conditions
    { type: 'lead_score', title: 'Lead Score', description: 'Check lead score value', icon: Filter, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'deal_value', title: 'Deal Value', description: 'Check deal amount', icon: Target, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'lead_source', title: 'Lead Source', description: 'Check lead source', icon: User, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'deal_stage', title: 'Deal Stage', description: 'Check current deal stage', icon: Target, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    
    // Communication Conditions
    { type: 'email_status', title: 'Email Status', description: 'Check email engagement', icon: Mail, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'sms_status', title: 'SMS Status', description: 'Check SMS status', icon: Phone, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'call_outcome', title: 'Call Outcome', description: 'Check call result', icon: Phone, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    
    // Data Conditions
    { type: 'custom_field', title: 'Custom Field', description: 'Check custom field value', icon: Database, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'tag_exists', title: 'Tag Exists', description: 'Check if tag is present', icon: Plus, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'record_age', title: 'Record Age', description: 'Check how old record is', icon: Clock, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    
    // Time Conditions
    { type: 'time_condition', title: 'Time Condition', description: 'Check time/date conditions', icon: Calendar, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'business_hours', title: 'Business Hours', description: 'Check if within business hours', icon: Clock, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'day_of_week', title: 'Day of Week', description: 'Check current day', icon: Calendar, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    
    // Activity Conditions
    { type: 'task_status', title: 'Task Status', description: 'Check task completion', icon: Plus, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'activity_count', title: 'Activity Count', description: 'Check number of activities', icon: FileText, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { type: 'last_activity', title: 'Last Activity', description: 'Check when last activity occurred', icon: Clock, category: 'condition', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' }
  ],
  
  delay: [
    { type: 'wait_time', title: 'Wait Time', description: 'Wait for specified duration', icon: Clock, category: 'delay', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { type: 'wait_date', title: 'Wait Until Date', description: 'Wait until specific date', icon: Calendar, category: 'delay', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { type: 'wait_condition', title: 'Wait for Condition', description: 'Wait until condition is met', icon: Filter, category: 'delay', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { type: 'wait_business_hours', title: 'Wait for Business Hours', description: 'Wait until business hours', icon: Clock, category: 'delay', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { type: 'wait_response', title: 'Wait for Response', description: 'Wait for email/SMS response', icon: Mail, category: 'delay', color: 'bg-purple-100 border-purple-300 text-purple-700' }
  ],
  
  code: [
    { type: 'javascript_code', title: 'JavaScript Code', description: 'Run custom JavaScript code', icon: FileText, category: 'code', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { type: 'python_code', title: 'Python Code', description: 'Run custom Python script', icon: FileText, category: 'code', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { type: 'sql_query', title: 'SQL Query', description: 'Execute SQL query', icon: Database, category: 'code', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { type: 'formula', title: 'Formula', description: 'Calculate using formula', icon: Target, category: 'code', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { type: 'data_transform', title: 'Data Transform', description: 'Transform data format', icon: RotateCcw, category: 'code', color: 'bg-orange-100 border-orange-300 text-orange-700' }
  ],
  
  integration: [
    { type: 'google_sheets', title: 'Google Sheets', description: 'Add row to Google Sheets', icon: Database, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { type: 'hubspot', title: 'HubSpot', description: 'Sync with HubSpot', icon: Zap, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { type: 'salesforce', title: 'Salesforce', description: 'Sync with Salesforce', icon: Zap, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { type: 'mailchimp', title: 'Mailchimp', description: 'Add to Mailchimp list', icon: Mail, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { type: 'twilio', title: 'Twilio', description: 'Send via Twilio', icon: Phone, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { type: 'zapier', title: 'Zapier Webhook', description: 'Trigger Zapier workflow', icon: Zap, category: 'integration', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' }
  ]
};

export default function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'New Lead Nurturing',
      description: 'Automated follow-up sequence for new leads',
      status: 'active',
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'New Lead',
          description: 'When a new lead is created',
          icon: User,
          position: { x: 100, y: 100 },
          size: { width: 180, height: 80 },
          config: { source: 'website', conditions: [] },
          connections: ['action-1'],
          status: 'success'
        },
        {
          id: 'action-1', 
          type: 'action',
          title: 'Send Welcome Email',
          description: 'Send automated welcome email',
          icon: Mail,
          position: { x: 350, y: 100 },
          size: { width: 180, height: 80 },
          config: { template: 'welcome_template', delay: 0 },
          connections: ['delay-1'],
          status: 'success'
        },
        {
          id: 'delay-1',
          type: 'delay', 
          title: 'Wait 2 Days',
          description: 'Wait for 2 days',
          icon: Clock,
          position: { x: 600, y: 100 },
          size: { width: 180, height: 80 },
          config: { duration: 2, unit: 'days' },
          connections: ['action-2'],
          status: 'running'
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Follow-up Email',
          description: 'Send follow-up email',
          icon: Mail,
          position: { x: 850, y: 100 },
          size: { width: 180, height: 80 },
          config: { template: 'followup_template', personalization: true },
          connections: [],
          status: 'pending'
        }
      ],
      connections: [
        { from: 'trigger-1', to: 'action-1', type: 'default' },
        { from: 'action-1', to: 'delay-1', type: 'success' },
        { from: 'delay-1', to: 'action-2', type: 'default' }
      ],
      lastModified: '2024-10-17T10:30:00Z',
      createdAt: '2024-10-01T10:30:00Z',
      executionCount: 1247,
      successRate: 89.5
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('1');
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('trigger');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showNodeSettings, setShowNodeSettings] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null);
  const [showWorkflowSettings, setShowWorkflowSettings] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentWorkflow = workflows.find(w => w.id === selectedWorkflow);

  const handleNodeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode || !currentWorkflow) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newNode: WorkflowNode = {
      id: `${draggedNode.type}-${Date.now()}`,
      type: draggedNode.category,
      title: draggedNode.title,
      description: draggedNode.description,
      icon: draggedNode.icon,
      position: {
        x: e.clientX - rect.left - 90, // Center the node
        y: e.clientY - rect.top - 40
      },
      size: { width: 180, height: 80 },
      config: {},
      connections: [],
      status: 'pending'
    };

    setWorkflows(prev => prev.map(w => 
      w.id === selectedWorkflow 
        ? { ...w, nodes: [...w.nodes, newNode], lastModified: new Date().toISOString() }
        : w
    ));

    setDraggedNode(null);
  }, [draggedNode, selectedWorkflow, currentWorkflow]);

  const handleNodeDelete = (nodeId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === selectedWorkflow 
        ? { 
            ...w, 
            nodes: w.nodes.filter(n => n.id !== nodeId)
              .map(n => ({ ...n, connections: n.connections.filter(c => c !== nodeId) }))
          }
        : w
    ));
    setSelectedNode(null);
  };

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
  };

  const createNewWorkflow = () => {
    const now = new Date().toISOString();
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: 'Description for new workflow',
      status: 'draft',
      nodes: [],
      connections: [],
      lastModified: now,
      createdAt: now,
      executionCount: 0,
      successRate: 0
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow.id);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Workflow Builder</h1>
                <p className="text-slate-600 text-sm">Create and manage automated workflows</p>
              </div>
              
              {currentWorkflow && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div>
                    <h2 className="font-semibold text-slate-900">{currentWorkflow.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        currentWorkflow.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : currentWorkflow.status === 'inactive'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {currentWorkflow.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {currentWorkflow.nodes.length} steps • {currentWorkflow.executionCount.toLocaleString()} runs
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mr-3 border-r border-slate-200 pr-3">
                <button 
                  title="Undo"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  title="Copy Workflow"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  title="Export"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              {/* Primary Actions */}
              <button
                onClick={createNewWorkflow}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Workflow
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              {currentWorkflow && (
                <button
                  onClick={() => toggleWorkflowStatus(currentWorkflow.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                    currentWorkflow.status === 'active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {currentWorkflow.status === 'active' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {currentWorkflow.status === 'active' ? 'Stop' : 'Start'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6">
        {/* Compact Workflow List Sidebar */}
        <div className="w-72 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Workflows</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {workflows.length}
              </span>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search workflows..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Eye className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    selectedWorkflow === workflow.id 
                      ? 'bg-blue-50 border-blue-200 border shadow-sm' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{workflow.name}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{workflow.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          workflow.status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : workflow.status === 'inactive'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {workflow.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {workflow.nodes.length} steps
                        </span>
                        <span className="text-xs text-slate-500">
                          {workflow.successRate}% success
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkflowStatus(workflow.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          workflow.status === 'active' 
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={workflow.status === 'active' ? 'Stop workflow' : 'Start workflow'}
                      >
                        {workflow.status === 'active' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button 
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Workflow settings"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Workflow Stats */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {workflows.filter(w => w.status === 'active').length}
                </div>
                <div className="text-xs text-slate-600">Active</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {workflows.reduce((sum, w) => sum + w.executionCount, 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-600">Total Runs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Canvas Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Modern Canvas Toolbar */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-slate-900">
                  {currentWorkflow?.name || 'Select a workflow to start building'}
                </h3>
                {currentWorkflow && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNodeModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Step
                    </button>
                  </div>
                )}
              </div>
              
              {currentWorkflow && (
                <div className="flex items-center gap-2">
                  {/* Canvas Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.25))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 text-sm font-medium text-slate-700 min-w-[3rem] text-center">
                      {Math.round(canvasZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setCanvasZoom(Math.min(2, canvasZoom + 0.25))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button 
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Center Canvas"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Test Workflow"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Canvas */}
          <div className="relative flex-1 overflow-hidden">
            {currentWorkflow ? (
              <div
                ref={canvasRef}
                className="w-full h-full relative overflow-auto"
                onDrop={handleNodeDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ 
                  minHeight: '600px',
                  background: `
                    radial-gradient(circle at 1px 1px, rgba(100,116,139,0.15) 1px, transparent 0),
                    linear-gradient(to right, rgba(100,116,139,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(100,116,139,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px, 20px 20px, 20px 20px',
                  backgroundPosition: '0 0, 0 0, 0 0'
                }}
              >
                {/* Enhanced Workflow Nodes */}
                {currentWorkflow?.nodes.map(node => (
                  <div
                    key={node.id}
                    className={`absolute bg-white rounded-xl shadow-lg border-2 p-4 cursor-move transition-all duration-200 min-w-48 ${
                      selectedNode === node.id 
                        ? 'border-blue-400 shadow-blue-200 shadow-xl' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xl'
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      transform: `scale(${canvasZoom})`
                    }}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        node.type === 'trigger' ? 'bg-green-100 text-green-600 border border-green-200' :
                        node.type === 'action' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
                        node.type === 'condition' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                        node.type === 'delay' ? 'bg-purple-100 text-purple-600 border border-purple-200' :
                        node.type === 'code' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                        'bg-indigo-100 text-indigo-600 border border-indigo-200'
                      }`}>
                        <node.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{node.title}</h4>
                        <p className="text-sm text-slate-600">{node.description}</p>
                        {node.status && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className={`w-2 h-2 rounded-full ${
                              node.status === 'success' ? 'bg-green-400' :
                              node.status === 'running' ? 'bg-blue-400' :
                              node.status === 'error' ? 'bg-red-400' :
                              'bg-slate-300'
                            }`} />
                            <span className="text-xs text-slate-500 capitalize">{node.status}</span>
                          </div>
                        )}
                      </div>
                      {selectedNode === node.id && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNodeSettings(node.id);
                            }}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit settings"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNodeDelete(node.id);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete node"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Enhanced Connection Lines */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {currentWorkflow?.nodes.map(node => 
                    node.connections.map(connectionId => {
                      const targetNode = currentWorkflow?.nodes.find(n => n.id === connectionId);
                      if (!targetNode) return null;

                      const startX = node.position.x + 192;
                      const startY = node.position.y + 40;
                      const endX = targetNode.position.x;
                      const endY = targetNode.position.y + 40;
                      
                      const midX = startX + (endX - startX) / 2;

                      return (
                        <g key={`${node.id}-${connectionId}`}>
                          <path
                            d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                            stroke="#3B82F6"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            className="drop-shadow-sm"
                          />
                        </g>
                      );
                    })
                  )}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="8"
                      markerHeight="6" 
                      refX="7"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path
                        d="M0,0 L0,6 L8,3 z"
                        fill="#3B82F6"
                      />
                    </marker>
                  </defs>
                </svg>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Workflow Selected</h3>
                  <p className="text-slate-600 mb-4">Choose a workflow from the sidebar to start building</p>
                  <button
                    onClick={createNewWorkflow}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Workflow
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Selection Modal */}
      {showNodeModal && (
        <NodeSelectionModal
          isOpen={showNodeModal}
          onClose={() => setShowNodeModal(false)}
          onSelectNode={(node, category) => {
            setDraggedNode({ ...node, category });
            setShowNodeModal(false);
            
            // Auto-add node to center of canvas if workflow is selected
            if (currentWorkflow) {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const newNode: WorkflowNode = {
                  id: `${node.type}-${Date.now()}`,
                  type: category as any,
                  title: node.title,
                  description: node.description,
                  icon: node.icon,
                  position: {
                    x: (rect.width / 2) - 90,
                    y: (rect.height / 2) - 40
                  },
                  size: { width: 180, height: 80 },
                  config: {},
                  connections: [],
                  status: 'pending'
                };

                setWorkflows(prev => prev.map(w => 
                  w.id === selectedWorkflow 
                    ? { ...w, nodes: [...w.nodes, newNode], lastModified: new Date().toISOString() }
                    : w
                ));
              }
            }
          }}
          nodeTypes={nodeTypes}
        />
      )}

      {/* Node Settings Modal */}
      {showNodeSettings && currentWorkflow && (
        <NodeSettingsModal 
          node={currentWorkflow.nodes.find(n => n.id === showNodeSettings)!}
          onClose={() => setShowNodeSettings(null)}
          onSave={(updates) => {
            setWorkflows(prev => prev.map(w => 
              w.id === selectedWorkflow 
                ? {
                    ...w,
                    nodes: w.nodes.map(n => 
                      n.id === showNodeSettings ? { ...n, ...updates } : n
                    )
                  }
                : w
            ));
            setShowNodeSettings(null);
          }}
        />
      )}

      {/* Workflow Settings Modal */}
      {showWorkflowSettings && currentWorkflow && (
        <WorkflowSettingsModal 
          workflow={currentWorkflow}
          onClose={() => setShowWorkflowSettings(false)}
          onSave={(updates) => {
            setWorkflows(prev => prev.map(w => 
              w.id === selectedWorkflow ? { ...w, ...updates } : w
            ));
            setShowWorkflowSettings(false);
          }}
        />
      )}
    </div>
  );
}

// Node Settings Modal Component
function NodeSettingsModal({ 
  node, 
  onClose, 
  onSave 
}: { 
  node: WorkflowNode;
  onClose: () => void;
  onSave: (updates: Partial<WorkflowNode>) => void;
}) {
  const [config, setConfig] = useState(node.config);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Configure {node.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {node.type === 'trigger' && (
            <TriggerSettings config={config} onChange={setConfig} />
          )}
          {node.type === 'action' && (
            <ActionSettings config={config} onChange={setConfig} />
          )}
          {node.type === 'condition' && (
            <ConditionSettings config={config} onChange={setConfig} />
          )}
          {node.type === 'delay' && (
            <DelaySettings config={config} onChange={setConfig} />
          )}
          {node.type === 'code' && (
            <CodeSettings config={config} onChange={setConfig} />
          )}
          {node.type === 'integration' && (
            <IntegrationSettings config={config} onChange={setConfig} />
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ config })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Workflow Settings Modal Component
function WorkflowSettingsModal({ 
  workflow, 
  onClose, 
  onSave 
}: { 
  workflow: Workflow;
  onClose: () => void;
  onSave: (updates: Partial<Workflow>) => void;
}) {
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [status, setStatus] = useState(workflow.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Workflow Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, description, status })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Configuration Components
function TriggerSettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Source</label>
        <select
          value={config.source || ''}
          onChange={(e) => onChange({ ...config, source: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select source...</option>
          <option value="website">Website Form</option>
          <option value="api">API Call</option>
          <option value="email">Email Received</option>
          <option value="manual">Manual Entry</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">Scheduled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filters (JSON)</label>
        <textarea
          value={JSON.stringify(config.filters || [], null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange({ ...config, filters: parsed });
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          placeholder='["lead_score > 50", "source = website"]'
          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Conditions</label>
        <textarea
          value={config.additionalConditions || ''}
          onChange={(e) => onChange({ ...config, additionalConditions: e.target.value })}
          placeholder="Enter any additional conditions..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none text-sm"
        />
      </div>
    </div>
  );
}

function ActionSettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
        <select
          value={config.actionType || ''}
          onChange={(e) => onChange({ ...config, actionType: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select action type...</option>
          <option value="email">Send Email</option>
          <option value="sms">Send SMS</option>
          <option value="task">Create Task</option>
          <option value="notification">Send Notification</option>
          <option value="webhook">Send Webhook</option>
          <option value="api">API Request</option>
        </select>
      </div>

      {config.actionType === 'email' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
            <select
              value={config.template || ''}
              onChange={(e) => onChange({ ...config, template: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select template...</option>
              <option value="welcome_template">Welcome Email</option>
              <option value="followup_template">Follow-up Email</option>
              <option value="promotional_template">Promotional Email</option>
              <option value="reengagement_template">Re-engagement Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
            <input
              type="text"
              value={config.subject || ''}
              onChange={(e) => onChange({ ...config, subject: e.target.value })}
              placeholder="Email subject line..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.personalization || false}
                onChange={(e) => onChange({ ...config, personalization: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Enable personalization</span>
            </label>
          </div>
        </>
      )}

      {config.actionType === 'webhook' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="url"
              value={config.webhookUrl || ''}
              onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
            <select
              value={config.method || 'POST'}
              onChange={(e) => onChange({ ...config, method: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payload (JSON)</label>
            <textarea
              value={JSON.stringify(config.payload || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange({ ...config, payload: parsed });
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"lead_id": "{{lead.id}}", "name": "{{lead.name}}"}'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none text-sm font-mono"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <select
          value={config.priority || 'medium'}
          onChange={(e) => onChange({ ...config, priority: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>
  );
}

function ConditionSettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition Type</label>
        <select
          value={config.conditionType || ''}
          onChange={(e) => onChange({ ...config, conditionType: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select condition type...</option>
          <option value="field_value">Field Value</option>
          <option value="lead_score">Lead Score</option>
          <option value="email_engagement">Email Engagement</option>
          <option value="time_based">Time Based</option>
          <option value="custom">Custom Logic</option>
        </select>
      </div>

      {config.conditionType === 'field_value' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
            <select
              value={config.field || ''}
              onChange={(e) => onChange({ ...config, field: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select field...</option>
              <option value="lead_score">Lead Score</option>
              <option value="lead_source">Lead Source</option>
              <option value="deal_value">Deal Value</option>
              <option value="custom_field">Custom Field</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
            <select
              value={config.operator || ''}
              onChange={(e) => onChange({ ...config, operator: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select operator...</option>
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="contains">Contains</option>
              <option value="starts_with">Starts With</option>
              <option value="ends_with">Ends With</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input
              type="text"
              value={config.value || ''}
              onChange={(e) => onChange({ ...config, value: e.target.value })}
              placeholder="Comparison value..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </>
      )}

      {config.conditionType === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Logic Expression</label>
          <textarea
            value={config.customLogic || ''}
            onChange={(e) => onChange({ ...config, customLogic: e.target.value })}
            placeholder="lead.score > 80 && lead.source === 'website'"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none text-sm font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use JavaScript-like expressions. Available variables: lead, deal, contact
          </p>
        </div>
      )}
    </div>
  );
}

function DelaySettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <input
            type="number"
            value={config.duration || ''}
            onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) })}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <select
            value={config.unit || 'hours'}
            onChange={(e) => onChange({ ...config, unit: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.businessHours || false}
            onChange={(e) => onChange({ ...config, businessHours: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Only during business hours</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.skipWeekends || false}
            onChange={(e) => onChange({ ...config, skipWeekends: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Skip weekends</span>
        </label>
      </div>

      {config.businessHours && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={config.startTime || '09:00'}
              onChange={(e) => onChange({ ...config, startTime: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={config.endTime || '17:00'}
              onChange={(e) => onChange({ ...config, endTime: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CodeSettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Code Language</label>
        <select
          value={config.language || 'javascript'}
          onChange={(e) => onChange({ ...config, language: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
          <option value="formula">Formula</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code Editor
          <span className="text-xs text-gray-500 ml-2">
            Available variables: input, lead, deal, contact
          </span>
        </label>
        <div className="border border-gray-300 rounded-lg">
          <textarea
            value={config.code || getDefaultCode(config.language || 'javascript')}
            onChange={(e) => onChange({ ...config, code: e.target.value })}
            className="w-full px-3 py-2 h-64 resize-none text-sm font-mono border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your code here..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Input Variables</label>
        <textarea
          value={JSON.stringify(config.inputVariables || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange({ ...config, inputVariables: parsed });
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"leadId": "{{lead.id}}", "score": "{{lead.score}}"}'
          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Output Variable Name</label>
        <input
          type="text"
          value={config.outputVariable || 'result'}
          onChange={(e) => onChange({ ...config, outputVariable: e.target.value })}
          placeholder="Variable name to store the result"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.continueOnError || false}
            onChange={(e) => onChange({ ...config, continueOnError: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Continue workflow on error</span>
        </label>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Code Examples:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div><strong>JavaScript:</strong> return input.score * 2;</div>
          <div><strong>Python:</strong> result = input['score'] * 2</div>
          <div><strong>SQL:</strong> SELECT COUNT(*) FROM leads WHERE score &gt; input.minScore</div>
          <div><strong>Formula:</strong> MULTIPLY(score, 2)</div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSettings({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Integration Platform</label>
        <select
          value={config.platform || ''}
          onChange={(e) => onChange({ ...config, platform: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select platform...</option>
          <option value="hubspot">HubSpot</option>
          <option value="salesforce">Salesforce</option>
          <option value="mailchimp">Mailchimp</option>
          <option value="google_sheets">Google Sheets</option>
          <option value="twilio">Twilio</option>
          <option value="zapier">Zapier</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">API Credentials</label>
        <div className="space-y-3">
          <input
            type="text"
            value={config.apiKey || ''}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            placeholder="API Key"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="password"
            value={config.apiSecret || ''}
            onChange={(e) => onChange({ ...config, apiSecret: e.target.value })}
            placeholder="API Secret (if required)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint/Action</label>
        <input
          type="text"
          value={config.endpoint || ''}
          onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
          placeholder="API endpoint or action name"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Field Mapping</label>
        <textarea
          value={JSON.stringify(config.fieldMapping || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange({ ...config, fieldMapping: parsed });
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"external_field": "{{lead.field}}", "email": "{{lead.email}}"}'
          className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none text-sm font-mono"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.testMode || false}
            onChange={(e) => onChange({ ...config, testMode: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Test mode (sandbox)</span>
        </label>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Security Notice:</h4>
        <p className="text-sm text-yellow-800">
          API credentials are encrypted and stored securely. Test your integration before activating the workflow.
        </p>
      </div>
    </div>
  );
}

function getDefaultCode(language: string): string {
  switch (language) {
    case 'javascript':
      return `// Available variables: input, lead, deal, contact
// Return the result or modify the input object
return {
  score: input.score * 2,
  message: "Score doubled"
};`;
    case 'python':
      return `# Available variables: input, lead, deal, contact
# Set the result variable
result = {
    "score": input["score"] * 2,
    "message": "Score doubled"
}`;
    case 'sql':
      return `-- Available variables can be referenced as input.variableName
SELECT 
  COUNT(*) as total_leads,
  AVG(score) as avg_score
FROM leads 
WHERE created_at > input.start_date;`;
    case 'formula':
      return `MULTIPLY(score, 2)`;
    default:
      return '';
  }
}

// Node Selection Modal Component
function NodeSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectNode, 
  nodeTypes 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (node: any, category: string) => void;
  nodeTypes: any;
}) {
  const [selectedCategory, setSelectedCategory] = useState('trigger');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodeTypes[selectedCategory]?.filter((node: any) =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Workflow Step</h2>
              <p className="text-slate-600 mt-1">Choose from our library of automation steps</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search workflow steps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Filter className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex gap-2">
            {Object.keys(nodeTypes).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
                  selectedCategory === category 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {category}s
                <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  {nodeTypes[category]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Node Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes.map((node: any) => (
              <button
                key={node.type}
                onClick={() => onSelectNode(node, selectedCategory)}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg transition-colors ${
                    selectedCategory === 'trigger' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' :
                    selectedCategory === 'action' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' :
                    selectedCategory === 'condition' ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' :
                    selectedCategory === 'delay' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' :
                    selectedCategory === 'code' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-200' :
                    'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                  }`}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-900">
                      {node.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {node.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {filteredNodes.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No steps found</h3>
              <p className="text-slate-600">Try adjusting your search or browse different categories</p>
            </div>
          )}
        </div>

        {/* Quick Templates Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <h4 className="font-semibold text-slate-900 mb-3">Quick Start Templates</h4>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Lead Nurturing</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Follow-up Calls</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Deal Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
