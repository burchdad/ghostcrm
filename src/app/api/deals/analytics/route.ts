import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { ok, bad, oops } from "@/lib/http";

export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auto Dealership Deal Analytics
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  
  // Query parameters for analytics filtering
  const timeframe = url.searchParams.get("timeframe") || "30"; // days
  const pipeline = url.searchParams.get("pipeline") ?? undefined;
  const ownerId = url.searchParams.get("owner_id") ?? undefined;
  const vehicleType = url.searchParams.get("vehicle_type") ?? undefined;
  
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    console.log(`📊 [DEALS ANALYTICS] Processing analytics for org ${organizationId}, timeframe: ${timeframe} days`);

    // Build base query with organization scoping and date filtering
    let baseQuery = supabaseAdmin
      .from('deals')
      .select('*')
      .eq('organization_id', organizationId);

    // Apply optional filters
    if (pipeline) {
      baseQuery = baseQuery.eq('vehicle_type', pipeline);
    }
    if (ownerId) {
      baseQuery = baseQuery.eq('assigned_to', ownerId);
    }
    if (vehicleType) {
      baseQuery = baseQuery.eq('vehicle_type', vehicleType);
    }

    // Get all deals for analysis
    const { data: allDeals, error: allDealsError } = await baseQuery;
    
    if (allDealsError) {
      console.error('❌ [DEALS ANALYTICS] Error fetching all deals:', allDealsError);
      return oops('Failed to fetch deals data');
    }

    // Get deals within timeframe
    const { data: timeframeDeals, error: timeframeError } = await baseQuery
      .gte('created_at', startDate.toISOString());
      
    if (timeframeError) {
      console.error('❌ [DEALS ANALYTICS] Error fetching timeframe deals:', timeframeError);
      return oops('Failed to fetch timeframe deals data');
    }

    const deals = allDeals || [];
    const recentDeals = timeframeDeals || [];

    console.log(`📈 [DEALS ANALYTICS] Processing ${deals.length} total deals, ${recentDeals.length} in timeframe`);

    // Calculate summary analytics from real data
    const closedWonDeals = deals.filter(d => d.stage === 'closed_won');
    const closedLostDeals = deals.filter(d => d.stage === 'closed_lost');
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const totalClosedDeals = closedWonDeals.length + closedLostDeals.length;
    
    const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const closedRevenue = closedWonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    
    const summary = {
      total_deals: deals.length,
      active_deals: activeDeals.length,
      closed_won: closedWonDeals.length,
      closed_lost: closedLostDeals.length,
      total_pipeline_value: totalPipelineValue,
      closed_revenue: closedRevenue,
      average_deal_size: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length : 0,
      win_rate: totalClosedDeals > 0 ? closedWonDeals.length / totalClosedDeals : 0,
      average_sales_cycle: calculateAverageSalesCycle(closedWonDeals),
      conversion_rate: deals.length > 0 ? closedWonDeals.length / deals.length : 0
    };

    // Calculate stage-based analytics
    const stageGroups = groupByStage(deals);
    const by_stage = Object.keys(stageGroups).reduce((acc, stage) => {
      const stageDeals = stageGroups[stage];
      acc[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
        avg_days: calculateAverageTimeInStage(stageDeals)
      };
      return acc;
    }, {} as any);

    // Calculate pipeline analytics (if vehicle types exist)
    const by_pipeline = groupByVehicleType(deals);

    // Calculate vehicle make analytics
    const by_vehicle_make = groupByVehicleMake(deals);

    // Calculate financing type analytics
    const by_financing_type = groupByFinancingType(deals);

    const analytics = {
      timeframe: `Last ${timeframe} days`,
      summary,
      by_stage,
      by_pipeline,
      by_vehicle_make,
      by_financing_type,
      recent_activity: {
        new_deals: recentDeals.length,
        closed_deals: recentDeals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length,
        revenue_closed: recentDeals
          .filter(d => d.stage === 'closed_won')
          .reduce((sum, deal) => sum + (deal.amount || 0), 0)
      },
      generated_at: new Date().toISOString(),
      organization_id: organizationId
    };

    console.log(`✅ [DEALS ANALYTICS] Analytics generated successfully`);
    return ok(analytics);

  } catch (error) {
    console.error('❌ [DEALS ANALYTICS] Unexpected error:', error);
    return oops('Internal server error generating analytics');
  }
}

// Helper functions for analytics calculations
function calculateAverageSalesCycle(deals: any[]): number {
  if (deals.length === 0) return 0;
  
  const cycleData = deals
    .filter(deal => deal.created_at && deal.updated_at)
    .map(deal => {
      const start = new Date(deal.created_at);
      const end = new Date(deal.updated_at);
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });
    
  return cycleData.length > 0 ? cycleData.reduce((sum, days) => sum + days, 0) / cycleData.length : 0;
}

function calculateAverageTimeInStage(deals: any[]): number {
  if (deals.length === 0) return 0;
  
  // This is a simplified calculation - in a full implementation, 
  // you'd want to track stage transitions in a separate table
  return calculateAverageSalesCycle(deals);
}

function groupByStage(deals: any[]): { [stage: string]: any[] } {
  return deals.reduce((acc, deal) => {
    const stage = deal.stage || 'unknown';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(deal);
    return acc;
  }, {});
}

function groupByVehicleType(deals: any[]): { [type: string]: any } {
  const groups = deals.reduce((acc, deal) => {
    const type = deal.vehicle_type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(deal);
    return acc;
  }, {} as { [type: string]: any[] });

  return Object.keys(groups).reduce((acc, type) => {
    const typeDeals = groups[type];
    const closedDeals = typeDeals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = typeDeals.filter(d => d.stage === 'closed_won');
    
    acc[type] = {
      count: typeDeals.length,
      value: typeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      avg_deal_size: typeDeals.length > 0 ? typeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / typeDeals.length : 0,
      win_rate: closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0,
      avg_cycle: calculateAverageSalesCycle(wonDeals)
    };
    return acc;
  }, {} as any);
}

function groupByVehicleMake(deals: any[]): { [make: string]: any } {
  const groups = deals.reduce((acc, deal) => {
    // Extract make from vehicle string or vehicle_details
    const make = extractVehicleMake(deal.vehicle, deal.vehicle_details);
    if (!acc[make]) acc[make] = [];
    acc[make].push(deal);
    return acc;
  }, {} as { [make: string]: any[] });

  return Object.keys(groups).reduce((acc, make) => {
    const makeDeals = groups[make];
    acc[make] = {
      count: makeDeals.length,
      value: makeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      avg_price: makeDeals.length > 0 ? makeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / makeDeals.length : 0
    };
    return acc;
  }, {} as any);
}

function groupByFinancingType(deals: any[]): { [type: string]: any } {
  const groups = deals.reduce((acc, deal) => {
    const financingType = deal.financing?.type || deal.payment_method || 'unknown';
    if (!acc[financingType]) acc[financingType] = [];
    acc[financingType].push(deal);
    return acc;
  }, {} as { [type: string]: any[] });

  return Object.keys(groups).reduce((acc, type) => {
    const typeDeals = groups[type];
    acc[type] = {
      count: typeDeals.length,
      total_financed: typeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      avg_amount: typeDeals.length > 0 ? typeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / typeDeals.length : 0
    };
    return acc;
  }, {} as any);
}

function extractVehicleMake(vehicleString?: string, vehicleDetails?: any): string {
  if (vehicleDetails?.make) {
    return vehicleDetails.make;
  }
  
  if (vehicleString) {
    // Try to extract make from vehicle string (e.g., "2023 Toyota Camry" -> "Toyota")
    const parts = vehicleString.split(' ');
    if (parts.length >= 2) {
      return parts[1]; // Assuming format: "Year Make Model"
    }
  }
  
  return 'Other';
}
