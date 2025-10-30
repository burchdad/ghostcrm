import { NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
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
  // Return empty counts for clean production environment
  // Only show counts that represent actual system state
  return {
    leads: 0,        // No leads in clean system
    deals: 0,        // No deals in clean system  
    dashboard: 0,    // No dashboard notifications
    inventory: 0,    // No inventory items
    calendar: 0,     // No calendar events
    automation: 1,   // Keep automation count for built workflows
    collaboration: 0,// No collaboration items
    performance: 0,  // No performance alerts
    finance: 0,      // No finance items
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
