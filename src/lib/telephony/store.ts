
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadProviderSecrets } from "./secret-store";

export async function getPhoneNumberConfig(org_id: string, e164: string) {
  const { data, error } = await supabaseAdmin.from("phone_numbers")
    .select("id, provider_account_id, capabilities, org_id, e164")
    .eq("org_id", org_id).eq("e164", e164).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrgProviderAccount(org_id: string, provider_account_id?: string) {
  let q = supabaseAdmin.from("org_provider_accounts")
    .select("id, org_id, provider_id, meta, telecom_providers:provider_id ( slug, name )")
    .eq("org_id", org_id);
  if (provider_account_id) q = q.eq("id", provider_account_id);
  const { data, error } = await q.limit(1).single();
  if (error) throw new Error(error.message);
  const secret_ref = data.meta?.secret_ref as string | undefined;
  const secrets = secret_ref ? await loadProviderSecrets(secret_ref) : {};
  return { ...data, secrets, slug: (data as any).telecom_providers.slug as string };
}
