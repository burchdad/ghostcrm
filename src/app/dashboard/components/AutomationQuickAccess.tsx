"use client";

import React from "react";
import { 
  Zap, 
  Play, 
  Settings, 
  Mail, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Activity
} from "lucide-react";

export default function AutomationQuickAccess() {
  const automationStats = {
    activeWorkflows: 18,
    tasksCreated: 432,
    emailsSent: 1284,
    leadsProcessed: 856
  };

  const quickActions = [
    { 
      title: 'Automation Hub', 
      description: 'View all automation',
      icon: Zap,
      href: '/automation',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Workflow Builder', 
      description: 'Create workflows',
      icon: Settings,
      href: '/automation/workflow-builder',
      color: 'bg-green-100 text-green-600'
    },
    { 
      title: 'Email Sequences', 
      description: 'Manage sequences',
      icon: Mail,
      href: '/automation/email-sequences',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      title: 'Auto Tasks', 
      description: 'Task automation',
      icon: CheckCircle,
      href: '/automation/auto-tasks',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="text-blue-600" size={20} />
              Automation Center
            </h3>
            <p className="text-sm text-gray-600 mt-1">Quick access to automation tools</p>
          </div>
          <a
            href="/automation"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
              <Play className="text-blue-600" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{automationStats.activeWorkflows}</p>
            <p className="text-xs text-gray-500">Active Workflows</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{automationStats.tasksCreated}</p>
            <p className="text-xs text-gray-500">Tasks Created</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
              <Mail className="text-purple-600" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{automationStats.emailsSent.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Emails Sent</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
              <Users className="text-orange-600" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{automationStats.leadsProcessed}</p>
            <p className="text-xs text-gray-500">Leads Processed</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="text-green-500" size={14} />
            <span className="text-gray-600">Automation Active</span>
          </div>
          <span className="text-gray-500">Last updated: just now</span>
        </div>
      </div>
    </div>
  );
}