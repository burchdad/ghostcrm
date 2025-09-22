import Telnyx from "telnyx";
import type { SmsAdapter, SendResult } from "../types";

function resolveTelnyxSecrets(provider: any) {
  // TODO: Resolve secrets from provider.meta/secret_ref
  return {
    apiKey: provider.meta.apiKey || "",
    messagingProfileId: provider.meta.messagingProfileId || "",
    defaultFrom: provider.meta.defaultFrom || ""
  };
}

export function telnyxSms(provider: { meta: any }): SmsAdapter {
  const { apiKey, messagingProfileId, defaultFrom } = resolveTelnyxSecrets(provider);
  const client = Telnyx(apiKey);

  return {
    async sendSms({ from, to, body }): Promise<SendResult> {
      try {
        const resp = await client.messages.create({
          from: from ?? defaultFrom,
          to,
          text: body,
          messaging_profile_id: messagingProfileId
        });
        return { ok: true, providerId: resp?.data?.id };
      } catch (e: any) {
        return { ok: false, error: e?.message || String(e) };
      }
    }
  };
}
