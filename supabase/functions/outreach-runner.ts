// Supabase Edge Function: outreach-runner
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

serve({
  async fetch(request) {
    const now = new Date().toISOString();
    // Pull a batch of due enrollments
    const { data: due } = await supabase
      .from("outreach_enrollments")
      .select("id, org_id, campaign_id, lead_id, current_step")
      .eq("status", "active")
      .lte("next_run_at", now)
      .limit(25);
    for (const row of due || []) {
      const stepIndex = (row.current_step || 0) + 1;
      // Get step, template, campaign, lead
      const [{ data: step }, { data: camp }, { data: tpl }, { data: lead }] = await Promise.all([
        supabase.from("outreach_steps").select("*").eq("campaign_id", row.campaign_id).eq("index", stepIndex).single(),
        supabase.from("outreach_campaigns").select("*").eq("id", row.campaign_id).single(),
        supabase.from("message_templates").select("*").eq("id", step?.template_id).single(),
        supabase.from("leads").select("*, contacts(*)").eq("id", row.lead_id).single()
      ]);
      if (!step || !tpl || !lead) {
        await supabase.from("outreach_enrollments").update({ status: "error", last_error: "missing step/template/lead" }).eq("id", row.id);
        continue;
      }
      // Quiet hours enforcement
      const qs = camp.quiet_start, qe = camp.quiet_end;
      const nowLocal = new Date();
      const withinQuiet = qs && qe && isWithinQuiet(nowLocal, qs, qe);
      if (withinQuiet) {
        const bump = bumpOutsideQuiet(nowLocal, qs, qe).toISOString();
        await supabase.from("outreach_enrollments").update({ next_run_at: bump }).eq("id", row.id);
        await supabase.from("outreach_events").insert({ org_id: row.org_id, enrollment_id: row.id, step_index: stepIndex, channel: step.type, status: "queued_quiet_hours" });
        continue;
      }
      // Personalize content
      const vars = {
        first_name: lead.contacts?.first_name || "",
        last_name: lead.contacts?.last_name || "",
        phone: lead.contacts?.phone || "",
        email: lead.contacts?.email || "",
        campaign: lead.campaign || ""
      };
      const body = tpl.body; // For full AI, call your aiPersonalize function here
      let eventStatus = "sent", providerId = null, err = null;
      try {
        if (step.type === "sms") {
          // Call your provider-agnostic SMS sender here
        } else if (step.type === "email") {
          // Call your provider-agnostic email sender here
        } else if (step.type === "voice") {
          // Call your provider-agnostic voice sender here
        }
      } catch (e) { eventStatus = "error"; err = String(e?.message || e); }
      await supabase.from("outreach_events").insert({
        org_id: row.org_id, enrollment_id: row.id, step_index: stepIndex,
        channel: step.type, status: eventStatus, provider_id: providerId, error: err
      });
      // Schedule next step
      const { data: nextStep } = await supabase
        .from("outreach_steps").select("delay_minutes").eq("campaign_id", row.campaign_id).eq("index", stepIndex + 1).single();
      const nextRun = nextStep ? new Date(Date.now() + (nextStep.delay_minutes || 0) * 60000).toISOString() : null;
      await supabase.from("outreach_enrollments").update({
        current_step: stepIndex, status: nextRun ? "active" : "done", next_run_at: nextRun, last_error: err
      }).eq("id", row.id);
    }
    return new Response(JSON.stringify({ processed: due?.length || 0 }), { headers: { "Content-Type": "application/json" } });
  }
});

function isWithinQuiet(now, qs, qe) {
  const [qsH, qsM] = qs.split(":").map(Number); const [qeH, qeM] = qe.split(":").map(Number);
  const inMins = now.getHours() * 60 + now.getMinutes();
  const s = qsH * 60 + qsM, e = qeH * 60 + qeM;
  return s < e ? (inMins >= s && inMins < e) : (inMins >= s || inMins < e);
}
function bumpOutsideQuiet(now, qs, qe) {
  const [qeH, qeM] = qe.split(":").map(Number);
  const out = new Date(now);
  out.setHours(qeH, qeM, 0, 0);
  if (out < now) out.setDate(out.getDate() + 1);
  return out;
}
