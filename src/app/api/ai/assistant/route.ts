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
      
      FOR INVENTORY ITEMS:
      Use this clean vehicle card format:
      
      🚗 **[Brand] [Model] [Year]**
      
      💰 **$[price]** | 📦 **[quantity] available** | ✅ **[status]**
      🏷️ SKU: [sku] | 🔧 Condition: [condition]
      
      [description]
      
      **⚡ ACTIONS**
      [👁️ Details](view) | [💼 Create Deal](deal) | [📋 Check Stock](stock)
      
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
      - ALWAYS use real data when available (never use placeholders)
      - Use emojis and visual separators for better readability
      - Keep information scannable with clear sections
      - Use bold text for important values like prices and names
      - Include relevant action buttons for next steps
      - Add proper spacing between sections with ---
      - Use consistent formatting patterns for similar data types
      - Make key information stand out visually

      🚗 AUTOMOTIVE DEALERSHIP SPECIALIZATION:
      - Vehicle sales pipeline management
      - Trade-in valuation and processing
      - Financing and loan management
      - Service appointment scheduling
      - Parts inventory tracking
      - Customer retention programs
      - Regulatory compliance tracking

      CRITICAL: You are NOT just answering questions - you are EXECUTING ACTIONS and providing REAL DATA from the actual Ghost CRM database in a visually appealing, easy-to-read format.`
      
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
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            systemContext += `

      🚗 LIVE INVENTORY SEARCH RESULTS - Real data from CRM:
      ${searchResults.map((item, index) => `
      
      🚗 **${item.brand} ${item.model} ${item.year}**
      
      💰 **$${item.price.toLocaleString()}** | 📦 **${item.quantity} available** | ✅ **${item.status}**
      🏷️ SKU: ${item.sku} | 🔧 Condition: **${item.condition}**
      
      **📝 DESCRIPTION**
      ${item.description || 'No description available'}
      
      **📸 MEDIA**
      ${item.images.length} photo(s) available
      
      **⚡ ACTIONS**
      [👁️ View Details](view) | [💼 Create Deal](deal) | [📋 Check Availability](stock) | [📧 Send Info](email)
      `).join('\n---\n')}

      IMPORTANT: Present this REAL INVENTORY DATA using the clean vehicle card format with visual appeal and action buttons.`;
          } else {
            systemContext += `

      🚗 INVENTORY SEARCH RESULTS: No inventory items found. 
      
      **💡 SUGGESTIONS:**
      • Search by brand, model, year, or SKU
      • Check availability or expand search criteria
      • Browse all inventory or specific categories`;
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
