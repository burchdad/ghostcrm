import { z } from "zod";

export const ApptCreate = z.object({
  title: z.string(),
  location: z.string().nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  lead_id: z.string().nullable().optional(),
  owner_id: z.string().nullable().optional(),
  status: z.string().optional(),
});