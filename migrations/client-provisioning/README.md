# Client Database Provisioning System

This system provides automated database provisioning for new client registrations in the multi-tenant GhostCRM application.

## Overview

When a new client registers for GhostCRM, the system automatically:
1. Creates a dedicated Supabase database instance
2. Applies the complete CRM schema
3. Sets up the admin user account
4. Configures client-specific settings
5. Implements Row Level Security policies

## Components

### 1. Schema Template (`001_client_schema_template.pgsql`)
- Complete PostgreSQL schema for a CRM system
- Includes all core tables: users, contacts, deals, activities, appointments, billing, automation
- Pre-configured indexes for optimal performance
- Row Level Security enabled on all tables
- Default data seeding (settings, email templates)

### 2. Provisioning System (`provisioning-system.ts`)
- **ClientDatabaseProvisioner**: Core provisioning logic
- **ProvisioningQueue**: Queue-based processing system
- Automated error handling and retry logic
- Comprehensive logging and audit trails

### 3. API Integration (`/api/admin/provision-client/route.ts`)
- REST API for triggering provisioning
- Admin authentication and authorization
- Queue status monitoring endpoint

### 4. Registration Hook (`useClientRegistration.ts`)
- Automatic provisioning trigger on user registration
- Plan-based configuration (starter/professional/enterprise)
- Failure handling and admin notifications

## Database Schema

The provisioned client database includes:

### Core Entities
- **Users & Profiles**: User management with roles and permissions
- **Contacts**: Lead and customer information with custom fields
- **Deals**: Sales opportunities with pipeline management
- **Activities**: Calls, emails, meetings, tasks, and notes

### Communication
- **Email Campaigns**: Bulk email marketing
- **Email Templates**: Reusable email templates with variables
- **Appointments**: Calendar and meeting management

### Business Operations
- **Invoices & Payments**: Billing and payment tracking
- **Files**: Document storage and attachment management
- **Workflows**: Automation and business process flows

### System Features
- **Client Settings**: Configurable system preferences
- **Audit Logs**: Complete change tracking
- **Row Level Security**: Multi-user data isolation

## Usage

### Automatic Provisioning (Recommended)

The system automatically triggers when users register:

```typescript
// In your registration endpoint
import { onClientRegistration } from '@/hooks/useClientRegistration'

const result = await onClientRegistration({
  companyName: 'ACME Corp',
  adminEmail: 'admin@acme.com',
  adminPassword: 'secure-password',
  plan: 'professional'
})
```

### Manual Provisioning

For admin-triggered provisioning:

```typescript
import { triggerClientProvisioning } from '@/migrations/client-provisioning/provisioning-system'

await triggerClientProvisioning({
  id: 'client-uuid',
  name: 'ACME Corp',
  adminEmail: 'admin@acme.com',
  adminPassword: 'secure-password',
  databaseUrl: process.env.SUPABASE_URL,
  databaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
})
```

### API Usage

```bash
# Trigger provisioning
curl -X POST /api/admin/provision-client \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientData": {
      "name": "ACME Corp",
      "adminEmail": "admin@acme.com",
      "plan": "professional"
    }
  }'

# Check queue status
curl -X GET /api/admin/provision-client/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Configuration

### Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Plan Configurations

#### Starter Plan
- Max Users: 5
- Max Contacts: 1,000
- Storage: 1GB
- Features: Basic CRM, Email Templates, Basic Reports

#### Professional Plan
- Max Users: 25
- Max Contacts: 10,000
- Storage: 10GB
- Features: Full CRM, Automation, Integrations, Advanced Reports

#### Enterprise Plan
- Max Users: Unlimited
- Max Contacts: Unlimited
- Storage: 100GB
- Features: Full CRM, Advanced Automation, API Access, White Label

## Monitoring

### Queue Status
Monitor provisioning queue through the API:
- Queue length
- Processing status
- Current operations

### Logging
Comprehensive logs are written to:
- `logs/provisioning/provisioning-YYYY-MM-DD.log`

Each log entry includes:
- Timestamp
- Client ID and name
- Success/failure status
- Execution duration
- Error details (if any)

### Error Handling

The system includes:
- **Automatic Retry**: Failed provisions retry up to 3 times
- **Admin Notifications**: Critical failures alert admin team
- **Graceful Degradation**: Queue continues processing other clients

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Users can view/edit their own data
- Ownership-based access for contacts and deals
- Role-based access for admin functions

### Authentication
- Admin API endpoints require valid Bearer tokens
- User permissions verified against admin database
- Service role keys used for provisioning operations

## Maintenance

### Migration Management
New schema changes can be added as sequential migration files:
- `002_add_new_feature.sql`
- `003_performance_improvements.sql`

### Cleanup Scripts
Regular maintenance tasks:
- Archive old logs
- Clean up failed provisioning attempts
- Monitor database usage

## Troubleshooting

### Common Issues

1. **Provisioning Timeout**
   - Check network connectivity to Supabase
   - Verify service role key permissions
   - Monitor system resources

2. **Schema Errors**
   - Validate SQL syntax in template
   - Check for conflicting table names
   - Verify RLS policy syntax

3. **Authentication Failures**
   - Confirm admin user permissions
   - Check Bearer token validity
   - Verify environment variables

### Debug Mode
Enable verbose logging by setting:
```env
DEBUG_PROVISIONING=true
```

## Development

### Testing
Run provisioning tests:
```bash
npm run test:provisioning
```

### Local Development
For local testing, use test database credentials:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_key
```

## Performance

### Optimization Tips
- Queue processes one client at a time to prevent resource exhaustion
- 1-second delay between provisions for stability
- Indexes optimized for common query patterns
- Batch operations for bulk data insertion

### Scaling Considerations
- Consider horizontal scaling for high-volume provisioning
- Implement database connection pooling
- Monitor and adjust queue processing delays
- Cache frequently accessed configuration data

## Support

For issues or questions regarding the provisioning system:
1. Check the logs in `logs/provisioning/`
2. Review error messages in the admin dashboard
3. Contact the development team with client ID and timestamp