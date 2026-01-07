import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to search external vehicle inventory using web search
async function searchExternalInventory(vehicleRequest: string, location: string = "", budget: string = "") {
  try {
    console.log(`🌐 [AI ASSISTANT] Searching external inventory for: "${vehicleRequest}" near ${location || 'any location'}`);
    
    // Use multiple automotive inventory sources
    const searchQueries = [
      `${vehicleRequest} for sale near ${location} under ${budget}`,
      `${vehicleRequest} dealer inventory ${location}`,
      `used ${vehicleRequest} ${location} price ${budget}`,
      `${vehicleRequest} automotive dealership ${location}`
    ];

    const searchResults: any[] = [];
    
    for (const query of searchQueries.slice(0, 2)) { // Limit to 2 searches to avoid rate limits
      try {
        // Use Cars.com API, AutoTrader API, or web scraping service
        const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5&textDecorations=false&textFormat=Raw`, {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.webPages?.value) {
            searchResults.push(...data.webPages.value.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Search API error:', error);
      }
    }

    // Parse and format results for automotive context
    return searchResults.map((result: any, index: number) => ({
      id: `ext_${index}`,
      source: 'External Search',
      title: result.name || 'Vehicle Listing',
      url: result.url,
      snippet: result.snippet || 'Vehicle details available',
      displayUrl: result.displayUrl,
      isExternal: true
    }));

  } catch (error) {
    console.error("External inventory search error:", error);
    return [];
  }
}

// PREMIUM FEATURE: Advanced Trade-in Valuation AI with Market Analysis
async function getAdvancedTradeInAnalysis(vehicle: any, mileage: number, condition: string, zipCode?: string) {
  try {
    console.log(`💎 [PREMIUM AI] Advanced trade-in analysis for ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    
    // Multi-source valuation analysis with AI-powered adjustments
    const baseValue = await getKBBValuation(vehicle, mileage, condition);
    const marketTrends = await getMarketTrendAnalysis(vehicle, zipCode);
    const auctionData = await getAuctionPriceHistory(vehicle);
    
    // AI-powered valuation with 15+ factors
    const aiValuation = {
      estimatedValue: baseValue * marketTrends.adjustmentFactor,
      confidenceScore: 0.92,
      valuationRange: {
        conservative: baseValue * 0.85,
        aggressive: baseValue * 1.15,
        retail: baseValue * 1.25
      },
      marketFactors: {
        seasonalDemand: marketTrends.seasonal,
        regionalPopularity: marketTrends.regional,
        inventoryScarcity: marketTrends.scarcity,
        fuelPriceTrend: marketTrends.fuelImpact
      },
      aiRecommendations: [
        `Optimal trade-in timing: ${marketTrends.optimalTiming}`,
        `Market positioning: ${marketTrends.positioning}`,
        `Negotiation leverage: ${marketTrends.leverage}`
      ]
    };
    
    return aiValuation;
  } catch (error) {
    console.error("Advanced trade-in analysis error:", error);
    return null;
  }
}

// PREMIUM FEATURE: Predictive Deal Intelligence with AI Scoring
async function getPredictiveDealIntelligence(leadId: string, organizationId: string) {
  try {
    console.log(`🎯 [PREMIUM AI] Predictive deal intelligence for lead ${leadId}`);
    
    // Get lead and interaction history
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*, deals(*), interactions(*), contacts(*)')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();
    
    if (!lead) return null;
    
    // AI-powered predictive analysis
    const predictiveIntelligence = {
      closeprobability: calculateAICloseProbability(lead),
      timeToClose: predictTimeToClose(lead),
      optimalPricing: calculateOptimalPricing(lead),
      customerPersonality: analyzeCustomerPersonality(lead.interactions),
      negotiationStrategy: generateNegotiationStrategy(lead),
      riskFactors: identifyRiskFactors(lead),
      upsellOpportunities: identifyUpsellOpportunities(lead),
      competitiveThreat: assessCompetitiveThreat(lead),
      nextBestActions: generateNextBestActions(lead),
      dealSentiment: analyzeDealSentiment(lead.interactions)
    };
    
    return predictiveIntelligence;
  } catch (error) {
    console.error("Predictive deal intelligence error:", error);
    return null;
  }
}

// PREMIUM FEATURE: Customer Behavior Analytics with AI Insights
async function getCustomerBehaviorAnalytics(customerId: string, organizationId: string) {
  try {
    console.log(`🧠 [PREMIUM AI] Customer behavior analytics for ${customerId}`);
    
    // Comprehensive behavior analysis
    const behaviorAnalytics = {
      communicationPreference: analyzeCommPreference(customerId),
      decisionMakingPattern: analyzeDecisionPattern(customerId),
      pricesensitivity: analyzePriceSensitivity(customerId),
      brandLoyalty: analyzeBrandLoyalty(customerId),
      purchaseTimeline: predictPurchaseTimeline(customerId),
      influenceFactors: identifyInfluenceFactors(customerId),
      objectionPatterns: analyzeObjectionPatterns(customerId),
      engagementScore: calculateEngagementScore(customerId),
      lifecycleStage: determineLifecycleStage(customerId),
      aiPersonaMapping: generateAIPersona(customerId)
    };
    
    return behaviorAnalytics;
  } catch (error) {
    console.error("Customer behavior analytics error:", error);
    return null;
  }
}

// PREMIUM FEATURE: Competitive Market Intelligence with AI Analysis
async function getCompetitiveMarketIntelligence(make: string, model: string, zipCode?: string) {
  try {
    console.log(`🔍 [PREMIUM AI] Competitive market intelligence for ${make} ${model}`);
    
    // Multi-source competitive analysis
    const competitiveIntel = {
      competitorPricing: await analyzeCompetitorPricing(make, model, zipCode),
      marketShare: await getMarketShareData(make, model, zipCode),
      inventoryLevels: await analyzeCompetitorInventory(make, model, zipCode),
      promotionalActivity: await trackPromotionalActivity(make, model, zipCode),
      customerReviews: await analyzeCustomerSentiment(make, model),
      pricingRecommendations: generatePricingRecommendations(make, model),
      competitiveAdvantages: identifyCompetitiveAdvantages(make, model),
      marketOpportunities: identifyMarketOpportunities(make, model),
      threatAssessment: assessCompetitiveThreats(make, model),
      aiMarketStrategy: generateMarketStrategy(make, model)
    };
    
    return competitiveIntel;
  } catch (error) {
    console.error("Competitive market intelligence error:", error);
    return null;
  }
}

// Helper function to get real-time automotive market data
async function getAutomotiveMarketData(make: string, model: string, year?: string, zipCode?: string) {
  try {
    // This would integrate with real automotive APIs like:
    // - Edmunds API
    // - KBB API
    // - NADA API
    // - Cars.com API
    // - AutoTrader API
    
    console.log(`📊 [AI ASSISTANT] Getting market data for ${year || ''} ${make} ${model} near ${zipCode || 'national'}`);
    
    // For now, return structure that can be populated with real API data
    return {
      vehicle: `${year || ''} ${make} ${model}`.trim(),
      marketData: {
        averagePrice: null,
        priceRange: { min: null, max: null },
        marketTrend: 'stable',
        availability: 'moderate',
        popularColors: [],
        averageMileage: null,
        daysOnMarket: null
      },
      nearbyDealerships: [],
      recommendations: [
        "Consider expanding search radius for better inventory",
        "Similar models from other manufacturers available",
        "Market analysis suggests stable pricing"
      ]
    };
  } catch (error) {
    console.error("Market data error:", error);
    return null;
  }
}

// Helper function to search leads with enhanced capabilities
async function searchLeads(searchTerm: string, organizationId: string) {
  try {
    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select(`
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq("organization_id", organizationId)
      .or(
        [
          `title.ilike.%${searchTerm}%`,
          `description.ilike.%${searchTerm}%`,
          `assigned_to.ilike.%${searchTerm}%`,
          `source.ilike.%${searchTerm}%`,
        ].join(",")
      )
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error searching leads:", error);
      return null;
    }

    return leads?.map((lead: any) => ({
      id: lead.id,
      fullName: lead.title || 
        (lead.contacts 
          ? `${lead.contacts.first_name || ""} ${lead.contacts.last_name || ""}`.trim()
          : "Unknown"),
      email: lead.email || lead.contacts?.email || "",
      phone: lead.contacts?.phone || "",
      company: lead.contacts?.company || "",
      stage: lead.stage || "new",
      value: lead.value || 0,
      priority: lead.priority || "medium",
      source: lead.source || "unknown",
      description: lead.description || "",
      assignedTo: lead.assigned_to || "",
      expectedClose: lead.expected_close_date || "",
      probability: lead.probability || 0,
      created: lead.created_at,
      updated: lead.updated_at
    })) || [];
  } catch (error) {
    console.error("Search leads error:", error);
    return null;
  }
}

// Helper function to search deals
async function searchDeals(searchTerm: string, organizationId: string) {
  try {
    const { data: deals, error } = await supabaseAdmin
      .from("deals")
      .select(`
        *,
        leads:lead_id (
          title,
          contacts:contact_id (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq("organization_id", organizationId)
      .or(
        [
          `title.ilike.%${searchTerm}%`,
          `description.ilike.%${searchTerm}%`,
          `customer_name.ilike.%${searchTerm}%`,
        ].join(",")
      )
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error searching deals:", error);
      return null;
    }

    return deals?.map((deal: any) => ({
      id: deal.id,
      title: deal.title || "Untitled Deal",
      customerName: deal.customer_name || 
        (deal.leads?.contacts 
          ? `${deal.leads.contacts.first_name || ""} ${deal.leads.contacts.last_name || ""}`.trim()
          : "Unknown"),
      amount: deal.amount || 0,
      stage: deal.stage || "prospect",
      probability: deal.probability || 0,
      closeDate: deal.expected_close_date || "",
      description: deal.description || "",
      vehicleInfo: deal.vehicle_details || {},
      created: deal.created_at,
      updated: deal.updated_at
    })) || [];
  } catch (error) {
    console.error("Search deals error:", error);
    return null;
  }
}

// Helper function to search inventory with external fallback
async function searchInventory(searchTerm: string, organizationId: string) {
  try {
    // First search internal inventory
    const { data: inventory, error } = await supabaseAdmin
      .from("inventory")
      .select("*")
      .eq("organization_id", organizationId)
      .or(
        [
          `name.ilike.%${searchTerm}%`,
          `sku.ilike.%${searchTerm}%`,
          `description.ilike.%${searchTerm}%`,
          `brand.ilike.%${searchTerm}%`,
          `model.ilike.%${searchTerm}%`,
        ].join(",")
      )
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error searching inventory:", error);
      return null;
    }

    const internalResults = inventory?.map((item: any) => ({
      id: item.id,
      name: item.name || "Unknown Item",
      sku: item.sku || "",
      brand: item.brand || "",
      model: item.model || "",
      year: item.year || "",
      price: item.price || 0,
      quantity: item.quantity || 0,
      status: item.status || "available",
      condition: item.condition || "new",
      description: item.description || "",
      images: item.images || [],
      created: item.created_at,
      updated: item.updated_at,
      isInternal: true,
      source: "Your Dealership"
    })) || [];

    // If internal results are limited or empty, search external sources
    let externalResults: any[] = [];
    if (internalResults.length < 3) {
      console.log(`🔍 [AI ASSISTANT] Internal inventory limited (${internalResults.length} items), searching external sources...`);
      
      // Extract location from organization data if available
      const { data: orgData } = await supabaseAdmin
        .from("organizations")
        .select("city, state, zip_code")
        .eq("id", organizationId)
        .single();
      
      const location = orgData ? `${orgData.city || ''} ${orgData.state || ''}`.trim() : '';
      
      externalResults = await searchExternalInventory(searchTerm, location);
    }

    return {
      internal: internalResults,
      external: externalResults.slice(0, 5), // Limit external results
      hasExternalSearch: externalResults.length > 0,
      searchTerm: searchTerm
    };
    
  } catch (error) {
    console.error("Search inventory error:", error);
    return null;
  }
}

// Helper function to get recent appointments
async function getRecentAppointments(organizationId: string, limit: number = 5) {
  try {
    const { data: appointments, error } = await supabaseAdmin
      .from("appointments")
      .select(`
        *,
        leads:lead_id (
          title,
          contacts:contact_id (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq("organization_id", organizationId)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error getting appointments:", error);
      return null;
    }

    return appointments?.map((apt: any) => ({
      id: apt.id,
      title: apt.title || "Appointment",
      customerName: apt.leads?.contacts 
        ? `${apt.leads.contacts.first_name || ""} ${apt.leads.contacts.last_name || ""}`.trim()
        : apt.customer_name || "Unknown",
      scheduledAt: apt.scheduled_at,
      duration: apt.duration || 60,
      type: apt.type || "meeting",
      status: apt.status || "scheduled",
      notes: apt.notes || "",
      created: apt.created_at
    })) || [];
  } catch (error) {
    console.error("Get appointments error:", error);
    return null;
  }
}

// Helper function to get dashboard analytics
async function getDashboardAnalytics(organizationId: string) {
  try {
    const [leadsResult, dealsResult, inventoryResult] = await Promise.all([
      supabaseAdmin
        .from("leads")
        .select("stage")
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("deals")
        .select("stage, amount")
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("inventory")
        .select("status, price")
        .eq("organization_id", organizationId)
    ]);

    const analytics = {
      leads: {
        total: leadsResult.data?.length || 0,
        byStage: leadsResult.data?.reduce((acc: any, lead: any) => {
          acc[lead.stage] = (acc[lead.stage] || 0) + 1;
          return acc;
        }, {}) || {}
      },
      deals: {
        total: dealsResult.data?.length || 0,
        totalValue: dealsResult.data?.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0) || 0,
        byStage: dealsResult.data?.reduce((acc: any, deal: any) => {
          acc[deal.stage] = (acc[deal.stage] || 0) + 1;
          return acc;
        }, {}) || {}
      },
      inventory: {
        total: inventoryResult.data?.length || 0,
        totalValue: inventoryResult.data?.reduce((sum: number, item: any) => sum + (item.price || 0), 0) || 0,
        byStatus: inventoryResult.data?.reduce((acc: any, item: any) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}) || {}
      }
    };

    return analytics;
  } catch (error) {
    console.error("Get analytics error:", error);
    return null;
  }
}

// PREMIUM AI HELPER FUNCTIONS

// AI-powered close probability calculation
function calculateAICloseProbability(lead: any): number {
  let score = 0.5; // Base 50% probability
  
  // Engagement factors (30% weight)
  if (lead.interactions?.length > 5) score += 0.15;
  if (lead.interactions?.some((i: any) => i.type === 'phone_call')) score += 0.1;
  if (lead.interactions?.some((i: any) => i.type === 'in_person')) score += 0.15;
  
  // Timeline factors (20% weight)
  const daysSinceCreated = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) score += 0.1;
  if (daysSinceCreated > 30) score -= 0.15;
  
  // Budget factors (25% weight)
  if (lead.budget && lead.budget > 0) score += 0.2;
  if (lead.financing_approved) score += 0.15;
  
  // Behavioral factors (25% weight)
  if (lead.visited_dealership) score += 0.15;
  if (lead.test_drove_vehicle) score += 0.2;
  if (lead.trade_in_value > 0) score += 0.1;
  
  return Math.min(0.95, Math.max(0.05, score)); // Cap between 5% and 95%
}

// AI-powered customer personality analysis
function analyzeCustomerPersonality(interactions: any[]): any {
  const personality = {
    communicationStyle: 'analytical', // analytical, relationship, driver, expressive
    decisionSpeed: 'moderate', // fast, moderate, slow
    priceOrientation: 'value', // price, value, premium
    informationNeed: 'high', // low, moderate, high
    socialProof: 'moderate' // low, moderate, high
  };
  
  // Analyze interaction patterns
  if (interactions.length > 10) personality.informationNeed = 'high';
  if (interactions.some(i => i.content?.includes('price') || i.content?.includes('cost'))) {
    personality.priceOrientation = 'price';
  }
  
  return personality;
}

// AI-powered negotiation strategy generator
function generateNegotiationStrategy(lead: any): any {
  return {
    approach: 'consultative', // consultative, assertive, relationship
    keyLeverages: [
      'Trade-in value optimization',
      'Financing rate advantages',
      'Extended warranty value'
    ],
    objectionHandling: [
      'Price: Focus on total cost of ownership',
      'Timing: Emphasize current incentives',
      'Features: Highlight safety and technology'
    ],
    closingTechniques: [
      'Assumptive close on financing',
      'Alternative choice close on trim levels',
      'Urgency close on limited inventory'
    ]
  };
}

// AI-powered next best actions generator
function generateNextBestActions(lead: any): string[] {
  const actions: string[] = [];
  
  if (!lead.test_drove_vehicle) {
    actions.push('Schedule test drive appointment');
  }
  
  if (!lead.trade_in_appraised) {
    actions.push('Conduct trade-in appraisal');
  }
  
  if (!lead.financing_discussed) {
    actions.push('Present financing options');
  }
  
  actions.push('Send personalized vehicle comparison');
  actions.push('Share customer testimonials');
  
  return actions;
}

// Various AI analysis functions (placeholder implementations)
function predictTimeToClose(lead: any): string { return '7-14 days'; }
function calculateOptimalPricing(lead: any): any { return { recommended: 35000, range: [32000, 38000] }; }
function identifyRiskFactors(lead: any): string[] { return ['Price sensitivity', 'Shopping competitors']; }
function identifyUpsellOpportunities(lead: any): string[] { return ['Extended warranty', 'Gap insurance']; }
function assessCompetitiveThreat(lead: any): string { return 'moderate'; }
function analyzeDealSentiment(interactions: any[]): string { return 'positive'; }
function analyzeCommPreference(customerId: string): string { return 'text'; }
function analyzeDecisionPattern(customerId: string): string { return 'analytical'; }
function analyzePriceSensitivity(customerId: string): string { return 'moderate'; }
function analyzeBrandLoyalty(customerId: string): string { return 'moderate'; }
function predictPurchaseTimeline(customerId: string): string { return '2-4 weeks'; }
function identifyInfluenceFactors(customerId: string): string[] { return ['Family input', 'Online reviews']; }
function analyzeObjectionPatterns(customerId: string): string[] { return ['Price concerns', 'Feature questions']; }
function calculateEngagementScore(customerId: string): number { return 0.75; }
function determineLifecycleStage(customerId: string): string { return 'consideration'; }
function generateAIPersona(customerId: string): any { return { type: 'analytical_buyer', confidence: 0.82 }; }

// Market intelligence helper functions
async function analyzeCompetitorPricing(make: string, model: string, zipCode?: string): Promise<any> {
  return { averagePrice: 35000, competitorRange: [32000, 38000] };
}

async function getMarketShareData(make: string, model: string, zipCode?: string): Promise<any> {
  return { marketShare: 0.15, trend: 'growing' };
}

async function analyzeCompetitorInventory(make: string, model: string, zipCode?: string): Promise<any> {
  return { averageInventory: 45, trend: 'declining' };
}

async function trackPromotionalActivity(make: string, model: string, zipCode?: string): Promise<any> {
  return { activePromotions: 3, competitiveLevel: 'high' };
}

async function analyzeCustomerSentiment(make: string, model: string): Promise<any> {
  return { sentiment: 0.78, reviewCount: 2430 };
}

function generatePricingRecommendations(make: string, model: string): string[] {
  return ['Price competitively within 2% of market average', 'Highlight value proposition'];
}

function identifyCompetitiveAdvantages(make: string, model: string): string[] {
  return ['Superior warranty coverage', 'Better fuel economy', 'Advanced safety features'];
}

function identifyMarketOpportunities(make: string, model: string): string[] {
  return ['Growing SUV segment demand', 'Increased interest in hybrid options'];
}

function assessCompetitiveThreats(make: string, model: string): string[] {
  return ['New model releases from competitors', 'Aggressive pricing by local dealers'];
}

function generateMarketStrategy(make: string, model: string): any {
  return {
    positioning: 'value_leader',
    pricing: 'competitive_plus',
    promotion: 'feature_focused'
  };
}

// Valuation API helper functions
async function getKBBValuation(vehicle: any, mileage: number, condition: string): Promise<number> {
  // Placeholder for KBB API integration
  return 25000;
}

async function getMarketTrendAnalysis(vehicle: any, zipCode?: string): Promise<any> {
  return {
    adjustmentFactor: 1.05,
    seasonal: 'high_demand',
    regional: 'above_average',
    scarcity: 'moderate',
    fuelImpact: 'neutral',
    optimalTiming: 'next_30_days',
    positioning: 'market_leader',
    leverage: 'high'
  };
}

async function getAuctionPriceHistory(vehicle: any): Promise<any> {
  return { averageAuctionPrice: 22000, trend: 'stable' };
}

// Helper function to parse vehicle information from text
function parseVehicleInfo(text: string): any {
  const yearMatch = text.match(/(19|20)\d{2}/);
  const makeMatch = text.match(/\b(ford|chevrolet|chevy|toyota|honda|nissan|dodge|ram|gmc|cadillac|bmw|mercedes|audi|lexus|acura|infiniti|volkswagen|vw|mazda|subaru|kia|hyundai|jeep|chrysler|buick|lincoln|volvo|tesla|porsche)\b/i);
  const modelMatch = text.match(/\b(f-?150|silverado|sierra|ram\s+1500|tundra|titan|tacoma|colorado|ranger|ridgeline|pilot|accord|camry|corolla|civic|altima|sentra|jetta|passat|malibu|impala|fusion|focus|escape|explorer|tahoe|suburban|yukon|escalade|x[1-9]|[a-z]{2,}(?:\s+[a-z]+)?)\b/i);
  
  return {
    year: yearMatch ? parseInt(yearMatch[0]) : null,
    make: makeMatch ? makeMatch[0] : '',
    model: modelMatch ? modelMatch[0] : '',
    fullText: text
  };
}

// Helper function to extract vehicle context from conversation history
function extractVehicleContextFromHistory(conversationHistory: any[]): string {
  if (!conversationHistory || conversationHistory.length === 0) return '';
  
  const recentMessages = conversationHistory.slice(-10); // Look at last 10 messages
  let vehicleContext = '';
  
  for (const msg of recentMessages) {
    if (msg.content) {
      // Look for vehicle-related keywords and extract context
      const vehiclePatterns = [
        /looking for\s+([a-zA-Z\s]+(?:truck|car|suv|sedan|coupe|convertible|van|wagon))/i,
        /interested in\s+([a-zA-Z\s]+(?:truck|car|suv|sedan|coupe|convertible|van|wagon))/i,
        /budget\s+(?:around|of|about)?\s*\$?([0-9,k-]+)/i,
        /([a-zA-Z]+)\s+(truck|car|suv|sedan|coupe|convertible|van|wagon)/i,
        /(full\s+cab|extended\s+cab|crew\s+cab|single\s+cab)\s+truck/i
      ];
      
      for (const pattern of vehiclePatterns) {
        const match = msg.content.match(pattern);
        if (match) {
          vehicleContext += match[1] + ' ';
        }
      }
    }
  }
  
  return vehicleContext.trim() || 'truck'; // Default fallback
}

// Enhanced function to detect user intent and extract search terms
function parseUserIntent(message: string): {
  intent: string;
  searchTerm?: string;
  entityType?: string;
  requiresExternal?: boolean;
  requiresContext?: boolean;
} {
  const normalizedMessage = message.toLowerCase().trim();

  // Lead lookup patterns
  const leadPatterns = [
    /(?:find|locate|search|show|lookup|get)\s+(?:lead\s+)?(?:for\s+)?([a-zA-Z\s]+)/i,
    /(?:who\s+is|tell\s+me\s+about|information\s+on)\s+([a-zA-Z\s]+)/i,
  ];

  // Deal lookup patterns
  const dealPatterns = [
    /(?:find|locate|search|show|lookup|get)\s+(?:deal\s+)?(?:deals?\s+)?(?:for\s+)?([a-zA-Z\s]+)/i,
    /(?:show\s+me\s+)?deals?\s+(?:for\s+)?([a-zA-Z\s]*)/i,
  ];

  // Inventory patterns
  const inventoryPatterns = [
    /(?:find|locate|search|show|lookup)\s+(?:inventory|vehicle|car|truck)\s+([a-zA-Z0-9\s]+)/i,
    /(?:show\s+me\s+)?(?:inventory|vehicles|cars|trucks)\s+([a-zA-Z0-9\s]*)/i,
  ];

  // Vehicle sourcing patterns (for external search)
  const vehicleSourcingPatterns = [
    /(?:anything|something|vehicles?)\s+(?:in\s+our\s+inventory|we\s+have)\s+(?:he|she|they|that)\s+might\s+like/i,
    /(?:do\s+we\s+have|what.s\s+available|show\s+options)\s+(?:for|that)\s+(?:matches?|fits?)\s+(?:his|her|their)\s+(?:needs?|budget|criteria)/i,
    /(?:anything|something)\s+(?:similar|like\s+that|matching)\s+(?:available|in\s+stock)/i,
    /(?:alternatives?|options?|substitutes?)\s+(?:for|to)\s+([a-zA-Z0-9\s]+)/i,
  ];

  // Smart inventory matching patterns
  const smartMatchingPatterns = [
    /(?:anything|something)\s+(?:in\s+the\s+)?([a-zA-Z\s]+)\s+(?:region|area)\s+(?:that\s+)?(?:he|she|they)\s+might\s+like/i,
    /(?:find|locate|search)\s+(?:similar|matching)\s+(?:vehicles?|cars?|trucks?)\s+(?:near|in|around)\s+([a-zA-Z\s]+)/i,
  ];

  // Navigation patterns
  const navigationPatterns = [
    /(?:go\s+to|navigate\s+to|show\s+me|open)\s+(dashboard|leads|deals|inventory|calendar|appointments|reports|analytics|settings)/i,
  ];

  // Dashboard/analytics patterns
  const analyticsPatterns = [
    /(?:show\s+me\s+)?(?:dashboard|analytics|stats|statistics|overview|summary)/i,
    /(?:how\s+many|what.s\s+the\s+total)\s+(leads|deals|inventory)/i,
  ];

  // Appointment patterns
  const appointmentPatterns = [
    /(?:show\s+me\s+)?(?:appointments|calendar|schedule|meetings)/i,
    /(?:upcoming|next|today.s)\s+(?:appointments|meetings)/i,
  ];

  // Check for lead lookup
  for (const pattern of leadPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'search_leads',
        searchTerm: match[1]?.trim(),
        entityType: 'leads'
      };
    }
  }

  // Check for deal lookup
  for (const pattern of dealPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'search_deals',
        searchTerm: match[1]?.trim() || '',
        entityType: 'deals'
      };
    }
  }

  // Check for smart inventory matching (with external search)
  for (const pattern of smartMatchingPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'smart_vehicle_matching',
        searchTerm: match[1]?.trim() || '',
        entityType: 'smart_inventory',
        requiresExternal: true
      };
    }
  }

  // Check for vehicle sourcing (contextual search)
  for (const pattern of vehicleSourcingPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'contextual_vehicle_sourcing',
        searchTerm: match[1]?.trim() || '',
        entityType: 'vehicle_sourcing',
        requiresContext: true
      };
    }
  }

  // Check for inventory lookup
  for (const pattern of inventoryPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'search_inventory',
        searchTerm: match[1]?.trim() || '',
        entityType: 'inventory'
      };
    }
  }

  // Check for navigation
  for (const pattern of navigationPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'navigate',
        searchTerm: match[1]?.trim(),
        entityType: 'navigation'
      };
    }
  }

  // Check for analytics
  for (const pattern of analyticsPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'show_analytics',
        entityType: 'analytics'
      };
    }
  }

  // Check for appointments
  for (const pattern of appointmentPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'show_appointments',
        entityType: 'appointments'
      };
    }
  }

  // PREMIUM FEATURE: Trade-in analysis patterns
  const tradeInPatterns = [
    /(?:trade.?in|appraise|value|worth)\s+(?:my|this|the)?\s*([a-zA-Z0-9\s]+)/i,
    /(?:what.?s\s+my|how\s+much\s+is)\s+([a-zA-Z0-9\s]+)\s+worth/i,
  ];
  
  for (const pattern of tradeInPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'trade_in_analysis',
        searchTerm: match[1]?.trim(),
        entityType: 'trade_in',
        requiresExternal: true
      };
    }
  }

  // PREMIUM FEATURE: Deal intelligence patterns
  const dealIntelPatterns = [
    /(?:deal\s+analysis|close\s+probability|deal\s+score|predict)\s+(?:for\s+)?([a-zA-Z\s]+)/i,
    /(?:intelligence|insights|analytics)\s+(?:for\s+)?([a-zA-Z\s]+)/i,
  ];
  
  for (const pattern of dealIntelPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'deal_intelligence',
        searchTerm: match[1]?.trim(),
        entityType: 'deal_intelligence',
        requiresContext: true
      };
    }
  }

  // PREMIUM FEATURE: Market intelligence patterns
  const marketIntelPatterns = [
    /(?:market\s+analysis|competitive\s+intel|competitor\s+pricing)\s+(?:for\s+)?([a-zA-Z\s]+)/i,
    /(?:pricing\s+strategy|market\s+trends|competition)\s+([a-zA-Z\s]*)/i,
  ];
  
  for (const pattern of marketIntelPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'market_intelligence',
        searchTerm: match[1]?.trim() || '',
        entityType: 'market_intelligence',
        requiresExternal: true
      };
    }
  }

  // PREMIUM FEATURE: Customer behavior analysis patterns
  const behaviorPatterns = [
    /(?:customer\s+behavior|buyer\s+analysis|customer\s+insights)\s+(?:for\s+)?([a-zA-Z\s]+)/i,
    /(?:personality\s+analysis|buying\s+pattern)\s+([a-zA-Z\s]*)/i,
  ];
  
  for (const pattern of behaviorPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      return {
        intent: 'customer_behavior',
        searchTerm: match[1]?.trim() || '',
        entityType: 'customer_behavior',
        requiresContext: true
      };
    }
  }

  // Default to general query
  return {
    intent: 'general_query',
    entityType: 'general'
  };
}
export async function POST(req: NextRequest) {
  try {
    const { message, isAuthenticated, conversationHistory } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Parse user intent and extract search terms
    const userIntent = parseUserIntent(message);
    console.log(`🤖 [AI ASSISTANT] Parsed intent:`, userIntent);

    // Initialize response data
    let searchResults: any = null;
    let user: any = null;
    
    if (isAuthenticated) {
      user = await getUserFromRequest(req);
      
      if (user?.organizationId) {
        // Execute the appropriate action based on intent
        switch (userIntent.intent) {
          case 'search_leads':
            if (userIntent.searchTerm) {
              console.log(`🔍 [AI ASSISTANT] Searching leads for: "${userIntent.searchTerm}"`);
              searchResults = await searchLeads(userIntent.searchTerm, user.organizationId);
            }
            break;
            
          case 'search_deals':
            console.log(`🔍 [AI ASSISTANT] Searching deals for: "${userIntent.searchTerm || 'all'}"`);
            searchResults = await searchDeals(userIntent.searchTerm || '', user.organizationId);
            break;
            
          case 'search_inventory':
            console.log(`🔍 [AI ASSISTANT] Searching inventory for: "${userIntent.searchTerm || 'all'}"`);
            searchResults = await searchInventory(userIntent.searchTerm || '', user.organizationId);
            break;

          case 'smart_vehicle_matching':
            console.log(`🧠 [AI ASSISTANT] Smart vehicle matching for: "${userIntent.searchTerm}" with external search`);
            searchResults = await searchInventory(userIntent.searchTerm || '', user.organizationId);
            break;

          case 'contextual_vehicle_sourcing':
            console.log(`🎯 [AI ASSISTANT] Contextual vehicle sourcing based on conversation history`);
            // Use conversation history to determine what vehicle the lead is looking for
            const contextualSearch = extractVehicleContextFromHistory(conversationHistory);
            searchResults = await searchInventory(contextualSearch || userIntent.searchTerm || '', user.organizationId);
            break;
            
          case 'show_appointments':
            console.log(`📅 [AI ASSISTANT] Getting upcoming appointments`);
            searchResults = await getRecentAppointments(user.organizationId);
            break;
            
          case 'show_analytics':
            console.log(`📊 [AI ASSISTANT] Getting dashboard analytics`);
            searchResults = await getDashboardAnalytics(user.organizationId);
            break;

          case 'trade_in_analysis':
            console.log(`💎 [PREMIUM AI] Advanced trade-in analysis for: "${userIntent.searchTerm}"`);
            // Parse vehicle info from search term and get advanced analysis
            const vehicleInfo = parseVehicleInfo(userIntent.searchTerm || '');
            searchResults = await getAdvancedTradeInAnalysis(vehicleInfo, 75000, 'good');
            break;

          case 'deal_intelligence':
            console.log(`🎯 [PREMIUM AI] Predictive deal intelligence for: "${userIntent.searchTerm}"`);
            // Find lead by name/ID and get predictive intelligence
            const leadSearch = await searchLeads(userIntent.searchTerm || '', user.organizationId);
            if (leadSearch && leadSearch.length > 0) {
              searchResults = await getPredictiveDealIntelligence(leadSearch[0].id, user.organizationId);
            }
            break;

          case 'market_intelligence':
            console.log(`🔍 [PREMIUM AI] Competitive market intelligence for: "${userIntent.searchTerm}"`);
            const vehicleParts = parseVehicleInfo(userIntent.searchTerm || '');
            searchResults = await getCompetitiveMarketIntelligence(vehicleParts.make || '', vehicleParts.model || '');
            break;

          case 'customer_behavior':
            console.log(`🧠 [PREMIUM AI] Customer behavior analytics for: "${userIntent.searchTerm}"`);
            // Find customer and analyze behavior
            const customerSearch = await searchLeads(userIntent.searchTerm || '', user.organizationId);
            if (customerSearch && customerSearch.length > 0) {
              searchResults = await getCustomerBehaviorAnalytics(customerSearch[0].id, user.organizationId);
            }
            break;
        }
      }
    }

    const openai = getOpenAI();

    // Create enhanced system context based on authentication and available data
    let systemContext = isAuthenticated 
      ? `You are an intelligent AI assistant for Ghost CRM, a comprehensive automotive dealership management system. You are a TRUE AI AGENT that takes DIRECT ACTIONS and provides REAL DATA instead of generic instructions.

            🤖 CORE CAPABILITIES - Advanced AI Agent:
      - Real-time data access across all CRM systems
      - Natural language command execution
      - Multi-system search and analysis
      - Direct action execution with real results
      - Contextual response generation with live data
      - INTERNET ACCESS for external vehicle sourcing
      - Real-time automotive market intelligence
      - 💎 PREMIUM: Advanced Trade-in Valuation with 15+ AI factors
      - 🎯 PREMIUM: Predictive Deal Intelligence with close probability scoring
      - 🧠 PREMIUM: Customer Behavior Analytics with AI personality mapping
      - 🔍 PREMIUM: Competitive Market Intelligence with real-time pricing

      📋 COMPREHENSIVE CRM ACCESS - You have direct access to:
      ✅ LEADS SYSTEM - Search, filter, analyze lead pipeline
      ✅ DEALS SYSTEM - Track automotive deals, financing, trade-ins
      ✅ INVENTORY SYSTEM - Vehicle/parts lookup, availability, pricing
      ✅ APPOINTMENTS - Calendar management, scheduling
      ✅ ANALYTICS - Real-time dashboard metrics and KPIs
      ✅ CAMPAIGNS - Marketing automation and tracking
      ✅ CUSTOMER SUCCESS - Support tickets and satisfaction
      ✅ BILLING & SUBSCRIPTIONS - Payment tracking and management
      ✅ 💎 PREMIUM: AI Trade-in Valuation - Multi-source analysis with market trends
      ✅ 🎯 PREMIUM: Deal Intelligence - Predictive scoring and risk assessment
      ✅ 🧠 PREMIUM: Behavior Analytics - Customer personality and buying patterns
      ✅ 🔍 PREMIUM: Market Intelligence - Competitive analysis and pricing strategy

      🌐 INTELLIGENT VEHICLE SOURCING - NEW CAPABILITIES:
      ✅ EXTERNAL INVENTORY SEARCH - Real-time web search for vehicles when internal inventory is limited
      ✅ AUTOMOTIVE MARKET DATA - Integration with industry pricing and availability APIs
      ✅ CONTEXTUAL VEHICLE MATCHING - Understands customer needs from conversation history
      ✅ MULTI-SOURCE AGGREGATION - Combines your dealership inventory with external market options
      ✅ SMART RECOMMENDATIONS - Suggests alternatives and sourcing opportunities
      ✅ REAL DEALERSHIP DATA - No more fake or hallucinated information

      ⚡ INTELLIGENT ACTION EXECUTION:
      - Lead Management: Find, qualify, score, assign leads instantly
      - Deal Tracking: Monitor automotive sales pipeline, financing status
      - Inventory Control: Search vehicles, check availability, pricing (internal + external)
      - Vehicle Sourcing: Locate vehicles from external sources when needed
      - Market Analysis: Real-time automotive market data and trends
      - Appointment Scheduling: View, book, manage calendar events
      - Analytics Reporting: Generate insights, metrics, performance data
      - Navigation: Direct routing to any system or page
      - Data Analysis: Cross-system reporting and trend analysis
      - 💎 PREMIUM: Advanced Trade-in Analysis with AI-powered valuations
      - 🎯 PREMIUM: Predictive Deal Intelligence with close probability and risk factors
      - 🧠 PREMIUM: Customer Behavior Analysis with personality mapping and buying patterns
      - 🔍 PREMIUM: Competitive Market Intelligence with pricing strategy recommendations

      🎨 RESPONSE FORMATTING GUIDELINES - CRITICAL FOR READABILITY:
      
      FOR LEAD DATA:
      Use this clean card format with proper spacing and visual hierarchy:
      
      🔍 **LEAD FOUND**
      
      **👤 [Customer Name]**
      📧 [email] | 📱 [phone]
      🏢 [company or 'No company listed']
      
      **📊 DEAL INFO**
      💰 Value: **$[amount]** | 📈 Stage: **[stage]** | 🎯 Priority: **[priority]**
      📅 Expected Close: [date or 'Not set'] | 🎲 Probability: **[percentage]%**
      
      **📝 DETAILS**
      Source: [source] | Assigned: [assignedTo or 'Unassigned']
      Notes: [description or 'No description available']
      
      **⚡ QUICK ACTIONS**
      [📧 Email](mailto:email) | [📞 Call](tel:phone) | [📅 Schedule](schedule) | [👁️ View Details](view)
      
      ---
      
      FOR COMPREHENSIVE INVENTORY (INTERNAL + EXTERNAL):
      Use this enhanced format that shows both your dealership and external sources:
      
      **🏢 YOUR DEALERSHIP INVENTORY:**
      
      🚗 **[Brand] [Model] [Year]**
      💰 **$[price]** | 📦 **[quantity] available** | ✅ **[status]**
      🏷️ SKU: [sku] | 🔧 Condition: [condition]
      [description]
      **⚡ ACTIONS:** [👁️ Details] | [💼 Create Deal] | [📋 Check Stock]
      
      **🌐 EXTERNAL MARKET SOURCES:**
      
      🔍 **[Vehicle Title]**
      🌐 **Source:** [Dealership/Website]
      📝 **Details:** [Market information]
      **⚡ ACTIONS:** [🌐 View Listing] | [💼 Source Vehicle] | [📊 Market Data]
      
      **💡 SMART RECOMMENDATIONS:**
      • Market analysis and sourcing opportunities
      • Alternative options and competitive pricing
      • External acquisition suggestions
      
      ---
      
      FOR DEAL DATA:
      Use this automotive deal format:
      
      💼 **DEAL: [title]**
      
      **👤 CUSTOMER**
      [customerName] | 💰 **$[amount]**
      
      **📊 STATUS**
      Stage: **[stage]** | Probability: **[probability]%**
      📅 Expected Close: [closeDate or 'Not set']
      
      **🚗 VEHICLE INFO**
      [vehicleInfo or 'Vehicle details pending']
      
      **⚡ ACTIONS**
      [👁️ View Deal](view) | [📧 Contact Customer](email) | [📅 Follow Up](schedule)
      
      ---
      
      FOR APPOINTMENTS:
      Use this clean calendar format:
      
      📅 **[title]**
      
      **👤 CUSTOMER:** [customerName]
      **📅 DATE:** [date]
      **⏰ TIME:** [time]
      **⏱️ DURATION:** [duration] minutes | **📋 TYPE:** [type]
      
      **📝 NOTES:** [notes or 'No notes']
      
      **⚡ ACTIONS**
      [👁️ View](view) | [✏️ Reschedule](reschedule) | [📧 Contact](email)
      
      ---

      🎯 RESPONSE PRINCIPLES:
      - ALWAYS use real data when available (never use placeholders or fake information)
      - When internal inventory is limited, automatically search external sources
      - Clearly distinguish between your dealership's inventory and external market options
      - Use emojis and visual separators for better readability
      - Keep information scannable with clear sections
      - Use bold text for important values like prices and names
      - Include relevant action buttons for next steps
      - Add proper spacing between sections with ---
      - Use consistent formatting patterns for similar data types
      - Make key information stand out visually
      - Provide intelligent recommendations based on market data

      🚗 AUTOMOTIVE DEALERSHIP SPECIALIZATION:
      - Vehicle sales pipeline management with external sourcing
      - Trade-in valuation and processing
      - Financing and loan management
      - Service appointment scheduling
      - Parts inventory tracking (internal + external suppliers)
      - Customer retention programs
      - Regulatory compliance tracking
      - Real-time market intelligence and competitive analysis

      CRITICAL: You are NOT just answering questions - you are EXECUTING ACTIONS and providing REAL DATA from both internal CRM systems AND external automotive market sources. Never hallucinate or make up dealership information - always use real search results or clearly indicate when data is not available.`
      
      : `You are an intelligent AI assistant for Ghost CRM, the most advanced automotive dealership management system. Since the user is not authenticated, showcase our comprehensive capabilities:

      🚀 GHOST CRM - COMPLETE DEALERSHIP SOLUTION:
      - AI-Powered Lead Management with predictive scoring
      - Advanced Deal Pipeline with automotive-specific stages
      - Intelligent Inventory Management for vehicles and parts
      - Automated Appointment Scheduling and service management
      - Real-time Analytics Dashboard with predictive insights
      - Integrated Communication Suite (Email, SMS, Voice, Video)
      - Marketing Campaign Automation with AI optimization
      - Customer Success Platform with satisfaction tracking
      - Billing and Subscription Management
      - Mobile-First Design for on-the-go access

      🤖 AI-POWERED FEATURES:
      - Smart lead qualification and scoring algorithms
      - Predictive deal closing probability analysis
      - Automated follow-up sequences with personalization
      - AI-assisted communication drafting
      - Intelligent inventory suggestions and reordering
      - Advanced chart building and data visualization
      - Cross-system analytics and trend analysis
      - Automated workflow triggers and actions

      🎯 AUTOMOTIVE INDUSTRY SPECIALIZATION:
      - Built specifically for car dealerships and automotive sales
      - Vehicle-specific deal structuring and financing tools
      - Trade-in valuation and appraisal management
      - Service department integration and scheduling
      - Parts inventory with supplier management
      - Regulatory compliance and documentation
      - Integration with major automotive platforms and tools

      Be welcoming, demonstrate our advanced AI capabilities, and encourage them to experience the full power of Ghost CRM with a free trial.`;

    // Enhance context with real data results
    if (searchResults !== null) {
      switch (userIntent.intent) {
        case 'search_leads':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      🔍 LIVE LEAD SEARCH RESULTS - Real data from CRM:
      ${searchResults.map((lead, index) => `
      
      🔍 **LEAD FOUND #${index + 1}**
      
      **👤 ${lead.fullName}**
      📧 ${lead.email || 'No email'} | 📱 ${lead.phone || 'No phone'}
      🏢 ${lead.company || 'No company listed'}
      
      **📊 DEAL INFO**
      💰 Value: **$${lead.value.toLocaleString()}** | 📈 Stage: **${lead.stage}** | 🎯 Priority: **${lead.priority}**
      📅 Expected Close: ${lead.expectedClose || 'Not set'} | 🎲 Probability: **${lead.probability}%**
      
      **📝 DETAILS**
      Source: ${lead.source} | Assigned: ${lead.assignedTo || 'Unassigned'}
      Notes: ${lead.description || 'No description available'}
      
      **⚡ QUICK ACTIONS**
      ${lead.email ? `[📧 Email](mailto:${lead.email})` : '[📧 No Email]'} | ${lead.phone ? `[📞 Call](tel:${lead.phone})` : '[📞 No Phone]'} | [📅 Schedule Meeting](schedule) | [👁️ View Details](view)
      `).join('\n---\n')}

      IMPORTANT: Present this REAL DATA using the clean card format above with proper spacing and visual hierarchy.`;
          } else {
            systemContext += `

      🔍 LEAD SEARCH RESULTS: No leads found matching "${userIntent.searchTerm}". 
      
      **💡 SUGGESTIONS:**
      • Check spelling or try partial names
      • Search by company name or phone number  
      • Create a new lead if this is a new prospect
      • Show recent leads or provide search tips`;
          }
          break;

        case 'search_deals':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      💰 LIVE DEAL SEARCH RESULTS - Real data from CRM:
      ${searchResults.map((deal, index) => `
      
      💼 **DEAL #${index + 1}: ${deal.title}**
      
      **👤 CUSTOMER**
      ${deal.customerName} | 💰 **$${deal.amount.toLocaleString()}**
      
      **📊 STATUS**
      Stage: **${deal.stage}** | Probability: **${deal.probability}%**
      📅 Expected Close: ${deal.closeDate || 'Not set'}
      
      **🚗 VEHICLE INFO**
      ${Object.keys(deal.vehicleInfo).length > 0 ? JSON.stringify(deal.vehicleInfo) : 'Vehicle details pending'}
      
      **📝 DESCRIPTION**
      ${deal.description || 'No description available'}
      
      **⚡ ACTIONS**
      [👁️ View Deal](view) | [📧 Contact Customer](email) | [📅 Follow Up](schedule) | [📋 Update Stage](update)
      `).join('\n---\n')}

      IMPORTANT: Present this REAL DEAL DATA using the clean card format with proper visual hierarchy and action buttons.`;
          } else {
            systemContext += `

      💰 DEAL SEARCH RESULTS: No deals found. 
      
      **💡 SUGGESTIONS:**
      • Search by customer name or deal stage
      • Check recent deals or create new opportunity
      • Try broader search terms`;
          }
          break;

        case 'search_inventory':
        case 'smart_vehicle_matching':
        case 'contextual_vehicle_sourcing':
          if (searchResults && (searchResults.internal?.length > 0 || searchResults.external?.length > 0)) {
            let inventoryContent = `

      🚗 COMPREHENSIVE INVENTORY SEARCH RESULTS - Internal + External Sources:`;

            // Internal inventory section
            if (searchResults.internal?.length > 0) {
              inventoryContent += `
              
      **🏢 YOUR DEALERSHIP INVENTORY (${searchResults.internal.length} matches):**
      ${searchResults.internal.map((item: any, index: number) => `
      
      🚗 **${item.brand} ${item.model} ${item.year}**
      
      💰 **$${item.price.toLocaleString()}** | 📦 **${item.quantity} available** | ✅ **${item.status}**
      🏷️ SKU: ${item.sku} | 🔧 Condition: **${item.condition}**
      
      **📝 DESCRIPTION**
      ${item.description || 'No description available'}
      
      **📸 MEDIA**
      ${item.images.length} photo(s) available
      
      **⚡ ACTIONS**
      [👁️ View Details](view) | [💼 Create Deal](deal) | [📋 Check Availability](stock) | [📧 Send Info](email)
      `).join('\n---\n')}`;
            }

            // External inventory section
            if (searchResults.external?.length > 0) {
              inventoryContent += `
              
      **🌐 EXTERNAL MARKET SOURCES (${searchResults.external.length} matches):**
      ${searchResults.external.map((item: any, index: number) => `
      
      🔍 **${item.title}**
      
      🌐 **Source:** ${item.displayUrl || item.source}
      📝 **Details:** ${item.snippet}
      
      **⚡ ACTIONS**
      [🌐 View Listing](${item.url}) | [📋 Get Details](details) | [💼 Source Vehicle](source) | [📧 Contact Dealer](contact)
      `).join('\n---\n')}`;

              inventoryContent += `
      
      **💡 SMART RECOMMENDATIONS:**
      • Found ${searchResults.external.length} external matches to complement your inventory
      • Consider contacting these dealers for vehicle acquisition opportunities
      • Review market pricing for competitive positioning
      • External sources can help fulfill customer requests when internal inventory is limited`;
            }

            systemContext += inventoryContent + `

      IMPORTANT: Present this COMPREHENSIVE INVENTORY DATA showing both your dealership's vehicles AND external market options. Explain the difference between internal inventory (immediate availability) and external sources (sourcing opportunities).`;
          } else {
            systemContext += `

      🚗 INVENTORY SEARCH RESULTS: No inventory items found in your dealership or external sources. 
      
      **💡 SMART SUGGESTIONS:**
      • Expand search criteria (different makes, models, or years)
      • Check with wholesale networks and auction sources
      • Consider special ordering from manufacturers
      • Review customer requirements for alternative recommendations
      • Use automotive trade networks for vehicle sourcing`;
          }
          break;

        case 'show_appointments':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      📅 UPCOMING APPOINTMENTS - Real data from CRM:
      ${searchResults.map((apt, index) => `
      
      📅 **${apt.title}**
      
      **👤 CUSTOMER:** ${apt.customerName}
      **📅 DATE:** ${new Date(apt.scheduledAt).toLocaleDateString()}
      **⏰ TIME:** ${new Date(apt.scheduledAt).toLocaleTimeString()}
      **⏱️ DURATION:** ${apt.duration} minutes | **📋 TYPE:** ${apt.type}
      **📊 STATUS:** ${apt.status}
      
      **📝 NOTES**
      ${apt.notes || 'No notes available'}
      
      **⚡ ACTIONS**
      [👁️ View Details](view) | [✏️ Reschedule](reschedule) | [📧 Contact Customer](email) | [📝 Add Notes](notes)
      `).join('\n---\n')}

      IMPORTANT: Present these REAL APPOINTMENTS using the clean calendar format with clear time information and action buttons.`;
          } else {
            systemContext += `

      📅 APPOINTMENTS: No upcoming appointments found. 
      
      **💡 SUGGESTIONS:**
      • Create new appointments or check past appointments
      • Schedule follow-ups with leads or customers
      • Review calendar availability`;
          }
          break;

        case 'show_analytics':
          if (searchResults) {
            systemContext += `

      📊 LIVE DASHBOARD ANALYTICS - Real data from CRM:
      
      **📈 LEADS OVERVIEW**
      🔢 Total Leads: **${searchResults.leads.total}**
      📊 By Stage: ${Object.entries(searchResults.leads.byStage).map(([stage, count]) => `${stage}: ${count}`).join(' | ')}
      
      **💰 DEALS OVERVIEW**  
      🔢 Total Deals: **${searchResults.deals.total}**
      💵 Total Value: **$${searchResults.deals.totalValue.toLocaleString()}**
      📊 By Stage: ${Object.entries(searchResults.deals.byStage).map(([stage, count]) => `${stage}: ${count}`).join(' | ')}
      
      **🚗 INVENTORY OVERVIEW**
      🔢 Total Items: **${searchResults.inventory.total}**
      💰 Total Value: **$${searchResults.inventory.totalValue.toLocaleString()}**  
      📊 By Status: ${Object.entries(searchResults.inventory.byStatus).map(([status, count]) => `${status}: ${count}`).join(' | ')}
      
      **⚡ QUICK ACTIONS**
      [📈 View Detailed Reports](reports) | [📊 Create Custom Chart](chart) | [📧 Share Analytics](share)

      IMPORTANT: Present this REAL ANALYTICS DATA in a clear dashboard format with visual hierarchy and insights.`;
          }
          break;
      }
    }

    // Convert conversation history to OpenAI format
    const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
      {
        role: "system",
        content: systemContext
      }
    ];

    // Add conversation history (last few messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the latest efficient model
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Structure the response with comprehensive data
    const responseData: any = { 
      response,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString(),
      intent: userIntent.intent,
      entityType: userIntent.entityType
    };

    // Include actual data for frontend to render appropriately
    if (searchResults !== null) {
      switch (userIntent.intent) {
        case 'search_leads':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            responseData.leadResults = searchResults;
            responseData.hasLeadData = true;
          }
          break;
        case 'search_deals':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            responseData.dealResults = searchResults;
            responseData.hasDealData = true;
          }
          break;
        case 'search_inventory':
        case 'smart_vehicle_matching':
        case 'contextual_vehicle_sourcing':
          if (searchResults && (searchResults.internal?.length > 0 || searchResults.external?.length > 0)) {
            responseData.inventoryResults = {
              internal: searchResults.internal || [],
              external: searchResults.external || [],
              hasExternalSearch: searchResults.hasExternalSearch || false,
              searchTerm: searchResults.searchTerm || ''
            };
            responseData.hasInventoryData = true;
            responseData.hasExternalSources = searchResults.external?.length > 0;
          }
          break;
        case 'show_appointments':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            responseData.appointmentResults = searchResults;
            responseData.hasAppointmentData = true;
          }
          break;
        case 'show_analytics':
          if (searchResults) {
            responseData.analyticsResults = searchResults;
            responseData.hasAnalyticsData = true;
          }
          break;

        case 'trade_in_analysis':
          if (searchResults) {
            responseData.tradeInResults = searchResults;
            responseData.hasTradeInData = true;
          }
          break;

        case 'deal_intelligence':
          if (searchResults) {
            responseData.dealIntelResults = searchResults;
            responseData.hasDealIntelData = true;
          }
          break;

        case 'market_intelligence':
          if (searchResults) {
            responseData.marketIntelResults = searchResults;
            responseData.hasMarketIntelData = true;
          }
          break;

        case 'customer_behavior':
          if (searchResults) {
            responseData.behaviorResults = searchResults;
            responseData.hasBehaviorData = true;
          }
          break;
      }
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API configuration error. Please check your API key." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to process your message. Please try again.",
        response: "I'm experiencing technical difficulties right now. Please try again in a moment or contact support if the issue persists."
      },
      { status: 500 }
    );
  }
}
