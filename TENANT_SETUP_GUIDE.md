# Multi-Tenant Development Setup Guide

## Overview

Your GhostCRM application now supports multi-tenant architecture using subdomain-based routing. Here's how to test and develop with the tenant system.

## Architecture Overview

- **Single Repository**: All tenant code in one repo for easier maintenance
- **Subdomain Routing**: Each tenant gets their own subdomain (e.g., `demo.ghostautocrm.com`)
- **Route Groups**: 
  - `(marketing)` for the main marketing site (ghostautocrm.com)
  - `(app)` for tenant-specific application pages
- **Middleware**: Handles routing, tenant identification, and access control
- **Database Isolation**: Row-level security (RLS) ensures tenant data separation

## Local Development

### Testing Subdomains Locally

Since browsers don't handle subdomains with `localhost`, you have several options:

#### Option 1: Use hosts file (Recommended)
Add these entries to your hosts file:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux**: `/etc/hosts`

```
127.0.0.1 ghostautocrm.local
127.0.0.1 demo.ghostautocrm.local
127.0.0.1 acme-auto.ghostautocrm.local
127.0.0.1 premium-cars.ghostautocrm.local
```

Then access:
- Marketing site: `http://ghostautocrm.local:3000`
- Demo tenant: `http://demo.ghostautocrm.local:3000`
- ACME Auto tenant: `http://acme-auto.ghostautocrm.local:3000`
- Premium Cars tenant: `http://premium-cars.ghostautocrm.local:3000`

#### Option 2: Query Parameter (Development Mode)
The middleware supports a fallback query parameter for development:
- `http://localhost:3000?tenant=demo`
- `http://localhost:3000?tenant=acme-auto`

## Tenant Configuration

### Sample Tenants (Pre-configured)

1. **Demo Dealership** (`demo`)
   - Subdomain: `demo.ghostautocrm.com`
   - Features: leads, inventory, finance
   - Primary Color: #1f2937

2. **ACME Auto Sales** (`acme-auto`)
   - Subdomain: `acme-auto.ghostautocrm.com`
   - Features: leads, inventory, finance, compliance
   - Primary Color: #dc2626

3. **Premium Cars LLC** (`premium-cars`)
   - Subdomain: `premium-cars.ghostautocrm.com`
   - Features: All features (Enterprise plan)
   - Primary Color: #059669

### Database Setup

1. **Run migrations** to create tenant tables:
   ```bash
   # Apply the tenant migration
   supabase db push
   ```

2. **Sample data** is automatically inserted via migration

### Environment Variables

Ensure these are set in your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

## Testing the Tenant System

### 1. Marketing Site
- URL: `http://ghostautocrm.local:3000` (or `http://localhost:3000`)
- Should show the main marketing/login page
- Routes to `(marketing)` route group

### 2. Tenant Sites
- URL: `http://demo.ghostautocrm.local:3000`
- Should redirect to `/dashboard` after login
- Routes to `(app)` route group
- Headers include `x-tenant-id` and `x-tenant-slug`

### 3. Tenant Context in React
Use the tenant hooks in your components:

```tsx
import { useTenant, useCurrentTenant, useIsMarketingSite } from '@/lib/tenant';

function MyComponent() {
  const tenant = useTenant();
  const currentTenant = useCurrentTenant();
  const isMarketing = useIsMarketingSite();

  if (isMarketing) {
    return <MarketingComponent />;
  }

  if (!tenant) {
    return <Loading />;
  }

  return (
    <div style={{ color: tenant.branding.primary_color }}>
      Welcome to {tenant.branding.company_name}!
    </div>
  );
}
```

## Tenant Features & Access Control

### Feature Checking
```tsx
import { hasFeatureAccess, validateFeatureAccess } from '@/lib/tenant';

// Check if tenant has access to a feature
const hasAdvancedReporting = hasFeatureAccess(tenant, 'advanced_reporting');

// Validate and throw error if no access
try {
  validateFeatureAccess(tenant, 'compliance');
  // Feature is available
} catch (error) {
  // Handle access denied
}
```

### Available Features
- `leads` - Lead management
- `inventory` - Vehicle inventory
- `finance` - Finance & lending
- `compliance` - Regulatory compliance
- `advanced_reporting` - Advanced analytics
- `api_access` - REST API access
- `custom_branding` - Custom colors/logos
- `sso` - Single sign-on
- `webhooks` - Webhook integrations
- `analytics` - Basic analytics
- `automation` - Workflow automation

## Database Queries with Tenant Context

### Using Tenant-Aware Database Client
```tsx
import { getTenantQuery, getTenantClient } from '@/lib/tenant';

// Get tenant-specific query builder
const query = getTenantQuery(tenant.id, 'leads');
const leads = await query.select('*').eq('status', 'active');

// Get tenant-specific Supabase client
const supabase = getTenantClient(tenant.id);
const { data } = await supabase.from('deals').select('*');
```

### Row-Level Security (RLS)
The database automatically filters data by tenant ID using PostgreSQL RLS policies. All queries are automatically scoped to the current tenant.

## Adding New Tenants

### Via Database
```sql
INSERT INTO tenants (subdomain, name, admin_email, admin_name, config, branding) 
VALUES (
  'new-dealership',
  'New Dealership Name', 
  'admin@newdealership.com',
  'Admin Name',
  '{"features": ["leads", "inventory"]}',
  '{"primary_color": "#3b82f6", "company_name": "New Dealership"}'
);
```

### Via API (Future)
```tsx
const response = await fetch('/api/tenants', {
  method: 'POST',
  body: JSON.stringify({
    subdomain: 'new-dealership',
    name: 'New Dealership Name',
    admin_email: 'admin@newdealership.com',
    // ... other fields
  })
});
```

## Middleware Flow

1. **Request arrives** → Extract hostname
2. **Parse subdomain** → Determine tenant or marketing site
3. **Marketing site** → Route to `(marketing)` group
4. **Tenant site** → Add tenant headers, route to `(app)` group
5. **Authentication** → Check JWT for protected routes
6. **Response** → Add security headers

## Troubleshooting

### Common Issues

1. **"getSubdomain is not defined"**
   - Restart the development server
   - Check that imports are correct in middleware.ts

2. **Tenant not found**
   - Verify tenant exists in database
   - Check subdomain spelling
   - Ensure tenant status is 'active'

3. **RLS blocking queries**
   - Verify tenant context is set: `SELECT current_setting('app.current_tenant_id')`
   - Use service role key for admin operations

4. **Localhost subdomain not working**
   - Use hosts file method or query parameter fallback
   - Clear browser cache and cookies

### Debug Information

The middleware logs helpful information:
```
🔍 Middleware: demo.ghostautocrm.local:3000 | Subdomain: demo | Path: /dashboard | Marketing: false | Tenant: true
```

This shows:
- Hostname detected
- Subdomain parsed
- Current path
- Whether it's marketing or tenant site

## Next Steps

1. **Custom Domains**: Add support for custom domains per tenant
2. **Tenant Admin Panel**: Build interface for managing tenant settings
3. **Billing Integration**: Connect to Stripe for subscription management
4. **Advanced Features**: SSO, webhooks, API management per tenant
5. **Performance**: Add caching for tenant configuration

## Security Considerations

- ✅ Row-level security isolates tenant data
- ✅ JWT validation for authentication
- ✅ Subdomain validation prevents injection
- ✅ Security headers added by middleware
- ⚠️ Ensure sensitive operations use service role key
- ⚠️ Validate tenant access before admin operations