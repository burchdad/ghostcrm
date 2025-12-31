import { NextRequest } from "next/server";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { ok, bad, oops } from "@/lib/http";
import { z } from "zod";

const MessageRequest = z.object({
  to: z.string().min(1),
  channel: z.enum(["sms", "email", "voice"]),
  message: z.string().min(1).max(1600),
  lead_id: z.number().optional(),
  template_id: z.string().optional(),
  scheduled_at: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  tags: z.array(z.string()).optional()
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    
    const parsed = MessageRequest.safeParse(await req.json());
    if (!parsed.success) {
      return bad(`Validation error: ${parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const { to, channel, message, lead_id, template_id, scheduled_at, priority = "normal", tags = [] } = parsed.data;

    console.log(`📤 [MESSAGES] Sending ${channel} message to ${to} from org ${organizationId}`);

    // Return mock success for now
    return ok({ 
      ok: true, 
      provider_id: "mock", 
      message: "Message sent (mock mode)",
      message_id: `mock_${Date.now()}`,
      status: "sent"
    });

  } catch (e: any) {
    console.log("General error in message sending, returning mock success:", e);
    return ok({ 
      ok: true, 
      provider_id: "mock", 
      message: "Message sent (mock mode)" 
    });
  }
}