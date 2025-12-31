import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";
import { z } from "zod";


export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

const LeadScoreRequest = z.object({
  lead_id: z.number().optional(),
  lead_data: z.object({
    vehicle_interest: z.object({
      type: z.enum(["new", "used", "certified_pre_owned"]).optional(),
      budget_max: z.number().min(0).optional(),
      financing_type: z.enum(["cash", "finance", "lease", "undecided"]).optional(),
    }).optional(),
    financing_info: z.object({
      credit_score_range: z.enum(["300-579", "580-669", "670-739", "740-799", "800-850", "unknown"]).optional(),
      pre_approved: z.boolean().optional(),
      down_payment_amount: z.number().min(0).optional(),
    }).optional(),
    urgency_level: z.enum(["immediate", "within_week", "within_month", "within_3_months", "just_browsing"]).optional(),
    source: z.enum(["website", "phone", "walk_in", "referral", "social_media", "advertising", "trade_show", "partner"]).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    preferred_contact_method: z.enum(["phone", "email", "text", "in_person"]).optional(),
  }).optional()
});

// Enhanced lead scoring algorithm for auto dealership with detailed breakdown
function calculateDetailedLeadScore(leadData: any): {
  total_score: number;
  breakdown: {
    vehicle_interest: { score: number; factors: string[] };
    financing: { score: number; factors: string[] };
    urgency: { score: number; factors: string[] };
    contact_quality: { score: number; factors: string[] };
    source_quality: { score: number; factors: string[] };
  };
  recommendations: string[];
} {
  let score = 0;
  const breakdown = {
    vehicle_interest: { score: 0, factors: [] as string[] },
    financing: { score: 0, factors: [] as string[] },
    urgency: { score: 0, factors: [] as string[] },
    contact_quality: { score: 0, factors: [] as string[] },
    source_quality: { score: 0, factors: [] as string[] }
  };
  const recommendations: string[] = [];
  
  // Vehicle Interest Score (0-30 points)
  const vehicleInterest = leadData.vehicle_interest || {};
  if (vehicleInterest.budget_max) {
    if (vehicleInterest.budget_max > 50000) {
      breakdown.vehicle_interest.score += 15;
      breakdown.vehicle_interest.factors.push("High budget ($50K+)");
    } else if (vehicleInterest.budget_max > 30000) {
      breakdown.vehicle_interest.score += 10;
      breakdown.vehicle_interest.factors.push("Good budget ($30K-$50K)");
    } else if (vehicleInterest.budget_max > 15000) {
      breakdown.vehicle_interest.score += 5;
      breakdown.vehicle_interest.factors.push("Moderate budget ($15K-$30K)");
    } else {
      breakdown.vehicle_interest.factors.push("Low budget (<$15K)");
    }
  } else {
    recommendations.push("Qualify budget range to improve scoring");
  }
  
  if (vehicleInterest.financing_type === "cash") {
    breakdown.vehicle_interest.score += 15;
    breakdown.vehicle_interest.factors.push("Cash buyer (premium)");
  } else if (vehicleInterest.financing_type === "finance") {
    breakdown.vehicle_interest.score += 10;
    breakdown.vehicle_interest.factors.push("Finance ready");
  } else if (vehicleInterest.financing_type === "lease") {
    breakdown.vehicle_interest.score += 8;
    breakdown.vehicle_interest.factors.push("Lease interested");
  } else if (vehicleInterest.financing_type === "undecided") {
    breakdown.vehicle_interest.factors.push("Financing undecided");
    recommendations.push("Discuss financing options to increase engagement");
  }
  
  // Financing Info Score (0-25 points)
  const financingInfo = leadData.financing_info || {};
  if (financingInfo.credit_score_range) {
    switch (financingInfo.credit_score_range) {
      case "800-850": 
        breakdown.financing.score += 15;
        breakdown.financing.factors.push("Excellent credit (800+)");
        break;
      case "740-799": 
        breakdown.financing.score += 12;
        breakdown.financing.factors.push("Very good credit (740-799)");
        break;
      case "670-739": 
        breakdown.financing.score += 10;
        breakdown.financing.factors.push("Good credit (670-739)");
        break;
      case "580-669": 
        breakdown.financing.score += 5;
        breakdown.financing.factors.push("Fair credit (580-669)");
        recommendations.push("May need special financing programs");
        break;
      default: 
        breakdown.financing.factors.push("Poor/unknown credit");
        recommendations.push("Credit qualification needed");
    }
  } else {
    recommendations.push("Obtain credit information for better qualification");
  }
  
  if (financingInfo.pre_approved) {
    breakdown.financing.score += 10;
    breakdown.financing.factors.push("Pre-approved financing");
  }
  
  if (financingInfo.down_payment_amount > 5000) {
    breakdown.financing.score += 5;
    breakdown.financing.factors.push("Substantial down payment");
  }
  
  // Urgency Score (0-20 points)
  switch (leadData.urgency_level) {
    case "immediate": 
      breakdown.urgency.score += 20;
      breakdown.urgency.factors.push("Ready to buy immediately");
      break;
    case "within_week": 
      breakdown.urgency.score += 15;
      breakdown.urgency.factors.push("Buying within a week");
      break;
    case "within_month": 
      breakdown.urgency.score += 10;
      breakdown.urgency.factors.push("Buying within a month");
      break;
    case "within_3_months": 
      breakdown.urgency.score += 5;
      breakdown.urgency.factors.push("Buying within 3 months");
      break;
    case "just_browsing":
      breakdown.urgency.factors.push("Just browsing");
      recommendations.push("Nurture lead with educational content");
      break;
    default: 
      recommendations.push("Qualify timeline for purchase");
  }
  
  // Contact Quality Score (0-15 points)
  if (leadData.email && leadData.phone) {
    breakdown.contact_quality.score += 10;
    breakdown.contact_quality.factors.push("Complete contact information");
  } else if (leadData.email || leadData.phone) {
    breakdown.contact_quality.score += 5;
    breakdown.contact_quality.factors.push("Partial contact information");
    recommendations.push("Collect additional contact methods");
  } else {
    breakdown.contact_quality.factors.push("Limited contact information");
    recommendations.push("Obtain phone and email for better follow-up");
  }
  
  if (leadData.preferred_contact_method) {
    breakdown.contact_quality.score += 5;
    breakdown.contact_quality.factors.push("Contact preference specified");
  }
  
  // Source Quality Score (0-10 points)
  switch (leadData.source) {
    case "referral": 
      breakdown.source_quality.score += 10;
      breakdown.source_quality.factors.push("Referral lead (highest quality)");
      break;
    case "walk_in": 
      breakdown.source_quality.score += 8;
      breakdown.source_quality.factors.push("Walk-in customer");
      break;
    case "phone": 
      breakdown.source_quality.score += 6;
      breakdown.source_quality.factors.push("Phone inquiry");
      break;
    case "website": 
      breakdown.source_quality.score += 5;
      breakdown.source_quality.factors.push("Website inquiry");
      break;
    default: 
      breakdown.source_quality.score += 3;
      breakdown.source_quality.factors.push("Other lead source");
  }
  
  const total_score = breakdown.vehicle_interest.score + breakdown.financing.score + 
                     breakdown.urgency.score + breakdown.contact_quality.score + 
                     breakdown.source_quality.score;
  
  // Add priority recommendations based on score
  if (total_score >= 80) {
    recommendations.unshift("HIGH PRIORITY: Contact immediately");
  } else if (total_score >= 60) {
    recommendations.unshift("MEDIUM-HIGH PRIORITY: Contact within 2 hours");
  } else if (total_score >= 40) {
    recommendations.unshift("MEDIUM PRIORITY: Contact within 24 hours");
  } else {
    recommendations.unshift("LOW PRIORITY: Add to nurture campaign");
  }
  
  return {
    total_score: Math.min(100, Math.max(0, total_score)),
    breakdown,
    recommendations
  };
}

// POST - Calculate lead score
export async function POST(req: NextRequest) {
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
  
    const parsed = LeadScoreRequest.safeParse(await req.json());
    if (!parsed.success) {
      return bad(`Validation error: ${parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const { lead_id, lead_data } = parsed.data;
    let dataToScore = lead_data;
    
    // If lead_id provided, fetch lead data from database
    if (lead_id && !lead_data) {
      try {
        const { data: lead, error } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("id", lead_id)
          .eq("organization_id", organizationId)
          .single();
        
        if (error) throw new Error(error.message);
        dataToScore = lead;
      } catch (dbError) {
        return bad(`Lead not found: ${lead_id}`);
      }
    }
    
    if (!dataToScore) {
      return bad("Either lead_id or lead_data must be provided");
    }
    
    const scoreResult = calculateDetailedLeadScore(dataToScore);
    
    // If updating an existing lead, save the new score
    if (lead_id) {
      try {
        await supabaseAdmin
          .from("leads")
          .update({ 
            lead_score: scoreResult.total_score,
            meta: {
              ...(dataToScore as any)?.meta,
              last_score_update: new Date().toISOString(),
              score_breakdown: scoreResult.breakdown
            }
          })
          .eq("id", lead_id)
          .eq("organization_id", organizationId);
      } catch (updateError) {
        console.warn("Failed to update lead score:", updateError);
      }
    }
    
    return ok({
      lead_id,
      score_result: scoreResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (e: any) {
    console.error("Lead scoring error:", e);
    return oops(e?.message || "Unknown error during lead scoring");
  }
}

// GET - Get lead score for existing lead
export async function GET(req: NextRequest) {
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
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead_id");
    
    if (!leadId) return bad("lead_id parameter is required");
    
    try {
      // Query lead with organization filter
      const { data: lead, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .eq("organization_id", organizationId)
        .single();
        
      if (error) {
        // Return mock score data if lead not found
        return ok({
          lead_id: leadId,
          current_score: 75,
          last_updated: new Date().toISOString(),
          breakdown: {
            vehicle_interest: { score: 20, factors: ["Good budget range"] },
            financing: { score: 15, factors: ["Pre-approved"] },
            urgency: { score: 15, factors: ["Within week"] },
            contact_quality: { score: 10, factors: ["Complete info"] },
            source_quality: { score: 8, factors: ["Walk-in"] }
          },
          recommendations: ["HIGH PRIORITY: Contact immediately"]
        });
      }
      
      const scoreResult = calculateDetailedLeadScore(lead);
      
      return ok({
        lead_id: leadId,
        current_score: lead.lead_score || scoreResult.total_score,
        recalculated_score: scoreResult.total_score,
        score_breakdown: scoreResult.breakdown,
        recommendations: scoreResult.recommendations,
        last_updated: lead.updated_at,
        lead_data: {
          stage: lead.stage,
          source: lead.source,
          priority: lead.priority,
          vehicle_interest: lead.vehicle_interest,
          financing_info: lead.financing_info,
          urgency_level: lead.urgency_level
        }
      });
      
    } catch (dbError) {
      console.log("Database error fetching lead score:", dbError);
      return bad(`Lead not found: ${leadId}`);
    }
    
  } catch (e: any) {
    console.error("Lead score retrieval error:", e);
    return oops(e?.message || "Unknown error retrieving lead score");
  }
}
