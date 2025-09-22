import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { encryptJSON, decryptJSON } from "@/lib/crypto/secret";

export async function saveProviderSecrets(args: {
  org_id: string; provider_id: string; secrets: any;
}) {
  const ref = `prov_${args.org_id}_${Date.now()}`;
  const cipher = encryptJSON(args.secrets);

  const { error } = await supabaseAdmin.from("org_provider_secrets")
    .insert({ org_id: args.org_id, ref, cipher });
  if (error) throw new Error(error.message);
  return ref;
}

export async function loadProviderSecrets(secret_ref: string) {
  const { data, error } = await supabaseAdmin.from("org_provider_secrets")
    .select("cipher").eq("ref", secret_ref).single();
  if (error) throw new Error(error.message);
  return decryptJSON(Buffer.from(data.cipher as any));
}
