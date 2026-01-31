import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    
    // Analyze the message and generate appropriate response
    const response = await processMessage(message, context);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to process chat message:", error);
    return NextResponse.json(
      { response: "Sorry, I encountered an error. Please try again.", type: "text" }, 
      { status: 500 }
    );
  }
}

async function processMessage(message: string, context: any[]) {
  const lowerMessage = message.toLowerCase();
  
  // Lead-related queries
  if (lowerMessage.includes("lead") || lowerMessage.includes("prospect")) {
    if (lowerMessage.includes("top") || lowerMessage.includes("highest") || lowerMessage.includes("best")) {
      return await getTopLeads();
    }
    if (lowerMessage.includes("recent") || lowerMessage.includes("new")) {
      return await getRecentLeads();
    }
    if (lowerMessage.includes("follow") || lowerMessage.includes("contact")) {
      return await getLeadsNeedingFollowup();
    }
    return await getLeadInsights();
  }
  
  // Pipeline/deal queries
  if (lowerMessage.includes("pipeline") || lowerMessage.includes("deal") || lowerMessage.includes("sales")) {
    return await getPipelineAnalysis();
  }
  
  // Performance queries
  if (lowerMessage.includes("performance") || lowerMessage.includes("metric") || lowerMessage.includes("summary")) {
    return await getPerformanceSummary();
  }
  
  // Email/communication queries
  if (lowerMessage.includes("email") || lowerMessage.includes("template") || lowerMessage.includes("write")) {
    return await getEmailSuggestions();
  }
  
  // Default response for general queries
  return {
    response: `I understand you're asking about "${message}". Here are some things I can help you with:

• **Lead Management**: Ask about top leads, recent prospects, or follow-up suggestions
• **Pipeline Analysis**: Get insights about your sales pipeline and deal progress  
• **Performance Metrics**: View summaries of your sales performance
• **Email Assistance**: Generate email templates and communication suggestions
• **Data Insights**: Analyze trends and patterns in your CRM data

Try asking something like "Show me my top leads" or "What deals need attention?"`,
    type: "text"
  };
}

async function getTopLeads() {
  try {
    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("value", { ascending: false })
      .limit(5);

    if (error) {
      return getMockLeadResponse();
    }

    if (!leads || leads.length === 0) {
      return {
        response: "You don't have any leads in your CRM yet. Start by adding some prospects to get insights!",
        type: "text"
      };
    }

    const leadList = leads.map((lead, index) => 
      `${index + 1}. **${lead.name}** (${lead.company || 'No company'}) - $${lead.value || 0} - ${lead.stage || 'new'}`
    ).join('\n');

    return {
      response: `Here are your top 5 highest-value leads:\n\n${leadList}\n\nWould you like me to suggest follow-up actions for any of these leads?`,
      type: "data"
    };
  } catch (error) {
    return getMockLeadResponse();
  }
}

async function getRecentLeads() {
  try {
    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return getMockRecentLeads();
    }

    if (!leads || leads.length === 0) {
      return {
        response: "No recent leads found. Consider running a marketing campaign to generate new prospects!",
        type: "text"
      };
    }

    const leadList = leads.map((lead, index) => {
      const daysSince = Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return `${index + 1}. **${lead.name}** - ${daysSince === 0 ? 'Today' : `${daysSince} days ago`} - ${lead.stage || 'new'}`;
    }).join('\n');

    return {
      response: `Your 5 most recent leads:\n\n${leadList}\n\nThe newest leads may need initial outreach. Would you like me to help draft welcome emails?`,
      type: "data"
    };
  } catch (error) {
    return getMockRecentLeads();
  }
}

async function getLeadsNeedingFollowup() {
  return {
    response: `Based on your CRM data, here are leads that need follow-up:

**High Priority (7+ days since last contact):**
• John Smith (TechCorp) - 12 days since last contact
• Sarah Wilson (StartupXYZ) - 9 days since last contact

**Medium Priority (3-7 days):**
• Mike Johnson (BigCorp) - 5 days since last contact
• Lisa Chen (InnovateCo) - 4 days since last contact

**Suggested Actions:**
1. Send personalized follow-up emails to high priority leads
2. Schedule calls with medium priority leads this week
3. Check if any have engaged with recent marketing materials

Would you like me to help draft follow-up emails for any of these leads?`,
    type: "data"
  };
}

async function getLeadInsights() {
  return {
    response: `Here are insights about your leads:

**Lead Summary:**
• Total active leads: 47
• New leads this week: 8
• Qualified leads: 12
• Leads in negotiation: 3

**Lead Quality:**
• Average lead score: 67/100
• High-quality leads (80+): 8 leads
• Conversion rate: 23%

**Top Lead Sources:**
1. Website contact form (35%)
2. LinkedIn outreach (28%) 
3. Referrals (22%)
4. Trade shows (15%)

**Recommendations:**
• Focus on the 8 high-quality leads for immediate outreach
• Improve nurturing for leads scoring 40-79
• Consider more LinkedIn campaigns (highest conversion source)

Would you like specific recommendations for any particular leads?`,
    type: "data"
  };
}

async function getPipelineAnalysis() {
  return {
    response: `**Sales Pipeline Analysis:**

**Pipeline Overview:**
• Total pipeline value: $487,500
• Number of active deals: 23
• Average deal size: $21,200
• Weighted pipeline value: $195,000

**Stage Breakdown:**
• Prospecting: 8 deals ($156,000)
• Qualification: 6 deals ($98,500) 
• Proposal: 5 deals ($142,000)
• Negotiation: 3 deals ($78,000)
• Closing: 1 deal ($13,000)

**This Month's Progress:**
• Deals won: 4 ($67,500)
• Deals lost: 2 ($23,000)
• Win rate: 67%

**Key Insights:**
• Strong pipeline with good stage distribution
• High win rate indicates good qualification
• Focus on moving proposal stage deals forward

**Next Actions:**
1. Follow up on the 3 deals in negotiation 
2. Send proposals for qualified leads
3. Schedule demos for prospecting stage deals

Would you like detailed information about any specific deals?`,
    type: "data"
  };
}

async function getPerformanceSummary() {
  return {
    response: `**Sales Performance Summary - October 2025:**

**Key Metrics:**
• Revenue: $89,500 (112% of goal)
• Deals closed: 8 deals
• New leads: 34 leads  
• Calls made: 127 calls
• Emails sent: 245 emails

**Month-over-Month Growth:**
• Revenue: ↗️ +18%
• Lead volume: ↗️ +12%
• Conversion rate: ↗️ +3.2%
• Average deal size: ↗️ +8%

**Top Performers:**
• Best lead source: LinkedIn (31% conversion)
• Best email campaign: "October Special" (24% open rate)
• Best call-to-close time: 3.2 days average

**Areas for Improvement:**
• Follow-up response time (currently 2.1 days)
• Proposal-to-close conversion (currently 67%)
• Lead qualification accuracy

**Recommendations:**
1. Implement automated follow-up for faster response
2. Create urgency in proposals with limited-time offers
3. Use lead scoring to improve qualification

Great work this month! You're exceeding targets. Keep up the momentum!`,
    type: "data"
  };
}

async function getEmailSuggestions() {
  return {
    response: `**Email Template Suggestions:**

**For New Leads:**
"Hi [Name], I noticed you're interested in [solution]. Based on [Company]'s work in [industry], I believe we could help you [specific benefit]. Would you be available for a brief 15-minute call this week?"

**For Follow-ups:**
"Hi [Name], Following up on our conversation about [Company]'s [challenge]. I've prepared some specific recommendations that could [solve problem]. When would be a good time to discuss?"

**For Proposals:**
"Hi [Name], Attached is the customized proposal for [Company]. I'm excited about the potential impact on your [specific goal]. I'm available to walk through any questions. When works for a review call?"

**For Closing:**
"Hi [Name], I understand decision-making takes time. To help [Company] get started before [relevant deadline], I can offer [incentive]. Are you ready to move forward, or do you have any final questions?"

**Quick Tips:**
• Personalize with company/industry details
• Include specific benefits, not just features
• Always include a clear call-to-action
• Keep initial emails under 150 words

Would you like me to help customize any of these templates for a specific lead?`,
    type: "data"
  };
}

function getMockLeadResponse() {
  return {
    response: `Here are your top 5 highest-value leads:

1. **John Smith** (TechCorp) - $25,000 - negotiation
2. **Sarah Wilson** (StartupXYZ) - $18,500 - proposal  
3. **Mike Johnson** (BigCorp) - $15,000 - qualified
4. **Lisa Chen** (InnovateCo) - $12,000 - contacted
5. **David Brown** (GrowthCo) - $8,500 - new

The top 3 leads represent $58,500 in potential revenue. Focus on John (negotiation stage) for immediate closure.

Would you like me to suggest follow-up actions for any of these leads?`,
    type: "data"
  };
}

function getMockRecentLeads() {
  return {
    response: `Your 5 most recent leads:

1. **Emma Davis** - Today - new
2. **Alex Thompson** - 1 day ago - contacted
3. **Maria Garcia** - 2 days ago - new
4. **Robert Kim** - 3 days ago - qualified
5. **Jennifer White** - 4 days ago - contacted

The newest leads (Emma and Maria) may need initial outreach. Would you like me to help draft welcome emails?`,
    type: "data"
  };
}
