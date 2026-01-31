import { NextRequest } from "next/server";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const brand = url.searchParams.get("brand") ?? undefined;
  const condition = url.searchParams.get("condition") ?? undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)));
  const offset = (page - 1) * limit;

  try {
    // Get authenticated user using new Supabase auth
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      console.log('❌ [INVENTORY GET] Authentication failed or no organization');
      return new Response(
        JSON.stringify({ error: "Authentication required", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🔍 [INVENTORY GET] Fetching inventory for organization ${user.organizationId}, page ${page}, limit ${limit}`);

    // Build query for inventory using the user's organization
    let query = supabaseAdmin
      .from("inventory")
      .select("*", { count: "exact" })
      .eq("organization_id", user.organizationId);

    // Apply filters
    if (search) {
      query = query.or(
        [
          `name.ilike.%${search}%`,
          `sku.ilike.%${search}%`,
          `brand.ilike.%${search}%`,
          `model.ilike.%${search}%`,
        ].join(",")
      );
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (brand) {
      query = query.eq("brand", brand);
    }

    if (condition) {
      query = query.eq("condition", condition);
    }

    // Apply pagination and ordering
    const {
      data: inventory,
      count,
      error,
    } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ [INVENTORY GET] Database error:", {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        organization: user.organizationId
      });
      return new Response(JSON.stringify({ 
        error: "Database error", 
        code: "DB_ERROR",
        message: "Unable to fetch inventory data" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!inventory) {
      console.warn(`⚠️ [INVENTORY GET] No inventory data returned for organization ${user.organizationId}`);
      return new Response(JSON.stringify({
        success: true,
        data: [],
        summary: { total_items: 0, total_value: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 },
        pagination: { page, limit, total: 0, totalPages: 0 },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform data to match frontend expectations and add calculated fields
    const transformedInventory = (inventory || []).map((item: any) => ({
      ...item,
      // Calculated profit margin (%)
      profit_margin:
        item.price_selling && item.price_cost
          ? (
              ((item.price_selling - item.price_cost) / item.price_selling) *
              100
            ).toFixed(2)
          : 0,
      // Total value (selling price * available stock)
      total_value: (item.price_selling || 0) * (item.stock_available || 0),
      // Location display
      location_display:
        [item.loc_lot, item.loc_section, item.loc_row, item.loc_spot]
          .filter(Boolean)
          .join("-") ||
        item.loc_warehouse ||
        "Unassigned",
      // Availability status
      availability_status:
        item.stock_available > 0
          ? "In Stock"
          : item.stock_reserved > 0
          ? "Reserved"
          : "Out of Stock",
    }));

    // Summary metrics
    const summary = {
      total_items: count || 0,
      total_value: transformedInventory.reduce(
        (sum: number, item: any) => sum + (item.total_value || 0),
        0
      ),
      in_stock: transformedInventory.filter(
        (item: any) => item.stock_available > 0
      ).length,
      low_stock: transformedInventory.filter(
        (item: any) =>
          item.stock_available > 0 &&
          item.stock_available <= (item.stock_reorder_level || 5)
      ).length,
      out_of_stock: transformedInventory.filter(
        (item: any) => item.stock_available === 0
      ).length,
    };

    console.log(`✅ [INVENTORY GET] Successfully fetched ${transformedInventory.length} items for organization ${user.organizationId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedInventory,
        summary,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ [INVENTORY GET] Unexpected error:", {
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined
    });
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while fetching inventory" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get authenticated user from Supabase SSR authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!user.organizationId) {
      console.error('❌ [INVENTORY] No organization ID in POST');
      return new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!body.name || !body.sku || !body.category) {
      return new Response(
        JSON.stringify({ error: "Name, SKU, and category are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create inventory data
    const inventoryData = {
      organization_id: user.organizationId,
      name: body.name,
      sku: body.sku,
      category: body.category,
      brand: body.brand || "",
      model: body.model || "",
      year: body.year || null,
      vin: body.vin || null,
      condition: body.condition || "new",
      status: body.status || "available",
      price_cost: parseFloat(body.price_cost) || 0,
      price_msrp: parseFloat(body.price_msrp) || 0,
      price_selling: parseFloat(body.price_selling) || 0,
      price_currency: body.price_currency || "USD",
      stock_on_hand: parseInt(body.stock_on_hand) || 0,
      stock_reserved: parseInt(body.stock_reserved) || 0,
      stock_available: parseInt(body.stock_available) || parseInt(body.stock_on_hand) || 0,
      stock_reorder_level: parseInt(body.stock_reorder_level) || 0,
      stock_reorder_qty: parseInt(body.stock_reorder_qty) || 0,
      loc_lot: body.loc_lot || "",
      loc_section: body.loc_section || "",
      loc_row: body.loc_row || "",
      loc_spot: body.loc_spot || "",
      loc_warehouse: body.loc_warehouse || "",
      description: body.description || "",
      notes: body.notes || "",
      specifications: body.specifications || {},
      images: body.images || [],
      custom_fields: body.custom_fields || {},
    };

    console.log('📦 [INVENTORY] Creating with data:', { ...inventoryData, organization_id: '[REDACTED]' });

    const {
      data: inventory,
      error,
    } = await supabaseAdmin
      .from("inventory")
      .insert(inventoryData)
      .select()
      .single();

    if (error) {
      console.error("❌ [INVENTORY] Database error creating inventory:", {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return new Response(
        JSON.stringify({ 
          error: "Failed to create inventory item",
          details: error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log('✅ [INVENTORY] Created successfully:', inventory.id);

    // Log audit event
    try {
      await supabaseAdmin.from("audit_events").insert({
        organization_id: user.organizationId,
        entity: "inventory",
        entity_id: inventory.id,
        action: "create",
        user_id: user.id,
      });
    } catch (auditError) {
      console.warn('⚠️ [INVENTORY] Failed to log audit event:', auditError);
      // Don't fail the request for audit logging issues
    }

    return new Response(JSON.stringify({ success: true, data: inventory }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [INVENTORY] Inventory creation error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Inventory ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get authenticated user from Supabase SSR authentication
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update inventory item
    const {
      data: inventory,
      error,
    } = await supabaseAdmin
      .from("inventory")
      .update({
        name: updateData.name,
        sku: updateData.sku,
        category: updateData.category,
        brand: updateData.brand,
        model: updateData.model,
        year: updateData.year,
        condition: updateData.condition,
        status: updateData.status,
        price_cost: updateData.price_cost,
        price_msrp: updateData.price_msrp,
        price_selling: updateData.price_selling,
        price_currency: updateData.price_currency,
        stock_on_hand: updateData.stock_on_hand,
        stock_reserved: updateData.stock_reserved,
        stock_available: updateData.stock_available,
        stock_reorder_level: updateData.stock_reorder_level,
        stock_reorder_qty: updateData.stock_reorder_qty,
        loc_lot: updateData.loc_lot,
        loc_section: updateData.loc_section,
        loc_row: updateData.loc_row,
        loc_spot: updateData.loc_spot,
        loc_warehouse: updateData.loc_warehouse,
        description: updateData.description,
        specifications: updateData.specifications,
        features: updateData.features,
        images: updateData.images,
        vendor_info: updateData.vendor_info,
        warranty_info: updateData.warranty_info,
        compliance_info: updateData.compliance_info,
        custom_fields: updateData.custom_fields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", user.organizationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update inventory item" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "inventory",
      entity_id: id,
      action: "update",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true, data: inventory }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Inventory ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get authenticated user from Supabase SSR authentication
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete inventory item
    const { error } = await supabaseAdmin
      .from("inventory")
      .delete()
      .eq("id", id)
      .eq("organization_id", user.organizationId);

    if (error) {
      console.error("Error deleting inventory item:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete inventory item" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "inventory",
      entity_id: id,
      action: "delete",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Inventory deletion error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
