/**
 * Multi-Tenant AI Agent Architecture
 * 
 * Defines the structure for tenant-specific AI agents with proper isolation
 * and access controls for dealership owners
 */

export interface TenantAgentConfig {
  tenantId: string;
  agentId: string;
  agentType: TenantAgentType;
  name: string;
  description: string;
  configuration: Record<string, any>;
  isActive: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type TenantAgentType = 
  | 'inbound-lead'
  | 'outbound-campaign'
  | 'conversational-sales'
  | 'lead-qualification'
  | 'appointment-booking'
  | 'follow-up-automation'
  | 'customer-service'
  | 'inventory-alert'
  | 'price-negotiation'
  | 'trade-in-evaluation';

export interface AgentAccessLevel {
  level: 'admin' | 'tenant' | 'shared';
  tenantId?: string;
  permissions: AgentPermission[];
}

export type AgentPermission = 
  | 'view'
  | 'configure'
  | 'start'
  | 'stop'
  | 'delete'
  | 'clone'
  | 'export-data'
  | 'view-logs';

export interface TenantAgentDashboard {
  tenantId: string;
  visibleAgents: TenantAgentConfig[];
  systemHealth: {
    totalAgents: number;
    runningAgents: number;
    pausedAgents: number;
    errorAgents: number;
  };
  performance: {
    totalLeadsProcessed: number;
    conversionRate: number;
    averageResponseTime: number;
    customerSatisfaction: number;
  };
}

/**
 * Pre-built Sales Agent Templates for Dealerships
 */
export interface SalesAgentTemplate {
  id: string;
  name: string;
  type: TenantAgentType;
  description: string;
  category: 'lead-management' | 'customer-service' | 'sales-automation' | 'inventory-management';
  defaultConfig: Record<string, any>;
  requiredIntegrations: string[];
  setupInstructions: string[];
  isRecommended: boolean;
}

export const DEALERSHIP_AGENT_TEMPLATES: SalesAgentTemplate[] = [
  {
    id: 'inbound-lead-capture',
    name: 'Inbound Lead Capture Agent',
    type: 'inbound-lead',
    description: 'Automatically captures and qualifies leads from website forms, phone calls, and chat interactions',
    category: 'lead-management',
    defaultConfig: {
      responseTimeTarget: 60, // seconds
      qualificationQuestions: [
        'Budget range for vehicle purchase',
        'Preferred vehicle type',
        'Timeline for purchase',
        'Trade-in vehicle details',
        'Financing preferences'
      ],
      autoResponseEnabled: true,
      businessHours: {
        start: '08:00',
        end: '20:00',
        timezone: 'local'
      }
    },
    requiredIntegrations: ['crm', 'phone-system', 'website-chat'],
    setupInstructions: [
      'Connect your website contact forms',
      'Integrate phone system for call logging',
      'Configure chat widget on website',
      'Set up lead qualification criteria',
      'Define response templates'
    ],
    isRecommended: true
  },
  {
    id: 'outbound-campaign-manager',
    name: 'Outbound Campaign Manager',
    type: 'outbound-campaign',
    description: 'Manages automated outbound campaigns via email, SMS, and phone calls for lead nurturing',
    category: 'sales-automation',
    defaultConfig: {
      campaignTypes: ['email', 'sms', 'phone'],
      followUpSequence: [
        { delay: 0, method: 'email', template: 'initial-contact' },
        { delay: 2, method: 'phone', template: 'follow-up-call' },
        { delay: 7, method: 'email', template: 'value-proposition' },
        { delay: 14, method: 'sms', template: 'limited-offer' }
      ],
      complianceSettings: {
        honorDoNotCall: true,
        honorUnsubscribe: true,
        includeOptOut: true
      }
    },
    requiredIntegrations: ['email-service', 'sms-provider', 'phone-system'],
    setupInstructions: [
      'Configure email service provider',
      'Set up SMS provider account',
      'Create campaign templates',
      'Define target audience criteria',
      'Set compliance preferences'
    ],
    isRecommended: true
  },
  {
    id: 'conversational-sales-assistant',
    name: 'Conversational Sales Assistant',
    type: 'conversational-sales',
    description: 'Real-time AI assistant for sales conversations, providing instant responses and deal guidance',
    category: 'customer-service',
    defaultConfig: {
      aiModel: 'gpt-4',
      responseStyle: 'professional-friendly',
      knowledgeBase: [
        'vehicle-specifications',
        'pricing-information',
        'financing-options',
        'trade-in-values',
        'warranty-details'
      ],
      escalationTriggers: [
        'price-negotiation-limit',
        'complex-financing-request',
        'customer-complaint',
        'technical-question'
      ]
    },
    requiredIntegrations: ['crm', 'inventory-system', 'financing-calculator'],
    setupInstructions: [
      'Upload vehicle inventory data',
      'Configure pricing guidelines',
      'Set up financing calculator',
      'Train AI on dealership policies',
      'Define escalation procedures'
    ],
    isRecommended: true
  },
  {
    id: 'appointment-booking-agent',
    name: 'Appointment Booking Agent',
    type: 'appointment-booking',
    description: 'Automatically schedules test drives, service appointments, and sales meetings',
    category: 'customer-service',
    defaultConfig: {
      availableServices: [
        'test-drive',
        'sales-consultation',
        'service-appointment',
        'financing-meeting',
        'trade-in-appraisal'
      ],
      bookingRules: {
        testDriveRequirements: ['valid-license', 'insurance-verification'],
        bufferTime: 15, // minutes between appointments
        advanceBookingLimit: 30 // days
      },
      calendarIntegration: 'google-calendar'
    },
    requiredIntegrations: ['calendar-system', 'crm', 'notification-service'],
    setupInstructions: [
      'Connect calendar system',
      'Set staff availability',
      'Configure service types',
      'Set up confirmation notifications',
      'Define booking requirements'
    ],
    isRecommended: false
  },
  {
    id: 'inventory-alert-agent',
    name: 'Inventory Alert Agent',
    type: 'inventory-alert',
    description: 'Monitors inventory levels and alerts customers when desired vehicles become available',
    category: 'inventory-management',
    defaultConfig: {
      alertTriggers: [
        'new-vehicle-arrival',
        'price-reduction',
        'matching-criteria',
        'low-inventory-warning'
      ],
      notificationMethods: ['email', 'sms', 'phone'],
      updateFrequency: 'daily'
    },
    requiredIntegrations: ['inventory-system', 'notification-service', 'crm'],
    setupInstructions: [
      'Connect inventory management system',
      'Set up alert criteria',
      'Configure notification preferences',
      'Define customer matching rules',
      'Set up inventory monitoring'
    ],
    isRecommended: false
  }
];

/**
 * Agent Visibility and Access Control
 */
export interface AgentVisibilityRule {
  agentId: string;
  accessLevel: AgentAccessLevel;
  visibilityRules: {
    adminVisible: boolean;
    tenantVisible: boolean;
    clientVisible: boolean;
  };
}

export const AGENT_ACCESS_MATRIX: Record<string, AgentVisibilityRule> = {
  // Admin-only infrastructure agents
  'database-connectivity': {
    agentId: 'database-connectivity',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'api-performance': {
    agentId: 'api-performance',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'security-compliance': {
    agentId: 'security-compliance',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'integration-health': {
    agentId: 'integration-health',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'billing-intelligence': {
    agentId: 'billing-intelligence',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'tenant-management': {
    agentId: 'tenant-management',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },
  'code-intelligence': {
    agentId: 'code-intelligence',
    accessLevel: { level: 'admin', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: false, clientVisible: false }
  },

  // Shared business intelligence (visible to both admin and tenants)
  'business-intelligence': {
    agentId: 'business-intelligence',
    accessLevel: { level: 'shared', permissions: ['view', 'export-data'] },
    visibilityRules: { adminVisible: true, tenantVisible: true, clientVisible: false }
  },

  // Tenant-specific conversational agent (customizable per tenant)
  'conversational-agent': {
    agentId: 'conversational-agent',
    accessLevel: { level: 'tenant', permissions: ['view', 'configure', 'start', 'stop'] },
    visibilityRules: { adminVisible: true, tenantVisible: true, clientVisible: false }
  }
};