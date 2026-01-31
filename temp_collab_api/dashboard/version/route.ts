import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
/**
 * @openapi
 * /api/dashboard/version:
 *   get:
 *     summary: Fetch all versions for a dashboard card
 *     parameters:
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card versions
 *   post:
 *     summary: Save a new version for a dashboard card
 */

// GET: Fetch all versions for a dashboard card
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
    .from("dashboard_versions")
    .select("*")
    .eq("user_id", userId);
  if (cardId) query = query.eq("card_id", cardId);
  query = query.order("version", { ascending: false });
  const { data, error } = await query;
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { versions: data || [] } };
});

// POST: Save a new version for a dashboard card
export const POST = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const schema = z.object({
    cardId: z.string(),
    cardData: z.any(),
    version: z.string(),
  });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Invalid body", details: parsed.error.issues } };
  }
  const { cardId, cardData, version } = parsed.data;
  const { error } = await supabase
    .from("dashboard_versions")
    .insert({ user_id: userId, card_id: cardId, card_data: cardData, version, timestamp: new Date().toISOString() });
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { success: true } };
});
