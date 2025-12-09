import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

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
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "25");
  const offset = (page - 1) * limit;

  try {
    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Build query for inventory
    let query = supabaseAdmin
      .from('inventory')
      .select('*', { count: 'exact' })
      .eq('organization_id', userOrg.organization_id);

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
      );
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    // Apply pagination and ordering
    const { data: inventory, count, error } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error fetching inventory:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    // Transform data to match frontend expectations and add calculated fields
    const transformedInventory = (inventory || []).map(item => ({
      ...item,
      // Add calculated profit margin
      profit_margin: item.price_selling && item.price_cost 
        ? ((item.price_selling - item.price_cost) / item.price_selling * 100).toFixed(2)
        : 0,
      // Add total value (selling price * available stock)
      total_value: item.price_selling * (item.stock_available || 0),
      // Add location display
      location_display: [item.loc_lot, item.loc_section, item.loc_row, item.loc_spot]
        .filter(Boolean)
        .join('-') || item.loc_warehouse || 'Unassigned',
      // Add availability status
      availability_status: item.stock_available > 0 ? 'In Stock' : 
                          item.stock_reserved > 0 ? 'Reserved' : 'Out of Stock'
    }));

    // Calculate summary metrics
    const summary = {
      total_items: count || 0,
      total_value: transformedInventory.reduce((sum, item) => sum + (item.total_value || 0), 0),
      in_stock: transformedInventory.filter(item => item.stock_available > 0).length,
      low_stock: transformedInventory.filter(item => 
        item.stock_available > 0 && item.stock_available <= (item.stock_reorder_level || 5)
      ).length,
      out_of_stock: transformedInventory.filter(item => item.stock_available === 0).length
    };

    return new Response(JSON.stringify({
      success: true,
      data: transformedInventory,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Inventory API error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Create inventory data
    const inventoryData = {
      organization_id: userOrg.organization_id,
      name: body.name,
      sku: body.sku,
      category: body.category,
      brand: body.brand || '',
      model: body.model || '',
      year: body.year || null,
      condition: body.condition || 'new',
      status: body.status || 'available',
      price_cost: body.price_cost || 0,
      price_msrp: body.price_msrp || 0,
      price_selling: body.price_selling,
      price_currency: body.price_currency || 'USD',
      stock_on_hand: body.stock_on_hand || 0,
      stock_reserved: body.stock_reserved || 0,
      stock_available: body.stock_available || body.stock_on_hand || 0,
      stock_reorder_level: body.stock_reorder_level || 0,
      stock_reorder_qty: body.stock_reorder_qty || 0,
      loc_lot: body.loc_lot || '',
      loc_section: body.loc_section || '',
      loc_row: body.loc_row || '',
      loc_spot: body.loc_spot || '',
      loc_warehouse: body.loc_warehouse || '',
      description: body.description || '',
      specifications: body.specifications || {},
      features: body.features || [],
      images: body.images || [],
      vendor_info: body.vendor_info || {},
      warranty_info: body.warranty_info || {},
      compliance_info: body.compliance_info || {},
      custom_fields: body.custom_fields || {}
    };

    const { data: inventory, error } = await supabaseAdmin
      .from('inventory')
      .insert(inventoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      return new Response(JSON.stringify({ error: 'Failed to create inventory item' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "inventory", 
      entity_id: inventory.id, 
      action: "create",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: inventory }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Inventory creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Inventory ID required' }), { status: 400 });
    }

    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Update inventory item
    const { data: inventory, error } = await supabaseAdmin
      .from('inventory')
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
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return new Response(JSON.stringify({ error: 'Failed to update inventory item' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "inventory", 
      entity_id: id, 
      action: "update",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: inventory }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Inventory update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Inventory ID required' }), { status: 400 });
    }

    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Delete inventory item
    const { error } = await supabaseAdmin
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete inventory item' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "inventory", 
      entity_id: id, 
      action: "delete",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Inventory deletion error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
    const { data: result, error } = await this.supabase
      .from('inventory')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  async update(id: string, data: any) {
    const { data: result, error } = await this.supabase
      .from('inventory')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async count(where?: any) {
    let query = this.supabase.from('inventory').select('*', { count: 'exact', head: true });
    if (where) {
      Object.entries(where).forEach(([key, value]: [string, any]) => {
        query = query.eq(key, value);
      });
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async aggregate(params: any) {
    // For Supabase, we'll calculate aggregates in memory for now
    const items = await this.findMany({});
    return {
      _sum: {
        totalValue: items.reduce((sum, item) => sum + (item.price_selling * item.stock_on_hand), 0)
      }
    };
  }
}

// REST API adapter for client integrations
class RestApiAdapter implements DatabaseAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: { baseUrl: string; apiKey?: string; headers?: Record<string, string> }) {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      ...config.headers
    };
  }

  async findMany(params: any) {
    const url = new URL(`${this.baseUrl}/inventory`);
    if (params.where) {
      Object.entries(params.where).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    
    const response = await fetch(url.toString(), { headers: this.headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const result = await response.json();
    return result.data || result;
  }

  async create(data: any) {
    const response = await fetch(`${this.baseUrl}/inventory`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async update(id: string, data: any) {
    const response = await fetch(`${this.baseUrl}/inventory/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.baseUrl}/inventory/${id}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  }

  async count(where?: any) {
    const items = await this.findMany({ where });
    return items.length;
  }

  async aggregate(params: any) {
    const items = await this.findMany({});
    return {
      _sum: {
        totalValue: items.reduce((sum, item) => sum + (item.price_selling * item.stock_on_hand), 0)
      }
    };
  }
}

// Validation schemas with client customization support
const BaseInventorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  condition: z.enum(["new", "used", "certified", "damaged"]),
  status: z.enum(["available", "reserved", "sold", "pending", "maintenance"]),
  price_cost: z.number().nonnegative().optional(),
  price_msrp: z.number().nonnegative().optional(),
  price_selling: z.number().nonnegative(),
  price_currency: z.string().default("USD"),
  stock_on_hand: z.number().int().nonnegative().default(0),
  stock_reserved: z.number().int().nonnegative().default(0),
  stock_available: z.number().int().nonnegative().default(0),
  stock_reorder_level: z.number().int().nonnegative().default(0),
  stock_reorder_qty: z.number().int().nonnegative().default(0),
  // Dynamic fields that clients can customize
  custom_fields: z.record(z.any()).optional().default({}),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Client configuration for database integration
interface ClientConfig {
  id: string;
  database_type: 'supabase' | 'mysql' | 'postgresql' | 'rest_api' | 'custom';
  connection_config: any;
  field_mappings?: Record<string, string>; // Map standard fields to client fields
  custom_validations?: any; // Additional validation rules
}

// Database adapter factory
function createDatabaseAdapter(config: any): DatabaseAdapter {
  switch (config.database_type) {
    case 'supabase':
      const { createSafeSupabaseClient } = require('@/lib/supabase-safe');
      const supabase = createSafeSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      return new SupabaseAdapter(supabase);
      
    case 'rest_api':
      return new RestApiAdapter(config.connection_config);
      
    case 'mysql':
    case 'postgresql':
      // TODO: Implement Prisma adapters for different databases
      throw new Error(`${config.database_type} adapter not implemented yet`);
      
    default:
      throw new Error(`Unsupported database type: ${config.database_type}`);
  }
}

// Get client configuration (this would come from your client management system)
async function getClientConfig(clientId: string) {
  try {
    return await ClientConfigManager.getClientConfig(clientId);
  } catch (error) {
    console.error('Failed to get client config:', error);
    // Return default configuration as fallback
    return {
      id: clientId,
      name: `Client ${clientId}`,
      database_type: 'supabase' as const,
      connection_config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // SECURITY: Never expose service role key in API responses
        key: '[PROTECTED]'
      },
      field_mappings: {},
      custom_validations: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active' as const
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id') || 'default';
    
    // Get client-specific configuration
    const clientConfig = await getClientConfig(clientId);
    const adapter = createDatabaseAdapter(clientConfig);
    
    // Build query parameters
    const queryParams: any = { where: {} };
    
    if (searchParams.get('category')) {
      queryParams.where.category = { contains: searchParams.get('category') };
    }
    if (searchParams.get('status')) {
      queryParams.where.status = { equals: searchParams.get('status') };
    }
    if (searchParams.get('condition')) {
      queryParams.where.condition = { equals: searchParams.get('condition') };
    }
    if (searchParams.get('brand')) {
      queryParams.where.brand = { contains: searchParams.get('brand') };
    }
    if (searchParams.get('search')) {
      queryParams.search = searchParams.get('search');
    }

    // Execute queries in parallel
    const [items, total, available, reserved, sold, valueAgg] = await Promise.all([
      adapter.findMany(queryParams),
      adapter.count(queryParams.where),
      adapter.count({ ...queryParams.where, status: 'available' }),
      adapter.count({ ...queryParams.where, status: 'reserved' }),
      adapter.count({ ...queryParams.where, status: 'sold' }),
      adapter.aggregate({})
    ]);

    const stats = {
      total,
      available,
      reserved,
      sold,
      totalValue: valueAgg._sum?.totalValue || 0
    };

    return NextResponse.json({
      success: true,
      data: { items, stats, client_config: clientConfig.database_type }
    });
  } catch (error) {
    console.error('GET /inventory error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch inventory' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, item, client_id = 'default' } = body;

    if (!action || !item) {
      return NextResponse.json({ success: false, error: 'Action and item are required' }, { status: 400 });
    }

    // Get client-specific configuration and adapter
    const clientConfig = await getClientConfig(client_id);
    const adapter = createDatabaseAdapter(clientConfig);
    
    // Validate input against schema (with potential client customizations)
    let validationSchema = BaseInventorySchema;
    if (clientConfig.custom_validations) {
      // Merge with client-specific validations
      validationSchema = BaseInventorySchema.merge(z.object(clientConfig.custom_validations));
    }

    switch (action) {
      case 'create': {
        const validatedItem = validationSchema.omit({ id: true }).parse(item);
        
        // Apply field mappings if needed
        const mappedData = clientConfig.field_mappings ? 
          FieldMapper.mapFields(validatedItem, clientConfig.field_mappings) : 
          validatedItem;
        
        const result = await adapter.create({
          ...mappedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        return NextResponse.json({ 
          success: true, 
          data: { item: result, message: 'Inventory item created' } 
        });
      }

      case 'update': {
        if (!item.id) {
          return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
        }

        const validatedItem = validationSchema.parse(item);
        const mappedData = clientConfig.field_mappings ? 
          FieldMapper.mapFields(validatedItem, clientConfig.field_mappings) : 
          validatedItem;

        const result = await adapter.update(item.id, {
          ...mappedData,
          updated_at: new Date().toISOString()
        });

        return NextResponse.json({ 
          success: true, 
          data: { item: result, message: 'Inventory item updated' } 
        });
      }

      case 'delete': {
        if (!item.id) {
          return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
        }

        await adapter.delete(item.id);
        return NextResponse.json({ 
          success: true, 
          data: { id: item.id, message: 'Inventory item deleted' } 
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /inventory error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      }, { status: 422 });
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}