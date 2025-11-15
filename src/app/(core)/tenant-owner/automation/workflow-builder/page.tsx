"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Play,
  Settings,
  Mail,
  Users,
  Clock,
  CheckCircle,
  Zap,
  Plus,
  Trash2,
  Copy,
  AlertTriangle
} from "lucide-react";
import './workflow-builder.css';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description: string;
  config: any;
}

interface WorkflowData {
  name: string;
  description: string;
  type: 'email' | 'task' | 'lead' | 'follow-up';
  status: 'draft' | 'active' | 'paused';
  steps: WorkflowStep[];
}

export default function WorkflowBuilderPage() {
  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    steps: []
  });
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check if we're editing an existing workflow
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      setIsEditMode(true);
      // In a real app, fetch the workflow data here
      // For now, set some default data
      setWorkflow({
        name: 'Edit Workflow',
        description: 'This workflow is being edited',
        type: 'email',
        status: 'draft',
        steps: []
      });
    }
  }, []);

  const addStep = (type: WorkflowStep['type']) => {
    const stepTemplates = {
      trigger: {
        title: 'New Trigger',
        description: 'When something happens',
        config: { event: '', conditions: [] }
      },
      condition: {
        title: 'Check Condition',
        description: 'If something is true',
        config: { field: '', operator: 'equals', value: '' }
      },
      action: {
        title: 'Take Action',
        description: 'Do something',
        config: { actionType: '', parameters: {} }
      },
      delay: {
        title: 'Wait',
        description: 'Wait for a period',
        config: { duration: 1, unit: 'hours' }
      }
    };

    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type,
      ...stepTemplates[type]
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const saveWorkflow = async () => {
    setSaving(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch('/api/automation/workflows', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflow,
          triggers: workflow.steps
            .filter(step => step.type === 'trigger')
            .map(step => step.title)
        }),
      });

      if (response.ok) {
        // Redirect back to automation hub
        window.location.href = '/tenant-owner/automation';
      } else {
        console.error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger': return Zap;
      case 'condition': return Settings;
      case 'action': return CheckCircle;
      case 'delay': return Clock;
      default: return Settings;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/tenant-owner/automation'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Workflow' : 'Workflow Builder'}
              </h1>
              <p className="text-gray-600">Create automated workflows to streamline your processes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={saveWorkflow}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Workflow'}
            </button>
            {workflow.status !== 'active' && (
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Play size={18} />
                Activate
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={workflow.description}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what this workflow does"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={workflow.type}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email Automation</option>
                    <option value="task">Task Automation</option>
                    <option value="lead">Lead Management</option>
                    <option value="follow-up">Follow-up Sequence</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step Library */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Add Steps</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => addStep('trigger')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Trigger</div>
                    <div className="text-sm text-gray-600">Start the workflow</div>
                  </div>
                </button>

                <button
                  onClick={() => addStep('condition')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Condition</div>
                    <div className="text-sm text-gray-600">Check if something is true</div>
                  </div>
                </button>

                <button
                  onClick={() => addStep('action')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Action</div>
                    <div className="text-sm text-gray-600">Do something</div>
                  </div>
                </button>

                <button
                  onClick={() => addStep('delay')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Delay</div>
                    <div className="text-sm text-gray-600">Wait for a period</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6 min-h-96">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Workflow Steps</h3>
                {workflow.steps.length === 0 && (
                  <p className="text-sm text-gray-500">Add steps from the library to build your workflow</p>
                )}
              </div>

              {workflow.steps.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                    <p className="text-gray-600 mb-4">Add triggers, conditions, and actions to automate your processes</p>
                    <button
                      onClick={() => addStep('trigger')}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} />
                      Add Your First Trigger
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflow.steps.map((step, index) => {
                    const StepIcon = getStepIcon(step.type);
                    return (
                      <div key={step.id} className="relative">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-lg border">
                                <StepIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                                  className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                                />
                                <textarea
                                  value={step.description}
                                  onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                  className="text-sm text-gray-600 bg-transparent border-none p-0 mt-1 w-full resize-none focus:outline-none focus:ring-0"
                                  rows={2}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => removeStep(step.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow connecting steps */}
                        {index < workflow.steps.length - 1 && (
                          <div className="flex justify-center py-2">
                            <div className="w-px h-6 bg-gray-300"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}