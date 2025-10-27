import { 
  OrganizationalChartLibrary, 
  OrganizationalChartTemplate, 
  ChartTemplate,
  AIChartRequest,
  AIChartResponse,
  ChartApprovalRequest,
  ChartVisibility,
  ApprovalStatus 
} from './types';
import { ChartLibraryRegistry } from './registry';

// Organizational Chart Registry - Manages organization-specific charts
export class OrganizationalChartRegistry {
  private static instances: Map<string, OrganizationalChartRegistry> = new Map();
  private organizationId: string;
  private organizationalCharts: OrganizationalChartTemplate[] = [];
  private baseRegistry: ChartLibraryRegistry;

  private constructor(organizationId: string) {
    this.organizationId = organizationId;
    this.baseRegistry = ChartLibraryRegistry.getInstance();
    this.loadOrganizationalCharts();
  }

  public static getInstance(organizationId: string): OrganizationalChartRegistry {
    if (!OrganizationalChartRegistry.instances.has(organizationId)) {
      OrganizationalChartRegistry.instances.set(
        organizationId, 
        new OrganizationalChartRegistry(organizationId)
      );
    }
    return OrganizationalChartRegistry.instances.get(organizationId)!;
  }

  private async loadOrganizationalCharts(): Promise<void> {
    try {
      // In real implementation, this would fetch from your database
      // For now, we'll simulate with localStorage or mock data
      const stored = localStorage.getItem(`org_charts_${this.organizationId}`);
      if (stored) {
        this.organizationalCharts = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load organizational charts:', error);
      this.organizationalCharts = [];
    }
  }

  private async saveOrganizationalCharts(): Promise<void> {
    try {
      // In real implementation, this would save to your database
      localStorage.setItem(
        `org_charts_${this.organizationId}`, 
        JSON.stringify(this.organizationalCharts)
      );
    } catch (error) {
      console.error('Failed to save organizational charts:', error);
    }
  }

  // ============= PUBLIC API =============

  public async getOrganizationalLibrary(userId: string, userRole: string): Promise<OrganizationalChartLibrary> {
    const baseLibrary = this.baseRegistry.getLibrary();
    
    // Filter charts based on user permissions
    const visibleCharts = this.getVisibleCharts(userId, userRole);
    
    const aiGenerated = visibleCharts.filter(chart => chart.source === 'ai');
    const pendingApproval = visibleCharts.filter(chart => 
      chart.approvalStatus === 'pending' && this.canApprove(userId, userRole, chart)
    );
    const myCharts = visibleCharts.filter(chart => chart.createdBy === userId);
    const teamCharts = visibleCharts.filter(chart => 
      chart.visibility === 'team' && chart.createdBy !== userId
    );

    // Add AI-generated category to base categories
    const categoriesWithAI = [
      ...baseLibrary.categories,
      {
        id: 'ai-generated' as const,
        name: 'AI Generated',
        description: 'Charts created by AI for your organization',
        icon: '🤖',
        color: '#8b5cf6',
        templates: aiGenerated
      },
      {
        id: 'organization' as const,
        name: 'Organization',
        description: 'Custom charts shared within your organization',
        icon: '🏢',
        color: '#059669',
        templates: visibleCharts.filter(chart => chart.approvalStatus === 'approved')
      }
    ];

    return {
      ...baseLibrary,
      categories: categoriesWithAI,
      aiGenerated,
      pendingApproval,
      myCharts,
      teamCharts,
      stats: this.generateStats(visibleCharts)
    };
  }

  public async saveAIChart(request: AIChartRequest, chartTemplate: ChartTemplate, userId: string, userInfo: {
    name: string;
    email: string;
    role: string;
  }): Promise<OrganizationalChartTemplate> {
    const orgChart: OrganizationalChartTemplate = {
      ...chartTemplate,
      // Organizational context
      organizationId: this.organizationId,
      tenantId: this.organizationId, // Assuming same for now
      
      // Creator information
      createdBy: userId,
      creatorName: userInfo.name,
      creatorEmail: userInfo.email,
      creatorRole: userInfo.role,
      
      // AI metadata
      aiMetadata: {
        originalPrompt: request.prompt,
        model: 'gpt-3.5-turbo', // Would be dynamic based on actual AI service
        confidence: 0.85, // Would come from AI response
        generatedAt: new Date().toISOString(),
        generationTime: 1500, // Would be actual generation time
        iterations: 1
      },
      
      // Sharing settings
      visibility: request.options.visibility,
      approvalStatus: request.options.requestApproval ? 'pending' : 'approved',
      
      // Initialize permissions
      permissions: {
        canView: this.getDefaultViewPermissions(request.options.visibility, userInfo.role),
        canUse: this.getDefaultUsePermissions(request.options.visibility, userInfo.role),
        canModify: [userId],
        canApprove: this.getApprovalPermissions(userInfo.role)
      },
      
      // Initialize usage tracking
      usage: {
        totalInstalls: 0,
        uniqueUsers: 0,
        lastUsed: new Date().toISOString(),
        usageHistory: []
      },
      
      // Version control
      versions: [{
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: userId,
        changes: 'Initial AI generation',
        config: chartTemplate.config,
        data: chartTemplate.sampleData
      }],
      
      // Quality metrics (initial)
      quality: {
        dataAccuracy: 85,
        visualClarity: 90,
        businessValue: 80,
        userRating: 0,
        reviewCount: 0
      },
      
      // Source tracking
      source: 'ai'
    };

    this.organizationalCharts.push(orgChart);
    await this.saveOrganizationalCharts();
    
    return orgChart;
  }

  public async approveChart(request: ChartApprovalRequest, approverId: string): Promise<boolean> {
    const chart = this.organizationalCharts.find(c => c.id === request.chartId);
    if (!chart) return false;

    chart.approvalStatus = request.action === 'approve' ? 'approved' : 'rejected';
    chart.approvedBy = approverId;
    chart.approvedAt = new Date().toISOString();
    
    if (request.reason) {
      chart.rejectionReason = request.reason;
    }

    await this.saveOrganizationalCharts();
    return true;
  }

  public getChartsByUser(userId: string): OrganizationalChartTemplate[] {
    return this.organizationalCharts.filter(chart => chart.createdBy === userId);
  }

  public getPendingApprovals(userId: string, userRole: string): OrganizationalChartTemplate[] {
    return this.organizationalCharts.filter(chart => 
      chart.approvalStatus === 'pending' && 
      this.canApprove(userId, userRole, chart)
    );
  }

  // ============= PRIVATE HELPERS =============

  private getVisibleCharts(userId: string, userRole: string): OrganizationalChartTemplate[] {
    return this.organizationalCharts.filter(chart => {
      // User can always see their own charts
      if (chart.createdBy === userId) return true;
      
      // Check visibility settings
      switch (chart.visibility) {
        case 'private':
          return false;
        case 'team':
          // Would need team membership logic here
          return chart.permissions.canView.includes(userId) || 
                 chart.permissions.canView.includes(userRole);
        case 'organization':
          return chart.approvalStatus === 'approved';
        case 'public':
          return true;
        default:
          return false;
      }
    });
  }

  private canApprove(userId: string, userRole: string, chart: OrganizationalChartTemplate): boolean {
    return chart.permissions.canApprove.includes(userId) ||
           chart.permissions.canApprove.includes(userRole) ||
           ['admin', 'manager', 'team_lead'].includes(userRole);
  }

  private getDefaultViewPermissions(visibility: ChartVisibility, creatorRole: string): string[] {
    switch (visibility) {
      case 'private':
        return [];
      case 'team':
        return ['team_member', 'team_lead', 'manager', 'admin'];
      case 'organization':
        return ['all_users'];
      case 'public':
        return ['public'];
      default:
        return [];
    }
  }

  private getDefaultUsePermissions(visibility: ChartVisibility, creatorRole: string): string[] {
    // Similar to view permissions but might be more restrictive
    return this.getDefaultViewPermissions(visibility, creatorRole);
  }

  private getApprovalPermissions(creatorRole: string): string[] {
    return ['admin', 'manager', 'team_lead'];
  }

  private generateStats(charts: OrganizationalChartTemplate[]) {
    const totalCharts = charts.length;
    const aiCharts = charts.filter(c => c.source === 'ai').length;
    const approvedCharts = charts.filter(c => c.approvalStatus === 'approved').length;
    const pendingCharts = charts.filter(c => c.approvalStatus === 'pending').length;

    // Most used charts
    const mostUsedCharts = charts
      .sort((a, b) => b.usage.totalInstalls - a.usage.totalInstalls)
      .slice(0, 5);

    // Top creators
    const creatorMap = new Map<string, { userName: string; chartCount: number; totalUsage: number }>();
    charts.forEach(chart => {
      const creator = creatorMap.get(chart.createdBy) || {
        userName: chart.creatorName,
        chartCount: 0,
        totalUsage: 0
      };
      creator.chartCount++;
      creator.totalUsage += chart.usage.totalInstalls;
      creatorMap.set(chart.createdBy, creator);
    });

    const topCreators = Array.from(creatorMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        chartCount: data.chartCount,
        totalUsage: data.totalUsage
      }))
      .sort((a, b) => b.chartCount - a.chartCount)
      .slice(0, 5);

    return {
      totalCharts,
      aiCharts,
      approvedCharts,
      pendingCharts,
      mostUsedCharts,
      topCreators
    };
  }
}

// Helper function to get current user context (would be replaced with actual auth)
export function getCurrentUserContext(): {
  userId: string;
  organizationId: string;
  userRole: string;
  userName: string;
  userEmail: string;
} {
  // Mock implementation - replace with actual auth context
  return {
    userId: 'user-123',
    organizationId: 'org-456',
    userRole: 'manager',
    userName: 'John Doe',
    userEmail: 'john@example.com'
  };
}