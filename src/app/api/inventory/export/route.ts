import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json"; // json or csv
    const includeImages = url.searchParams.get("include_images") === "true";

    // Get authenticated user
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`📤 [INVENTORY EXPORT] Exporting inventory for organization ${user.organizationId} in ${format} format`);

    // Fetch all inventory for the organization
    const { data: inventory, error } = await supabaseAdmin
      .from("inventory")
      .select("*")
      .eq("organization_id", user.organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [INVENTORY EXPORT] Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch inventory data" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!inventory || inventory.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No inventory items found",
          data: format === "csv" ? "" : []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Transform data for export
    const exportData = inventory.map(item => {
      const baseData = {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        brand: item.brand || '',
        model: item.model || '',
        year: item.year || '',
        vin: item.vin || '',
        condition: item.condition,
        status: item.status,
        price_cost: item.price_cost,
        price_msrp: item.price_msrp,
        price_selling: item.price_selling,
        price_currency: item.price_currency,
        stock_on_hand: item.stock_on_hand,
        stock_reserved: item.stock_reserved,
        stock_available: item.stock_available,
        stock_reorder_level: item.stock_reorder_level,
        stock_reorder_qty: item.stock_reorder_qty,
        location_lot: item.loc_lot || '',
        location_section: item.loc_section || '',
        location_row: item.loc_row || '',
        location_spot: item.loc_spot || '',
        location_warehouse: item.loc_warehouse || '',
        description: item.description || '',
        notes: item.notes || '',
        specifications: JSON.stringify(item.specifications || {}),
        custom_fields: JSON.stringify(item.custom_fields || {}),
        created_at: item.created_at,
        updated_at: item.updated_at
      };

      if (includeImages) {
        baseData.images = JSON.stringify(item.images || []);
      }

      return baseData;
    });

    // Log audit event
    try {
      await supabaseAdmin.from("audit_events").insert({
        organization_id: user.organizationId,
        entity: "inventory",
        entity_id: null,
        action: "export",
        user_id: user.id,
        details: {
          format,
          item_count: inventory.length,
          include_images: includeImages
        }
      });
    } catch (auditError) {
      console.warn("⚠️ [INVENTORY EXPORT] Failed to log audit event:", auditError);
    }

    if (format === "csv") {
      // Convert to CSV format
      if (exportData.length === 0) {
        return new Response("", {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="inventory_export_${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            let value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\\n'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="inventory_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON format
      return new Response(JSON.stringify({
        success: true,
        data: exportData,
        meta: {
          total_items: inventory.length,
          exported_at: new Date().toISOString(),
          format: "json",
          include_images: includeImages
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("❌ [INVENTORY EXPORT] Export error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error during export",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}