export type SendResult = { ok: true; providerId?: string } | { ok: false; error: string };

export interface SmsAdapter {
  sendSms(args: { orgId: string; from?: string; to: string; body: string; meta?: any }): Promise<SendResult>;
}

export interface VoiceAdapter {
  placeCall(args: { orgId: string; from: string; to: string; sip?: any; meta?: any }): Promise<SendResult>;
}
