import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { getUserIdFromRequest } from "@/utils/auth";
// OpenAPI docs (for documentation)
/**
 * @openapi
 * /api/dashboard/analytics:
 *   get:
 *     summary: Fetch analytics data for dashboard cards
 *     parameters:
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: string
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 *   post:
 *     summary: Store or run analytics query
 *   delete:
 *     summary: Remove analytics data for a card
 */

export const GET = createRouteHandler(async (req) => {
  const userIdGet = getUserIdFromRequest(req);
  if (!userIdGet) {
    return { status: 401, body: { error: "Unauthorized: Invalid or missing token" } };
  }
  const schemaGet = z.object({
    cardId: z.string().optional(),
    range: z.string().optional(),
    page: z.string().transform(Number).optional(),
    pageSize: z.string().transform(Number).optional(),
    sort: z.string().optional(),
  });
  const urlGet = new URL(req.url, "http://localhost");
  const paramsGet = Object.fromEntries(urlGet.searchParams.entries());
  const parsedGet = schemaGet.safeParse(paramsGet);
  if (!parsedGet.success) {
    return { status: 400, body: { error: "Invalid query params", details: parsedGet.error.issues } };
  }
  const { cardId, range, page = 1, pageSize = 20, sort } = parsedGet.data;
  let queryGet = supabase
    .from("dashboard_analytics")
    .select("*")
    .eq("user_id", userIdGet);
  if (cardId) queryGet = queryGet.eq("card_id", cardId);
  if (range) queryGet = queryGet.eq("range", range);
  if (sort) queryGet = queryGet.order(sort, { ascending: false });
  queryGet = queryGet.range((page - 1) * pageSize, page * pageSize - 1);
  const { data: dataGet, error: errorGet } = await queryGet;
  if (errorGet) return { status: 500, body: { error: errorGet.message } };
  return { status: 200, body: { analytics: dataGet || [], page, pageSize } };
});

export const POST = createRouteHandler(async (req) => {
  const userIdPost = getUserIdFromRequest(req);
  if (!userIdPost) {
    return { status: 401, body: { error: "Unauthorized: Invalid or missing token" } };
  }
  const schemaPost = z.object({
    cardId: z.string(),
    query: z.string(),
    result: z.any(),
  });
  const bodyPost = await req.json();
  const parsedPost = schemaPost.safeParse(bodyPost);
  if (!parsedPost.success) {
    return { status: 400, body: { error: "Invalid body", details: parsedPost.error.issues } };
  }
  // Store analytics result
  const { cardId: cardIdPost, query: queryStrPost, result: resultPost } = parsedPost.data;
  const { error: errorPost } = await supabase
    .from("dashboard_analytics")
    .upsert({ user_id: userIdPost, card_id: cardIdPost, query: queryStrPost, result: resultPost });
  if (errorPost) return { status: 500, body: { error: errorPost.message } };
  return { status: 200, body: { success: true } };
});

export const DELETE = createRouteHandler(async (req) => {
  const userIdDelete = getUserIdFromRequest(req);
  if (!userIdDelete) {
    return { status: 401, body: { error: "Unauthorized: Invalid or missing token" } };
  }
  const schemaDelete = z.object({ cardId: z.string() });
  const bodyDelete = await req.json();
  const parsedDelete = schemaDelete.safeParse(bodyDelete);
  if (!parsedDelete.success) {
    return { status: 400, body: { error: "Invalid body", details: parsedDelete.error.issues } };
  }
  const { cardId: cardIdDelete } = parsedDelete.data;
  const { error: errorDelete } = await supabase
    .from("dashboard_analytics")
    .delete()
    .eq("user_id", userIdDelete)
    .eq("card_id", cardIdDelete);
  if (errorDelete) return { status: 500, body: { error: errorDelete.message } };
  return { status: 200, body: { success: true } };
});
