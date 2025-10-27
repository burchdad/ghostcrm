import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";

export const GET = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const { data, error } = await supabase
    .from("dashboard_cards")
    .select("*")
    .eq("user_id", userId);
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { cards: data || [] } };
});

export const POST = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const { cards } = await req.json();
  // Upsert all cards for user
  const { error } = await supabase
    .from("dashboard_cards")
    .upsert(cards.map(card => ({ ...card, user_id: userId })));
  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { success: true } };
});
