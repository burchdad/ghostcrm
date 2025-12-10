import { NextRequest } from "next/server";
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
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "25", 10);
  const offset = (page - 1) * limit;

  try {
    // Get authenticated user and organization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build query for inventory
    let query = supabaseAdmin
      .from("inventory")
      .select("*", { count: "exact" })
      .eq("organization_id", userOrg.organization_id);

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
      console.error("Database error fetching inventory:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
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
    console.error("Inventory GET API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
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

    // Get authenticated user and organization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create inventory data
    const inventoryData = {
      organization_id: userOrg.organization_id,
      name: body.name,
      sku: body.sku,
      category: body.category,
      brand: body.brand || "",
      model: body.model || "",
      year: body.year || null,
      condition: body.condition || "new",
      status: body.status || "available",
      price_cost: body.price_cost || 0,
      price_msrp: body.price_msrp || 0,
      price_selling: body.price_selling,
      price_currency: body.price_currency || "USD",
      stock_on_hand: body.stock_on_hand || 0,
      stock_reserved: body.stock_reserved || 0,
      stock_available: body.stock_available || body.stock_on_hand || 0,
      stock_reorder_level: body.stock_reorder_level || 0,
      stock_reorder_qty: body.stock_reorder_qty || 0,
      loc_lot: body.loc_lot || "",
      loc_section: body.loc_section || "",
      loc_row: body.loc_row || "",
      loc_spot: body.loc_spot || "",
      loc_warehouse: body.loc_warehouse || "",
      description: body.description || "",
      specifications: body.specifications || {},
      features: body.features || [],
      images: body.images || [],
      vendor_info: body.vendor_info || {},
      warranty_info: body.warranty_info || {},
      compliance_info: body.compliance_info || {},
      custom_fields: body.custom_fields || {},
    };

    const {
      data: inventory,
      error,
    } = await supabaseAdmin
      .from("inventory")
      .insert(inventoryData)
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create inventory item" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: userOrg.organization_id,
      entity: "inventory",
      entity_id: inventory.id,
      action: "create",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true, data: inventory }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Inventory creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
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

    // Get authenticated user and organization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
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
      .eq("organization_id", userOrg.organization_id)
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
      organization_id: userOrg.organization_id,
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

    // Get authenticated user and organization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete inventory item
    const { error } = await supabaseAdmin
      .from("inventory")
      .delete()
      .eq("id", id)
      .eq("organization_id", userOrg.organization_id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete inventory item" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: userOrg.organization_id,
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
