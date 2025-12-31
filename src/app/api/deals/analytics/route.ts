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
    if (!isAuthenticated(req)) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    if (!org_id) {
      // Return comprehensive mock analytics for auto dealership
      const mockAnalytics = {
        timeframe: `Last ${timeframe} days`,
        summary: {
          total_deals: 89,
          active_deals: 67,
          closed_won: 15,
          closed_lost: 7,
          total_pipeline_value: 2847500,
          closed_revenue: 485000,
          average_deal_size: 32000,
          win_rate: 0.68, // 15/(15+7)
          average_sales_cycle: 18, // days
          conversion_rate: 0.169 // 15/89
        },
        by_stage: {
          prospect: { count: 12, value: 384000, avg_days: 3 },
          qualified: { count: 18, value: 576000, avg_days: 7 },
          proposal: { count: 15, value: 480000, avg_days: 12 },
          negotiation: { count: 11, value: 396000, avg_days: 16 },
          financing: { count: 8, value: 288000, avg_days: 21 },
          paperwork: { count: 3, value: 108000, avg_days: 25 },
          closed_won: { count: 15, value: 485000, avg_days: 28 },
          closed_lost: { count: 7, value: 0, avg_days: 22 }
        },
        by_pipeline: {
          new_vehicle: { 
            count: 45, 
            value: 1580000,
            avg_deal_size: 35111,
            win_rate: 0.72,
            avg_cycle: 19
          },
          certified_pre_owned: { 
            count: 28, 
            value: 812000,
            avg_deal_size: 29000,
            win_rate: 0.68,
            avg_cycle: 16
          },
          used_vehicle: { 
            count: 16, 
            value: 455500,
            avg_deal_size: 28469,
            win_rate: 0.58,
            avg_cycle: 14
          }
        },
        by_vehicle_make: {
          "Toyota": { count: 22, value: 715000, avg_price: 32500 },
          "Honda": { count: 18, value: 522000, avg_price: 29000 },
          "Ford": { count: 15, value: 487500, avg_price: 32500 },
          "Nissan": { count: 12, value: 336000, avg_price: 28000 },
          "Chevrolet": { count: 11, value: 352000, avg_price: 32000 },
          "Other": { count: 11, value: 435000, avg_price: 39545 }
        },
        by_financing_type: {
          finance: { 
            count: 48, 
            value: 1584000, 
            avg_amount: 33000,
            avg_apr: 5.2,
            avg_term: 60 
          },
          lease: { 
            count: 24, 
            value: 768000, 
            avg_payment: 389,
            avg_term: 36 
          },
          cash: { 
            count: 17, 
            value: 495500, 
            avg_amount: 29147
          }
        },
        monthly_trends: [
          { month: "2024-01", deals: 28, revenue: 896000, avg_size: 32000 },
          { month: "2024-02", deals: 32, revenue: 1024000, avg_size: 32000 },
          { month: "2024-03", deals: 29, revenue: 927500, avg_size: 32000 }
        ],
        sales_funnel: {
          prospect_to_qualified: 0.85,
          qualified_to_proposal: 0.78,
          proposal_to_negotiation: 0.72,
          negotiation_to_financing: 0.68,
          financing_to_paperwork: 0.92,
          paperwork_to_closed: 0.95
        },
        top_performers: {
          by_revenue: [
            { sales_rep: "Mike Johnson", deals: 8, revenue: 285000, avg_size: 35625 },
            { sales_rep: "Sarah Williams", deals: 12, revenue: 360000, avg_size: 30000 },
            { sales_rep: "David Chen", deals: 6, revenue: 195000, avg_size: 32500 }
          ],
          by_volume: [
            { sales_rep: "Sarah Williams", deals: 12, revenue: 360000 },
            { sales_rep: "Mike Johnson", deals: 8, revenue: 285000 },
            { sales_rep: "David Chen", deals: 6, revenue: 195000 }
          ]
        },
        trade_in_analysis: {
          deals_with_trade: 52,
          deals_without_trade: 37,
          avg_trade_value: 18500,
          total_trade_value: 962000,
          trade_in_rate: 0.584 // 52/89
        }
      };
      
      return ok(mockAnalytics, res.headers);
    }

    try {
      // Get deal data within timeframe
      const { data: dealData, error: dealError } = await s
        .from("deals")
        .select(`
          *,
          owner:users(id, first_name, last_name)
        `)
        .eq("org_id", org_id)
        .gte("created_at", startDate.toISOString());
      
      if (dealError) throw new Error(dealError.message);
      
      // Apply additional filters
      let filteredDeals = dealData;
      if (pipeline) filteredDeals = filteredDeals.filter(d => d.pipeline === pipeline);
      if (ownerId) filteredDeals = filteredDeals.filter(d => d.owner_id === ownerId);
      if (vehicleType) filteredDeals = filteredDeals.filter(d => d.vehicle_details?.condition === vehicleType);
      
      // Calculate summary metrics
      const totalDeals = filteredDeals.length;
      const activeDeals = filteredDeals.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).length;
      const closedWon = filteredDeals.filter(d => d.stage === "closed_won");
      const closedLost = filteredDeals.filter(d => d.stage === "closed_lost");
      
      const totalPipelineValue = filteredDeals
        .filter(d => !["closed_won", "closed_lost"].includes(d.stage))
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const closedRevenue = closedWon.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const avgDealSize = totalDeals > 0 ? (totalPipelineValue + closedRevenue) / totalDeals : 0;
      const winRate = (closedWon.length + closedLost.length) > 0 ? closedWon.length / (closedWon.length + closedLost.length) : 0;
      
      // Calculate stage distribution
      const stageStats: any = {};
      const stageValues: any = {};
      filteredDeals.forEach(deal => {
        const stage = deal.stage;
        stageStats[stage] = (stageStats[stage] || 0) + 1;
        stageValues[stage] = (stageValues[stage] || 0) + (deal.amount || 0);
      });
      
      // Calculate pipeline distribution
      const pipelineStats: any = {};
      filteredDeals.forEach(deal => {
        const pipeline = deal.pipeline || "default";
        if (!pipelineStats[pipeline]) {
          pipelineStats[pipeline] = { count: 0, value: 0, deals: [] };
        }
        pipelineStats[pipeline].count++;
        pipelineStats[pipeline].value += deal.amount || 0;
        pipelineStats[pipeline].deals.push(deal);
      });
      
      // Calculate vehicle make distribution
      const vehicleMakeStats: any = {};
      filteredDeals.forEach(deal => {
        const make = deal.vehicle_details?.make || "Unknown";
        if (!vehicleMakeStats[make]) {
          vehicleMakeStats[make] = { count: 0, value: 0 };
        }
        vehicleMakeStats[make].count++;
        vehicleMakeStats[make].value += deal.amount || 0;
      });
      
      // Calculate financing type distribution
      const financingStats: any = {};
      filteredDeals.forEach(deal => {
        const type = deal.financing?.type || "unknown";
        if (!financingStats[type]) {
          financingStats[type] = { count: 0, value: 0, terms: [], aprs: [] };
        }
        financingStats[type].count++;
        financingStats[type].value += deal.amount || 0;
        if (deal.financing?.term_months) financingStats[type].terms.push(deal.financing.term_months);
        if (deal.financing?.apr) financingStats[type].aprs.push(deal.financing.apr);
      });
      
      // Calculate trade-in statistics
      const tradesWithTradeIn = filteredDeals.filter(d => d.trade_in?.has_trade);
      const totalTradeValue = tradesWithTradeIn.reduce((sum, deal) => 
        sum + (deal.trade_in?.trade_value_estimate || 0), 0);
      
      const analytics = {
        timeframe: `Last ${timeframe} days`,
        summary: {
          total_deals: totalDeals,
          active_deals: activeDeals,
          closed_won: closedWon.length,
          closed_lost: closedLost.length,
          total_pipeline_value: totalPipelineValue,
          closed_revenue: closedRevenue,
          average_deal_size: avgDealSize,
          win_rate: winRate,
          conversion_rate: totalDeals > 0 ? closedWon.length / totalDeals : 0
        },
        by_stage: Object.keys(stageStats).reduce((acc, stage) => {
          acc[stage] = {
            count: stageStats[stage],
            value: stageValues[stage],
            percentage: (stageStats[stage] / totalDeals) * 100
          };
          return acc;
        }, {} as any),
        by_pipeline: Object.keys(pipelineStats).reduce((acc, pipeline) => {
          const data = pipelineStats[pipeline];
          acc[pipeline] = {
            count: data.count,
            value: data.value,
            avg_deal_size: data.count > 0 ? data.value / data.count : 0,
            percentage: (data.count / totalDeals) * 100
          };
          return acc;
        }, {} as any),
        by_vehicle_make: Object.keys(vehicleMakeStats).reduce((acc, make) => {
          const data = vehicleMakeStats[make];
          acc[make] = {
            count: data.count,
            value: data.value,
            avg_price: data.count > 0 ? data.value / data.count : 0,
            percentage: (data.count / totalDeals) * 100
          };
          return acc;
        }, {} as any),
        by_financing_type: Object.keys(financingStats).reduce((acc, type) => {
          const data = financingStats[type];
          acc[type] = {
            count: data.count,
            value: data.value,
            avg_amount: data.count > 0 ? data.value / data.count : 0,
            avg_apr: data.aprs.length > 0 ? data.aprs.reduce((sum: number, apr: number) => sum + apr, 0) / data.aprs.length : 0,
            avg_term: data.terms.length > 0 ? data.terms.reduce((sum: number, term: number) => sum + term, 0) / data.terms.length : 0
          };
          return acc;
        }, {} as any),
        trade_in_analysis: {
          deals_with_trade: tradesWithTradeIn.length,
          deals_without_trade: totalDeals - tradesWithTradeIn.length,
          avg_trade_value: tradesWithTradeIn.length > 0 ? totalTradeValue / tradesWithTradeIn.length : 0,
          total_trade_value: totalTradeValue,
          trade_in_rate: totalDeals > 0 ? tradesWithTradeIn.length / totalDeals : 0
        }
      };
      
      return ok(analytics, res.headers);
      
    } catch (dbError) {
      console.log("Database error in deal analytics:", dbError);
      // Return basic mock data on database error
      return ok({
        timeframe: `Last ${timeframe} days`,
        summary: { total_deals: 0, error: "Database connection issue" },
        message: "Analytics temporarily unavailable"
      }, res.headers);
    }
    
  } catch (e: any) {
    console.error("Deal analytics error:", e);
    return oops(e?.message || "Unknown error retrieving deal analytics");
  }
}
