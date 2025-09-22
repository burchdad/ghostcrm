import Twilio from "twilio";
import type { SmsAdapter, SendResult } from "../types";

function resolveTwilioSecrets(provider: any) {
  // TODO: Resolve secrets from provider.meta/secret_ref
  return {
    accountSid: provider.meta.accountSid || "",
    authToken: provider.meta.authToken || "",
    defaultFrom: provider.meta.defaultFrom || ""
  };
}

export function twilioSms(provider: { meta: any; secret_ref?: string }): SmsAdapter {
  const { accountSid, authToken, defaultFrom } = resolveTwilioSecrets(provider);
  const client = Twilio(accountSid, authToken);

  return {
    async sendSms({ from, to, body }): Promise<SendResult> {
      try {
        const resp = await client.messages.create({ to, from: from ?? defaultFrom, body });
        return { ok: true, providerId: resp.sid };
      } catch (e: any) {
        return { ok: false, error: e?.message || String(e) };
      }
    }
  };
}
