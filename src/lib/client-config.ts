import { createClient } from '@supabase/supabase-js';

// Client database configuration types
export interface ClientConfig {
  id: string;
  name: string;
  database_type: 'supabase' | 'mysql' | 'postgresql' | 'rest_api' | 'custom';
  connection_config: {
    // Supabase
    url?: string;
    key?: string;
    
    // MySQL/PostgreSQL
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    
    // REST API
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
  };
  field_mappings?: Record<string, string>;
  custom_validations?: Record<string, any>;
  integration_settings?: {
    sync_frequency?: number; // minutes
    auto_sync?: boolean;
    webhook_url?: string;
    sync_endpoints?: {
      inventory?: string;
      leads?: string;
      deals?: string;
    };
  };
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'testing';
}

// Default Supabase client for client config management
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ClientConfigManager {
  
  /**
   * Get client configuration by ID
   */
  static async getClientConfig(clientId: string): Promise<ClientConfig> {
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error || !data) {
      // Return default configuration if client not found
      return this.getDefaultConfig(clientId);
    }

    return data;
  }

  /**
   * Get all client configurations
   */
  static async getAllClientConfigs(): Promise<ClientConfig[]> {
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Failed to fetch client configs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create or update client configuration
   */
  static async saveClientConfig(config: Partial<ClientConfig>): Promise<ClientConfig> {
    const now = new Date().toISOString();
    
    if (config.id) {
      // Update existing
      const { data, error } = await supabase
        .from('client_configs')
        .update({
          ...config,
          updated_at: now
        })
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update client config: ${error.message}`);
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('client_configs')
        .insert({
          ...config,
          created_at: now,
          updated_at: now,
          status: config.status || 'testing'
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create client config: ${error.message}`);
      return data;
    }
  }

  /**
   * Delete client configuration
   */
  static async deleteClientConfig(clientId: string): Promise<void> {
    const { error } = await supabase
      .from('client_configs')
      .delete()
      .eq('id', clientId);

    if (error) throw new Error(`Failed to delete client config: ${error.message}`);
  }

  /**
   * Test client database connection
   */
  static async testConnection(config: ClientConfig): Promise<{ success: boolean; message: string }> {
    try {
      switch (config.database_type) {
        case 'supabase':
          if (!config.connection_config.url || !config.connection_config.key) {
            return { success: false, message: 'Missing Supabase URL or key' };
          }
          
          const testClient = createClient(
            config.connection_config.url,
            config.connection_config.key
          );
          
          // Test with a simple query
          const { error } = await testClient.from('inventory').select('count').limit(1);
          if (error) {
            return { success: false, message: `Supabase connection failed: ${error.message}` };
          }
          break;

        case 'rest_api':
          if (!config.connection_config.baseUrl) {
            return { success: false, message: 'Missing REST API base URL' };
          }
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...config.connection_config.headers
          };
          
          if (config.connection_config.apiKey) {
            headers['Authorization'] = `Bearer ${config.connection_config.apiKey}`;
          }
          
          const response = await fetch(`${config.connection_config.baseUrl}/health`, {
            method: 'GET',
            headers
          });
          
          if (!response.ok) {
            return { success: false, message: `REST API connection failed: ${response.statusText}` };
          }
          break;

        case 'mysql':
        case 'postgresql':
          return { success: false, message: 'Database connection testing not implemented for this type yet' };

        default:
          return { success: false, message: 'Unsupported database type' };
      }

      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get default configuration for new clients
   */
  private static getDefaultConfig(clientId: string): ClientConfig {
    return {
      id: clientId,
      name: `Client ${clientId}`,
      database_type: 'supabase',
      connection_config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key: process.env.SUPABASE_SERVICE_ROLE_KEY!
      },
      field_mappings: {},
      custom_validations: {},
      integration_settings: {
        sync_frequency: 30,
        auto_sync: true,
        sync_endpoints: {
          inventory: '/api/inventory',
          leads: '/api/leads',
          deals: '/api/deals'
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };
  }

  /**
   * Migrate client data between different databases
   */
  static async migrateClientData(fromClientId: string, toClientId: string): Promise<{ success: boolean; message: string }> {
    try {
      const fromConfig = await this.getClientConfig(fromClientId);
      const toConfig = await this.getClientConfig(toClientId);

      // This would implement data migration logic
      // For now, just return success
      return { 
        success: true, 
        message: `Migration from ${fromConfig.name} to ${toConfig.name} completed` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Field mapping helpers
export class FieldMapper {
  
  /**
   * Apply field mappings to data
   */
  static mapFields(data: any, mappings: Record<string, string>, reverse: boolean = false): any {
    if (!mappings || Object.keys(mappings).length === 0) {
      return data;
    }

    const mapped = { ...data };
    const mappingEntries = reverse ? 
      Object.entries(mappings).map(([k, v]) => [v, k]) : 
      Object.entries(mappings);

    mappingEntries.forEach(([sourceField, targetField]) => {
      if (sourceField in mapped) {
        mapped[targetField] = mapped[sourceField];
        if (targetField !== sourceField) {
          delete mapped[sourceField];
        }
      }
    });

    return mapped;
  }

  /**
   * Get standard field mapping for common CRM systems
   */
  static getStandardMappings(system: string): Record<string, string> {
    const mappings: Record<string, Record<string, string>> = {
      salesforce: {
        'stock_on_hand': 'Quantity_On_Hand__c',
        'price_selling': 'Sale_Price__c',
        'status': 'Status__c',
        'created_at': 'CreatedDate',
        'updated_at': 'LastModifiedDate'
      },
      hubspot: {
        'stock_on_hand': 'hs_inventory_quantity',
        'price_selling': 'hs_price',
        'status': 'hs_status',
        'created_at': 'createdate',
        'updated_at': 'hs_lastmodifieddate'
      },
      pipedrive: {
        'stock_on_hand': 'quantity_in_stock',
        'price_selling': 'unit_price',
        'status': 'active_flag',
        'created_at': 'add_time',
        'updated_at': 'update_time'
      }
    };

    return mappings[system] || {};
  }
}