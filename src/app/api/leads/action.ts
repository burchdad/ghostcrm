

import { NextResponse } from "next/server";
import Airtable from "airtable";
import twilio from "twilio";

export async function POST(request: Request) {
  const { leadId, action, phone, message } = await request.json();
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!baseId || !apiKey) {
    return NextResponse.json({ error: "Missing Airtable credentials" }, { status: 500 });
  }

  const base = new Airtable({ apiKey }).base(baseId);

  try {
    // Log the action in Airtable
    await base("Leads").update(leadId, {
      Notes: `Action: ${action} at ${new Date().toISOString()}`
    });

    // Example: Twilio integration for "call" or "sms" actions
    if ((action === "call" || action === "sms")) {
      if (!twilioSid || !twilioAuthToken) {
        throw new Error("Missing Twilio credentials");
      }
      if (!phone) {
        throw new Error("Missing phone number for Twilio action");
      }
      const client = twilio(twilioSid, twilioAuthToken);
      if (action === "sms" && message) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
      }
      // For "call", you could trigger a call here (not implemented for MVP)
    }

    // TODO: Integrate SendGrid, Supabase as needed
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
