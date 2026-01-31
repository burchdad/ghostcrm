import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
/**
 * @openapi
 * /api/dashboard/schedule:
 *   get:
 *     summary: Fetch scheduled reports for dashboard cards
 *     responses:
 *       200:
 *         description: Scheduled reports
 *   post:
 *     summary: Schedule a report for a dashboard card
 *   delete:
 *     summary: Remove a scheduled report
 */

// GET: Fetch scheduled reports for dashboard cards
export const GET = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const { data, error } = await supabase
    .from("dashboard_schedules")
    .select("*")
    .eq("user_id", userId);
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { schedules: data || [] } };
});

// POST: Schedule a report for a dashboard card
export const POST = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const schema = z.object({
    cardId: z.string(),
    email: z.string().email(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
  });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid body", details: parsed.error.issues } };
  }
  const { cardId, email, frequency } = parsed.data;
  const { error } = await supabase
    .from("dashboard_schedules")
    .upsert({ user_id: userId, card_id: cardId, email, frequency });
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { success: true } };
});

// DELETE: Remove a scheduled report
export const DELETE = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const schema = z.object({ cardId: z.string() });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid body", details: parsed.error.issues } };
  }
  const { cardId } = parsed.data;
  const { error } = await supabase
    .from("dashboard_schedules")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", cardId);
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { success: true } };
});
