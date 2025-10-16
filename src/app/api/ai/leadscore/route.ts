import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Fetch leads data
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (leadsError) {
      console.warn("Database error, using mock lead scores:", leadsError.message);
      return new Response(JSON.stringify({ scores: generateMockLeadScores() }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate scores for existing leads
    const scores = generateLeadScores(leads || []);
    
    return new Response(JSON.stringify({ scores }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Failed to fetch lead scores:", error);
    return new Response(JSON.stringify({ scores: generateMockLeadScores() }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: NextRequest) {
  const { leads, messages } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Missing OpenAI API key", { status: 500 });

  const prompt = `You are an expert CRM assistant. Score each lead from 0-100 based on engagement, recent activity, and likelihood to close. Leads: ${JSON.stringify(leads)}. Messages: ${JSON.stringify(messages)}. Return a JSON array of {leadId, score, suggestion}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(error, { status: 500 });
  }

  const data = await response.json();
  // Extract JSON from OpenAI response
  const text = data.choices?.[0]?.message?.content || "";
  let scores = [];
  try {
    scores = JSON.parse(text);
  } catch {
    scores = [{ error: "Could not parse AI response", raw: text }];
  }
  return new Response(JSON.stringify(scores), { status: 200 });
}

function generateLeadScores(leads: any[]) {
  return leads.map(lead => {
    // Simple scoring algorithm based on available data
    let score = 50; // Base score
    const factors = [];
    
    // Stage-based scoring
    switch (lead.stage) {
      case "qualified":
        score += 30;
        factors.push("Qualified lead");
        break;
      case "proposal":
        score += 25;
        factors.push("Proposal stage");
        break;
      case "negotiation":
        score += 35;
        factors.push("In negotiation");
        break;
      case "new":
        score += 10;
        factors.push("New lead");
        break;
    }
    
    // Value-based scoring
    if (lead.value) {
      const value = parseFloat(lead.value);
      if (value > 10000) {
        score += 20;
        factors.push("High value deal");
      } else if (value > 5000) {
        score += 10;
        factors.push("Medium value deal");
      }
    }
    
    // Recent activity scoring
    const updatedAt = new Date(lead.updated_at);
    const daysSince = (new Date().getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) {
      score += 15;
      factors.push("Recent activity");
    } else if (daysSince > 14) {
      score -= 10;
      factors.push("Stale lead");
    }
    
    // Email engagement (if available)
    if (lead.email) {
      score += 5;
      factors.push("Email available");
    }
    
    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));
    
    // Generate confidence based on data quality
    let confidence = 70;
    if (lead.value) confidence += 10;
    if (lead.phone) confidence += 10;
    if (lead.company) confidence += 10;
    
    // Generate recommendation
    let recommendation = "Continue nurturing";
    if (score >= 80) {
      recommendation = "High priority - contact immediately";
    } else if (score >= 60) {
      recommendation = "Good prospect - schedule follow-up";
    } else if (score < 40) {
      recommendation = "Low priority - automated nurturing";
    }
    
    return {
      leadId: lead.id.toString(),
      name: lead.name || "Unknown",
      email: lead.email || "No email",
      score,
      confidence,
      factors,
      recommendation,
      stage: lead.stage || "new",
      value: lead.value ? parseFloat(lead.value) : undefined
    };
  });
}

function generateMockLeadScores() {
  return [
    {
      leadId: "1",
      name: "John Smith",
      email: "john@techcorp.com",
      score: 92,
      confidence: 85,
      factors: ["High value deal", "Recent activity", "In negotiation"],
      recommendation: "High priority - contact immediately",
      stage: "negotiation",
      value: 25000
    },
    {
      leadId: "2", 
      name: "Sarah Johnson",
      email: "sarah@startup.io",
      score: 78,
      confidence: 72,
      factors: ["Qualified lead", "Medium value deal", "Email available"],
      recommendation: "Good prospect - schedule follow-up",
      stage: "qualified",
      value: 8000
    },
    {
      leadId: "3",
      name: "Mike Chen",
      email: "mike@bigcorp.com",
      score: 45,
      confidence: 68,
      factors: ["New lead", "Email available"],
      recommendation: "Continue nurturing",
      stage: "new",
      value: 3000
    },
    {
      leadId: "4",
      name: "Lisa Rodriguez",
      email: "lisa@company.com",
      score: 35,
      confidence: 60,
      factors: ["Stale lead", "Low engagement"],
      recommendation: "Low priority - automated nurturing",
      stage: "contacted",
      value: 1500
    }
  ];
}
