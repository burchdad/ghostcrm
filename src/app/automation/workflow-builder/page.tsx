"use client";

import React, { useState, useCallback, useRef } from "react";
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
  Calendar
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  description: string;
  icon: any;
  position: { x: number; y: number };
  config?: any;
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  nodes: WorkflowNode[];
  lastModified: string;
}

const nodeTypes = {
  trigger: [
    { type: 'new_lead', title: 'New Lead', description: 'When a new lead is created', icon: User },
    { type: 'form_submit', title: 'Form Submission', description: 'When a form is submitted', icon: Database },
    { type: 'email_open', title: 'Email Opened', description: 'When an email is opened', icon: Mail },
    { type: 'date_trigger', title: 'Date/Time', description: 'At a specific date/time', icon: Calendar }
  ],
  action: [
    { type: 'send_email', title: 'Send Email', description: 'Send automated email', icon: Mail },
    { type: 'send_sms', title: 'Send SMS', description: 'Send text message', icon: Phone },
    { type: 'create_task', title: 'Create Task', description: 'Create follow-up task', icon: Plus },
    { type: 'update_lead', title: 'Update Lead', description: 'Modify lead information', icon: User },
    { type: 'send_notification', title: 'Send Notification', description: 'Send team notification', icon: MessageCircle }
  ],
  condition: [
    { type: 'lead_score', title: 'Lead Score', description: 'Check lead score value', icon: Filter },
    { type: 'email_status', title: 'Email Status', description: 'Check email engagement', icon: Mail },
    { type: 'custom_field', title: 'Custom Field', description: 'Check custom field value', icon: Database }
  ],
  delay: [
    { type: 'wait_time', title: 'Wait Time', description: 'Wait for specified duration', icon: Clock },
    { type: 'wait_date', title: 'Wait Until Date', description: 'Wait until specific date', icon: Calendar }
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
          connections: ['action-1']
        },
        {
          id: 'action-1', 
          type: 'action',
          title: 'Send Welcome Email',
          description: 'Send automated welcome email',
          icon: Mail,
          position: { x: 300, y: 100 },
          connections: ['delay-1']
        },
        {
          id: 'delay-1',
          type: 'delay', 
          title: 'Wait 2 Days',
          description: 'Wait for 2 days',
          icon: Clock,
          position: { x: 500, y: 100 },
          connections: ['action-2']
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Follow-up Email',
          description: 'Send follow-up email',
          icon: Mail,
          position: { x: 700, y: 100 },
          connections: []
        }
      ],
      lastModified: '2024-01-15T10:30:00Z'
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('1');
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
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
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      },
      connections: []
    };

    setWorkflows(prev => prev.map(w => 
      w.id === selectedWorkflow 
        ? { ...w, nodes: [...w.nodes, newNode] }
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
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: 'Description for new workflow',
      status: 'draft',
      nodes: [],
      lastModified: new Date().toISOString()
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
                      'bg-purple-100 text-purple-600'
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
                            'bg-purple-100 text-purple-600'
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
    </div>
  );
}