import { getOrgProviderAccount, getPhoneNumberConfig } from "./store";
import { twilioSms } from "./providers/twilio";
// Ensure the file exists at the specified path and exports telnyxSms
import { telnyxSms } from "./providers/telnyx";
// import { ringcentralSms } from "./providers/ringcentral";

export async function getSmsAdapterFor(orgId: string, fromE164?: string) {
  const pn = fromE164 ? await getPhoneNumberConfig(orgId, fromE164) : null;
  const provider = await getOrgProviderAccount(orgId, pn?.provider_account_id);
  switch (provider.slug) {
    case "twilio": return twilioSms(provider);
    case "telnyx": return telnyxSms(provider);
    // case "ringcentral": return ringcentralSms(provider);
    default: throw new Error("provider_not_supported");
  }
}
