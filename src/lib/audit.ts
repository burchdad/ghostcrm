import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function audit(org_id: string, entity: string, entity_id: string, action: string, diff?: any) {
  await supabaseAdmin.from("audit_events").insert({
    org_id, entity, entity_id, action, diff: diff ?? null
  });
}
