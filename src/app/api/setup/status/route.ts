import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/setup/status
 * Returns the setup/onboarding status for the organization
 */
export async function GET(request: NextRequest) {
  try {
    // For now, return a default completed setup status
    // This can be enhanced later to check actual setup requirements
    return NextResponse.json({
      success: true,
      status: 'completed',
      isCompleted: true,
      completedAt: new Date().toISOString(),
      organizationId: 'system-default',
      steps: {
        organization: true,
        users: true,
        billing: true,
        configuration: true
      },
      message: 'Setup completed'
    });
  } catch (error: any) {
    console.error('❌ [SETUP-STATUS] Error checking setup status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check setup status',
        status: 'error'
      }, 
      { status: 500 }
    );
  }
}