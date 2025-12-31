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

// Auto Dealership Lead Analytics
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  
  // Query parameters for analytics filtering
  const timeframe = url.searchParams.get("timeframe") || "30"; // days
  const groupBy = url.searchParams.get("group_by") || "stage"; // stage, source, vehicle_type, etc.
  const includeDetails = url.searchParams.get("details") === "true";
  
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
    
    // For demo purposes, return mock analytics
    // In production, we'd fetch real data using organizationId
    if (!organizationId) {
      // Return comprehensive mock analytics for auto dealership
      const mockAnalytics = {
        timeframe: `Last ${timeframe} days`,
        summary: {
          total_leads: 156,
          new_leads: 23,
          qualified_leads: 45,
          appointments_scheduled: 18,
          test_drives_completed: 12,
          deals_in_progress: 8,
          closed_won: 6,
          closed_lost: 15,
          conversion_rate: 0.038, // 6/156
          average_lead_score: 67.5,
          total_pipeline_value: 485000
        },
        by_stage: {
          inquiry: { count: 34, percentage: 21.8 },
          contacted: { count: 28, percentage: 17.9 },
          qualified: { count: 45, percentage: 28.8 },
          appointment_scheduled: { count: 18, percentage: 11.5 },
          test_drive_completed: { count: 12, percentage: 7.7 },
          negotiating: { count: 8, percentage: 5.1 },
          financing: { count: 5, percentage: 3.2 },
          closed_won: { count: 6, percentage: 3.8 }
        },
        by_source: {
          website: { count: 62, percentage: 39.7, conversion_rate: 0.045 },
          referral: { count: 28, percentage: 17.9, conversion_rate: 0.071 },
          walk_in: { count: 24, percentage: 15.4, conversion_rate: 0.042 },
          phone: { count: 18, percentage: 11.5, conversion_rate: 0.056 },
          social_media: { count: 14, percentage: 9.0, conversion_rate: 0.021 },
          advertising: { count: 10, percentage: 6.4, conversion_rate: 0.030 }
        },
        by_vehicle_type: {
          new: { count: 89, percentage: 57.1, avg_budget: 42500 },
          used: { count: 45, percentage: 28.8, avg_budget: 24800 },
          certified_pre_owned: { count: 22, percentage: 14.1, avg_budget: 31200 }
        },
        by_priority: {
          urgent: { count: 18, percentage: 11.5, avg_score: 89.2 },
          high: { count: 34, percentage: 21.8, avg_score: 78.5 },
          medium: { count: 68, percentage: 43.6, avg_score: 62.1 },
          low: { count: 36, percentage: 23.1, avg_score: 41.3 }
        },
        trends: {
          daily_leads: [
            { date: "2024-01-15", count: 8 },
            { date: "2024-01-16", count: 12 },
            { date: "2024-01-17", count: 6 },
            { date: "2024-01-18", count: 15 },
            { date: "2024-01-19", count: 9 },
            { date: "2024-01-20", count: 11 },
            { date: "2024-01-21", count: 7 }
          ],
          conversion_funnel: {
            inquiry_to_qualified: 0.68,
            qualified_to_appointment: 0.40,
            appointment_to_test_drive: 0.67,
            test_drive_to_negotiation: 0.67,
            negotiation_to_closed: 0.75
          }
        },
        top_performers: {
          vehicle_models: [
            { make: "Toyota", model: "Camry", interest_count: 28 },
            { make: "Honda", model: "CR-V", interest_count: 22 },
            { make: "Ford", model: "F-150", interest_count: 18 },
            { make: "Nissan", model: "Altima", interest_count: 15 }
          ],
          budget_ranges: [
            { range: "$30K-$40K", count: 45, percentage: 28.8 },
            { range: "$20K-$30K", count: 38, percentage: 24.4 },
            { range: "$40K-$50K", count: 32, percentage: 20.5 },
            { range: "$50K+", count: 25, percentage: 16.0 }
          ]
        }
      };
      
      return ok(mockAnalytics);
    }

    try {
      // Get lead counts by stage
      const { data: stageData, error: stageError } = await supabaseAdmin
        .from("leads")
        .select("stage")
        .eq("organization_id", organizationId)
        .gte("created_at", startDate.toISOString());
      
      if (stageError) throw new Error(stageError.message);
      
      // Get lead counts by source
      const { data: sourceData, error: sourceError } = await supabaseAdmin
        .from("leads")
        .select("source, stage")
        .eq("organization_id", organizationId)
        .gte("created_at", startDate.toISOString());
      
      if (sourceError) throw new Error(sourceError.message);
      
      // Get vehicle interest data
      const { data: vehicleData, error: vehicleError } = await supabaseAdmin
        .from("leads")
        .select("vehicle_interest, financing_info")
        .eq("organization_id", organizationId)
        .gte("created_at", startDate.toISOString());
      
      if (vehicleError) throw new Error(vehicleError.message);
      
      // Get lead scores and priority data
      const { data: scoreData, error: scoreError } = await supabaseAdmin
        .from("leads")
        .select("lead_score, priority, stage")
        .eq("organization_id", organizationId)
        .gte("created_at", startDate.toISOString());
      
      if (scoreError) throw new Error(scoreError.message);
      
      // Process stage analytics
      const stageStats: any = {};
      const totalLeads = stageData.length;
      
      stageData.forEach(lead => {
        const stage = lead.stage || "unknown";
        stageStats[stage] = (stageStats[stage] || 0) + 1;
      });
      
      // Process source analytics with conversion rates
      const sourceStats: any = {};
      sourceData.forEach(lead => {
        const source = lead.source || "unknown";
        if (!sourceStats[source]) {
          sourceStats[source] = { count: 0, closed_won: 0 };
        }
        sourceStats[source].count++;
        if (lead.stage === "closed_won") {
          sourceStats[source].closed_won++;
        }
      });
      
      // Process vehicle type analytics
      const vehicleStats: any = { new: 0, used: 0, certified_pre_owned: 0 };
      const budgetTotals: any = { new: [], used: [], certified_pre_owned: [] };
      
      vehicleData.forEach(lead => {
        const vehicleType = lead.vehicle_interest?.type || "unknown";
        if (vehicleStats[vehicleType] !== undefined) {
          vehicleStats[vehicleType]++;
          if (lead.vehicle_interest?.budget_max) {
            budgetTotals[vehicleType].push(lead.vehicle_interest.budget_max);
          }
        }
      });
      
      // Process priority and scoring analytics
      const priorityStats: any = {};
      const scoresByPriority: any = {};
      
      scoreData.forEach(lead => {
        const priority = lead.priority || "unknown";
        if (!priorityStats[priority]) {
          priorityStats[priority] = { count: 0, scores: [] };
        }
        priorityStats[priority].count++;
        if (lead.lead_score) {
          priorityStats[priority].scores.push(lead.lead_score);
        }
      });
      
      // Calculate conversion rates and averages
      const closedWon = stageStats["closed_won"] || 0;
      const conversionRate = totalLeads > 0 ? closedWon / totalLeads : 0;
      
      const analytics = {
        timeframe: `Last ${timeframe} days`,
        summary: {
          total_leads: totalLeads,
          new_leads: stageStats["inquiry"] || 0,
          qualified_leads: stageStats["qualified"] || 0,
          appointments_scheduled: stageStats["appointment_scheduled"] || 0,
          test_drives_completed: stageStats["test_drive_completed"] || 0,
          deals_in_progress: (stageStats["negotiating"] || 0) + (stageStats["financing"] || 0),
          closed_won: closedWon,
          closed_lost: stageStats["closed_lost"] || 0,
          conversion_rate: conversionRate,
          average_lead_score: scoreData.length > 0 ? 
            scoreData.filter(l => l.lead_score).reduce((sum, l) => sum + l.lead_score, 0) / 
            scoreData.filter(l => l.lead_score).length : 0
        },
        by_stage: Object.keys(stageStats).reduce((acc, stage) => {
          acc[stage] = {
            count: stageStats[stage],
            percentage: (stageStats[stage] / totalLeads) * 100
          };
          return acc;
        }, {} as any),
        by_source: Object.keys(sourceStats).reduce((acc, source) => {
          const data = sourceStats[source];
          acc[source] = {
            count: data.count,
            percentage: (data.count / totalLeads) * 100,
            conversion_rate: data.count > 0 ? data.closed_won / data.count : 0
          };
          return acc;
        }, {} as any),
        by_vehicle_type: Object.keys(vehicleStats).reduce((acc, type) => {
          acc[type] = {
            count: vehicleStats[type],
            percentage: (vehicleStats[type] / totalLeads) * 100,
            avg_budget: budgetTotals[type].length > 0 ?
              budgetTotals[type].reduce((sum: number, budget: number) => sum + budget, 0) / budgetTotals[type].length : 0
          };
          return acc;
        }, {} as any),
        by_priority: Object.keys(priorityStats).reduce((acc, priority) => {
          const data = priorityStats[priority];
          acc[priority] = {
            count: data.count,
            percentage: (data.count / totalLeads) * 100,
            avg_score: data.scores.length > 0 ?
              data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length : 0
          };
          return acc;
        }, {} as any)
      };
      
      return ok(analytics);
      
    } catch (dbError) {
      console.log("Database error in lead analytics:", dbError);
      // Return basic mock data on database error
      return ok({
        timeframe: `Last ${timeframe} days`,
        summary: { total_leads: 0, error: "Database connection issue" },
        message: "Analytics temporarily unavailable"
      });
    }
    
  } catch (e: any) {
    console.error("Lead analytics error:", e);
    return oops(e?.message || "Unknown error retrieving lead analytics");
  }
}
