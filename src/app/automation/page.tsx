"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle,
  Users,
  Calendar,
  Filter,
  Plus,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalTriggers: number;
  emailsSent: number;
  tasksCreated: number;
  leadsProcessed: number;
}

interface RecentActivity {
  id: string;
  type: 'workflow' | 'trigger' | 'campaign';
  name: string;
  action: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

export default function AutomationPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats] = useState<AutomationStats>({
    totalWorkflows: 24,
    activeWorkflows: 18,
    totalTriggers: 67,
    emailsSent: 1284,
    tasksCreated: 432,
    leadsProcessed: 856
  });

  const [recentActivity] = useState<RecentActivity[]>([
    { id: '1', type: 'workflow', name: 'New Lead Welcome Sequence', action: 'Executed', timestamp: '2 minutes ago', status: 'success' },
    { id: '2', type: 'trigger', name: 'Email Open Trigger', action: 'Activated', timestamp: '5 minutes ago', status: 'success' },
    { id: '3', type: 'campaign', name: 'Monthly Newsletter', action: 'Sent', timestamp: '15 minutes ago', status: 'success' },
    { id: '4', type: 'workflow', name: 'Lead Scoring Update', action: 'Failed', timestamp: '30 minutes ago', status: 'failed' },
    { id: '5', type: 'trigger', name: 'Appointment Reminder', action: 'Scheduled', timestamp: '1 hour ago', status: 'pending' }
  ]);

  const quickActions = [
    { 
      title: 'Workflow Builder', 
      description: 'Create and manage automated workflows',
      icon: Zap,
      href: '/automation/workflow-builder',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Trigger Settings', 
      description: 'Configure automation triggers',
      icon: Settings,
      href: '/automation/trigger-settings',
      color: 'bg-green-100 text-green-600'
    },
    { 
      title: 'Drip Campaigns', 
      description: 'Set up email drip campaigns',
      icon: Mail,
      href: '/automation/drip-campaigns',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      title: 'Email Sequences', 
      description: 'Create automated email sequences',
      icon: MessageCircle,
      href: '/automation/email-sequences',
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      title: 'Auto Tasks', 
      description: 'Automate task creation and assignment',
      icon: CheckCircle,
      href: '/automation/auto-tasks',
      color: 'bg-teal-100 text-teal-600'
    },
    { 
      title: 'Assign Rules', 
      description: 'Configure lead assignment rules',
      icon: Users,
      href: '/automation/assign-rules',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'pending': return Clock;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Hub</h1>
          <p className="text-gray-600 mt-1">Manage your automated workflows, triggers, and campaigns</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Create Automation
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeWorkflows}</p>
            </div>
            <Play className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Triggers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTriggers}</p>
            </div>
            <Settings className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emailsSent.toLocaleString()}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Created</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tasksCreated}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.leadsProcessed}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 text-sm mt-1">Jump to common automation tasks</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="block p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 text-sm mt-1">Latest automation events and executions</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const StatusIcon = getStatusIcon(activity.status);
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <StatusIcon size={20} className={getStatusColor(activity.status)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{activity.name}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{activity.action}</span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}