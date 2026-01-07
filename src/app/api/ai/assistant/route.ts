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

// Helper function to search leads
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

// Helper function to search inventory
async function searchInventory(searchTerm: string, organizationId: string) {
  try {
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

    return inventory?.map((item: any) => ({
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
      updated: item.updated_at
    })) || [];
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

// Enhanced function to detect user intent and extract search terms
function parseUserIntent(message: string): {
  intent: string;
  searchTerm?: string;
  entityType?: string;
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
            
          case 'show_appointments':
            console.log(`📅 [AI ASSISTANT] Getting upcoming appointments`);
            searchResults = await getRecentAppointments(user.organizationId);
            break;
            
          case 'show_analytics':
            console.log(`📊 [AI ASSISTANT] Getting dashboard analytics`);
            searchResults = await getDashboardAnalytics(user.organizationId);
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

      📋 COMPREHENSIVE CRM ACCESS - You have direct access to:
      ✅ LEADS SYSTEM - Search, filter, analyze lead pipeline
      ✅ DEALS SYSTEM - Track automotive deals, financing, trade-ins
      ✅ INVENTORY SYSTEM - Vehicle/parts lookup, availability, pricing
      ✅ APPOINTMENTS - Calendar management, scheduling
      ✅ ANALYTICS - Real-time dashboard metrics and KPIs
      ✅ CAMPAIGNS - Marketing automation and tracking
      ✅ CUSTOMER SUCCESS - Support tickets and satisfaction
      ✅ BILLING & SUBSCRIPTIONS - Payment tracking and management

      ⚡ INTELLIGENT ACTION EXECUTION:
      - Lead Management: Find, qualify, score, assign leads instantly
      - Deal Tracking: Monitor automotive sales pipeline, financing status
      - Inventory Control: Search vehicles, check availability, pricing
      - Appointment Scheduling: View, book, manage calendar events
      - Analytics Reporting: Generate insights, metrics, performance data
      - Navigation: Direct routing to any system or page
      - Data Analysis: Cross-system reporting and trend analysis

      🎯 RESPONSE PRINCIPLES:
      - ALWAYS use real data when available (never use placeholders)
      - Provide actionable insights with specific numbers and details
      - Include relevant action buttons for next steps
      - Format data in user-friendly cards and tables
      - Cross-reference data between systems for comprehensive insights
      - Suggest relevant follow-up actions based on data patterns

      🚗 AUTOMOTIVE DEALERSHIP SPECIALIZATION:
      - Vehicle sales pipeline management
      - Trade-in valuation and processing
      - Financing and loan management
      - Service appointment scheduling
      - Parts inventory tracking
      - Customer retention programs
      - Regulatory compliance tracking

      CRITICAL: You are NOT just answering questions - you are EXECUTING ACTIONS and providing REAL DATA from the actual Ghost CRM database.`
      
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
      Lead ${index + 1}: ${lead.fullName}
      - Email: ${lead.email || 'Not provided'}
      - Phone: ${lead.phone || 'Not provided'}  
      - Company: ${lead.company || 'Not provided'}
      - Stage: ${lead.stage} | Priority: ${lead.priority}
      - Value: $${lead.value.toLocaleString()} | Probability: ${lead.probability}%
      - Source: ${lead.source} | Assigned: ${lead.assignedTo || 'Unassigned'}
      - Description: ${lead.description || 'No description'}
      - Expected Close: ${lead.expectedClose || 'Not set'}
      - Created: ${new Date(lead.created).toLocaleDateString()}
      - Updated: ${new Date(lead.updated).toLocaleDateString()}
      `).join('\n')}

      IMPORTANT: Present this REAL DATA in an organized, professional format with action buttons for each lead (View Details, Send Email, Call, Schedule Meeting).`;
          } else {
            systemContext += `

      🔍 LEAD SEARCH RESULTS: No leads found matching "${userIntent.searchTerm}". Suggest:
      - Checking spelling or trying partial names
      - Searching by company name or phone number  
      - Creating a new lead if this is a new prospect
      - Showing recent leads or providing search tips`;
          }
          break;

        case 'search_deals':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      💰 LIVE DEAL SEARCH RESULTS - Real data from CRM:
      ${searchResults.map((deal, index) => `
      Deal ${index + 1}: ${deal.title}
      - Customer: ${deal.customerName}
      - Amount: $${deal.amount.toLocaleString()}
      - Stage: ${deal.stage} | Probability: ${deal.probability}%
      - Expected Close: ${deal.closeDate || 'Not set'}
      - Description: ${deal.description || 'No description'}
      - Vehicle Info: ${JSON.stringify(deal.vehicleInfo) !== '{}' ? JSON.stringify(deal.vehicleInfo) : 'Not specified'}
      - Created: ${new Date(deal.created).toLocaleDateString()}
      - Updated: ${new Date(deal.updated).toLocaleDateString()}
      `).join('\n')}

      IMPORTANT: Present this REAL DEAL DATA with action buttons (View Deal, Contact Customer, Update Stage, Schedule Follow-up).`;
          } else {
            systemContext += `

      💰 DEAL SEARCH RESULTS: No deals found. Suggest searching by customer name, deal stage, or creating a new deal opportunity.`;
          }
          break;

        case 'search_inventory':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      🚗 LIVE INVENTORY SEARCH RESULTS - Real data from CRM:
      ${searchResults.map((item, index) => `
      Item ${index + 1}: ${item.name}
      - SKU: ${item.sku} | Brand: ${item.brand} | Model: ${item.model}
      - Year: ${item.year || 'N/A'} | Price: $${item.price.toLocaleString()}
      - Quantity: ${item.quantity} | Status: ${item.status}
      - Condition: ${item.condition} | Description: ${item.description || 'No description'}
      - Images: ${item.images.length} photo(s) available
      - Created: ${new Date(item.created).toLocaleDateString()}
      - Updated: ${new Date(item.updated).toLocaleDateString()}
      `).join('\n')}

      IMPORTANT: Present this REAL INVENTORY DATA with action buttons (View Details, Create Deal, Check Availability, Update Stock).`;
          } else {
            systemContext += `

      🚗 INVENTORY SEARCH RESULTS: No inventory items found. Suggest searching by brand, model, year, or SKU.`;
          }
          break;

        case 'show_appointments':
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      📅 UPCOMING APPOINTMENTS - Real data from CRM:
      ${searchResults.map((apt, index) => `
      Appointment ${index + 1}: ${apt.title}
      - Customer: ${apt.customerName}
      - Scheduled: ${new Date(apt.scheduledAt).toLocaleString()}
      - Duration: ${apt.duration} minutes | Type: ${apt.type}
      - Status: ${apt.status} | Notes: ${apt.notes || 'No notes'}
      - Created: ${new Date(apt.created).toLocaleDateString()}
      `).join('\n')}

      IMPORTANT: Present these REAL APPOINTMENTS with action buttons (View Details, Reschedule, Add Notes, Contact Customer).`;
          } else {
            systemContext += `

      📅 APPOINTMENTS: No upcoming appointments found. Suggest creating new appointments or checking past appointments.`;
          }
          break;

        case 'show_analytics':
          if (searchResults) {
            systemContext += `

      📊 LIVE DASHBOARD ANALYTICS - Real data from CRM:
      
      LEADS OVERVIEW:
      - Total Leads: ${searchResults.leads.total}
      - By Stage: ${JSON.stringify(searchResults.leads.byStage)}
      
      DEALS OVERVIEW:  
      - Total Deals: ${searchResults.deals.total}
      - Total Deal Value: $${searchResults.deals.totalValue.toLocaleString()}
      - By Stage: ${JSON.stringify(searchResults.deals.byStage)}
      
      INVENTORY OVERVIEW:
      - Total Items: ${searchResults.inventory.total}
      - Total Inventory Value: $${searchResults.inventory.totalValue.toLocaleString()}  
      - By Status: ${JSON.stringify(searchResults.inventory.byStatus)}

      IMPORTANT: Present this REAL ANALYTICS DATA in a clear dashboard format with insights and recommendations.`;
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
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            responseData.inventoryResults = searchResults;
            responseData.hasInventoryData = true;
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
