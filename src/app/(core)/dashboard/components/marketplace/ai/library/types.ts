// Chart Library Types and Interfaces

export type ChartCategory = 'sales' | 'marketing' | 'analytics' | 'finance' | 'operations' | 'custom' | 'ai-generated' | 'organization';

export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'doughnut' 
  | 'scatter' 
  | 'area' 
  | 'radar' 
  | 'bubble'
  | 'polarArea'
  | 'funnel';

export interface ChartDataMapping {
  /** Field mappings for data integration */
  xAxis?: string;
  yAxis?: string;
  series?: string;
  groupBy?: string;
  dateField?: string;
  valueField?: string;
  categoryField?: string;
}

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  category: ChartCategory;
  type: ChartType;
  
  // Metadata
  tags: string[];
  author: string;
  version: string;
  rating: number;
  downloads: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Source tracking
  source: 'marketplace' | 'ai' | 'custom' | 'organization';
  
  // Visual
  thumbnail: string; // Base64 or URL
  preview?: string;  // Larger preview image
  
  // Configuration
  config: any; // Chart.js configuration object
  defaultOptions: any; // Default chart options
  
  // Data requirements
  dataRequirements: {
    required: string[]; // Required data fields
    optional: string[]; // Optional data fields
    minDataPoints: number;
    maxDataPoints?: number;
    dataTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  };
  
  // Sample data for preview/testing
  sampleData: {
    labels: string[];
    datasets: any[];
  };
  
  // Data mapping configuration
  dataMapping: ChartDataMapping;
  
  // Customization options
  customization: {
    colors: {
      primary: string[];
      secondary?: string[];
      schemes: Record<string, string[]>;
    };
    themes: string[]; // Available theme variants
    responsive: boolean;
    animations: boolean;
    interactive: boolean;
  };
  
  // Usage examples
  useCases: string[];
  examples: {
    title: string;
    description: string;
    data: any;
  }[];
}

export interface ChartCategoryInfo {
  id: ChartCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  templates: ChartTemplate[];
}

export interface ChartLibrary {
  categories: ChartCategoryInfo[];
  featured: ChartTemplate[];
  popular: ChartTemplate[];
  recent: ChartTemplate[];
}

// Chart installation/configuration types
export interface ChartInstallation {
  templateId: string;
  instanceId: string;
  name: string;
  configuration: any;
  dataSource?: string;
  filters?: Record<string, any>;
  customizations?: {
    colors?: string[];
    theme?: string;
    options?: any;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Search and filtering
export interface ChartSearchFilters {
  category?: ChartCategory;
  type?: ChartType;
  tags?: string[];
  author?: string;
  rating?: number;
  featured?: boolean;
  search?: string;
}

export interface ChartSearchResult {
  templates: ChartTemplate[];
  total: number;
  page: number;
  pageSize: number;
  filters: ChartSearchFilters;
}

// ============= ORGANIZATIONAL AI CHART EXTENSIONS =============

export type ChartVisibility = 'private' | 'team' | 'organization' | 'public';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type AIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3' | 'custom';

export interface OrganizationalChartTemplate extends ChartTemplate {
  // Organizational context
  organizationId: string;
  tenantId: string;
  departmentId?: string;
  teamId?: string;
  
  // Creator information
  createdBy: string;
  creatorName: string;
  creatorEmail: string;
  creatorRole: string;
  
  // AI-specific fields (when source === 'ai')
  aiMetadata?: {
    originalPrompt: string;
    refinedPrompt?: string;
    model: AIModel;
    confidence: number;
    generatedAt: string;
    generationTime: number; // milliseconds
    tokensUsed?: number;
    iterations: number; // how many AI refinements
  };
  
  // Sharing and permissions
  visibility: ChartVisibility;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Access control
  permissions: {
    canView: string[]; // user IDs or role names
    canUse: string[];   // who can install/use this chart
    canModify: string[]; // who can edit the chart
    canApprove: string[]; // who can approve/reject
  };
  
  // Usage analytics
  usage: {
    totalInstalls: number;
    uniqueUsers: number;
    lastUsed: string;
    usageHistory: {
      userId: string;
      userName: string;
      installedAt: string;
      lastUsed: string;
      instanceCount: number;
    }[];
  };
  
  // Version control for organizational charts
  versions: {
    version: string;
    createdAt: string;
    createdBy: string;
    changes: string;
    config: any;
    data: any;
  }[];
  
  // Collaboration features
  comments?: {
    id: string;
    userId: string;
    userName: string;
    message: string;
    createdAt: string;
    replies?: {
      id: string;
      userId: string;
      userName: string;
      message: string;
      createdAt: string;
    }[];
  }[];
  
  // Quality metrics
  quality: {
    dataAccuracy: number; // 0-100
    visualClarity: number; // 0-100
    businessValue: number; // 0-100
    userRating: number; // 1-5 stars
    reviewCount: number;
  };
}

export interface AIChartRequest {
  prompt: string;
  context?: {
    dataSource?: string;
    expectedFields?: string[];
    chartPreference?: ChartType;
    businessContext?: string;
  };
  options: {
    saveToOrganization: boolean;
    visibility: ChartVisibility;
    requestApproval: boolean;
    notifyTeam: boolean;
  };
}

export interface AIChartResponse {
  success: boolean;
  chartTemplate?: OrganizationalChartTemplate;
  suggestions?: ChartTemplate[];
  error?: string;
  warnings?: string[];
}

export interface ChartApprovalRequest {
  chartId: string;
  action: 'approve' | 'reject' | 'request_changes';
  reason?: string;
  suggestedChanges?: string;
  reviewerNotes?: string;
}

export interface OrganizationalChartLibrary extends ChartLibrary {
  // Organization-specific sections
  aiGenerated: OrganizationalChartTemplate[];
  pendingApproval: OrganizationalChartTemplate[];
  myCharts: OrganizationalChartTemplate[];
  teamCharts: OrganizationalChartTemplate[];
  
  // Analytics
  stats: {
    totalCharts: number;
    aiCharts: number;
    approvedCharts: number;
    pendingCharts: number;
    mostUsedCharts: OrganizationalChartTemplate[];
    topCreators: {
      userId: string;
      userName: string;
      chartCount: number;
      totalUsage: number;
    }[];
  };
}