import Telnyx from "telnyx";
import type { SmsAdapter, VoiceAdapter, SendResult } from "../types";

function resolveTelnyxSecrets(provider: any) {
  // TODO: Resolve secrets from provider.meta/secret_ref
  return {
    apiKey: provider.meta.apiKey || "",
    messagingProfileId: provider.meta.messagingProfileId || "",
    connectionId: provider.meta.connectionId || "",
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

export function telnyxVoice(provider: { meta: any }): VoiceAdapter {
  const { apiKey, connectionId, defaultFrom } = resolveTelnyxSecrets(provider);
  const client = Telnyx(apiKey);

  return {
    async placeCall({ from, to, meta }): Promise<SendResult> {
      try {
        console.log('🔧 Telnyx API call parameters:', {
          to,
          from: from ?? defaultFrom,
          connection_id: connectionId,
          webhook_url: meta?.webhookUrl,
          webhook_url_method: 'POST',
          client_state: meta?.clientState ? 'present' : 'missing',
          additionalOptions: meta?.telnyxOptions
        });

        let clientStateEncoded: string | undefined;
        if (meta?.clientState) {
          try {
            clientStateEncoded = btoa(JSON.stringify(meta.clientState));
          } catch (e) {
            console.error('❌ [TELNYX] Failed to encode client_state:', e);
            clientStateEncoded = undefined;
          }
        }

        const call = await client.calls.create({
          to,
          from: from ?? defaultFrom,
          connection_id: connectionId,
          webhook_url: meta?.webhookUrl,
          webhook_url_method: 'POST',
          client_state: clientStateEncoded,
          ...meta?.telnyxOptions
        });
        
        // CRITICAL: Log the full Telnyx response to debug call_control_id extraction
        console.log('🔍 [TELNYX] Full call response:', JSON.stringify(call, null, 2));
        console.log('🔍 [TELNYX] Call data:', JSON.stringify(call?.data, null, 2));
        console.log('🔍 [TELNYX] Call control ID:', call?.data?.call_control_id);
        console.log('🔍 [TELNYX] Call ID (legacy):', call?.data?.id);
        
        // Use call_control_id (the correct field) instead of id
        const callControlId = call?.data?.call_control_id || call?.data?.id;
        
        console.log('✅ Telnyx API call successful, call_control_id:', callControlId);
        return { ok: true, providerId: callControlId };
      } catch (e: any) {
        console.error('❌ Telnyx API detailed error:', {
          message: e?.message,
          type: e?.type,
          response: e?.response?.data,
          status: e?.response?.status,
          statusText: e?.response?.statusText,
          statusCode: e?.statusCode,
          errors: e?.raw?.errors,
          fullError: e
        });
        
        // Extract specific error details from Telnyx error format
        let errorMessage = 'Unknown Telnyx error';
        
        if (e?.raw?.errors && Array.isArray(e.raw.errors)) {
          const errorDetails = e.raw.errors.map((err: any) => 
            `${err.title || 'Error'}: ${err.detail || 'No details'}`
          ).join('; ');
          errorMessage = errorDetails;
        } else if (e?.response?.data?.errors?.[0]?.detail) {
          errorMessage = e.response.data.errors[0].detail;
        } else if (e?.response?.data?.message) {
          errorMessage = e.response.data.message;
        } else if (e?.message) {
          errorMessage = e.message;
        }
        
        return { ok: false, error: errorMessage };
      }
    }
  };
}
