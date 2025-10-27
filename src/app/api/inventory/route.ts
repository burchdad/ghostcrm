import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ClientConfigManager, FieldMapper } from "@/lib/client-config";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Dynamic database adapter interface
interface DatabaseAdapter {
  findMany(params: any): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  count(where?: any): Promise<number>;
  aggregate(params: any): Promise<any>;
}

// Supabase adapter (default)
class SupabaseAdapter implements DatabaseAdapter {
  private supabase: any;
  
  constructor(client: any) {
    this.supabase = client;
  }

  async findMany(params: any) {
    let query = this.supabase.from('inventory').select('*');
    
    if (params.where) {
      Object.entries(params.where).forEach(([key, value]: [string, any]) => {
        if (value?.contains) {
          query = query.ilike(key, `%${value.contains}%`);
        } else if (value?.equals) {
          query = query.eq(key, value.equals);
        } else {
          query = query.eq(key, value);
        }
      });
    }
    
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%,brand.ilike.%${params.search}%`);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(data: any) {
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
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        config.connection_config.url,
        config.connection_config.key
      );
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