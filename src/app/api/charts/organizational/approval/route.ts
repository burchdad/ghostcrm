import { NextRequest, NextResponse } from 'next/server';
import { 
  ChartApprovalRequest 
} from '../../../../(core)/dashboard/components/marketplace/ai/library/types';
import { 
  OrganizationalChartRegistry, 
  getCurrentUserContext 
} from '../../../../(core)/dashboard/components/marketplace/ai/library/organizationalRegistry';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// POST /api/charts/organizational/approval - Approve or reject charts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChartApprovalRequest;
    const { chartId, action, reason, reviewerNotes } = body;

    if (!chartId || !action) {
      return NextResponse.json(
        { success: false, error: 'Chart ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, or request_changes' },
        { status: 400 }
      );
    }

    // Get user context and check permissions
    const userContext = getCurrentUserContext();
    const hasApprovalPermission = ['admin', 'manager', 'team_lead'].includes(userContext.userRole);
    
    if (!hasApprovalPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to approve/reject charts' },
        { status: 403 }
      );
    }

    // Process approval
    const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
    const success = await orgRegistry.approveChart(body, userContext.userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Chart not found or already processed' },
        { status: 404 }
      );
    }

    // In a real implementation, you would also:
    // 1. Send notifications to chart creator
    // 2. Log the approval action
    // 3. Update any related workflows

    return NextResponse.json({
      success: true,
      message: `Chart ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent back for changes'} successfully`,
      data: {
        chartId,
        action,
        approvedBy: userContext.userName,
        approvedAt: new Date().toISOString(),
        reason: reason || reviewerNotes
      }
    });

  } catch (error) {
    console.error('Error processing chart approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

// GET /api/charts/organizational/approval - Get pending approvals (for admins)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user context and check permissions
    const userContext = getCurrentUserContext();
    const hasApprovalPermission = ['admin', 'manager', 'team_lead'].includes(userContext.userRole);
    
    if (!hasApprovalPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to view pending approvals' },
        { status: 403 }
      );
    }

    // Get pending approvals
    const orgRegistry = OrganizationalChartRegistry.getInstance(userContext.organizationId);
    const pendingCharts = orgRegistry.getPendingApprovals(userContext.userId, userContext.userRole);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharts = pendingCharts.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        pendingApprovals: paginatedCharts,
        totalPending: pendingCharts.length,
        totalPages: Math.ceil(pendingCharts.length / limit),
        currentPage: page,
        userPermissions: {
          canApprove: hasApprovalPermission,
          role: userContext.userRole
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}