"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Settings,
  Play,
  Pause,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Target
} from "lucide-react";

interface AutoTask {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  trigger: TaskTrigger;
  taskTemplate: TaskTemplate;
  assignmentRule: string;
  createdAt: string;
  lastModified: string;
  tasksCreated: number;
  completionRate: number;
}

interface TaskTrigger {
  type: 'lead_created' | 'lead_updated' | 'appointment_scheduled' | 'email_opened' | 'form_submitted' | 'time_based';
  conditions: any[];
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'research' | 'demo' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueIn: number;
  dueUnit: 'minutes' | 'hours' | 'days';
}

interface RecentTask {
  id: string;
  title: string;
  assignee: string;
  leadName: string;
  createdAt: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: string;
}

export default function AutoTasksPage() {
  const [autoTasks, setAutoTasks] = useState<AutoTask[]>([
    {
      id: '1',
      name: 'Call New High-Value Leads',
      description: 'Automatically create call tasks for leads with budget >$40k',
      status: 'active',
      trigger: {
        type: 'lead_created',
        conditions: [
          { field: 'budget', operator: 'greater_than', value: 40000 },
          { field: 'lead_score', operator: 'greater_than', value: 70 }
        ]
      },
      taskTemplate: {
        id: 'call-template-1',
        title: 'Call new high-value lead: {lead_name}',
        description: 'Contact new lead to discuss their vehicle needs and budget',
        type: 'call',
        priority: 'high',
        dueIn: 2,
        dueUnit: 'hours'
      },
      assignmentRule: 'Senior Sales Reps',
      createdAt: '2024-09-15',
      lastModified: '2024-10-12',
      tasksCreated: 67,
      completionRate: 89.5
    },
    {
      id: '2',
      name: 'Follow-up After Test Drive',
      description: 'Create follow-up tasks after customers complete test drives',
      status: 'active',
      trigger: {
        type: 'lead_updated',
        conditions: [
          { field: 'activity_type', operator: 'equals', value: 'test_drive_completed' }
        ],
        delay: 24,
        delayUnit: 'hours'
      },
      taskTemplate: {
        id: 'follow-up-template-1',
        title: 'Follow up on test drive with {lead_name}',
        description: 'Check on test drive experience and discuss next steps',
        type: 'call',
        priority: 'medium',
        dueIn: 1,
        dueUnit: 'days'
      },
      assignmentRule: 'Original Sales Rep',
      createdAt: '2024-08-20',
      lastModified: '2024-10-08',
      tasksCreated: 134,
      completionRate: 76.1
    },
    {
      id: '3',
      name: 'Email Hot Prospects Weekly',
      description: 'Send weekly check-in emails to hot prospects',
      status: 'active',
      trigger: {
        type: 'time_based',
        conditions: [
          { field: 'lead_temperature', operator: 'equals', value: 'hot' },
          { field: 'last_contact', operator: 'older_than', value: '7_days' }
        ]
      },
      taskTemplate: {
        id: 'email-template-1',
        title: 'Weekly check-in with {lead_name}',
        description: 'Send personalized weekly check-in email',
        type: 'email',
        priority: 'medium',
        dueIn: 1,
        dueUnit: 'days'
      },
      assignmentRule: 'Round Robin',
      createdAt: '2024-07-10',
      lastModified: '2024-09-30',
      tasksCreated: 245,
      completionRate: 82.4
    },
    {
      id: '4',
      name: 'Research Company Leads',
      description: 'Research tasks for leads from companies',
      status: 'inactive',
      trigger: {
        type: 'lead_created',
        conditions: [
          { field: 'company', operator: 'is_not_empty', value: null },
          { field: 'lead_type', operator: 'equals', value: 'business' }
        ]
      },
      taskTemplate: {
        id: 'research-template-1',
        title: 'Research company: {company_name}',
        description: 'Research the lead\'s company background and decision makers',
        type: 'research',
        priority: 'low',
        dueIn: 1,
        dueUnit: 'days'
      },
      assignmentRule: 'Junior Sales Reps',
      createdAt: '2024-06-15',
      lastModified: '2024-08-22',
      tasksCreated: 89,
      completionRate: 65.2
    }
  ]);

  const [recentTasks] = useState<RecentTask[]>([
    { id: '1', title: 'Call new high-value lead: Sarah Johnson', assignee: 'Michael Chen', leadName: 'Sarah Johnson', createdAt: '10 minutes ago', dueDate: '2 hours', status: 'pending', priority: 'high' },
    { id: '2', title: 'Follow up on test drive with David Wilson', assignee: 'Lisa Rodriguez', leadName: 'David Wilson', createdAt: '1 hour ago', dueDate: '1 day', status: 'pending', priority: 'medium' },
    { id: '3', title: 'Weekly check-in with Jennifer Thompson', assignee: 'James Anderson', leadName: 'Jennifer Thompson', createdAt: '2 hours ago', dueDate: '1 day', status: 'completed', priority: 'medium' },
    { id: '4', title: 'Research company: Tech Solutions Inc', assignee: 'Sarah Johnson', leadName: 'John Miller', createdAt: '3 hours ago', dueDate: '1 day', status: 'pending', priority: 'low' },
    { id: '5', title: 'Call new high-value lead: Robert Kim', assignee: 'Michael Chen', leadName: 'Robert Kim', createdAt: '5 hours ago', dueDate: 'Overdue', status: 'overdue', priority: 'high' }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('rules');

  const handleToggleRule = (taskId: string) => {
    setAutoTasks(autoTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: task.status === 'active' ? 'inactive' : 'active' };
      }
      return task;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Users;
      case 'follow_up': return CheckCircle;
      case 'research': return FileText;
      case 'demo': return Target;
      default: return CheckCircle;
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'lead_created': return 'New Lead Created';
      case 'lead_updated': return 'Lead Updated';
      case 'appointment_scheduled': return 'Appointment Scheduled';
      case 'email_opened': return 'Email Opened';
      case 'form_submitted': return 'Form Submitted';
      case 'time_based': return 'Time-based';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto Tasks</h1>
          <p className="text-gray-600 mt-1">Automatically create and assign tasks based on triggers and conditions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Auto Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {autoTasks.filter(task => task.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Created Today</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Auto Task Rules ({autoTasks.length})
          </button>
          <button
            onClick={() => setSelectedTab('recent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'recent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Tasks ({recentTasks.length})
          </button>
        </nav>
      </div>

      {/* Auto Task Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          {autoTasks.map((task) => {
            const TaskIcon = getTaskTypeIcon(task.taskTemplate.type);
            return (
              <div key={task.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TaskIcon className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    {/* Trigger Info */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Trigger:</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {getTriggerTypeLabel(task.trigger.type)}
                        </span>
                        {task.trigger.delay && (
                          <span className="text-gray-500">
                            + {task.trigger.delay} {task.trigger.delayUnit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Template Info */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Task Details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type: </span>
                          <span className="capitalize">{task.taskTemplate.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Priority: </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.taskTemplate.priority)}`}>
                            {task.taskTemplate.priority}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due: </span>
                          <span>{task.taskTemplate.dueIn} {task.taskTemplate.dueUnit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Tasks Created</p>
                        <p className="font-semibold text-gray-900">{task.tasksCreated}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completion Rate</p>
                        <p className="font-semibold text-gray-900">{task.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Assignment</p>
                        <p className="font-semibold text-gray-900">{task.assignmentRule}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleRule(task.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {task.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Tasks Tab */}
      {selectedTab === 'recent' && (
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recently Created Tasks</h3>
            <p className="text-gray-600 text-sm mt-1">Tasks automatically created by your auto task rules</p>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>Assigned to: {task.assignee}</span>
                      <span>•</span>
                      <span>Created {task.createdAt}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Auto Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Auto Task Rule</h2>
            
            <form className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="research">Research</option>
                    <option value="demo">Demo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Describe when this auto task should be created"
                />
              </div>

              {/* Trigger Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Trigger Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="lead_created">New Lead Created</option>
                      <option value="lead_updated">Lead Updated</option>
                      <option value="appointment_scheduled">Appointment Scheduled</option>
                      <option value="email_opened">Email Opened</option>
                      <option value="form_submitted">Form Submitted</option>
                      <option value="time_based">Time-based</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Rule</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Senior Sales Reps</option>
                      <option>Round Robin</option>
                      <option>Load Balance</option>
                      <option>Original Sales Rep</option>
                      <option>Custom Assignment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task Template */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Task Template</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Use {lead_name}, {company}, etc. for dynamic values"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due In</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Unit</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Auto Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}