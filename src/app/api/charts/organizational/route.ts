import { NextRequest, NextResponse } from 'next/server';
import { 
  OrganizationalChartTemplate, 
  ChartApprovalRequest, 
  AIChartRequest, 
  AIChartResponse 
} from '../../../(core)/dashboard/components/marketplace/ai/library/types';
import { 
  OrganizationalChartRegistry, 
  getCurrentUserContext 
} from '../../../(core)/dashboard/components/marketplace/ai/library/organizationalRegistry';
import { AIChartService } from '../../../(core)/dashboard/components/marketplace/ai/library/aiChartService';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/charts/organizational - Get organizational charts with RBAC
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const createdBy = searchParams.get('createdBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user context (in real app, this would come from auth middleware)
    const userContext = getCurrentUserContext();
    const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
    
    // Get organizational library with user permissions
    const orgLibrary = await orgRegistry.getOrganizationalLibrary(
      userContext.userId, 
      userContext.userRole
    );

    // Combine all charts and apply filters
    let allCharts = [
      ...orgLibrary.aiGenerated,
      ...orgLibrary.myCharts,
      ...orgLibrary.teamCharts,
      ...orgLibrary.pendingApproval
    ];

    // Remove duplicates
    allCharts = allCharts.filter((chart, index, self) => 
      index === self.findIndex(c => c.id === chart.id)
    );

    // Apply filters
    if (status && status !== 'all') {
      allCharts = allCharts.filter(chart => chart.approvalStatus === status);
    }

    if (category && category !== 'all') {
      allCharts = allCharts.filter(chart => chart.category === category);
    }

    if (createdBy) {
      allCharts = allCharts.filter(chart => chart.createdBy === createdBy);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharts = allCharts.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        charts: paginatedCharts,
        totalCharts: allCharts.length,
        totalPages: Math.ceil(allCharts.length / limit),
        currentPage: page,
        stats: orgLibrary.stats
      }
    });

  } catch (error) {
    console.error('Error fetching organizational charts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch charts' },
      { status: 500 }
    );
  }
}

// POST /api/charts/organizational - Create AI chart and save to organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, options, context } = body as {
      prompt: string;
      options: {
        saveToOrganization: boolean;
        visibility: string;
        requestApproval: boolean;
        notifyTeam: boolean;
      };
      context?: any;
    };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate user permissions (in real app, this would check actual permissions)
    const userContext = getCurrentUserContext();
    const hasCreatePermission = ['admin', 'manager', 'team_lead', 'user'].includes(userContext.userRole);
    
    if (!hasCreatePermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create charts' },
        { status: 403 }
      );
    }

    // Generate AI chart
    const aiService = AIChartService.getInstance();
    const aiRequest: AIChartRequest = {
      prompt: prompt.trim(),
      context: context || {},
      options: {
        saveToOrganization: options.saveToOrganization,
        visibility: options.visibility as any,
        requestApproval: options.requestApproval,
        notifyTeam: options.notifyTeam
      }
    };

    const aiResponse = await aiService.generateChart(aiRequest);

    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        error: aiResponse.error || 'Failed to generate chart'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        chart: aiResponse.chartTemplate,
        suggestions: aiResponse.suggestions || []
      }
    });

  } catch (error) {
    console.error('Error creating AI chart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chart' },
      { status: 500 }
    );
  }
}

// PUT /api/charts/organizational/[id] - Update chart (permissions required)
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chartId = url.pathname.split('/').pop();
    const body = await request.json();

    if (!chartId) {
      return NextResponse.json(
        { success: false, error: 'Chart ID is required' },
        { status: 400 }
      );
    }

    const userContext = getCurrentUserContext();
    const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
    
    // In a real implementation, you would:
    // 1. Check if user has permission to edit this chart
    // 2. Update the chart in the database
    // 3. Send notifications if needed

    return NextResponse.json({
      success: true,
      message: 'Chart updated successfully'
    });

  } catch (error) {
    console.error('Error updating chart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update chart' },
      { status: 500 }
    );
  }
}

// DELETE /api/charts/organizational/[id] - Delete chart (permissions required)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chartId = url.pathname.split('/').pop();

    if (!chartId) {
      return NextResponse.json(
        { success: false, error: 'Chart ID is required' },
        { status: 400 }
      );
    }

    const userContext = getCurrentUserContext();
    
    // Check if user has permission to delete (creator, admin, or manager)
    const hasDeletePermission = ['admin', 'manager'].includes(userContext.userRole);
    
    if (!hasDeletePermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to delete charts' },
        { status: 403 }
      );
    }

    // In a real implementation, you would delete from database
    return NextResponse.json({
      success: true,
      message: 'Chart deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chart' },
      { status: 500 }
    );
  }
}