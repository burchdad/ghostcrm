export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

// Checks SendGrid, DB write, and (optionally) Twilio reachability
export async function GET() {
  const checks = { dbWrite: false, sendgrid: "skipped", twilio: "skipped" };
  const errors: Record<string, string> = {};

  // 1) DB write test: insert then delete a tiny audit record
  try {
    const marker = `health-${Date.now()}`;
    await queryDb(
      "INSERT INTO audit_logs (user_id, event_type, event_details) VALUES (@param0,@param1,@param2)",
      [null, "_health", JSON.stringify({ marker })]
    );
    checks.dbWrite = true;
    await queryDb(
      "DELETE TOP(1) FROM audit_logs WHERE event_type=@param0 AND event_details LIKE @param1",
      ["_health", `%${marker}%`]
    );
  } catch (e) {
    errors.dbWrite = String(e);
  }

  // 2) SendGrid presence check (optional)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sg = (await import("@sendgrid/mail")).default;
      sg.setApiKey(process.env.SENDGRID_API_KEY);
      checks.sendgrid = "configured";
    } catch (e) {
      checks.sendgrid = "error";
      errors.sendgrid = String(e);
    }
  }

  // 3) Twilio connectivity (optional)
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      // Simple authenticated call
      await client.api.accounts(process.env.TWILIO_SID).fetch();
      checks.twilio = "ok";
    } catch (e) {
      checks.twilio = "error";
      errors.twilio = String(e);
    }
  }

  const ok = checks.dbWrite && checks.twilio !== "error" && checks.sendgrid !== "error";
  return NextResponse.json(
    { ok, checks, errors, hint: "Missing services are 'skipped'; only 'error' fails health." },
    { status: ok ? 200 : 500 }
  );
}
