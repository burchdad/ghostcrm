// Telnyx verifyNumberOwnership implementation
import Telnyx from "telnyx";

export async function verifyNumberOwnership({ org_id, provider_account_id, e164 }:{ org_id:string, provider_account_id:string, e164:string }) {
  // TODO: Load Telnyx API key from secret store
  const apiKey = process.env.TELNYX_API_KEY ?? "";
  const client = Telnyx(apiKey);
  // Query Telnyx for numbers
  const resp = await client.numbers.list({ filter_phone_number: e164 });
  const found = resp.data?.filter((n:any) => n.phone_number === e164);
  if (!found?.length) throw new Error("number_not_found");
  // Optionally check org_id/provider_account_id match
  return true;
}
