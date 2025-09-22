export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
let sg: any = null;
if (process.env.SENDGRID_API_KEY) {
  sg = (await import("@sendgrid/mail")).default;
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check existing in Supabase
    const { data: existing, error: existsError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", emailNorm)
      .single();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (existsError && existsError.code !== "PGRST116") {
      // PGRST116 = No rows found, which is fine
      return NextResponse.json({ error: "db_error", detail: existsError.message }, { status: 500 });
    }

    // Hash and insert
    const password_hash = await hash(password, 10);
    const { data: user, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ email: emailNorm, password_hash, role: "user" })
      .select()
      .single();
    if (insertError) {
      if (insertError.code === "23505" || /duplicate/i.test(insertError.message)) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: "db_error", detail: insertError.message }, { status: 500 });
    }

    // Audit (best effort)
    await supabaseAdmin.from("audit_events").insert({
      org_id: process.env.DEFAULT_ORG_ID,
      actor_id: user?.id ?? null,
      entity: "user",
      entity_id: user?.id ?? null,
      action: "register",
      diff: { email: emailNorm }
    });

    // Send welcome/verify email (fail-soft)
    if (sg && process.env.SENDGRID_FROM) {
      try {
        await sg.send({
          to: emailNorm,
          from: process.env.SENDGRID_FROM!,
          subject: "Welcome to GhostCRM",
          text: "Your account has been created.",
        });
      } catch (e: any) {
        // Log but DO NOT fail registration
        console.warn("sendgrid error:", e?.response?.body || e?.message || e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: String(e) }, { status: 500 });
  }
}
