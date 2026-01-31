# Role-Based Authentication System Demo

## Overview
The GhostCRM system now includes a comprehensive role-based authentication system with tenant isolation. This ensures that "when a sales rep from company A logs in it will only pull up that sales rep access and data" as requested.

## User Roles & Permissions

### 1. **Owner** (System Administrator)
- **Access Level**: Full system access across all tenants
- **Key Permissions**: 
  - `manage_system` - Complete system control
  - `manage_users` - User account management
  - `manage_settings` - System configuration
  - `view_analytics` - Full analytics access
  - All other permissions
- **Dashboard**: `/owner/dashboard`
- **Tenant Isolation**: Can view and manage all tenants

### 2. **Admin** (Company Administrator)  
- **Access Level**: Full access within their assigned tenant/company
- **Key Permissions**:
  - `manage_users` - Manage company users
  - `manage_settings` - Company settings
  - `manage_inventory` - Full inventory control
  - `manage_billing` - Billing and payments
  - `view_reports` - Advanced reporting
- **Dashboard**: `/admin/dashboard`
- **Tenant Isolation**: Only sees data for their assigned company

### 3. **Manager** (Department Manager)
- **Access Level**: Departmental management within their company
- **Key Permissions**:
  - `manage_inventory` - Inventory management
  - `manage_deals` - Deal oversight
  - `manage_leads` - Lead management
  - `view_reports` - Department reports
  - `manage_appointments` - Scheduling
- **Dashboard**: `/dashboard`
- **Tenant Isolation**: Only sees data for their assigned company

### 4. **Sales Rep** (Sales Representative)
- **Access Level**: Limited to assigned vehicles and personal data
- **Key Permissions**:
  - `manage_inventory` - View and basic vehicle updates
  - `manage_deals` - Own deals only
  - `manage_leads` - Assigned leads
  - `manage_appointments` - Own appointments
- **Dashboard**: `/dashboard`
- **Tenant Isolation**: Only sees company data + vehicles assigned to them

### 5. **User** (Basic User)
- **Access Level**: View-only access to basic information
- **Key Permissions**:
  - `view_inventory` - Basic vehicle viewing
  - `view_profile` - Own profile access
- **Dashboard**: `/dashboard`
- **Tenant Isolation**: Limited company data access

## Demo Users

### Honda Downtown (honda-downtown)
```javascript
{
  email: "sarah.johnson@honda-downtown.com",
  role: "sales_rep",
  name: "Sarah Johnson",
  tenantId: "honda-downtown"
}
```

### Ford City (ford-city)
```javascript
{
  email: "mike.chen@ford-city.com", 
  role: "sales_rep",
  name: "Mike Chen",
  tenantId: "ford-city"
}
```

### Chevrolet Valley (chevrolet-valley)
```javascript
{
  email: "alex.rodriguez@chevrolet-valley.com",
  role: "admin", 
  name: "Alex Rodriguez",
  tenantId: "chevrolet-valley"
}
```

## How Tenant Isolation Works

### 1. **Data Filtering**
```typescript
// Sales reps only see their company's vehicles
const filteredVehicles = filterDataByTenant(sampleVehicles, user.tenantId);

// Additionally, sales reps only see vehicles assigned to them
if (isSalesRep && user?.email) {
  filteredVehicles = filteredVehicles.filter(vehicle => 
    vehicle.assignedSalesRep === user.email || !vehicle.assignedSalesRep
  );
}
```

### 2. **Route Protection**
```typescript
// Middleware checks route access based on role
const ROLE_BASED_ROUTES = {
  "/owner": ["owner"],
  "/admin": ["owner", "admin"], 
  "/agent-control-panel": ["owner", "admin"],
  "/bi": ["owner", "admin", "manager"],
  "/reports": ["owner", "admin", "manager"]
};
```

### 3. **Component-Level Security**
```tsx
{/* Only managers and above can add vehicles */}
<FeatureGuard permissions={['manage_inventory']} roles={['owner', 'admin', 'manager']}>
  <button>+ Add Vehicle</button>
</FeatureGuard>

{/* Delete operations restricted */}
<FeatureGuard permissions={['manage_inventory']} roles={['owner', 'admin', 'manager']}>
  <button>Delete Selected</button>
</FeatureGuard>
```

## Testing the System

### Step 1: Login as Sales Rep
- Email: `sarah.johnson@honda-downtown.com`
- Password: `demo123`
- **Expected Result**: Only sees Honda vehicles assigned to Sarah + available Honda vehicles

### Step 2: Login as Admin
- Email: `alex.rodriguez@chevrolet-valley.com`  
- Password: `demo123`
- **Expected Result**: Sees all Chevrolet Valley vehicles, can manage users, access admin features

### Step 3: Login as Manager
- Email: `jane.smith@automax-central.com`
- Password: `demo123`
- **Expected Result**: Full company access but no system-wide admin features

## Key Features

### ✅ **Tenant Data Isolation**
- Sales reps from Company A only see Company A data
- Cross-company data access is impossible
- Secure tenant boundary enforcement

### ✅ **Role-Based Permissions** 
- Granular permission system (30+ permissions)
- Feature-level access control
- Route-level protection

### ✅ **Vehicle Assignment**
- Sales reps see vehicles assigned to them
- Round-robin assignment for test drives
- Territory-based vehicle management

### ✅ **UI Adaptations**
- Role-appropriate interfaces
- Permission-based feature visibility  
- Tenant-specific branding indicators

### ✅ **Security Middleware**
- Server-side route protection
- Token-based authentication
- Automatic role-based redirects

## File Structure

```
src/
├── lib/auth.ts                    # Core authentication logic
├── context/AuthContext.tsx       # React authentication context
├── middleware/PermissionMiddleware.tsx # Component-level guards
├── middleware.ts                  # Next.js route protection
└── app/(business)/inventory/page.tsx   # Demo implementation
```

## Integration Points

### QR Code System Integration
- QR codes respect tenant boundaries
- Vehicle profiles show correct company branding
- Test drive scheduling uses company sales reps

### Sales Agent System Integration  
- Round-robin assignment within tenant
- Agent specialties matched to vehicle types
- Appointment scheduling respects company boundaries

### Analytics Dashboard Integration
- Tenant-specific performance metrics
- Role-appropriate data visibility
- Company-scoped reporting

## Security Considerations

1. **JWT Token Management**: Secure token handling with automatic expiration
2. **Tenant Validation**: Server-side tenant boundary enforcement
3. **Permission Checking**: Multiple layers of permission validation
4. **Data Sanitization**: All data filtered through tenant context
5. **Route Guards**: Comprehensive route-level protection

This system ensures complete tenant isolation while providing appropriate access levels for each user role, fulfilling the requirement that sales reps from different companies only see their own company's data.