// =============================================================================
// DATABASE CONNECTION POOL CONFIGURATION
// Implements connection pooling for 10x scalability improvement
// =============================================================================

import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// POSTGRESQL CONNECTION POOL
// =============================================================================

interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  // Connection pool settings
  max: number;          // Maximum connections in pool
  min: number;          // Minimum connections to maintain
  idleTimeoutMillis: number;  // Close idle connections after this time
  connectionTimeoutMillis: number; // Time to wait for connection
  acquireTimeoutMillis: number;    // Time to wait for available connection
  // Performance settings
  statement_timeout: number;
  query_timeout: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
}

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ghostcrm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // Production optimized pool settings
  max: isProduction ? 20 : 5,          // Max 20 connections in production
  min: isProduction ? 5 : 2,           // Keep 5 connections warm in production
  idleTimeoutMillis: 30000,            // 30 seconds
  connectionTimeoutMillis: 10000,      // 10 seconds
  acquireTimeoutMillis: 60000,         // 60 seconds
  
  // Query performance settings
  statement_timeout: 30000,            // 30 second query timeout
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Pool event monitoring
pool.on('connect', (client) => {
  console.log('📊 Database connection established');
  // Set timezone for all connections
  client.query('SET timezone = "UTC"');
});

pool.on('acquire', (client) => {
  console.log('🔗 Database connection acquired from pool');
});

pool.on('remove', (client) => {
  console.log('❌ Database connection removed from pool');
});

pool.on('error', (err, client) => {
  console.error('💥 Database pool error:', err);
});

// =============================================================================
// QUERY OPTIMIZATION UTILITIES
// =============================================================================

export class DatabaseManager {
  private static instance: DatabaseManager;
  private queryCache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Optimized query execution with connection pooling
  async query(text: string, params?: any[], options: QueryOptions = {}): Promise<any> {
    const start = Date.now();
    const cacheKey = this.generateCacheKey(text, params);
    
    // Check cache for read-only queries
    if (options.cache && !this.isWriteQuery(text)) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log(`⚡ Cache hit for query (${Date.now() - start}ms)`);
        return cached.result;
      }
    }

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        
        // Cache read queries
        if (options.cache && !this.isWriteQuery(text)) {
          this.queryCache.set(cacheKey, {
            result: result.rows,
            timestamp: Date.now()
          });
        }
        
        const duration = Date.now() - start;
        console.log(`🔍 Query executed in ${duration}ms`);
        
        if (duration > 1000) {
          console.warn(`⚠️ Slow query detected (${duration}ms):`, text.substring(0, 100));
        }
        
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('💥 Database query error:', error);
      throw error;
    }
  }

  // Batch query execution for better performance
  async batchQuery(queries: BatchQuery[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result.rows);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Optimized pagination with cursor-based approach
  async paginatedQuery(
    baseQuery: string,
    params: any[],
    options: PaginationOptions
  ): Promise<PaginatedResult> {
    const { limit = 20, cursor, sortField = 'id', sortDirection = 'DESC' } = options;
    
    let query = baseQuery;
    let queryParams = [...params];
    
    if (cursor) {
      const operator = sortDirection === 'DESC' ? '<' : '>';
      query += ` AND ${sortField} ${operator} $${queryParams.length + 1}`;
      queryParams.push(cursor);
    }
    
    query += ` ORDER BY ${sortField} ${sortDirection} LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit + 1); // Get one extra to check if there's a next page
    
    const results = await this.query(query, queryParams);
    const hasNextPage = results.length > limit;
    const items = hasNextPage ? results.slice(0, -1) : results;
    
    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage ? items[items.length - 1][sortField] : null,
      totalCount: await this.getCount(baseQuery, params)
    };
  }

  // Get connection pool statistics
  async getPoolStats(): Promise<PoolStats> {
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
      maxConnections: poolConfig.max,
      usage: ((pool.totalCount - pool.idleCount) / poolConfig.max) * 100
    };
  }

  // Clear query cache
  clearCache(): void {
    this.queryCache.clear();
  }

  private generateCacheKey(text: string, params?: any[]): string {
    return `${text}:${JSON.stringify(params || [])}`;
  }

  private isWriteQuery(text: string): boolean {
    const writeOperations = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    return writeOperations.some(op => text.toUpperCase().includes(op));
  }

  private async getCount(baseQuery: string, params: any[]): Promise<number> {
    const countQuery = baseQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
    const result = await this.query(countQuery, params);
    return parseInt(result[0].count);
  }
}

// =============================================================================
// TENANT-AWARE QUERY BUILDER
// =============================================================================

export class TenantQueryBuilder {
  private tenantId: string;
  private db: DatabaseManager;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.db = DatabaseManager.getInstance();
  }

  // Get leads with optimized indexes
  async getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    let query = `
      SELECT l.*, o.name as organization_name
      FROM leads l
      LEFT JOIN organizations o ON l.organization_id = o.id
      WHERE l.tenant_id = $1
    `;
    let params = [this.tenantId];
    let paramIndex = 2;

    // Use indexed filters
    if (filters.status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.createdAfter) {
      query += ` AND l.created_at >= $${paramIndex}`;
      params.push(filters.createdAfter.toISOString());
      paramIndex++;
    }

    if (filters.email) {
      query += ` AND l.email = $${paramIndex}`;
      params.push(filters.email);
      paramIndex++;
    }

    query += ` ORDER BY l.created_at DESC`;

    return this.db.query(query, params, { cache: true });
  }

  // Get deals with pipeline optimization
  async getDeals(filters: DealFilters = {}): Promise<Deal[]> {
    let query = `
      SELECT d.*, l.first_name, l.last_name, l.email
      FROM deals d
      LEFT JOIN leads l ON d.lead_id = l.id
      WHERE d.tenant_id = $1
    `;
    let params = [this.tenantId];
    let paramIndex = 2;

    if (filters.stage) {
      query += ` AND d.stage = $${paramIndex}`;
      params.push(filters.stage);
      paramIndex++;
    }

    if (filters.minAmount) {
      query += ` AND d.amount >= $${paramIndex}`;
      params.push(filters.minAmount.toString());
      paramIndex++;
    }

    query += ` ORDER BY d.amount DESC, d.created_at DESC`;

    return this.db.query(query, params, { cache: true });
  }

  // Get dashboard metrics using optimized views
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const metricsQuery = `
      SELECT * FROM dashboard_metrics WHERE tenant_id = $1
    `;
    
    const pipelineQuery = `
      SELECT * FROM deal_pipeline WHERE tenant_id = $1 ORDER BY total_amount DESC
    `;

    const activityQuery = `
      SELECT * FROM activity_summary 
      WHERE tenant_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY activity_date DESC
    `;

    const [metrics, pipeline, activities] = await this.db.batchQuery([
      { text: metricsQuery, params: [this.tenantId] },
      { text: pipelineQuery, params: [this.tenantId] },
      { text: activityQuery, params: [this.tenantId] }
    ]);

    return {
      leads: metrics[0] || {},
      pipeline: pipeline,
      activities: activities
    };
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface QueryOptions {
  cache?: boolean;
  timeout?: number;
}

interface BatchQuery {
  text: string;
  params?: any[];
}

interface PaginationOptions {
  limit?: number;
  cursor?: any;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

interface PaginatedResult {
  items: any[];
  hasNextPage: boolean;
  nextCursor: any;
  totalCount: number;
}

interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
  usage: number;
}

interface Lead {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
}

interface Deal {
  id: string;
  tenant_id: string;
  lead_id?: string;
  title: string;
  amount: number;
  stage: string;
  close_date?: Date;
  created_at: Date;
  updated_at: Date;
}

interface LeadFilters {
  status?: string;
  createdAfter?: Date;
  email?: string;
}

interface DealFilters {
  stage?: string;
  minAmount?: number;
}

interface DashboardMetrics {
  leads: any;
  pipeline: any[];
  activities: any[];
}

// Export singleton instance
export const db = DatabaseManager.getInstance();