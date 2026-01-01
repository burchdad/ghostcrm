import { NextRequest } from "next/server";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { ok, bad, oops } from "@/lib/http";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Store message in database
    const { data: messageRecord, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        lead_id: lead_id || null,
        to_address: to,
        channel,
        content: message,
        template_id: template_id || null,
        scheduled_at: scheduled_at || null,
        priority,
        tags,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [MESSAGES] Failed to store message:', insertError);
      return oops("Failed to store message");
    }

    let provider_id = "system";
    let error: string | null = null;

    try {
      // Send via appropriate provider based on channel
      switch (channel) {
        case "email":
          // TODO: Integrate with email provider (SendGrid, etc.)
          provider_id = "email";
          break;
        case "sms":
          // TODO: Integrate with SMS provider (Twilio, etc.)
          provider_id = "sms";
          break;
        case "voice":
          // TODO: Integrate with voice provider (Twilio, etc.)
          provider_id = "voice";
          break;
        default:
          error = "Unsupported channel";
      }

      // Update message status
      const finalStatus = error ? "failed" : "sent";
      await supabaseAdmin
        .from('messages')
        .update({
          status: finalStatus,
          provider_id,
          error: error || null,
          sent_at: error ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageRecord.id);

      // Log audit event
      await supabaseAdmin.from("audit_events").insert({
        organization_id: organizationId,
        user_id: user.id,
        entity: "message",
        entity_id: String(messageRecord.id),
        action: error ? "send_failed" : "sent",
        details: { channel, to, provider_id, error }
      });

    } catch (sendError) {
      console.error('❌ [MESSAGES] Send error:', sendError);
      error = (sendError as Error).message;
      
      // Update message as failed
      await supabaseAdmin
        .from('messages')
        .update({
          status: "failed",
          error,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageRecord.id);
    }

    if (error) {
      return ok({ 
        ok: false, 
        error,
        message_id: messageRecord.id,
        status: "failed"
      });
    }

    return ok({ 
      ok: true, 
      provider_id,
      message: "Message sent successfully",
      message_id: messageRecord.id,
      status: "sent"
    });

  } catch (e: any) {
    console.error("General error in message sending:", e);
    return oops(e?.message || "Message sending failed");
  }
}