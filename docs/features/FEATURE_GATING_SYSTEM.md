# Feature Gating System

A comprehensive feature-gating system that controls access to features based on subscription plans, usage limits, and tenant permissions.

## Overview

This system provides:
- ✅ **Feature definitions** - Centralized feature registry with 60+ features
- ✅ **Pricing plans** - 4 tiers with included features and add-ons
- ✅ **Access control** - Backend middleware for feature permission checking
- ✅ **Subscription management** - Database schema and APIs for billing
- ✅ **Automatic provisioning** - Feature activation when payments clear
- ✅ **UI components** - Frontend components for conditional rendering
- ✅ **Payment integration** - Webhook handlers for subscription lifecycle

## Quick Start

### 1. Basic Feature Gating

```tsx
import { FeatureGate } from '@/components/FeatureGate';

function MyComponent({ tenantId }: { tenantId: string }) {
  return (
    <FeatureGate
      featureId="advanced_reporting"
      tenantId={tenantId}
      fallback={<p>Upgrade to access advanced reporting</p>}
    >
      <AdvancedReportingDashboard />
    </FeatureGate>
  );
}
```

### 2. Plan-Based Gating

```tsx
import { PlanGate } from '@/components/FeatureGate';

function ProfessionalFeature({ tenantId }: { tenantId: string }) {
  return (
    <PlanGate
      requiredPlan="professional"
      tenantId={tenantId}
      showUpgrade={true}
    >
      <ProfessionalOnlyContent />
    </PlanGate>
  );
}
```

### 3. Usage Limits

```tsx
import { UsageLimit } from '@/components/FeatureGate';
import { useFeatureUsage } from '@/hooks/useFeatureAccess';

function ContactForm({ tenantId }: { tenantId: string }) {
  const { trackUsage } = useFeatureUsage('contacts_management', tenantId);

  const handleSubmit = async () => {
    await trackUsage(); // Track usage before action
    // Create contact...
  };

  return (
    <UsageLimit
      featureId="contacts_management"
      tenantId={tenantId}
      warningThreshold={90}
    >
      <form onSubmit={handleSubmit}>
        {/* Contact form */}
      </form>
    </UsageLimit>
  );
}
```

## Components

### Core Components

#### `<FeatureGate>`
Conditionally renders children based on feature access.

**Props:**
- `featureId: FeatureId` - The feature to check
- `tenantId: string` - Tenant identifier
- `children: ReactNode` - Content to show when access granted
- `fallback?: ReactNode` - Content to show when access denied
- `loadingComponent?: ReactNode` - Loading state
- `showUpgrade?: boolean` - Show upgrade prompt instead of fallback
- `upgradeComponent?: ReactNode` - Custom upgrade component

#### `<PlanGate>`
Conditionally renders based on subscription plan level.

**Props:**
- `requiredPlan: 'starter' | 'professional' | 'business' | 'enterprise'`
- `tenantId: string`
- `children: ReactNode`
- `fallback?: ReactNode`
- `showUpgrade?: boolean`

#### `<UsageLimit>`
Shows usage information and enforces limits.

**Props:**
- `featureId: FeatureId`
- `tenantId: string`
- `children: ReactNode`
- `warningThreshold?: number` - Warning percentage (default: 80)
- `warningComponent?: ReactNode`
- `limitReachedComponent?: ReactNode`

#### `<FeatureToggle>`
Simple show/hide based on feature access.

**Props:**
- `featureId: FeatureId`
- `tenantId: string`
- `children: ReactNode`
- `fallback?: ReactNode`

### Utility Components

#### `<SubscriptionStatus>`
Displays current subscription information.

#### `<UpgradePrompt>`
Reusable upgrade prompt for locked features.

## Hooks

### `useFeatureAccess(featureId, tenantId)`

Returns feature access information:

```tsx
const { hasAccess, usageCount, usageLimit, isLoading, error } = useFeatureAccess('ai_assistant', tenantId);
```

**Returns:**
- `hasAccess: boolean` - Whether user has access
- `usageCount?: number` - Current usage count
- `usageLimit?: number` - Usage limit (-1 = unlimited)
- `isLoading: boolean` - Loading state
- `error?: string` - Error message if any

### `useSubscription(tenantId)`

Returns subscription information:

```tsx
const { planId, status, addOnFeatures, isLoading, error } = useSubscription(tenantId);
```

### `useMultipleFeatureAccess(featureIds, tenantId)`

Check multiple features at once:

```tsx
const accessMap = useMultipleFeatureAccess(['ai_assistant', 'advanced_reporting'], tenantId);
```

### `useFeatureUsage(featureId, tenantId)`

Track feature usage:

```tsx
const { trackUsage } = useFeatureUsage('contacts_management', tenantId);
await trackUsage(); // Increments usage count
```

## Features

### Feature Categories

1. **Core Features** - Basic CRM functionality
2. **Sales Features** - Pipeline, forecasting, quotes
3. **Marketing Features** - Campaigns, lead scoring, automation
4. **Automation Features** - Workflows, triggers, integrations
5. **Analytics Features** - Reporting, dashboards, insights
6. **Integration Features** - APIs, webhooks, third-party apps
7. **Collaboration Features** - Team management, sharing, comments
8. **Advanced Features** - AI, custom fields, advanced workflows
9. **Enterprise Features** - SSO, white-labeling, premium support

### Pricing Plans

| Plan | Price | Features | Limits |
|------|-------|----------|---------|
| **Starter** | $29/month | 15+ core features | 100 contacts, 50 deals |
| **Professional** | $79/month | 25+ features + add-ons | 1,000 contacts, 500 deals |
| **Business** | $149/month | 35+ features + add-ons | 10,000 contacts, 5,000 deals |
| **Enterprise** | $399/month | All features + enterprise | Unlimited everything |

## API Endpoints

### `GET /api/features/check`
Check feature access for a tenant.

**Query Parameters:**
- `tenantId: string`
- `featureId: string`

**Response:**
```json
{
  "hasAccess": true,
  "usageCount": 45,
  "usageLimit": 100,
  "reason": "included",
  "featureId": "contacts_management",
  "tenantId": "tenant-123"
}
```

### `POST /api/features/track-usage`
Track feature usage.

**Body:**
```json
{
  "tenantId": "tenant-123",
  "featureId": "contacts_management",
  "amount": 1
}
```

### `GET/POST/PATCH/DELETE /api/subscriptions/[tenantId]`
Manage tenant subscriptions.

## Database Schema

### `tenant_subscriptions`
```sql
- id (uuid, primary key)
- tenant_id (uuid, foreign key)
- plan_id (text) -- 'starter', 'professional', 'business', 'enterprise'
- billing_cycle (text) -- 'monthly', 'yearly'
- status (text) -- 'active', 'trial', 'cancelled', 'past_due', 'inactive'
- enabled_features (text[]) -- array of feature IDs
- add_on_features (text[]) -- array of add-on feature IDs
- usage_limits (jsonb) -- usage limits per feature
- current_usage (jsonb) -- current usage counts
- stripe_subscription_id (text)
- stripe_customer_id (text)
- trial_ends_at (timestamp)
- current_period_start (timestamp)
- current_period_end (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### `subscription_add_ons`
```sql
- id (uuid, primary key)
- subscription_id (uuid, foreign key)
- feature_id (text)
- quantity (integer)
- unit_price (decimal)
- total_price (decimal)
- created_at (timestamp)
```

### `billing_events`
```sql
- id (uuid, primary key)
- subscription_id (uuid, foreign key)
- event_type (text)
- stripe_event_id (text)
- amount (decimal)
- currency (text)
- description (text)
- status (text)
- processed_at (timestamp)
- event_data (jsonb)
- created_at (timestamp)
```

## Payment Integration

### Webhook Handler

The system includes a comprehensive webhook handler at `/api/webhooks/stripe/route.ts` that processes:

- `subscription.created` - Provision new subscription
- `subscription.updated` - Update subscription features
- `subscription.deleted` - Suspend subscription
- `invoice.payment_succeeded` - Activate features
- `invoice.payment_failed` - Handle failed payments
- `customer.subscription.trial_will_end` - Trial ending notifications

### Automatic Provisioning

When a payment succeeds, the system automatically:

1. ✅ **Updates subscription status** to active
2. ✅ **Provisions features** based on plan
3. ✅ **Activates add-ons** from subscription items
4. ✅ **Sets usage limits** according to plan
5. ✅ **Logs billing events** for audit trail

## Example Usage

### Complete Feature-Gated Page

```tsx
import { FeatureGatingDemo } from '@/components/examples/FeatureGatingExamples';

export default function DashboardPage() {
  const tenantId = 'tenant-123'; // Get from auth context
  
  return (
    <div>
      <h1>Dashboard</h1>
      <FeatureGatingDemo tenantId={tenantId} />
    </div>
  );
}
```

### Navigation with Feature Gating

```tsx
import { FeatureToggle } from '@/components/FeatureGate';

function Navigation({ tenantId }: { tenantId: string }) {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      <FeatureToggle featureId="advanced_reporting" tenantId={tenantId}>
        <a href="/reports">Advanced Reports</a>
      </FeatureToggle>
      
      <FeatureToggle featureId="ai_assistant" tenantId={tenantId}>
        <a href="/ai">AI Assistant</a>
      </FeatureToggle>
    </nav>
  );
}
```

## Development

### Adding New Features

1. **Define the feature** in `src/lib/features/definitions.ts`
2. **Add to pricing plans** in `src/lib/features/pricing.ts`
3. **Use in components** with `<FeatureGate>` or hooks
4. **Track usage** if applicable with `useFeatureUsage`

### Testing

Use the example components to test different scenarios:

```tsx
import { FeatureGatingExamples } from '@/components/examples/FeatureGatingExamples';

// Test with different tenant IDs and subscription states
<FeatureGatingExamples tenantId="test-tenant-starter" />
<FeatureGatingExamples tenantId="test-tenant-enterprise" />
```

## Security

- ✅ **Server-side validation** - All access checks happen server-side
- ✅ **Row Level Security** - Database-level tenant isolation
- ✅ **Webhook signature verification** - Secure payment processing
- ✅ **Usage limit enforcement** - Prevents abuse and overuse
- ✅ **Audit logging** - Complete subscription change history

## Production Deployment

1. **Deploy database migrations** from `migrations/007_subscription_management.sql`
2. **Configure payment provider** (Stripe, PayPal, etc.)
3. **Set webhook endpoints** to `/api/webhooks/stripe`
4. **Configure environment variables** for Supabase and payment provider
5. **Test subscription flows** with staging environment

The system is now production-ready with enterprise-grade security, scalability, and reliability! 🚀