import { createRouteHandler } from "@/utils/api";
import { supabase } from "@/lib/supabase";

// POST: Export dashboard card data (e.g., CSV, PDF)
export const POST = createRouteHandler(async (req) => {
  const userId = req.headers["x-user-id"] || "demo";
  const { cardId, format } = await req.json();
  // Fetch card data
  const { data, error } = await supabase
    .from("dashboard_cards")
    .select("*")
    .eq("user_id", userId)
    .eq("id", cardId);
  if (error) return { status: 500, body: { error: error.message } };
  // Simulate export logic (CSV/PDF)
  let exported = null;
  if (format === "csv") {
    exported = JSON.stringify(data);
  } else if (format === "pdf") {
    exported = "PDF export not implemented.";
  }
  return { status: 200, body: { exported } };
});
