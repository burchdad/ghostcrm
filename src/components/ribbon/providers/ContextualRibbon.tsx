"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

// Simple mock hook for user authentication - can be replaced with actual auth
function useUser() {
  return {
    role: 'admin', // 'admin', 'manager', 'sales', 'user'
    name: 'John Doe',
    id: 'user-123'
  };
}

// Smart contextual ribbon that adapts based on page, user role, and workflow state
export function useContextualRibbon() {
  const pathname = usePathname();
  const user = useUser();
  
  const contextualConfig = useMemo(() => {
    // Determine current page context
    const pageContext = getPageContext(pathname);
    const userRole = user?.role || 'user';
    const workflowState = getWorkflowState(pathname);
    
    return {
      activeTab: getActiveTab(pageContext),
      availableTabs: getAvailableTabs(pageContext, userRole),
      priorityActions: getPriorityActions(pageContext, userRole, workflowState),
      contextualHelp: getContextualHelp(pageContext),
      smartRecommendations: getSmartRecommendations(pageContext, userRole),
      adaptiveLayout: getAdaptiveLayout(pageContext)
    };
  }, [pathname, user]);
  
  return contextualConfig;
}

// Determine the current page context for smart adaptations
function getPageContext(pathname: string) {
  if (pathname.includes('/leads')) return 'leads';
  if (pathname.includes('/deals')) return 'deals';
  if (pathname.includes('/contacts')) return 'contacts';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/reports')) return 'reports';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/automation')) return 'automation';
  if (pathname.includes('/collaboration')) return 'collaboration';
  if (pathname.includes('/billing')) return 'billing';
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/ai')) return 'ai';
  if (pathname.includes('/workflow')) return 'workflow';
  if (pathname.includes('/calls')) return 'calls';
  if (pathname.includes('/messaging')) return 'messaging';
  return 'general';
}

// Get the most relevant tab for the current context
function getActiveTab(context: string) {
  const contextTabMap: Record<string, string> = {
    'leads': 'Customer',
    'deals': 'Sales',
    'contacts': 'Customer',
    'calendar': 'Schedule',
    'reports': 'Analytics',
    'dashboard': 'Home',
    'settings': 'Settings',
    'automation': 'Automation',
    'collaboration': 'Collaborate',
    'billing': 'Finance',
    'admin': 'Admin',
    'ai': 'AI',
    'workflow': 'Automation',
    'calls': 'Communication',
    'messaging': 'Communication'
  };
  
  return contextTabMap[context] || 'Home';
}

// Determine which tabs should be available based on context and user role
function getAvailableTabs(context: string, userRole: string) {
  const baseTabs = ['Home', 'Customer', 'Sales', 'Communication'];
  
  // Role-based tab availability
  const roleTabs: Record<string, string[]> = {
    'admin': [...baseTabs, 'Analytics', 'Settings', 'Admin', 'Developer'],
    'manager': [...baseTabs, 'Analytics', 'Settings', 'Schedule'],
    'sales': [...baseTabs, 'Schedule', 'Analytics'],
    'user': baseTabs
  };
  
  // Context-specific tab additions
  const contextTabs: Record<string, string[]> = {
    'automation': ['Automation'],
    'ai': ['AI'],
    'collaboration': ['Collaborate'],
    'billing': ['Finance'],
    'workflow': ['Automation']
  };
  
  let availableTabs = roleTabs[userRole] || roleTabs['user'];
  
  // Add context-specific tabs
  if (contextTabs[context]) {
    availableTabs = [...new Set([...availableTabs, ...contextTabs[context]])];
  }
  
  return availableTabs;
}

// Get priority actions for the current context
function getPriorityActions(context: string, userRole: string, workflowState: any) {
  const contextActions: Record<string, Array<{id: string, label: string, icon: string, priority: number}>> = {
    'leads': [
      { id: 'new-lead', label: 'New Lead', icon: '👤', priority: 1 },
      { id: 'import-leads', label: 'Import', icon: '📥', priority: 2 },
      { id: 'lead-report', label: 'Lead Report', icon: '📊', priority: 3 }
    ],
    'deals': [
      { id: 'new-deal', label: 'New Deal', icon: '💼', priority: 1 },
      { id: 'pipeline-view', label: 'Pipeline', icon: '🔄', priority: 2 },
      { id: 'forecast', label: 'Forecast', icon: '📈', priority: 3 }
    ],
    'calendar': [
      { id: 'new-appointment', label: 'New Meeting', icon: '📅', priority: 1 },
      { id: 'sync-calendar', label: 'Sync', icon: '🔄', priority: 2 },
      { id: 'availability', label: 'Availability', icon: '⏰', priority: 3 }
    ],
    'reports': [
      { id: 'generate-report', label: 'Generate', icon: '📊', priority: 1 },
      { id: 'schedule-report', label: 'Schedule', icon: '⏰', priority: 2 },
      { id: 'export-data', label: 'Export', icon: '📤', priority: 3 }
    ],
    'dashboard': [
      { id: 'refresh-data', label: 'Refresh', icon: '🔄', priority: 1 },
      { id: 'customize-dashboard', label: 'Customize', icon: '⚙️', priority: 2 },
      { id: 'create-widget', label: 'Add Widget', icon: '➕', priority: 3 }
    ]
  };
  
  const baseActions = contextActions[context] || [
    { id: 'search', label: 'Search', icon: '🔍', priority: 1 },
    { id: 'help', label: 'Help', icon: '❓', priority: 2 }
  ];
  
  // Filter by user role permissions
  return baseActions.filter(action => hasPermission(action.id, userRole));
}

// Get contextual help content
function getContextualHelp(context: string) {
  const helpContent: Record<string, {title: string, tips: string[]}> = {
    'leads': {
      title: 'Lead Management',
      tips: [
        'Use bulk actions to process multiple leads efficiently',
        'Set up lead scoring to prioritize follow-ups',
        'Create custom fields for your specific lead data'
      ]
    },
    'deals': {
      title: 'Deal Pipeline',
      tips: [
        'Drag and drop deals between pipeline stages',
        'Set probability percentages for accurate forecasting',
        'Use deal templates for consistent processes'
      ]
    },
    'calendar': {
      title: 'Schedule Management',
      tips: [
        'Sync with external calendars for unified view',
        'Set buffer times between meetings',
        'Use recurring appointments for regular check-ins'
      ]
    },
    'reports': {
      title: 'Analytics & Reports',
      tips: [
        'Schedule automated reports for stakeholders',
        'Use filters to drill down into specific data',
        'Export reports in multiple formats'
      ]
    }
  };
  
  return helpContent[context] || {
    title: 'General Help',
    tips: ['Use the search function to quickly find records', 'Customize your workspace layout']
  };
}

// Get smart recommendations based on context and user behavior
function getSmartRecommendations(context: string, userRole: string) {
  // This would typically come from AI/ML analysis of user behavior
  const recommendations: Record<string, Array<{type: string, message: string, action?: string}>> = {
    'leads': [
      {
        type: 'productivity',
        message: 'You have 15 uncontacted leads from this week',
        action: 'view-uncontacted-leads'
      },
      {
        type: 'automation',
        message: 'Set up lead scoring to prioritize your follow-ups',
        action: 'setup-lead-scoring'
      }
    ],
    'deals': [
      {
        type: 'opportunity',
        message: '3 deals are stalled in negotiation stage',
        action: 'review-stalled-deals'
      },
      {
        type: 'forecast',
        message: 'You\'re 85% to your monthly target',
        action: 'view-forecast'
      }
    ],
    'dashboard': [
      {
        type: 'insight',
        message: 'Your conversion rate improved 12% this month',
        action: 'view-conversion-report'
      },
      {
        type: 'action',
        message: 'Schedule follow-ups for 8 warm prospects',
        action: 'schedule-followups'
      }
    ]
  };
  
  return recommendations[context] || [];
}

// Get adaptive layout configuration
function getAdaptiveLayout(context: string) {
  const layouts: Record<string, {compactMode: boolean, hiddenGroups: string[], priorityGroups: string[]}> = {
    'leads': {
      compactMode: false,
      hiddenGroups: ['Developer', 'Finance'],
      priorityGroups: ['Customer', 'Communication', 'Data']
    },
    'deals': {
      compactMode: false,
      hiddenGroups: ['Developer'],
      priorityGroups: ['Sales', 'Customer', 'Analytics']
    },
    'reports': {
      compactMode: true,
      hiddenGroups: ['Communication', 'Collaborate'],
      priorityGroups: ['Analytics', 'Data', 'File']
    },
    'settings': {
      compactMode: true,
      hiddenGroups: ['Customer', 'Sales'],
      priorityGroups: ['Settings', 'Admin', 'Developer']
    }
  };
  
  return layouts[context] || {
    compactMode: false,
    hiddenGroups: [],
    priorityGroups: ['Home']
  };
}

// Get current workflow state for smart adaptations
function getWorkflowState(pathname: string) {
  // This would analyze current user actions and workflow state
  return {
    isInWorkflow: pathname.includes('/workflow/'),
    workflowStep: getWorkflowStep(pathname),
    hasUnsavedChanges: false, // Would be determined by form state
    isMultiStep: false // Would be determined by workflow configuration
  };
}

function getWorkflowStep(pathname: string) {
  const match = pathname.match(/\/workflow\/([^\/]+)\/step\/(\d+)/);
  return match ? { workflow: match[1], step: parseInt(match[2]) } : null;
}

// Check user permissions for actions
function hasPermission(actionId: string, userRole: string) {
  const permissions: Record<string, string[]> = {
    'admin': ['*'], // Admin has access to everything
    'manager': [
      'new-lead', 'import-leads', 'lead-report', 'new-deal', 'pipeline-view', 
      'forecast', 'generate-report', 'schedule-report', 'export-data',
      'new-appointment', 'sync-calendar', 'availability'
    ],
    'sales': [
      'new-lead', 'lead-report', 'new-deal', 'pipeline-view', 'forecast',
      'new-appointment', 'sync-calendar', 'availability'
    ],
    'user': [
      'new-lead', 'new-deal', 'new-appointment', 'search', 'help'
    ]
  };
  
  const userPermissions = permissions[userRole] || permissions['user'];
  return userPermissions.includes('*') || userPermissions.includes(actionId);
}

// Smart notification prioritization
export function prioritizeNotifications(notifications: any[], context: string) {
  const contextPriorities: Record<string, string[]> = {
    'leads': ['lead_assigned', 'lead_contacted', 'lead_converted'],
    'deals': ['deal_won', 'deal_lost', 'deal_stage_changed', 'proposal_sent'],
    'calendar': ['meeting_reminder', 'meeting_cancelled', 'availability_changed'],
    'reports': ['report_ready', 'scheduled_report', 'data_export_complete']
  };
  
  const priorities = contextPriorities[context] || [];
  
  return notifications.sort((a, b) => {
    const aPriority = priorities.indexOf(a.type);
    const bPriority = priorities.indexOf(b.type);
    
    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    
    return aPriority - bPriority;
  });
}

// Context-aware keyboard shortcuts
export function getContextualShortcuts(context: string) {
  const shortcuts: Record<string, Array<{key: string, action: string, description: string}>> = {
    'leads': [
      { key: 'Ctrl+N', action: 'new-lead', description: 'Create new lead' },
      { key: 'Ctrl+I', action: 'import-leads', description: 'Import leads' },
      { key: 'Ctrl+F', action: 'search-leads', description: 'Search leads' }
    ],
    'deals': [
      { key: 'Ctrl+N', action: 'new-deal', description: 'Create new deal' },
      { key: 'Ctrl+P', action: 'pipeline-view', description: 'View pipeline' },
      { key: 'Ctrl+R', action: 'refresh-deals', description: 'Refresh deals' }
    ],
    'calendar': [
      { key: 'Ctrl+N', action: 'new-appointment', description: 'New appointment' },
      { key: 'Ctrl+T', action: 'today-view', description: 'Today view' },
      { key: 'Ctrl+W', action: 'week-view', description: 'Week view' }
    ]
  };
  
  return shortcuts[context] || [
    { key: 'Ctrl+/', action: 'help', description: 'Show help' },
    { key: 'Ctrl+K', action: 'quick-search', description: 'Quick search' }
  ];
}