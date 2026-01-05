import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id;

    // Check authentication using our server utility
    const isAuth = await isAuthenticated(req);
    if (!isAuth) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(JSON.stringify({ error: "User organization not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch lead with contact information
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select(`
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq("id", leadId)
      .eq("organization_id", user.organizationId)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: lead }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Lead fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}