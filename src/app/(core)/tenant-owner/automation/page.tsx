"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Settings,
  Mail,
  MessageCircle,
  Users,
  Clock,
  Filter,
  Plus,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Workflow,
  ChevronDown,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  Loader
} from "lucide-react";
import './automation.css';

interface WorkflowCard {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  type: "email" | "task" | "lead" | "follow-up";
  lastRun: string;
  successRate: number;
  totalRuns: number;
  triggers: string[];
}

interface RecentActivity {
  id: string;
  type: "workflow" | "trigger" | "campaign";
  name: string;
  action: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
}

const quickActions = [
  {
    title: "Workflow Builder",
    description: "Create and manage automated workflows",
    icon: Zap,
    href: "/tenant-owner/automation/workflow-builder",
    color: "text-blue-600",
  },
  {
    title: "Trigger Settings",
    description: "Configure automation triggers",
    icon: Settings,
    href: "/tenant-owner/automation/trigger-settings",
    color: "text-green-600",
  },
  {
    title: "Drip Campaigns",
    description: "Set up email drip campaigns",
    icon: Mail,
    href: "/tenant-owner/automation/drip-campaigns",
    color: "text-purple-600",
  },
  {
    title: "Email Sequences",
    description: "Create automated email sequences",
    icon: MessageCircle,
    href: "/tenant-owner/automation/email-sequences",
    color: "text-orange-600",
  },
  {
    title: "Auto Tasks",
    description: "Automate task creation and assignment",
    icon: CheckCircle,
    href: "/tenant-owner/automation/auto-tasks",
    color: "text-teal-600",
  },
  {
    title: "Assign Rules",
    description: "Configure lead assignment rules",
    icon: Users,
    href: "/tenant-owner/automation/assign-rules",
    color: "text-indigo-600",
  },
];

const getStatusColor = (status: WorkflowCard["status"]) => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50 border-green-200";
    case "paused":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "draft":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getTypeIcon = (type: WorkflowCard["type"]) => {
  switch (type) {
    case "email":
      return Mail;
    case "task":
      return CheckCircle;
    case "lead":
      return Users;
    case "follow-up":
      return Clock;
    default:
      return Workflow;
  }
};

const getActivityStatusColor = (status: RecentActivity["status"]) => {
  switch (status) {
    case "success":
      return "text-green-600";
    case "failed":
      return "text-red-600";
    case "pending":
      return "text-amber-600";
    default:
      return "text-gray-600";
  }
};

const getActivityStatusIcon = (status: RecentActivity["status"]) => {
  switch (status) {
    case "success":
      return CheckCircle;
    case "failed":
      return AlertTriangle;
    case "pending":
      return Clock;
    default:
      return Activity;
  }
};

export default function TenantOwnerAutomationPage() {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflows from API
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/automation/workflows');
        const data = await response.json();
        
        if (response.ok) {
          setWorkflows(data.workflows || []);
        } else {
          setError(data.error || 'Failed to fetch workflows');
        }
      } catch (err) {
        setError('Failed to fetch workflows');
        console.error('Error fetching workflows:', err);
      }
    };

    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/automation/activity');
        const data = await response.json();
        
        if (response.ok) {
          setRecentActivity(data.activity || []);
        } else {
          console.error('Failed to fetch activity:', data.error);
        }
      } catch (err) {
        console.error('Error fetching activity:', err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchWorkflows(), fetchActivity()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Handle workflow status toggle
  const handleStatusToggle = async (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const response = await fetch('/api/automation/workflows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: workflowId,
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update local state
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(workflow =>
            workflow.id === workflowId
              ? { ...workflow, status: newStatus as WorkflowCard['status'] }
              : workflow
          )
        );
      } else {
        console.error('Failed to update workflow status');
      }
    } catch (err) {
      console.error('Error updating workflow status:', err);
    }
  };

  // Handle create new workflow
  const handleCreateWorkflow = () => {
    window.location.href = '/tenant-owner/automation/workflow-builder';
  };

  if (loading) {
    return (
      <div className="automation-page">
        <div className="loading-container">
          <Loader className="h-6 w-6" style={{ 
            animation: 'spin 1s linear infinite',
            color: 'white'
          }} />
          <span className="text-white">Loading automation hub...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="automation-page">
        <div className="error-container">
          <AlertTriangle className="h-12 w-12" style={{ 
            color: '#ef4444',
            marginBottom: '16px'
          }} />
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '8px'
          }}>
            Error Loading Automation Hub
          </h2>
          <p className="text-gray-300" style={{ 
            marginBottom: '24px',
            fontSize: '16px'
          }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="automation-page">

      <div className="automation-container">
        {/* Header with Quick Actions Dropdown */}
        <div className="header-glass">
          <div className="header-content">
            <div className="header-left">
              <div className="header-title-section">
                <div className="header-icon">
                  <Bot className="h-6 w-6" />
                </div>
                <h1 className="header-title">
                  Automation Hub
                </h1>
              </div>
              <p className="header-subtitle">
                Manage and monitor your automated workflows
              </p>
            </div>

            <div className="header-actions">
              {/* Quick Actions Dropdown */}
              <div className="quick-actions-container">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="btn-secondary"
                >
                  <Zap size={18} />
                  Quick Actions
                  <ChevronDown
                    size={16}
                    className={`chevron ${showQuickActions ? 'rotated' : ''}`}
                  />
                </button>

                {showQuickActions && (
                  <div className="quick-actions-dropdown">
                    <div className="dropdown-header">
                      <h3 className="dropdown-title">
                        Quick Actions
                      </h3>
                      <p className="dropdown-subtitle">
                        Jump to automation tools
                      </p>
                    </div>
                    <div>
                      {quickActions.map((action) => (
                        <a
                          key={action.title}
                          href={action.href}
                          className="dropdown-item"
                          onClick={() => setShowQuickActions(false)}
                        >
                          <div className="icon-wrapper">
                            <action.icon size={18} />
                          </div>
                          <div className="dropdown-item-content">
                            <div className="dropdown-item-title">
                              {action.title}
                            </div>
                            <div className="dropdown-item-description">
                              {action.description}
                            </div>
                          </div>
                          <ArrowRight size={16} className="dropdown-arrow" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCreateWorkflow}
                className="btn-primary"
              >
                <Plus size={20} />
                Create Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Active Workflows Grid */}
        <div className="glass-card workflows-section">
          <div className="section-header">
            <div className="section-title">
              <Workflow className="h-5 w-5 section-icon" />
              <h2 className="section-heading">
                Your Workflows
              </h2>
            </div>
            <div className="section-actions">
              <Filter className="h-4 w-4 filter-icon" />
              <select className="filter-select">
                <option>All Workflows</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div className="workflows-grid">
            {workflows.map((workflow) => {
              const TypeIcon = getTypeIcon(workflow.type);
              return (
                <div
                  key={workflow.id}
                  className="workflow-card"
                >
                  <div className="workflow-header">
                    <div className="workflow-info">
                      <div className="workflow-icon">
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="workflow-meta">
                        <h3 className="workflow-title">
                          {workflow.name}
                        </h3>
                        <div className={`status-badge status-${workflow.status}`}>
                          {workflow.status === "active" && (
                            <div className="pulse-dot" />
                          )}
                          {workflow.status}
                        </div>
                      </div>
                    </div>

                    <div className="workflow-menu">
                      <button className="menu-button">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="workflow-description">
                    {workflow.description}
                  </p>

                  <div className="workflow-stats">
                    <div className="stat-row">
                      <span className="stat-label">Last Run:</span>
                      <span className="stat-value">
                        {workflow.lastRun}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Success Rate:</span>
                      <span className={`stat-value ${
                        workflow.successRate >= 80 ? 'success' : 
                        workflow.successRate >= 60 ? 'warning' : 'error'
                      }`}>
                        {workflow.successRate}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Runs:</span>
                      <span className="stat-value">
                        {workflow.totalRuns}
                      </span>
                    </div>
                  </div>

                  <div className="workflow-triggers">
                    <div className="triggers-label">
                      Triggers:
                    </div>
                    <div className="triggers-list">
                      {workflow.triggers.slice(0, 2).map((trigger, index) => (
                        <span
                          key={index}
                          className="trigger-tag"
                        >
                          {trigger}
                        </span>
                      ))}
                      {workflow.triggers.length > 2 && (
                        <span className="trigger-tag">
                          +{workflow.triggers.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="workflow-actions">
                    {workflow.status === "active" ? (
                      <button 
                        onClick={() => handleStatusToggle(workflow.id, workflow.status)}
                        className="action-btn action-btn-pause"
                      >
                        <PauseCircle size={14} />
                        Pause
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusToggle(workflow.id, workflow.status)}
                        className="action-btn action-btn-play"
                      >
                        <PlayCircle size={14} />
                        {workflow.status === "draft" ? "Activate" : "Resume"}
                      </button>
                    )}
                    <button 
                      onClick={() => window.location.href = `/tenant-owner/automation/workflow-builder?edit=${workflow.id}`}
                      className="action-btn action-btn-edit"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => window.location.href = `/tenant-owner/automation/workflows/${workflow.id}`}
                      className="action-btn action-btn-view"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="activity-header">
            <div className="activity-header-content">
              <div className="section-title">
                <Activity className="h-5 w-5 section-icon" />
                <h2 className="section-heading">
                  Recent Activity
                </h2>
              </div>
              <button className="view-all-btn">
                View All
              </button>
            </div>
            <p className="activity-subtitle">
              Latest automation events and executions
            </p>
          </div>
          <div className="activity-content">
            <div>
              {recentActivity.map((activity) => {
                const StatusIcon = getActivityStatusIcon(activity.status);
                return (
                  <div
                    key={activity.id}
                    className="activity-item"
                  >
                    <div className="activity-item-content">
                      <div className={`activity-icon ${activity.status}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="activity-details">
                        <div className="activity-main">
                          <span className="activity-name">
                            {activity.name}
                          </span>
                          <span className="activity-separator">
                            •
                          </span>
                          <span className="activity-action">
                            {activity.action}
                          </span>
                        </div>
                        <p className="activity-timestamp">
                          {activity.timestamp}
                        </p>
                      </div>
                      <div className={`activity-status-badge ${activity.status}`}>
                        {activity.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showQuickActions && (
        <div
          className="dropdown-backdrop"
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
}
