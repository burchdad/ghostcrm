import { NextRequest, NextResponse } from 'next/server';

interface SidebarCounts {
  leads: number;
  deals: number;
  dashboard: number;
  inventory: number;
  calendar: number;
  automation: number;
  collaboration: number;
  performance: number;
  finance: number;
}

// Function to get counts from database
async function getSidebarCounts(tenantId?: string): Promise<SidebarCounts> {
  // For development/demo mode, return mock realistic counts that match actual data
  // In production, this would connect directly to the database
  return {
    leads: 3, // Updated to match actual demo leads count
    deals: 8,
    dashboard: 1,
    inventory: 47,
    calendar: 12,
    automation: 3,
    collaboration: 5,
    performance: 1,
    finance: 2,
  };
}

function getEmptyCounts(): SidebarCounts {
  return {
    leads: 0,
    deals: 0,
    dashboard: 0,
    inventory: 0,
    calendar: 0,
    automation: 0,
    collaboration: 0,
    performance: 0,
    finance: 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const counts = await getSidebarCounts();
    
    return NextResponse.json({
      success: true,
      data: counts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error in /api/sidebar/counts:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sidebar counts',
        data: {
          leads: 0,
          deals: 0,
          dashboard: 0,
          inventory: 0,
          calendar: 0,
          automation: 0,
          collaboration: 0,
          performance: 0,
          finance: 0,
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for updating counts when actions are taken
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type } = body;
    
    // Handle real-time count updates
    // For example: when a lead is created, increment lead count
    // when a deal is closed, decrement deal count, etc.
    
    console.log(`Count update: ${action} on ${type}`);
    
    // Return updated counts
    const counts = await getSidebarCounts();
    
    return NextResponse.json({
      success: true,
      data: counts,
      action: action,
      type: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error in POST /api/sidebar/counts:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update sidebar counts'
      },
      { status: 500 }
    );
  }
}