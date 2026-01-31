import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { Tenant } from './types';

// Tenant-aware Supabase client factory
export class TenantDatabase {
  private static instance: TenantDatabase;
  private clients: Map<string, any> = new Map();

  static getInstance(): TenantDatabase {
    if (!TenantDatabase.instance) {
      TenantDatabase.instance = new TenantDatabase();
    }
    return TenantDatabase.instance;
  }

  // Get or create a tenant-specific Supabase client
  getClient(tenantId: number, isServerSide = false) {
    const clientKey = `${tenantId}-${isServerSide ? 'server' : 'client'}`;
    
    if (!this.clients.has(clientKey)) {
      let client;
      
      if (isServerSide) {
        // Server-side client with RLS context
        client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
      } else {
        // Client-side client
        client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
      }

      // Set tenant context for RLS
      this.setTenantContext(client, tenantId);
      this.clients.set(clientKey, client);
    }

    return this.clients.get(clientKey);
  }

  // Set tenant context for row-level security
  private async setTenantContext(client: any, tenantId: number) {
    try {
      await client.rpc('set_config', {
        setting_name: 'app.current_tenant_id',
        new_value: tenantId.toString(),
        is_local: true
      });
    } catch (error) {
      console.warn('Failed to set tenant context:', error);
    }
  }

  // Get tenant by subdomain
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Tenant;
  }

  // Get tenant by custom domain
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('domain', domain)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Tenant;
  }

  // Create tenant-aware query builder
  from(tenantId: number, tableName: string, isServerSide = false) {
    const client = this.getClient(tenantId, isServerSide);
    return client.from(tableName);
  }

  // Create tenant-aware RPC call
  async rpc(tenantId: number, functionName: string, params: any = {}, isServerSide = false) {
    const client = this.getClient(tenantId, isServerSide);
    return await client.rpc(functionName, params);
  }

  // Clear client cache (useful for testing)
  clearCache() {
    this.clients.clear();
  }
}

// Singleton instance
export const tenantDb = TenantDatabase.getInstance();

// Convenience functions for common operations
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  return await tenantDb.getTenantBySubdomain(subdomain);
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  return await tenantDb.getTenantByDomain(domain);
}

export function getTenantClient(tenantId: number, isServerSide = false) {
  return tenantDb.getClient(tenantId, isServerSide);
}

export function getTenantQuery(tenantId: number, tableName: string, isServerSide = false) {
  return tenantDb.from(tenantId, tableName, isServerSide);
}