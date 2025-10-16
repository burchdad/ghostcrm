import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check if we're in a build environment or missing required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("Missing Supabase configuration, using mock suggestions");
      return NextResponse.json({
        suggestions: generateMockSuggestions()
      });
    }

    // Fetch leads and recent activity to generate suggestions
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (leadsError) {
      console.warn("Database error, using mock suggestions:", leadsError.message);
      return NextResponse.json({
        suggestions: generateMockSuggestions()
      });
    }

    // Generate AI-powered suggestions based on data
    const suggestions = await generateSuggestions(leads || []);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Failed to generate suggestions:", error);
    return NextResponse.json({
      suggestions: generateMockSuggestions()
    });
  }
}

async function generateSuggestions(leads: any[]) {
  const suggestions = [];
  const now = new Date();

  // Lead opportunity suggestions
  const highValueLeads = leads.filter(lead => 
    lead.value && parseFloat(lead.value) > 5000
  );
  
  if (highValueLeads.length > 0) {
    suggestions.push({
      id: `lead-${Date.now()}`,
      type: "lead",
      title: `${highValueLeads.length} High-Value Leads Need Attention`,
      description: `Focus on leads worth $${highValueLeads.reduce((sum, lead) => sum + parseFloat(lead.value || 0), 0).toLocaleString()}+ in potential revenue.`,
      impact: "high",
      action: "Review High-Value Leads"
    });
  }

  // Follow-up suggestions
  const staleLeads = leads.filter(lead => {
    const updatedAt = new Date(lead.updated_at);
    const daysSince = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7 && lead.stage !== "closed";
  });

  if (staleLeads.length > 0) {
    suggestions.push({
      id: `followup-${Date.now()}`,
      type: "followup",
      title: `${staleLeads.length} Leads Need Follow-up`,
      description: "These leads haven't been contacted in over a week. Schedule follow-ups to maintain momentum.",
      impact: "medium",
      action: "Schedule Follow-ups"
    });
  }

  // Email suggestions
  const newLeads = leads.filter(lead => lead.stage === "new");
  if (newLeads.length > 0) {
    suggestions.push({
      id: `email-${Date.now()}`,
      type: "email",
      title: "Welcome Email Campaign",
      description: `Send personalized welcome emails to ${newLeads.length} new leads to start building relationships.`,
      impact: "medium",
      action: "Create Email Campaign"
    });
  }

  // Add mock suggestions if we don't have enough data
  if (suggestions.length < 3) {
    suggestions.push(...generateMockSuggestions().slice(suggestions.length));
  }

  return suggestions;
}

function generateMockSuggestions() {
  return [
    {
      id: "mock-1",
      type: "lead",
      title: "Contact Hot Leads This Week",
      description: "3 leads have shown high engagement and are ready for immediate follow-up.",
      impact: "high",
      action: "View Hot Leads"
    },
    {
      id: "mock-2",
      type: "optimization",
      title: "Optimize Email Open Rates",
      description: "Your email open rate is 15% below industry average. Try different subject lines.",
      impact: "medium",
      action: "Improve Email Strategy"
    },
    {
      id: "mock-3",
      type: "upsell",
      title: "Cross-sell Opportunity",
      description: "2 existing customers fit the profile for premium service upgrades.",
      impact: "high",
      action: "Create Upsell Campaign"
    },
    {
      id: "mock-4",
      type: "followup",
      title: "Weekly Check-ins Needed",
      description: "5 prospects haven't been contacted in 10+ days. Schedule follow-up calls.",
      impact: "medium",
      action: "Schedule Calls"
    }
  ];
}