# 🔄 Automatic Stripe Product Synchronization System

## Overview

This system automatically creates, updates, and syncs products between your GhostCRM software and Stripe. It ensures that all your pricing plans, add-ons, role-based tiers, and organization plans are always synchronized with Stripe, eliminating manual product management.

---

## 🎯 **Key Features**

### **1. Automatic Product Discovery**
- ✅ Scans all pricing configurations in your codebase
- ✅ Discovers products from multiple sources:
  - Main pricing plans (`pricing.ts`)
  - Add-on packages
  - Role-based pricing tiers
  - Organization-level plans
  - Setup fees and one-time payments

### **2. Intelligent Synchronization**
- ✅ Creates missing products in Stripe
- ✅ Updates existing products when prices change
- ✅ Validates sync integrity
- ✅ Handles both monthly and yearly billing cycles
- ✅ Preserves Stripe product relationships

### **3. Real-time Sync Triggers**
- ✅ Automatically syncs when products are modified
- ✅ Debounced queue system prevents excessive API calls
- ✅ Audit trail for all changes
- ✅ Manual and scheduled sync options

### **4. Admin Dashboard**
- ✅ Visual sync status monitoring
- ✅ One-click sync operations
- ✅ Dry-run preview mode
- ✅ Detailed sync results and error reporting

---

## 📁 **System Components**

### **Core Files**
```
src/lib/stripe/
├── product-sync.ts              # Main synchronization logic
├── product-sync-triggers.ts     # Automatic sync triggers
└── stripe-safe.ts              # Safe Stripe client wrapper

src/app/api/admin/stripe/
└── sync-products/route.ts       # API endpoint for sync operations

src/components/admin/
└── StripeProductSyncDashboard.tsx # Admin UI for managing syncs

scripts/
└── stripe-product-sync.js       # CLI script for sync operations

migrations/
├── 010_stripe_product_mappings.sql # Product mapping table
└── 011_product_change_log.sql      # Change tracking table
```

### **Database Tables**

#### **stripe_product_mappings**
Maps your local products to Stripe products and prices:
```sql
- local_product_id: Your internal product ID (e.g., "plan_starter_monthly")
- stripe_product_id: Stripe product ID (prod_xxx)
- stripe_price_id: Stripe price ID (price_xxx)
- price_amount: Price in dollars
- sync_status: 'created', 'updated', 'synced', 'error'
```

#### **product_change_log**
Tracks all product changes and sync triggers:
```sql
- event_type: Type of change (e.g., "plan.updated")
- product_id: ID of changed product
- changes: JSON of what changed
- triggered_sync: Whether it triggered a sync
```

---

## 🚀 **Getting Started**

### **1. Run Database Migrations**
```bash
# Apply the database migrations
psql -d your_database -f migrations/010_stripe_product_mappings.sql
psql -d your_database -f migrations/011_product_change_log.sql
```

### **2. Environment Setup**
Ensure these environment variables are set:
```bash
STRIPE_SECRET_KEY=sk_live_or_test_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### **3. Initial Sync**
Run the initial sync to create all products in Stripe:

**Option A: Using the CLI Script**
```bash
# Preview what will be created (dry run)
node scripts/stripe-product-sync.js --dry-run

# Perform the actual sync
node scripts/stripe-product-sync.js

# Force update all products
node scripts/stripe-product-sync.js --force-update
```

**Option B: Using the Admin Dashboard**
1. Navigate to `/admin/stripe-sync` (or wherever you mount the component)
2. Click "Preview Sync (Dry Run)" to see what will be created
3. Click "Sync Products" to perform the actual sync

**Option C: Using the API**
```bash
# Dry run
curl -X POST http://localhost:3000/api/admin/stripe/sync-products \
  -H "Content-Type: application/json" \
  -d '{"action": "sync", "dryRun": true}'

# Actual sync
curl -X POST http://localhost:3000/api/admin/stripe/sync-products \
  -H "Content-Type: application/json" \
  -d '{"action": "sync"}'
```

---

## 📊 **Product Mapping Examples**

Your GhostCRM products will be mapped to Stripe as follows:

### **Main Pricing Plans**
```
GhostCRM Product          → Stripe Product Name
plan_starter_monthly      → Starter Plan (Monthly)
plan_starter_yearly       → Starter Plan (Yearly)
plan_professional_monthly → Professional Plan (Monthly)
plan_professional_yearly  → Professional Plan (Yearly)
plan_enterprise_monthly   → Enterprise Plan (Monthly)
plan_enterprise_yearly    → Enterprise Plan (Yearly)
```

### **Add-on Packages**
```
GhostCRM Product          → Stripe Product Name
addon_sales_powerpack     → Sales PowerPack Add-on
addon_marketing_suite     → Marketing Suite Add-on
addon_automation_plus     → Automation Plus Add-on
```

### **Role-based Tiers**
```
GhostCRM Product                → Stripe Product Name
role_sales_rep_sales_rep_basic → Sales Representative - Basic
role_sales_rep_sales_rep_pro   → Sales Representative - Professional
role_admin_admin_elite         → Administrator - Elite
```

### **Organization Plans**
```
GhostCRM Product          → Stripe Product Name
org_starter_monthly       → Organization Starter
org_growth_monthly        → Organization Growth
org_starter_setup         → Starter Setup Fee (one-time)
```

---

## 🔄 **Automatic Sync Triggers**

The system automatically triggers syncs when:

### **Code Changes**
```typescript
import { onPricingPlanChange } from '@/lib/stripe/product-sync-triggers';

// When you update a pricing plan
onPricingPlanChange('starter', {
  monthlyPrice: { from: 29, to: 35 },
  description: { from: 'Old desc', to: 'New desc' }
}, userId);
```

### **Admin Actions**
- Product price updates through admin interface
- New plans or add-ons created
- Feature modifications that affect pricing

### **Scheduled Syncs**
- Hourly validation checks
- Daily comprehensive syncs
- Manual triggers from admin dashboard

---

## 🛠️ **API Reference**

### **Sync Products**
```
POST /api/admin/stripe/sync-products
Content-Type: application/json

{
  "action": "sync",
  "dryRun": false,
  "forceUpdate": false
}
```

### **Validate Sync**
```
POST /api/admin/stripe/sync-products
Content-Type: application/json

{
  "action": "validate"
}
```

### **Get Sync Status**
```
GET /api/admin/stripe/sync-products
```

---

## 🎛️ **Admin Dashboard Features**

### **Status Overview**
- 🟢 **All Synced**: All products are properly synchronized
- 🟡 **Needs Sync**: Some products need synchronization
- 🔴 **Sync Errors**: Issues found during last sync

### **Action Buttons**
- **Preview Sync**: See what changes will be made (dry run)
- **Sync Products**: Perform actual synchronization
- **Force Update**: Update all products regardless of current state
- **Validate**: Check if all products are properly synced
- **Refresh Status**: Update the dashboard status

### **Detailed Results**
- ✨ Products created in Stripe
- 🔄 Products updated in Stripe
- ✅ Products already synced
- ❌ Errors with specific details
- 🔗 Direct links to Stripe Dashboard

---

## 🔧 **Configuration Options**

### **Sync Behavior**
```typescript
// In product-sync.ts
const SYNC_OPTIONS = {
  // Debounce time for automatic triggers (ms)
  debounceMs: 5000,
  
  // Events that trigger automatic sync
  triggerEvents: [
    'product.created',
    'product.updated',
    'plan.price_changed'
  ],
  
  // Retry failed syncs
  retryAttempts: 3,
  retryDelay: 1000
};
```

### **Product Naming**
```typescript
// Customize how products are named in Stripe
const getProductName = (product) => {
  return `${product.name} - ${product.billing} billing`;
};
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Product not found in Stripe"**
- **Cause**: Product was deleted from Stripe manually
- **Solution**: Run force update to recreate the product

#### **"Price mismatch"**
- **Cause**: Price was changed in code but not synced
- **Solution**: Run a regular sync to create new price

#### **"Missing Stripe credentials"**
- **Cause**: Environment variables not set
- **Solution**: Check `STRIPE_SECRET_KEY` is properly configured

#### **"Database connection failed"**
- **Cause**: Supabase credentials incorrect
- **Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### **Debug Commands**
```bash
# Check what products would be synced
node scripts/stripe-product-sync.js --dry-run

# Validate current sync status
node scripts/stripe-product-sync.js --validate-only

# Force recreate all products
node scripts/stripe-product-sync.js --force-update
```

### **Logs and Monitoring**
- Sync operations are logged to console
- Change events stored in `product_change_log` table
- Sync reports saved to `logs/stripe-sync/` directory
- Admin dashboard shows detailed sync history

---

## 🔐 **Security Considerations**

### **API Access**
- Sync endpoints should be admin-only
- Use proper authentication middleware
- Rate limit sync operations

### **Stripe Keys**
- Use environment variables for Stripe keys
- Separate test/live keys by environment
- Regularly rotate webhook secrets

### **Data Validation**
- Validate product data before syncing
- Sanitize product names and descriptions
- Check price ranges and limits

---

## 📈 **Performance Optimization**

### **Batching**
- Sync operations are batched for efficiency
- Debounced triggers prevent excessive API calls
- Queue system manages concurrent syncs

### **Caching**
- Product mappings cached in database
- Validation results cached for 1 hour
- Stripe API responses cached when possible

### **Monitoring**
- Track sync duration and success rates
- Monitor API usage and rate limits
- Alert on sync failures

---

## 🔄 **Deployment Process**

### **Production Deployment**
1. **Pre-deployment**: Run sync validation
2. **Deploy**: Deploy application updates
3. **Post-deployment**: Run comprehensive sync
4. **Verify**: Check all products in Stripe Dashboard

### **CI/CD Integration**
```yaml
# Example GitHub Actions step
- name: Sync Stripe Products
  run: |
    npm run build
    node scripts/stripe-product-sync.js --validate-only
    if [ $? -ne 0 ]; then
      node scripts/stripe-product-sync.js
    fi
```

---

## 🎉 **Success Metrics**

With this system, you achieve:

- ✅ **100% Product Sync**: All products automatically synchronized
- ✅ **Zero Manual Work**: No more manually creating Stripe products
- ✅ **Real-time Updates**: Changes reflect in Stripe within seconds
- ✅ **Error Prevention**: Validation catches issues before they affect customers
- ✅ **Complete Audit Trail**: Full history of all product changes
- ✅ **Admin Control**: Easy management through dashboard interface

---

## 📞 **Support**

For issues with the sync system:

1. **Check the logs**: Review sync operation logs
2. **Use validation**: Run sync validation to identify issues
3. **Try dry run**: Use dry run mode to preview changes
4. **Check Stripe**: Verify products exist in Stripe Dashboard
5. **Force sync**: Use force update as last resort

**Remember**: This system is designed to be resilient and self-healing. Most issues resolve automatically with the next sync cycle.

---

**🚀 Your product synchronization system is now ready! All 6+ products from your GhostCRM software will automatically stay in sync with Stripe, with full audit trails and admin control.**