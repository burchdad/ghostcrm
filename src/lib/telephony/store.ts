// Stub: implement with Supabase queries
export async function getOrgProviderAccount(orgId: string, providerAccountId?: string) {
  // TODO: Query org_provider_accounts by orgId and providerAccountId
  return { slug: "twilio", meta: {}, secret_ref: "" };
}

export async function getPhoneNumberConfig(orgId: string, e164: string) {
  // TODO: Query phone_numbers by orgId and e164
  return { provider_account_id: "", e164 };
}
