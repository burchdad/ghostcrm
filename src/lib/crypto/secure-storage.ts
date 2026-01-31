import { credentialManager } from './secure-credentials';

interface StoredConnection {
  id: string;
  integrationId: string;
  userId: string;
  name: string;
  category: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  isConnected: boolean;
  isEnabled: boolean;
  connectedAt: string;
  lastUsed?: string;
  encryptedCredentials: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ConnectionQuery {
  userId?: string;
  integrationId?: string;
  category?: string;
  status?: string;
  isConnected?: boolean;
  limit?: number;
  offset?: number;
}

class SecureConnectionStorage {
  private connections: Map<string, StoredConnection> = new Map();
  private userConnections: Map<string, Set<string>> = new Map();

  /**
   * Store a new encrypted connection
   */
  public async storeConnection(
    connectionData: Omit<StoredConnection, 'id' | 'encryptedCredentials' | 'createdAt' | 'updatedAt'> & {
      credentials: Record<string, any>;
    }
  ): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
      // Generate unique connection ID
      const connectionId = this.generateConnectionId(connectionData.integrationId, connectionData.userId);
      
      // Encrypt sensitive credentials
      const encryptedCredentials = credentialManager.encryptCredentialObject(connectionData.credentials);
      
      // Create stored connection object
      const storedConnection: StoredConnection = {
        id: connectionId,
        integrationId: connectionData.integrationId,
        userId: connectionData.userId,
        name: connectionData.name,
        category: connectionData.category,
        type: connectionData.type,
        status: connectionData.status,
        isConnected: connectionData.isConnected,
        isEnabled: connectionData.isEnabled,
        connectedAt: connectionData.connectedAt,
        lastUsed: connectionData.lastUsed,
        encryptedCredentials,
        metadata: connectionData.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store connection
      this.connections.set(connectionId, storedConnection);

      // Update user index
      if (!this.userConnections.has(connectionData.userId)) {
        this.userConnections.set(connectionData.userId, new Set());
      }
      this.userConnections.get(connectionData.userId)!.add(connectionId);

      // In production, persist to database here
      await this.persistToDatabase(storedConnection);

      return { success: true, connectionId };
    } catch (error) {
      console.error('Failed to store connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown storage error' 
      };
    }
  }

  /**
   * Retrieve and decrypt a connection
   */
  public async getConnection(connectionId: string, userId: string): Promise<{
    success: boolean;
    connection?: StoredConnection & { decryptedCredentials?: Record<string, any> };
    error?: string;
  }> {
    try {
      const connection = this.connections.get(connectionId);
      
      if (!connection) {
        return { success: false, error: 'Connection not found' };
      }

      // Verify user owns this connection
      if (connection.userId !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Decrypt credentials for use
      const decryptedCredentials = credentialManager.decryptCredentialObject(connection.encryptedCredentials);

      // Update last used timestamp
      connection.lastUsed = new Date().toISOString();
      connection.updatedAt = new Date().toISOString();

      return {
        success: true,
        connection: {
          ...connection,
          decryptedCredentials
        }
      };
    } catch (error) {
      console.error('Failed to retrieve connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve connection' 
      };
    }
  }

  /**
   * Query connections with filters
   */
  public async queryConnections(query: ConnectionQuery): Promise<{
    success: boolean;
    connections?: Array<Omit<StoredConnection, 'encryptedCredentials'>>;
    total?: number;
    error?: string;
  }> {
    try {
      let filteredConnections = Array.from(this.connections.values());

      // Apply filters
      if (query.userId) {
        filteredConnections = filteredConnections.filter(conn => conn.userId === query.userId);
      }
      if (query.integrationId) {
        filteredConnections = filteredConnections.filter(conn => conn.integrationId === query.integrationId);
      }
      if (query.category) {
        filteredConnections = filteredConnections.filter(conn => conn.category === query.category);
      }
      if (query.status) {
        filteredConnections = filteredConnections.filter(conn => conn.status === query.status);
      }
      if (query.isConnected !== undefined) {
        filteredConnections = filteredConnections.filter(conn => conn.isConnected === query.isConnected);
      }

      // Apply pagination
      const total = filteredConnections.length;
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      
      const paginatedConnections = filteredConnections
        .slice(offset, offset + limit)
        .map(conn => {
          // Remove encrypted credentials from response
          const { encryptedCredentials, ...safeConnection } = conn;
          return {
            ...safeConnection,
            // Add masked credentials for display
            maskedCredentials: this.maskCredentials(encryptedCredentials)
          };
        });

      return {
        success: true,
        connections: paginatedConnections,
        total
      };
    } catch (error) {
      console.error('Failed to query connections:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Query failed' 
      };
    }
  }

  /**
   * Update connection status or metadata
   */
  public async updateConnection(
    connectionId: string, 
    userId: string, 
    updates: Partial<Pick<StoredConnection, 'status' | 'isEnabled' | 'isConnected' | 'metadata'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const connection = this.connections.get(connectionId);
      
      if (!connection) {
        return { success: false, error: 'Connection not found' };
      }

      if (connection.userId !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Apply updates
      Object.assign(connection, updates, { updatedAt: new Date().toISOString() });

      // In production, persist changes to database
      await this.persistToDatabase(connection);

      return { success: true };
    } catch (error) {
      console.error('Failed to update connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      };
    }
  }

  /**
   * Delete a connection
   */
  public async deleteConnection(connectionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const connection = this.connections.get(connectionId);
      
      if (!connection) {
        return { success: false, error: 'Connection not found' };
      }

      if (connection.userId !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Remove from storage
      this.connections.delete(connectionId);

      // Update user index
      const userConnections = this.userConnections.get(userId);
      if (userConnections) {
        userConnections.delete(connectionId);
      }

      // In production, delete from database
      await this.deleteFromDatabase(connectionId);

      return { success: true };
    } catch (error) {
      console.error('Failed to delete connection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  /**
   * Test connection credentials by decrypting and returning them for API calls
   */
  public async getCredentialsForUse(connectionId: string, userId: string): Promise<{
    success: boolean;
    credentials?: Record<string, any>;
    error?: string;
  }> {
    try {
      const result = await this.getConnection(connectionId, userId);
      
      if (!result.success || !result.connection) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        credentials: result.connection.decryptedCredentials
      };
    } catch (error) {
      console.error('Failed to get credentials for use:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve credentials' 
      };
    }
  }

  /**
   * Get connection statistics for a user
   */
  public async getConnectionStats(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const userConnectionIds = this.userConnections.get(userId) || new Set();
    const userConnections = Array.from(userConnectionIds)
      .map(id => this.connections.get(id))
      .filter(Boolean) as StoredConnection[];

    const stats = {
      total: userConnections.length,
      active: userConnections.filter(conn => conn.status === 'active' && conn.isConnected).length,
      inactive: userConnections.filter(conn => !conn.isConnected || conn.status !== 'active').length,
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    // Count by category and type
    userConnections.forEach(conn => {
      stats.byCategory[conn.category] = (stats.byCategory[conn.category] || 0) + 1;
      stats.byType[conn.type] = (stats.byType[conn.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(integrationId: string, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `conn_${integrationId}_${userId}_${timestamp}_${random}`;
  }

  /**
   * Create masked version of credentials for safe display
   */
  private maskCredentials(encryptedCredentials: Record<string, any>): Record<string, any> {
    const masked: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(encryptedCredentials)) {
      if (typeof value === 'object' && value !== null && value.encrypted) {
        // This is an encrypted credential
        masked[key] = { status: 'encrypted', length: value.encrypted.length };
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }

  /**
   * Persist connection to database (placeholder for production implementation)
   */
  private async persistToDatabase(connection: StoredConnection): Promise<void> {
    // In production, this would save to your database (Supabase, PostgreSQL, etc.)
    console.log(`Persisting connection ${connection.id} to database`);
    
    // Example for Supabase:
    // await supabase.from('encrypted_connections').upsert({
    //   id: connection.id,
    //   user_id: connection.userId,
    //   integration_id: connection.integrationId,
    //   encrypted_data: JSON.stringify(connection.encryptedCredentials),
    //   metadata: connection.metadata,
    //   status: connection.status,
    //   is_connected: connection.isConnected,
    //   connected_at: connection.connectedAt,
    //   updated_at: connection.updatedAt
    // });
  }

  /**
   * Delete connection from database (placeholder for production implementation)
   */
  private async deleteFromDatabase(connectionId: string): Promise<void> {
    // In production, this would delete from your database
    console.log(`Deleting connection ${connectionId} from database`);
    
    // Example for Supabase:
    // await supabase.from('encrypted_connections').delete().eq('id', connectionId);
  }
}

// Export singleton instance
export const connectionStorage = new SecureConnectionStorage();

// Export types
export type { StoredConnection, ConnectionQuery };