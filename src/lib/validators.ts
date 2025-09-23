import { z } from "zod";
export const LeadCreate = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  stage: z.string().optional(),
  campaign: z.string().optional(),
  est_value: z.number().optional(),
  meta: z.record(z.any()).optional(),
});
export const DealCreate = z.object({
  title: z.string().min(1),
  amount: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  close_date: z.string().optional(),
  pipeline: z.string().optional(),
  stage: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  lead_id: z.number().optional(),
});
export const ApptCreate = z.object({
  title: z.string().min(1),
  location: z.string().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  lead_id: z.number().optional(),
  owner_id: z.string().uuid().optional(),
  status: z.string().optional(),
});
export const MessageSend = z.object({
  channel: z.enum(["sms","email"]),
  to: z.string().min(3),
  from: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  lead_id: z.number().optional(),
});
