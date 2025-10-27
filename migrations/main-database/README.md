# Main Database Migrations

This directory contains SQL migration files for the central GhostCRM admin database.

## Structure

```
main-database/
├── 001_create_users.sql              # User authentication system
├── 002_auth_security.sql             # Security enhancements  
├── 003_users_min_columns.sql         # User table optimizations
├── 004_billing_system.sql            # Billing and subscriptions
├── 004_integration_preferences.sql   # Integration settings
├── 005_user_invitations.sql          # User invitation system
├── supabase_collab_schema.sql        # Collaboration features (PostgreSQL)
├── supabase_collab_schema_postgres.sql  # Collaboration features (duplicate)
├── supabase_multi_tenant_schema.sql  # Multi-tenant configuration
└── README.md                         # This file
```

## Database Types

### SQL Server Migrations (001-005)
These migrations are for the main admin database running on SQL Server:
- User authentication and authorization
- Billing and subscription management
- System-wide configuration
- Integration preferences

### PostgreSQL/Supabase Schemas (supabase_*)
These are legacy schema files that have been:
- **supabase_collab_schema.sql**: Moved to client provisioning as `002_collaboration_features.sql`
- **supabase_multi_tenant_schema.sql**: Integrated into client provisioning as `003_inventory_management.sql`
- **supabase_collab_schema_postgres.sql**: Duplicate file, can be removed

## Migration Order

### SQL Server (Main Database)
1. `001_create_users.sql` - Base user system
2. `002_auth_security.sql` - Security features
3. `003_users_min_columns.sql` - Schema optimization
4. `004_billing_system.sql` - Billing system
5. `004_integration_preferences.sql` - Integration settings (note: same number as billing)
6. `005_user_invitations.sql` - Invitation system

### PostgreSQL (Client Databases)
These are automatically applied during client provisioning:
1. `001_client_schema_template.sql` - Complete CRM schema with collaboration and inventory
2. `002_collaboration_features.sql` - Extended collaboration features
3. `003_inventory_management.sql` - Advanced inventory management

## Usage

### Manual SQL Server Migrations
```bash
# Connect to SQL Server and run migrations in order
sqlcmd -S server -d ghostcrm_main -i 001_create_users.sql
sqlcmd -S server -d ghostcrm_main -i 002_auth_security.sql
# ... continue with remaining files
```

### Automated Client Database Setup
Client databases are automatically provisioned with all features included.

## Notes

- **Duplicate Numbering**: `004_billing_system.sql` and `004_integration_preferences.sql` both use number 004. Consider renaming one to 006.
- **Legacy Files**: The supabase_* files are legacy and have been integrated into the new client provisioning system.
- **Environment Separation**: Main database handles admin/billing, client databases handle CRM operations.

## Cleanup Recommendations

1. Remove duplicate `supabase_collab_schema_postgres.sql`
2. Rename `004_integration_preferences.sql` to `006_integration_preferences.sql`
3. Archive legacy supabase schema files after confirming integration
4. Consider creating a unified migration runner script