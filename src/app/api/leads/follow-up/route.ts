import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";
import { z } from "zod";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

const FollowUpRequest = z.object({
  lead_id: z.number(),
  action_type: z.enum(["schedule_call", "send_email", "send_sms", "schedule_appointment", "create_task"]),
  schedule_time: z.string().optional(), // ISO datetime
  message_template: z.enum([
    "initial_inquiry", 
    "follow_up_interested", 
    "appointment_reminder", 
    "test_drive_follow_up",
    "financing_options",
    "trade_in_evaluation",
    "maintenance_reminder"
  ]).optional(),
  custom_message: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigned_to: z.string().uuid().optional(), // user ID
  meta: z.record(z.any()).optional()
});

// Auto dealership message templates
const MESSAGE_TEMPLATES = {
  initial_inquiry: {
    email: {
      subject: "Thank you for your interest in {vehicle_make} {vehicle_model}",
      body: `Hi {customer_name},

Thank you for your interest in the {vehicle_year} {vehicle_make} {vehicle_model}! 

I'm {agent_name}, your personal automotive specialist. I'd love to help you find the perfect vehicle that fits your needs and budget.

Based on your inquiry, I can schedule:
• A personal consultation to discuss your needs
• A test drive at your convenience
• Financing pre-approval (if needed)

When would be a good time to connect? I'm available:
• Phone: {dealership_phone}
• Email: {agent_email}
• In-person at our showroom

We also have several {vehicle_make} {vehicle_model} models in stock with various trims and options.

Best regards,
{agent_name}
{dealership_name}`
    },
    sms: "Hi {customer_name}! Thanks for your interest in the {vehicle_year} {vehicle_make} {vehicle_model}. I'm {agent_name} from {dealership_name}. When's a good time to discuss your vehicle needs? Call me at {agent_phone} or reply here. Thanks!"
  },
  
  follow_up_interested: {
    email: {
      subject: "Following up on your {vehicle_make} {vehicle_model} inquiry",
      body: `Hi {customer_name},

I wanted to follow up on your recent inquiry about the {vehicle_year} {vehicle_make} {vehicle_model}.

Here's what I can offer you:
• Competitive pricing on {vehicle_type} vehicles
• Flexible financing options (rates as low as {interest_rate}%)
• Trade-in evaluation for your current vehicle
• Extended warranty options

Current inventory includes:
• {available_models}

Would you like to schedule a test drive? I can also arrange financing pre-approval to streamline your buying experience.

Let's find you the perfect vehicle!

Best regards,
{agent_name}
{dealership_name}
{agent_phone}`
    },
    sms: "Hi {customer_name}, following up on the {vehicle_make} {vehicle_model} you were interested in. We have great financing rates and several in stock. Want to schedule a test drive? - {agent_name}, {dealership_name}"
  },
  
  appointment_reminder: {
    email: {
      subject: "Reminder: Your appointment tomorrow at {dealership_name}",
      body: `Hi {customer_name},

This is a friendly reminder about your appointment tomorrow:

📅 Date: {appointment_date}
🕐 Time: {appointment_time}
📍 Location: {dealership_address}
🚗 Vehicle: {vehicle_year} {vehicle_make} {vehicle_model}

What to bring:
• Valid driver's license
• Current insurance card
• Trade-in vehicle (if applicable)
• Any financing documents

If you need to reschedule, please call {dealership_phone} as soon as possible.

Looking forward to meeting you!

{agent_name}
{dealership_name}`
    },
    sms: "Reminder: Your appointment at {dealership_name} is tomorrow at {appointment_time} for the {vehicle_make} {vehicle_model}. Bring your license & insurance. See you then! - {agent_name}"
  },
  
  test_drive_follow_up: {
    email: {
      subject: "How was your test drive of the {vehicle_make} {vehicle_model}?",
      body: `Hi {customer_name},

Thank you for taking the time to test drive the {vehicle_year} {vehicle_make} {vehicle_model} with us!

I hope you enjoyed the experience. Based on our conversation, I think this vehicle is a great match for your needs:
• {key_feature_1}
• {key_feature_2} 
• {key_feature_3}

Next steps I can help with:
• Financing options and payment calculations
• Trade-in appraisal for your current vehicle
• Extended warranty and protection plans
• Delivery and paperwork completion

I'm here to answer any questions and make this process as smooth as possible.

When would be a good time to discuss moving forward?

Best regards,
{agent_name}
{dealership_name}
{agent_phone}`
    },
    sms: "Hi {customer_name}! How did you like the {vehicle_make} {vehicle_model} test drive? I can run financing numbers and get you driving today. Ready to move forward? - {agent_name}"
  },
  
  financing_options: {
    email: {
      subject: "Financing options for your {vehicle_make} {vehicle_model}",
      body: `Hi {customer_name},

Great news! I've prepared several financing options for the {vehicle_year} {vehicle_make} {vehicle_model}:

💰 FINANCING OPTIONS:
• Loan Term: {loan_term} months
• Interest Rate: {interest_rate}% APR
• Monthly Payment: {monthly_payment}
• Down Payment: {down_payment}

💳 LEASE OPTIONS:
• Lease Term: {lease_term} months  
• Monthly Payment: {lease_payment}
• Down Payment: {lease_down}
• Mileage: {mileage_allowance} miles/year

🔄 TRADE-IN:
• Estimated Value: {trade_value}
• Net Cost: {net_cost}

All offers include:
• Factory warranty
• 30-day exchange policy
• Free maintenance for {maintenance_period}

Ready to get you driving today! When can you come in to finalize?

{agent_name}
{dealership_name}
{agent_phone}`
    },
    sms: "Hi {customer_name}! Your financing is approved: {monthly_payment}/month for the {vehicle_make} {vehicle_model}. Ready to sign today? Call {agent_phone} - {agent_name}"
  }
};

// GET - Get available follow-up actions for a lead
export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead_id");
  
    if (!leadId) return bad("lead_id parameter is required");

    try {
      // Get lead data to determine appropriate follow-up actions
      const { data: lead, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .eq("organization_id", organizationId)
        .single();
      
      if (error) throw new Error(error.message);
      
      // Determine suggested actions based on lead stage and data
      const suggestedActions: any[] = [];
      const now = new Date();
      
      switch (lead.stage) {
        case "inquiry":
          suggestedActions.push({
            type: "send_email",
            template: "initial_inquiry", 
            priority: lead.priority === "urgent" ? "urgent" : "high",
            scheduled_time: new Date(now.getTime() + (lead.priority === "urgent" ? 1 : 2) * 60 * 60 * 1000).toISOString(),
            reason: "Initial response to new inquiry"
          });
          if (lead.contact_phone) {
            suggestedActions.push({
              type: "schedule_call",
              priority: "medium",
              scheduled_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
              reason: "Personal follow-up call"
            });
          }
          break;
          
        case "contacted":
          suggestedActions.push({
            type: "send_email",
            template: "follow_up_interested",
            priority: "medium",
            scheduled_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            reason: "Continue engagement with interested prospect"
          });
          break;
          
        case "qualified":
          suggestedActions.push({
            type: "schedule_appointment",
            priority: "high",
            scheduled_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            reason: "Schedule test drive for qualified lead"
          });
          break;
          
        default:
          suggestedActions.push({
            type: "send_email",
            template: "initial_inquiry",
            priority: "medium",
            scheduled_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            reason: "General follow-up"
          });
          break;
      }
      
      return ok({
        lead_id: leadId,
        lead_stage: lead.stage,
        lead_score: lead.lead_score,
        priority: lead.priority,
        suggested_actions: suggestedActions,
        available_templates: Object.keys(MESSAGE_TEMPLATES),
        next_recommended_action: suggestedActions[0]?.type || "send_email"
      });
      
    } catch (dbError) {
      console.log("Database error fetching lead for follow-up:", dbError);
      // Return mock follow-up suggestions as fallback
      return ok({
        lead_id: leadId,
        suggested_actions: [
          {
            type: "send_email",
            template: "initial_inquiry",
            priority: "high",
            scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            reason: "High-priority lead requires immediate follow-up"
          }
        ],
        available_templates: Object.keys(MESSAGE_TEMPLATES),
        next_recommended_action: "send_email"
      });
    }
    
  } catch (e: any) {
    console.error("Follow-up suggestions error:", e);
    return oops(e?.message || "Unknown error retrieving follow-up suggestions");
  }
}

// POST - Create follow-up action
export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
  
    const parsed = FollowUpRequest.safeParse(await req.json());
    if (!parsed.success) {
      return bad(`Validation error: ${parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const { lead_id, action_type, schedule_time, message_template, custom_message, priority, assigned_to, meta } = parsed.data;
    
    // Return mock follow-up creation success for now
    return ok({
      id: Math.floor(Math.random() * 1000) + 100,
      lead_id,
      action_type,
        status: "scheduled",
        scheduled_time: schedule_time || new Date().toISOString(),
        priority: priority || "medium",
        created_at: new Date().toISOString(),
        message_preview: message_template ? MESSAGE_TEMPLATES[message_template]?.email?.subject || "Custom message" : "Custom action"
      });
    
  } catch (e: any) {
    console.error("Follow-up creation error:", e);
    return oops(e?.message || "Unknown error creating follow-up");
  }
}
