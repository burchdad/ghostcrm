import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
/**
 * @openapi
 * /api/dashboard/audit:
 *   get:
 *     summary: Fetch audit trail for dashboard cards
 *     parameters:
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit trail
 *   post:
 *     summary: Add audit log entry
 */

// GET: Fetch audit trail for dashboard cards
export const GET = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const schema = z.object({ cardId: z.string().optional() });
  const url = new URL(req.url, "http://localhost");
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid query params", details: parsed.error.issues } };
  }
  const { cardId } = parsed.data;
  let query = supabase
    .from("dashboard_audit")
    .select("*")
    .eq("user_id", userId);
  if (cardId) query = query.eq("card_id", cardId);
  query = query.order("timestamp", { ascending: false });
  const { data, error } = await query;
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { audit: data || [] } };
});

// POST: Add audit log entry
export const POST = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const schema = z.object({
    cardId: z.string(),
    action: z.string(),
    details: z.string().optional(),
  });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid body", details: parsed.error.issues } };
  }
  const { cardId, action, details } = parsed.data;
  const { error } = await supabase
    .from("dashboard_audit")
    .insert({ user_id: userId, card_id: cardId, action, details, timestamp: new Date().toISOString() });
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { success: true } };
});
