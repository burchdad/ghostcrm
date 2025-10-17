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
  const [showNodePalette, setShowNodePalette] = useState(true);
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
    <div className="p-6 h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
            <p className="text-gray-600">Create and manage automated workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createNewWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Workflow List Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Workflows</h3>
          <div className="space-y-2">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedWorkflow === workflow.id 
                    ? 'bg-blue-50 border-blue-200 border' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        workflow.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : workflow.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {workflow.nodes.length} steps
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflowStatus(workflow.id);
                      }}
                      className={`p-1 rounded ${
                        workflow.status === 'active' 
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {workflow.status === 'active' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm">
          {/* Canvas Toolbar */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-900">
                {currentWorkflow?.name || 'Select a workflow'}
              </h3>
              {currentWorkflow && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentWorkflow.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : currentWorkflow.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentWorkflow.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNodePalette(!showNodePalette)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative flex-1 overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full bg-gray-50 relative overflow-auto"
              onDrop={handleNodeDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ minHeight: '600px' }}
            >
              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Workflow Nodes */}
              {currentWorkflow?.nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute bg-white rounded-lg shadow-md border-2 p-4 cursor-move min-w-48 ${
                    selectedNode === node.id ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      node.type === 'trigger' ? 'bg-green-100 text-green-600' :
                      node.type === 'action' ? 'bg-blue-100 text-blue-600' :
                      node.type === 'condition' ? 'bg-yellow-100 text-yellow-600' :
                      node.type === 'delay' ? 'bg-purple-100 text-purple-600' :
                      node.type === 'code' ? 'bg-orange-100 text-orange-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      <node.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{node.title}</h4>
                      <p className="text-sm text-gray-600">{node.description}</p>
                    </div>
                    {selectedNode === node.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeDelete(node.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {currentWorkflow?.nodes.map(node => 
                  node.connections.map(connectionId => {
                    const targetNode = currentWorkflow.nodes.find(n => n.id === connectionId);
                    if (!targetNode) return null;

                    const startX = node.position.x + 192; // node width/2 + offset
                    const startY = node.position.y + 32; // node height/2
                    const endX = targetNode.position.x;
                    const endY = targetNode.position.y + 32;

                    return (
                      <line
                        key={`${node.id}-${connectionId}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })
                )}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7" 
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#3B82F6"
                    />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Node Palette */}
        {showNodePalette && (
          <div className="w-80 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Steps</h3>
              <button
                onClick={() => setShowNodePalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(nodeTypes).map(([category, nodes]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-700 mb-2 capitalize">{category}s</h4>
                  <div className="space-y-2">
                    {nodes.map(node => (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={() => setDraggedNode({ ...node, category })}
                        className="p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            category === 'trigger' ? 'bg-green-100 text-green-600' :
                            category === 'action' ? 'bg-blue-100 text-blue-600' :
                            category === 'condition' ? 'bg-yellow-100 text-yellow-600' :
                            category === 'delay' ? 'bg-purple-100 text-purple-600' :
                            category === 'code' ? 'bg-orange-100 text-orange-600' :
                            'bg-indigo-100 text-indigo-600'
                          }`}>
                            <node.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{node.title}</h5>
                            <p className="text-sm text-gray-600">{node.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Node Settings Modal */}
      {showNodeSettings && (
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
      {showWorkflowSettings && (
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