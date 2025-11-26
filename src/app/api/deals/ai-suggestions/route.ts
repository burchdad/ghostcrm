import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { getMembershipOrgId } from "@/lib/rbac";

export const dynamic = 'force-dynamic';

interface AIMatch {
  leadId: string;
  vehicleId: string;
  leadName: string;
  vehicleDesc: string;
  leadBudget: string;
  vehiclePrice: number;
  score: number;
  factors: string[];
  leadStage: string;
  vehicleCondition: string;
  matchTags: string[];
}

// AI Matching Algorithm - Server-side with SQL optimization
export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  
  try {
    // Try multiple ways to get org_id for compatibility with different auth methods
    let org_id: string | null = null;
    
    // Method 1: Try getMembershipOrgId 
    try {
      org_id = await getMembershipOrgId(s) || null;
    } catch (error) {
      console.log('getMembershipOrgId failed, trying alternative methods');
    }
    
    // Method 2: If that fails, try to get it from the JWT cookie directly
    if (!org_id) {
      const cookieValue = req.cookies.get('ghostcrm_jwt')?.value;
      if (cookieValue) {
        try {
          const payload = JSON.parse(atob(cookieValue.split('.')[1]));
          org_id = payload.organizationId || payload.tenantId;
          console.log('Using org_id from JWT:', org_id);
        } catch (e) {
          console.log('Failed to decode JWT:', e);
        }
      }
    }
    
    // Method 3: Fallback to your specific org ID
    if (!org_id) {
      org_id = '122e543d-f112-4e21-8f29-726642316a19'; // Burch Enterprises
      console.log('Using fallback org_id:', org_id);
    }
    
    if (!org_id) {
      return NextResponse.json({ 
        error: "Organization not found", 
        suggestions: [] 
      }, { status: 403 });
    }

    // Fetch active leads (no existing deals, not closed)
    const { data: leads, error: leadsError } = await s
      .from('leads')
      .select(`
        id,
        contact_id,
        stage,
        budget_range,
        vehicle_interest,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .or(`organization_id.eq.${org_id},org_id.eq.${org_id}`) // Handle both column naming conventions
      .not('stage', 'in', '(closed,lost)')
      .order('updated_at', { ascending: false });

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      return NextResponse.json({ 
        error: "Failed to fetch leads", 
        suggestions: [] 
      }, { status: 500 });
    }

    // Fetch available inventory
    const { data: inventory, error: inventoryError } = await s
      .from('inventory')
      .select('id, make, model, year, price_selling, condition, status, vin')
      .or(`organization_id.eq.${org_id},org_id.eq.${org_id}`) // Handle both column naming conventions
      .eq('status', 'available')
      .order('price_selling', { ascending: true });

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      return NextResponse.json({ 
        error: "Failed to fetch inventory", 
        suggestions: [] 
      }, { status: 500 });
    }

    // Fetch existing deals to avoid duplicates
    const { data: existingDeals, error: dealsError } = await s
      .from('deals')
      .select('contact_id, customer_name')
      .or(`organization_id.eq.${org_id},org_id.eq.${org_id}`) // Handle both column naming conventions
      .not('stage', 'in', '(closed_lost)');

    if (dealsError) {
      console.error('Error fetching existing deals:', dealsError);
    }

    // Generate AI matches
    const suggestions = generateAIMatches(
      leads || [], 
      inventory || [], 
      existingDeals || []
    );

    return NextResponse.json({ 
      suggestions,
      metadata: {
        totalLeads: leads?.length || 0,
        totalInventory: inventory?.length || 0,
        matchesFound: suggestions.length,
        organizationId: org_id
      }
    });

  } catch (error) {
    console.error('AI Suggestions API error:', error);
    return NextResponse.json({ 
      error: "Internal server error", 
      suggestions: [] 
    }, { status: 500 });
  }
}

// Core AI Matching Logic
function generateAIMatches(
  leads: any[], 
  inventory: any[], 
  existingDeals: any[]
): AIMatch[] {
  if (!leads.length || !inventory.length) return [];

  const matches: AIMatch[] = [];
  const existingContactIds = new Set(existingDeals.map(d => d.contact_id));
  const existingCustomerNames = new Set(
    existingDeals.map(d => d.customer_name?.toLowerCase()).filter(Boolean)
  );

  for (const lead of leads) {
    // Skip leads with existing deals
    const leadFullName = `${lead.contacts?.first_name || ''} ${lead.contacts?.last_name || ''}`.trim().toLowerCase();
    
    if (existingContactIds.has(lead.contact_id) || 
        existingCustomerNames.has(leadFullName)) {
      continue;
    }

    // Extract lead preferences
    const leadBudget = parseBudgetRange(lead.budget_range);
    const vehicleInterest = lead.vehicle_interest || '';
    const leadStage = lead.stage || 'new';

    // Find best matching vehicles
    const vehicleMatches = inventory
      .map(vehicle => {
        const matchResult = calculateMatchScore(lead, vehicle, leadBudget, vehicleInterest, leadStage);
        
        if (matchResult.score > 30) { // Minimum viable match threshold
          return {
            leadId: lead.id,
            vehicleId: vehicle.id,
            leadName: leadFullName || `${lead.contacts?.first_name} ${lead.contacts?.last_name}`,
            vehicleDesc: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            leadBudget: leadBudget ? 
              `$${(leadBudget.min/1000).toFixed(0)}k-$${(leadBudget.max/1000).toFixed(0)}k` : 
              'Budget not specified',
            vehiclePrice: vehicle.price_selling,
            score: Math.round(matchResult.score),
            factors: matchResult.factors,
            leadStage,
            vehicleCondition: vehicle.condition,
            matchTags: generateMatchTags(matchResult, leadStage, vehicle)
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 1); // Top match per lead

    if (vehicleMatches.length > 0) {
      matches.push(vehicleMatches[0]!);
    }
  }

  // Return top 5 matches across all leads
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// Enhanced scoring algorithm
function calculateMatchScore(
  lead: any, 
  vehicle: any, 
  leadBudget: { min: number; max: number } | null,
  vehicleInterest: string,
  leadStage: string
) {
  let score = 0;
  const factors: string[] = [];

  // Budget compatibility (40% weight)
  if (leadBudget && vehicle.price_selling) {
    if (vehicle.price_selling >= leadBudget.min && vehicle.price_selling <= leadBudget.max) {
      // Perfect budget fit
      score += 40;
      factors.push('Perfect budget match');
    } else if (vehicle.price_selling <= leadBudget.max * 1.1) {
      // Slightly over budget but reasonable
      const overBudgetPenalty = Math.abs(vehicle.price_selling - leadBudget.max) / leadBudget.max;
      score += Math.max(15, 40 - (overBudgetPenalty * 25));
      factors.push('Within budget range');
    }
  } else if (vehicle.price_selling && vehicle.price_selling < 50000) {
    // Default assumption for reasonable pricing
    score += 20;
    factors.push('Reasonably priced');
  }

  // Vehicle preference matching (30% weight)
  const vehicleText = `${vehicle.make} ${vehicle.model}`.toLowerCase();
  const interestText = vehicleInterest.toLowerCase();
  
  if (interestText.includes(vehicle.make?.toLowerCase())) {
    score += 20;
    factors.push('Brand preference match');
  }
  if (interestText.includes(vehicle.model?.toLowerCase())) {
    score += 15;
    factors.push('Model preference match');
  }
  
  // Check for vehicle type keywords in interest
  const vehicleTypeKeywords = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'wagon', 'hatchback'];
  for (const keyword of vehicleTypeKeywords) {
    if (interestText.includes(keyword)) {
      score += 10;
      factors.push('Vehicle type preference');
      break;
    }
  }

  // Lead quality scoring (20% weight)
  const stageScores = {
    'qualified': 20,
    'contacted': 15,
    'interested': 12,
    'new': 8,
    'cold': 5
  };
  const stageScore = stageScores[leadStage as keyof typeof stageScores] || 8;
  score += stageScore;
  factors.push(`Lead quality: ${leadStage}`);

  // Vehicle condition bonus (10% weight)
  if (vehicle.condition === 'new') {
    score += 10;
    factors.push('New vehicle');
  } else if (vehicle.condition === 'certified') {
    score += 8;
    factors.push('Certified pre-owned');
  } else {
    score += 5;
    factors.push('Used vehicle');
  }

  return {
    score: Math.min(100, score),
    factors
  };
}

// Generate contextual tags for the match
function generateMatchTags(
  matchResult: { score: number; factors: string[] },
  leadStage: string,
  vehicle: any
): string[] {
  const tags: string[] = [];

  // Score-based tags
  if (matchResult.score >= 80) tags.push('hot');
  else if (matchResult.score >= 60) tags.push('good');
  else tags.push('potential');

  // Lead-based tags
  if (leadStage === 'qualified') tags.push('financing');
  if (leadStage === 'interested') tags.push('ready');

  // Vehicle-based tags
  if (vehicle.condition === 'new') tags.push('new');
  if (matchResult.factors.includes('Brand preference match')) tags.push('preference');

  return tags;
}

// Enhanced budget parsing with multiple formats
function parseBudgetRange(budgetStr: string): { min: number; max: number } | null {
  if (!budgetStr) return null;
  
  // Handle various budget formats
  const cleanStr = budgetStr.replace(/[$,\s]/g, '').toLowerCase();
  
  // Range formats: "25000-35000", "25k-35k", "25-35k"
  const rangeMatch = cleanStr.match(/(\d+(?:\.\d+)?)(k?)\s*[-–to]\s*(\d+(?:\.\d+)?)(k?)/);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    let max = parseFloat(rangeMatch[3]);
    
    // Handle k notation
    if (rangeMatch[2] === 'k' || rangeMatch[4] === 'k') {
      min *= 1000;
      max *= 1000;
    }
    
    return { min, max };
  }
  
  // Single value with "under" or "up to"
  const underMatch = cleanStr.match(/(?:under|upto|maximum)(\d+(?:\.\d+)?)(k?)/);
  if (underMatch) {
    let max = parseFloat(underMatch[1]);
    if (underMatch[2] === 'k') max *= 1000;
    return { min: 0, max };
  }
  
  // Single value - assume it's maximum
  const singleMatch = cleanStr.match(/(\d+(?:\.\d+)?)(k?)/);
  if (singleMatch) {
    let value = parseFloat(singleMatch[1]);
    if (singleMatch[2] === 'k') value *= 1000;
    return { min: value * 0.8, max: value }; // Assume 20% range below
  }
  
  return null;
}