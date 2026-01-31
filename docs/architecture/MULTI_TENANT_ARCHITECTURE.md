# Multi-Tenant Inventory & CRM System Architecture

## Overview

Ghost Auto CRM has been architected as a **sophisticated multi-tenant SaaS platform** that allows clients to integrate their own databases and customize field mappings to match their existing systems. This approach provides maximum flexibility while maintaining code reusability and system performance.

## 🏗️ **System Architecture**

### **1. Database Adapter Pattern**

The system uses a **database adapter pattern** to support multiple database types:

- **Supabase** (Default) - Primary database with full feature support
- **REST API** - For clients with existing API endpoints
- **MySQL/PostgreSQL** - Direct database connections (planned)
- **Custom** - Extensible for unique client requirements

### **2. Field Mapping System**

Clients can map standard CRM fields to their existing schema:

```json
{
  "stock_on_hand": "inventory_count",
  "price_selling": "sale_price",
  "status": "vehicle_status"
}
```

### **3. Validation Layer**

Uses **Zod** for robust input validation with client-specific extensions:

- Base schema for all clients
- Custom validation rules per client
- Type-safe data handling
- Error validation and reporting

## 🔧 **Implementation Details**

### **Client Configuration**

Each client has a configuration record stored in `client_configs` table:

```typescript
interface ClientConfig {
  id: string;
  name: string;
  database_type: 'supabase' | 'mysql' | 'postgresql' | 'rest_api' | 'custom';
  connection_config: {
    // Database-specific connection parameters
  };
  field_mappings?: Record<string, string>;
  custom_validations?: Record<string, any>;
  integration_settings?: {
    sync_frequency?: number;
    auto_sync?: boolean;
    webhook_url?: string;
  };
  status: 'active' | 'inactive' | 'testing';
}
```

### **API Usage**

All API endpoints support client-specific operations:

```typescript
// GET with client context
GET /api/inventory?client_id=demo-client&status=available

// POST with client context
POST /api/inventory
{
  "client_id": "demo-client",
  "action": "create",
  "item": { ... }
}
```

### **Database Adapters**

#### **Supabase Adapter**
```typescript
class SupabaseAdapter implements DatabaseAdapter {
  async findMany(params: any) {
    // Supabase-specific query logic
  }
  // ... other methods
}
```

#### **REST API Adapter**
```typescript
class RestApiAdapter implements DatabaseAdapter {
  async findMany(params: any) {
    // HTTP requests to client's API
  }
  // ... other methods
}
```

## 🎯 **Key Benefits**

### **For Clients:**
- **Bring Your Own Database** - Use existing infrastructure
- **Zero Migration** - No need to migrate existing data
- **Custom Field Support** - Map to existing schema
- **Real-time Sync** - Keep data synchronized
- **Webhook Integration** - Real-time notifications

### **For Development:**
- **Code Reusability** - Same codebase for all clients
- **Type Safety** - Full TypeScript support
- **Scalable** - Add new database types easily
- **Maintainable** - Centralized adapter management
- **Testable** - Mock adapters for testing

## 📊 **Supported Database Types**

| Database Type | Status | Features |
|---------------|--------|----------|
| Supabase | ✅ **Implemented** | Full feature set, real-time, RLS |
| REST API | ✅ **Implemented** | HTTP-based, flexible endpoints |
| MySQL | 🚧 **Planned** | Direct connection, Prisma ORM |
| PostgreSQL | 🚧 **Planned** | Direct connection, advanced queries |
| MongoDB | 🚧 **Planned** | Document-based, flexible schema |
| Custom | 🚧 **Planned** | Client-specific implementations |

## 🔐 **Security & Compliance**

### **Multi-Tenancy Security**
- **Row-Level Security (RLS)** for Supabase
- **Client ID isolation** for all operations
- **Encrypted connection strings** for sensitive data
- **API key management** per client

### **Data Privacy**
- **Client data isolation** - No cross-client data access
- **Configurable retention policies**
- **GDPR compliance** features
- **Audit logging** for all operations

## 🚀 **Onboarding New Clients**

### **1. Database Assessment**
```typescript
// Assess client's existing system
const assessment = {
  database_type: 'mysql',
  schema_analysis: { ... },
  field_mappings: { ... },
  integration_points: [ ... ]
};
```

### **2. Configuration Setup**
```typescript
// Create client configuration
const config = await ClientConfigManager.saveClientConfig({
  name: "ABC Auto Dealership",
  database_type: "mysql",
  connection_config: {
    host: "client.db.server",
    database: "dealership_crm",
    // ... connection details
  },
  field_mappings: {
    "stock_on_hand": "vehicle_inventory_count",
    "price_selling": "current_sale_price"
  }
});
```

### **3. Testing & Validation**
```typescript
// Test connection and validate mappings
const testResult = await ClientConfigManager.testConnection(config);
if (testResult.success) {
  // Activate client configuration
  await ClientConfigManager.saveClientConfig({
    ...config,
    status: 'active'
  });
}
```

## 📈 **Performance Considerations**

### **Caching Strategy**
- **Client config caching** - Reduce database lookups
- **Adapter pooling** - Reuse database connections
- **Query optimization** - Database-specific optimizations

### **Scalability**
- **Horizontal scaling** - Add more database adapters
- **Load balancing** - Distribute client requests
- **Background sync** - Async data synchronization

## 🛠️ **Development Workflow**

### **Adding New Database Type**

1. **Create Adapter**
```typescript
class NewDatabaseAdapter implements DatabaseAdapter {
  // Implement required methods
}
```

2. **Update Factory**
```typescript
function createDatabaseAdapter(config: ClientConfig) {
  switch (config.database_type) {
    case 'new_database':
      return new NewDatabaseAdapter(config.connection_config);
    // ... existing cases
  }
}
```

3. **Add Configuration UI**
- Update client configuration form
- Add connection testing
- Implement field mapping UI

### **Testing Strategy**

```typescript
// Mock adapter for testing
class MockAdapter implements DatabaseAdapter {
  private mockData: any[] = [];
  
  async findMany(params: any) {
    return this.mockData.filter(/* ... */);
  }
  // ... other methods
}
```

## 📝 **Configuration Examples**

### **Supabase Client**
```json
{
  "id": "supabase-client",
  "name": "Premium Auto Dealership",
  "database_type": "supabase",
  "connection_config": {
    "url": "https://client-project.supabase.co",
    "key": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "field_mappings": {},
  "status": "active"
}
```

### **REST API Client**
```json
{
  "id": "api-client",
  "name": "Custom CRM Integration",
  "database_type": "rest_api",
  "connection_config": {
    "baseUrl": "https://client-api.example.com/v2",
    "apiKey": "abc123...",
    "headers": {
      "X-Client-ID": "dealership-123"
    }
  },
  "field_mappings": {
    "stock_on_hand": "qty_available",
    "price_selling": "current_price"
  },
  "integration_settings": {
    "sync_frequency": 15,
    "webhook_url": "https://client.example.com/webhooks/crm"
  },
  "status": "active"
}
```

### **MySQL Client (Planned)**
```json
{
  "id": "mysql-client",
  "name": "Legacy System Integration",
  "database_type": "mysql",
  "connection_config": {
    "host": "mysql.client.com",
    "port": 3306,
    "database": "dealership_db",
    "username": "crm_user",
    "password": "encrypted_password"
  },
  "field_mappings": {
    "sku": "vehicle_id",
    "stock_on_hand": "inventory_count",
    "price_selling": "sale_price"
  },
  "status": "testing"
}
```

## 🔄 **Data Synchronization**

### **Real-time Sync (Supabase)**
- WebSocket connections for live updates
- Row-level security for data isolation
- Automatic conflict resolution

### **Periodic Sync (REST API)**
- Configurable sync intervals
- Webhook notifications for changes
- Retry mechanisms for failed syncs

### **Manual Sync**
- On-demand synchronization
- Bulk data import/export
- Migration tools for data transfer

## 📚 **API Documentation**

### **Core Endpoints**

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/inventory` | GET | List inventory with client context |
| `/api/inventory` | POST | Create/update/delete inventory items |
| `/api/admin/client-config` | GET | Manage client configurations |
| `/api/admin/client-config` | POST | Save/test client configurations |

### **Client Context Parameter**

All endpoints accept a `client_id` parameter to specify the client context:

```typescript
// URL parameter
GET /api/inventory?client_id=demo-client

// Request body
POST /api/inventory
{
  "client_id": "demo-client",
  "action": "create",
  "item": { ... }
}
```

## 🎉 **Success Stories**

This multi-tenant architecture enables:

- **Rapid client onboarding** - New clients can be configured and operational within hours
- **Zero downtime migrations** - Clients can switch databases without service interruption  
- **Custom integrations** - Support for unique client requirements and legacy systems
- **Scalable growth** - Add new database types and clients without architectural changes

## 🔮 **Future Enhancements**

- **GraphQL support** - For clients preferring GraphQL APIs
- **NoSQL databases** - MongoDB, DynamoDB support
- **Real-time analytics** - Cross-client performance insights
- **AI-powered mapping** - Automatic field mapping suggestions
- **Data transformation** - ETL capabilities for complex migrations