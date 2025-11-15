# Environment Variables for 14-Day Trial Billing System

## Required Stripe Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (for frontend)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret from Stripe dashboard

# Product and Pricing
STRIPE_PRODUCT_ID=prod_... # Your product ID from Stripe dashboard
STRIPE_PRICE_ID=price_... # Your price ID from Stripe dashboard (monthly subscription)
STRIPE_FULL_AMOUNT=9999 # Full monthly amount in cents (e.g., 9999 = $99.99)

# Cron/Background Job Security
CRON_SECRET=your-secure-random-string # For securing cron job endpoints
```

## Setting Up Stripe Products and Prices

1. **Create a Product in Stripe Dashboard:**
   - Go to Products in your Stripe dashboard
   - Create a new product (e.g., "GhostCRM Subscription")
   - Copy the product ID (starts with `prod_`)

2. **Create a Price for the Product:**
   - Add a recurring price to your product
   - Set billing interval to monthly
   - Set the amount (e.g., $99.99)
   - Copy the price ID (starts with `price_`)

3. **Set Up Webhook Endpoint:**
   - Go to Webhooks in your Stripe dashboard
   - Add endpoint: `https://yourdomain.com/api/billing/webhook`
   - Select these events:
     - `customer.subscription.trial_will_end`
     - `customer.subscription.updated`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `setup_intent.succeeded`
   - Copy the webhook secret (starts with `whsec_`)

## Database Migration

Run the database migration to create the billing tables:

```sql
-- Apply the user billing migration
-- This creates the user_billing table and related functions
\i migrations/008_user_billing_trials.sql
```

## Background Jobs Setup

For production, set up cron jobs or use a service like Vercel Cron to run:

1. **Trial Expiry Processing** (run every hour):
   ```bash
   curl -X POST https://yourdomain.com/api/billing/trial/expiry \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **Trial Notifications** (run daily):
   ```bash
   curl -X POST https://yourdomain.com/api/billing/trial/notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## How the 14-Day Trial System Works

### Trial Flow:
1. User signs up and starts trial
2. Payment method is collected via Stripe Setup Intent ($0.00 charge)
3. Subscription is created with 14-day trial period
4. User has full access during trial
5. System sends reminder notifications (3 days before expiry)
6. When trial expires:
   - If payment method exists: Automatic billing starts
   - If no payment method: Subscription is canceled

### Key Features:
- **$0.00 Trial**: No charges during trial period
- **Automatic Billing**: Seamless conversion to paid subscription
- **Payment Security**: Uses Stripe's secure payment processing
- **Webhook Integration**: Real-time billing status updates
- **Background Jobs**: Automated trial expiry and notification handling
- **UI Components**: Complete trial dashboard and status indicators

### Database Schema:
- `user_billing` table tracks individual user trials and billing status
- Integrates with existing `tenant_subscriptions` for organization-level billing
- Includes helper functions for trial expiry processing

### API Endpoints:
- `POST /api/billing/trial/setup` - Initialize trial setup
- `POST /api/billing/subscription/create` - Create subscription after payment method
- `GET /api/billing/status` - Get billing status for user
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `POST /api/billing/trial/expiry` - Process expired trials (cron job)
- `POST /api/billing/trial/notifications` - Send trial reminders (cron job)

### UI Components:
- `TrialCountdown` - Real-time countdown display
- `BillingStatusIndicator` - Shows current billing status
- `PaymentMethodCollector` - Handles payment method collection
- `TrialDashboard` - Complete trial management interface

## Testing the System

1. **Test Trial Setup:**
   ```javascript
   // Call the trial setup API
   const response = await fetch('/api/billing/trial/setup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@example.com',
       userId: 'user-uuid',
       organizationId: 'org-uuid'
     })
   });
   ```

2. **Test Billing Status:**
   ```javascript
   // Check billing status
   const status = await fetch('/api/billing/status?userId=user-uuid');
   ```

3. **Test Webhook (in Stripe CLI):**
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

## Production Checklist

- [ ] Set all required environment variables
- [ ] Run database migration
- [ ] Configure Stripe webhook endpoint
- [ ] Set up cron jobs for background processing
- [ ] Test trial flow end-to-end
- [ ] Configure email notifications (SendGrid, etc.)
- [ ] Set up monitoring and alerting
- [ ] Test webhook event handling
- [ ] Verify automatic billing conversion
- [ ] Test cancellation and refund flows